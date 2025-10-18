/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

// Zod Schema for Validation
const SpeedResultSchema = z.object({
  address: z.string().describe("Sorgulanan adres"),
  downloadSpeed: z.number().describe("İndirme hızı (Mbps)"),
  uploadSpeed: z.number().describe("Yükleme hızı (Mbps)"),
  ping: z.number().describe("Ping değeri (ms)"),
  provider: z.string().describe("İnternet sağlayıcısı"),
  technology: z.enum(["Fiber", "VDSL", "ADSL", "Unavailable"]).describe("İnternet teknolojisi"),
  lastUpdated: z.string().describe("Son güncelleme tarihi (YYYY-MM-DD HH:mm:ss)"),
  infrastructure: z.object({
    maxSpeed: z.number().describe("Maksimum hız (Kbps)"),
    svuid: z.string().describe("SVUID"),
    technologies: z.object({
      fiber: z.object({
        available: z.boolean().describe("Fiber mevcut mu"),
        distance: z.number().describe("Fiber mesafe (metre)")
      }),
      vdsl: z.object({
        available: z.boolean().describe("VDSL mevcut mu"),
        distance: z.number().describe("VDSL mesafe (metre)")
      }),
      adsl: z.object({
        available: z.boolean().describe("ADSL mevcut mu"),
        distance: z.number().describe("ADSL mesafe (metre)")
      })
    })
  }).describe("Altyapı bilgileri")
});

// Profesyonel Infrastructure Interface
interface InfrastructureData {
  maxSpeed: number; // Kbps cinsinden
  svuid: string;
  technologies: {
    fiber: {
      available: boolean;
      distance: number; // metre cinsinden
    };
    vdsl: {
      available: boolean;
      distance: number; // metre cinsinden
    };
    adsl: {
      available: boolean;
      distance: number; // metre cinsinden
    };
  };
}

// Profesyonel SpeedResult Interface
interface SpeedResult {
  address: string;
  downloadSpeed: number; // Mbps
  uploadSpeed: number; // Mbps
  ping: number; // ms
  provider: string;
  technology: "Fiber" | "VDSL" | "ADSL" | "Unavailable";
  lastUpdated: string;
  infrastructure: InfrastructureData;
  tracing: {
    steps: Array<{
      step: number;
      action: string;
      tool: string;
      input: any;
      output: any;
      timestamp: string;
      duration: number;
    }>;
    totalDuration: number;
    aiModel: string;
    success: boolean;
    error?: {
      message: string;
      type: string;
      details: string;
      timestamp: string;
    };
  };
}

// Service Provider API Tool
const serviceProviderAPITool = tool(
  async ({ type, id }) => {
    try {
      const formData = new URLSearchParams();
      formData.append("type", type.toString());
      formData.append("id", id);

      const response = await fetch(
        "https://www.netspeed.com.tr/Home/GetAddress",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            Accept: "application/json, text/javascript, */*; q=0.01",
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return JSON.stringify(data);
    } catch (error) {
      return JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "service_provider_api",
    description: "Service Provider API'ye istek atarak adres bilgilerini getirir",
    schema: z.object({
      type: z
        .union([z.number(), z.string()])
        .transform((val) => Number(val))
        .describe(
          "API istek tipi (1=şehir, 2=ilçe, 3=mahalle, 4=sokak, 5=bina, 6=daire)"
        ),
      id: z
        .union([z.string(), z.number()])
        .transform((val) => String(val))
        .describe("Üst seviye ID"),
    }),
  }
);

// Infrastructure data tool
const infrastructureTool = tool(
  async ({ finalId }) => {
    try {
      const response = await fetch(
        "https://www.netspeed.com.tr/Home/GetInfrastractureQueryResult",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            Accept: "application/json, text/javascript, */*; q=0.01",
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: new URLSearchParams({
            searchKey: finalId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Infrastructure API request failed: ${response.status}`
        );
      }

      const data = await response.json();
      return JSON.stringify(data);
    } catch (error) {
      return JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "infrastructure_api",
    description: "Service Provider API'den altyapı verilerini getirir",
    schema: z.object({
      finalId: z
        .union([z.string(), z.number()])
        .transform((val) => String(val))
        .describe("Son adım ID'si"),
    }),
  }
);

export class AddressProcessor {
  private llm: ChatGoogleGenerativeAI;
  private cityMap: Map<string, string>;

  constructor() {
    this.llm = new ChatGoogleGenerativeAI({
      model: "models/gemini-2.5-flash-lite",
      apiKey: process.env.GOOGLE_API_KEY || "",
      temperature: 0.1,
    });

    // Türkiye şehir ID'leri
    this.cityMap = new Map([
      ["ADANA", "1"],
      ["ADIYAMAN", "2"],
      ["AFYONKARAHİSAR", "3"],
      ["AĞRI", "4"],
      ["AKSARAY", "68"],
      ["AMASYA", "5"],
      ["ANKARA", "6"],
      ["ANTALYA", "7"],
      ["ARDAHAN", "75"],
      ["ARTVİN", "8"],
      ["AYDIN", "9"],
      ["BALIKESİR", "10"],
      ["BARTIN", "74"],
      ["BATMAN", "72"],
      ["BAYBURT", "69"],
      ["BİLECİK", "11"],
      ["BİNGÖL", "12"],
      ["BİTLİS", "13"],
      ["BOLU", "14"],
      ["BURDUR", "15"],
      ["BURSA", "16"],
      ["ÇANAKKALE", "17"],
      ["ÇANKIRI", "18"],
      ["ÇORUM", "19"],
      ["DENİZLİ", "20"],
      ["DİYARBAKIR", "21"],
      ["DÜZCE", "81"],
      ["EDİRNE", "22"],
      ["ELAZIĞ", "23"],
      ["ERZİNCAN", "24"],
      ["ERZURUM", "25"],
      ["ESKİŞEHİR", "26"],
      ["GAZİANTEP", "27"],
      ["GİRESUN", "28"],
      ["GÜMÜŞHANE", "29"],
      ["HAKKARİ", "30"],
      ["HATAY", "31"],
      ["IĞDIR", "76"],
      ["ISPARTA", "32"],
      ["İSTANBUL", "34"],
      ["İZMİR", "35"],
      ["KAHRAMANMARAŞ", "46"],
      ["KARABÜK", "78"],
      ["KARAMAN", "70"],
      ["KARS", "36"],
      ["KASTAMONU", "37"],
      ["KAYSERİ", "38"],
      ["KIBRIS", "-1"],
      ["KIRIKKALE", "71"],
      ["KIRKLARELİ", "39"],
      ["KIRŞEHİR", "40"],
      ["KİLİS", "79"],
      ["KKTC", "-9"],
      ["KOCAELİ", "41"],
      ["KONYA", "42"],
      ["KÜTAHYA", "43"],
      ["MALATYA", "44"],
      ["MANİSA", "45"],
      ["MARDİN", "47"],
      ["MERSİN", "33"],
      ["MUĞLA", "48"],
      ["MUŞ", "49"],
      ["NEVŞEHİR", "50"],
      ["NİĞDE", "51"],
      ["ORDU", "52"],
      ["OSMANİYE", "80"],
      ["RİZE", "53"],
      ["SAKARYA", "54"],
      ["SAMSUN", "55"],
      ["SİİRT", "56"],
      ["SİNOP", "57"],
      ["SİVAS", "58"],
      ["ŞANLIURFA", "63"],
      ["ŞIRNAK", "73"],
      ["TEKİRDAĞ", "59"],
      ["TOKAT", "60"],
      ["TRABZON", "61"],
      ["TUNCELİ", "62"],
      ["UŞAK", "64"],
      ["VAN", "65"],
      ["YALOVA", "77"],
      ["YOZGAT", "66"],
      ["ZONGULDAK", "67"],
    ]);
  }

  async processAddress(userAddress: string): Promise<SpeedResult> {
    const startTime = Date.now();
    const tracingSteps: Array<{
      step: number;
      action: string;
      tool: string;
      input: any;
      output: any;
      timestamp: string;
      duration: number;
    }> = [];

    const tools = [serviceProviderAPITool, infrastructureTool];
    const llmWithTools = this.llm.bindTools(tools);

    const systemPrompt = `Sen bir Türkiye adres uzmanısın. Verilen adresi analiz edip Service Provider API'ye istek atarak internet hız bilgilerini getir.

Mevcut şehir kodları:
${Array.from(this.cityMap.entries())
  .map(([name, id]) => `${name}: ${id}`)
  .join(", ")}

Adım adım işlem - TÜM ADIMLARI SIRASIYLA YAP:
1. Adresindeki şehir ismini bul ve yukarıdaki listeden ID'sini al
2. service_provider_api tool'unu kullanarak ilçe listesini getir (type=1, id=şehir_id)
3. Adresindeki ilçe ismini bul ve ID'sini al
4. service_provider_api tool'unu kullanarak mahalle listesini getir (type=2, id=ilçe_id)
5. Adresindeki mahalle ismini bul ve ID'sini al
6. service_provider_api tool'unu kullanarak sokak listesini getir (type=3, id=mahalle_id)
7. Adresindeki sokak ismini bul ve ID'sini al
8. service_provider_api tool'unu kullanarak bina listesini getir (type=4, id=sokak_id)
9. Adresindeki bina numarasını bul ve ID'sini al
10. service_provider_api tool'unu kullanarak daire listesini getir (type=5, id=bina_id)
11. Adresindeki daire numarasını bul ve ID'sini al
12. infrastructure_api tool'unu kullanarak altyapı verilerini getir (final_id)
13. Altyapı verilerini analiz et ve hız bilgilerini çıkar

ÖNEMLİ: 
- TÜM ADIMLARI SIRASIYLA YAP, DURMA!
- Her adımda tool call yap
- Son adımda infrastructure_api'den gelen veriyi analiz et
- MaxSpeed değeri Kbps cinsinden gelir, Mbps'e çevir (1000'e böl)
- Teknoloji önceliği: Fiber > VDSL > ADSL
- Upload hızı: Fiber %60, VDSL %25, ADSL %15
- Ping: 4-90ms arası rastgele
- Provider: Final response'dan provider bilgisini çıkar, yoksa "Unknown" döndür
- Sonucu JSON formatında döndür`;

    const humanPrompt = `"${userAddress}" adresinin internet hızını bul.`;

    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(humanPrompt),
    ];

    try {
      const currentMessages: any[] = [...messages];
      let stepCounter = 1;

      // AI çağrısı
      const aiStartTime = Date.now();
      let response = await llmWithTools.invoke(currentMessages);
      const aiDuration = Date.now() - aiStartTime;

      tracingSteps.push({
        step: stepCounter++,
        action: "AI Address Analysis",
        tool: "gemini-flash-latest",
        input: { userAddress, systemPrompt, humanPrompt },
        output: { toolCalls: response.tool_calls?.length || 0 },
        timestamp: new Date().toISOString(),
        duration: aiDuration,
      });

      // Tool call loop - AI tool call yapana kadar devam et
      while (response.tool_calls && response.tool_calls.length > 0) {
        // Tool calls'ları işle
        const toolResults = [];

        for (const toolCall of response.tool_calls) {
          const toolStartTime = Date.now();
          const tool = tools.find((t) => t.name === toolCall.name);

          if (tool && "call" in tool) {
            const result = await (tool as any).invoke(toolCall.args);
            const toolDuration = Date.now() - toolStartTime;

            toolResults.push({ name: toolCall.name, result });

            tracingSteps.push({
              step: stepCounter++,
              action: `Tool Call: ${toolCall.name}`,
              tool: toolCall.name,
              input: toolCall.args,
              output: result,
              timestamp: new Date().toISOString(),
              duration: toolDuration,
            });
          }
        }

        // Tool results'ları message'lara ekle
        currentMessages.push(response);
        for (const toolResult of toolResults) {
          currentMessages.push(
            new ToolMessage({
              content: toolResult.result,
              tool_call_id: toolResult.name,
              name: toolResult.name,
            })
          );
        }

        // AI'ya tool results'ları gönder ve devam et
        response = await llmWithTools.invoke(currentMessages);
      }

      // Son tool result'ından hız bilgilerini çıkar
      const lastToolResult = tracingSteps
        .filter((step) => step.tool === "infrastructure_api")
        .pop();

      if (lastToolResult) {
        // Structured Output ile AI'dan veri al
        const structuredLLM = this.llm.withStructuredOutput(SpeedResultSchema);
        
        const finalPrompt = `Altyapı verilerini analiz et ve hız bilgilerini çıkar:

Altyapı Verisi: ${lastToolResult.output}
Kullanıcı Adresi: ${userAddress}

ÖNEMLİ KURALLAR:
- MaxSpeed değeri Kbps cinsinden gelir, Mbps'e çevir (1000'e böl)
- PortState "VAR" ise available: true, "YOK" ise available: false
- Distance değerini metre cinsinden sayıya çevir
- Teknoloji önceliği: Fiber > VDSL > ADSL > Unavailable
- Upload hızı: Fiber %60, VDSL %25, ADSL %15
- Ping: 10-40ms arası rastgele
- Provider: Final response'dan provider bilgisini çıkar, yoksa "Unknown" döndür
- lastUpdated: YYYY-MM-DD HH:mm:ss formatında`;

        currentMessages.push(response);
        currentMessages.push(new HumanMessage(finalPrompt));

        // Structured output ile AI'dan veri al
        try {
          console.log("Calling structured LLM...");
          const aiResult = await structuredLLM.invoke(currentMessages);
          console.log("Structured Result:", aiResult);

          // Tracing bilgilerini ekle
          const result: SpeedResult = {
            ...aiResult,
            tracing: {
              steps: tracingSteps,
              totalDuration: Date.now() - startTime,
              aiModel: "gemini-flash-latest",
              success: true,
            },
          };

          return result;
        } catch (structuredError) {
          console.error("Structured output failed:", structuredError);
          
          // Eğer structured output başarısız olursa, manuel parsing'e geri dön
          try {
            const infraData = JSON.parse(lastToolResult.output);
            const result = this.processInfrastructureData(infraData, userAddress);

            // Fallback result'ı da validate et
            SpeedResultSchema.parse({
              address: result.address,
              downloadSpeed: result.downloadSpeed,
              uploadSpeed: result.uploadSpeed,
              ping: result.ping,
              provider: result.provider,
              technology: result.technology,
              lastUpdated: result.lastUpdated,
              infrastructure: result.infrastructure
            });

            // Tracing bilgilerini ekle
            result.tracing = {
              steps: tracingSteps,
              totalDuration: Date.now() - startTime,
              aiModel: "gemini-flash-latest",
              success: true,
            };

            return result;
          } catch (fallbackError) {
            console.error("Fallback parsing also failed:", fallbackError);
            throw new Error(`Structured output failed: ${structuredError}. Fallback also failed: ${fallbackError}`);
          }
        }
      }

      // Eğer AI bir sonuç döndüremezse hata fırlat
      throw new Error(
        "AI adres işleme başarısız oldu veya geçerli bir sonuç döndürmedi."
      );
    } catch (error) {
      console.error("Address processing failed:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      });

      // Hata durumunda da tracing bilgilerini döndür
      const errorMessage =
        error instanceof Error ? error.message : "Bilinmeyen hata";
      const errorWithTracing = new Error(errorMessage);

      // Tracing bilgilerini error objesine ekle
      (errorWithTracing as any).tracing = {
        steps: tracingSteps,
        totalDuration: Date.now() - startTime,
        aiModel: "gemini-flash-latest",
        success: false,
        error: {
          message: errorMessage,
          type: "AI_PROCESSING_ERROR",
          details: error instanceof Error ? error.stack : String(error),
          timestamp: new Date().toISOString(),
        },
      };

      throw errorWithTracing;
    }
  }

  private processInfrastructureData(
    infraData: Record<string, any>,
    address: string
  ): SpeedResult {
    // MaxSpeed değeri Kbps cinsinden geliyor, Mbps'e çeviriyoruz
    const maxSpeedKbps = parseInt(infraData.MaxSpeed) || 0;
    const downloadSpeed =
      maxSpeedKbps > 0 ? Math.floor(maxSpeedKbps / 1000) : 0;

    // Upload hızı teknolojiye göre hesapla
    let uploadSpeed = 0;
    let technology: "Fiber" | "VDSL" | "ADSL" | "Unavailable" = "Unavailable";

    if (infraData.Fiber?.PortState === "VAR") {
      technology = "Fiber";
      uploadSpeed = Math.floor(downloadSpeed * 0.6);
    } else if (infraData.VDSL?.PortState === "VAR") {
      technology = "VDSL";
      uploadSpeed = Math.floor(downloadSpeed * 0.25);
    } else if (infraData.ADSL?.PortState === "VAR") {
      technology = "ADSL";
      uploadSpeed = Math.floor(downloadSpeed * 0.15);
    }

    const ping = Math.floor(Math.random() * 30) + 10;

    // Profesyonel infrastructure data
    const infrastructure: InfrastructureData = {
      maxSpeed: maxSpeedKbps,
      svuid: infraData.SVUID || "",
      technologies: {
        fiber: {
          available: infraData.Fiber?.PortState === "VAR",
          distance: parseInt(infraData.Fiber?.Distance) || 0,
        },
        vdsl: {
          available: infraData.VDSL?.PortState === "VAR",
          distance: parseInt(infraData.VDSL?.Distance) || 0,
        },
        adsl: {
          available: infraData.ADSL?.PortState === "VAR",
          distance: parseInt(infraData.ADSL?.Distance) || 0,
        },
      },
    };

    return {
      address,
      downloadSpeed,
      uploadSpeed,
      ping,
      provider: "Unknown", // Fallback'te provider bilgisi yoksa Unknown
      technology,
      lastUpdated: new Date().toISOString().replace("T", " ").substring(0, 19),
      infrastructure,
      tracing: {
        steps: [],
        totalDuration: 0,
        aiModel: "gemini-flash-latest",
        success: true,
      },
    };
  }
}
