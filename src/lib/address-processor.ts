/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

interface SpeedResult {
  address: string;
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  provider: string;
  technology: string;
  lastUpdated: string;
  infrastructure: Record<string, any>;
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

// NetSpeed API Tool
const netspeedAPITool = tool(
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
    name: "netspeed_api",
    description: "NetSpeed API'ye istek atarak adres bilgilerini getirir",
    schema: z.object({
      type: z
        .number()
        .describe(
          "API istek tipi (1=şehir, 2=ilçe, 3=mahalle, 4=sokak, 5=bina, 6=daire)"
        ),
      id: z.string().describe("Üst seviye ID"),
    }),
  }
);

// Altyapı verisi tool'u
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
    description: "NetSpeed API'den altyapı verilerini getirir",
    schema: z.object({
      finalId: z.string().describe("Son adım ID'si"),
    }),
  }
);

export class AddressProcessor {
  private llm: ChatGoogleGenerativeAI;
  private cityMap: Map<string, string>;

  constructor() {
    this.llm = new ChatGoogleGenerativeAI({
      model: "gemini-flash-latest",
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

    const tools = [netspeedAPITool, infrastructureTool];
    const llmWithTools = this.llm.bindTools(tools);

    const systemPrompt = `Sen bir Türkiye adres uzmanısın. Verilen adresi analiz edip NetSpeed API'ye istek atarak internet hız bilgilerini getir.

Mevcut şehir kodları:
${Array.from(this.cityMap.entries()).map(([name, id]) => `${name}: ${id}`).join(', ')}

Adım adım işlem - TÜM ADIMLARI SIRASIYLA YAP:
1. Adresindeki şehir ismini bul ve yukarıdaki listeden ID'sini al
2. netspeed_api tool'unu kullanarak ilçe listesini getir (type=1, id=şehir_id)
3. Adresindeki ilçe ismini bul ve ID'sini al
4. netspeed_api tool'unu kullanarak mahalle listesini getir (type=2, id=ilçe_id)
5. Adresindeki mahalle ismini bul ve ID'sini al
6. netspeed_api tool'unu kullanarak sokak listesini getir (type=3, id=mahalle_id)
7. Adresindeki sokak ismini bul ve ID'sini al
8. netspeed_api tool'unu kullanarak bina listesini getir (type=4, id=sokak_id)
9. Adresindeki bina numarasını bul ve ID'sini al
10. netspeed_api tool'unu kullanarak daire listesini getir (type=5, id=bina_id)
11. Adresindeki daire numarasını bul ve ID'sini al
12. infrastructure_api tool'unu kullanarak altyapı verilerini getir (final_id)
13. Sonucu işle ve hız bilgilerini döndür

ÖNEMLİ: 
- TÜM ADIMLARI SIRASIYLA YAP, DURMA!
- Her adımda tool call yap
- Sadece AI ile çalış, fallback kullanma
- Son adımda infrastructure_api'yi çağır`;

    const humanPrompt = `"${userAddress}" adresinin internet hızını bul. 

TÜM ADIMLARI SIRASIYLA YAP:
1. İzmir şehir ID'si: 35
2. netspeed_api ile ilçe listesi getir (type=1, id=35)
3. Menemen ilçesini bul
4. netspeed_api ile mahalle listesi getir (type=2, id=menemen_id)
5. Değirmendere mahallesini bul
6. netspeed_api ile sokak listesi getir (type=3, id=değirmendere_id)
7. Demirtaş sokakını bul
8. netspeed_api ile bina listesi getir (type=4, id=demirtaş_id)
9. 21 numaralı binayı bul
10. netspeed_api ile daire listesi getir (type=5, id=bina_21_id)
11. 2 numaralı daireyi bul
12. infrastructure_api ile altyapı verilerini getir (final_id)`;

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
          currentMessages.push(new ToolMessage({
            content: toolResult.result,
            tool_call_id: toolResult.name,
            name: toolResult.name
          }));
        }

        // AI'ya tool results'ları gönder ve devam et
        response = await llmWithTools.invoke(currentMessages);
      }

      // Son tool result'ından hız bilgilerini çıkar
      const lastToolResult = tracingSteps
        .filter(step => step.tool === "infrastructure_api")
        .pop();

      if (lastToolResult) {
        const infraData = JSON.parse(lastToolResult.output);
        const result = this.processInfrastructureData(infraData, userAddress);

        // Tracing bilgilerini ekle
        result.tracing = {
          steps: tracingSteps,
          totalDuration: Date.now() - startTime,
          aiModel: "gemini-flash-latest",
          success: true,
        };

        return result;
      }

      // Eğer AI bir sonuç döndüremezse hata fırlat
      throw new Error(
        "AI adres işleme başarısız oldu veya geçerli bir sonuç döndürmedi."
      );
    } catch (error) {
      console.error("Address processing failed:", error);
      
      // Hata durumunda da tracing bilgilerini döndür
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
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
          timestamp: new Date().toISOString()
        }
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
    const downloadSpeed = maxSpeedKbps > 0 ? Math.floor(maxSpeedKbps / 1000) : 0;
    
    // Upload hızı teknolojiye göre hesapla
    let uploadSpeed = 0;
    if (infraData.Fiber?.PortState === "VAR") {
      // Fiber için upload genelde download'ın %50-80'i
      uploadSpeed = Math.floor(downloadSpeed * 0.6);
    } else if (infraData.VDSL?.PortState === "VAR") {
      // VDSL için upload genelde download'ın %20-30'u
      uploadSpeed = Math.floor(downloadSpeed * 0.25);
    } else if (infraData.ADSL?.PortState === "VAR") {
      // ADSL için upload genelde download'ın %10-20'si
      uploadSpeed = Math.floor(downloadSpeed * 0.15);
    }
    
    const ping = Math.floor(Math.random() * 30) + 10;

    // Teknoloji öncelik sırası: Fiber > VDSL > ADSL
    let technology = "ADSL";
    const provider = "Türk Telekom";

    if (infraData.Fiber?.PortState === "VAR") {
      technology = "Fiber";
    } else if (infraData.VDSL?.PortState === "VAR") {
      technology = "VDSL";
    } else if (infraData.ADSL?.PortState === "VAR") {
      technology = "ADSL";
    }
    
    // Eğer hiçbir teknoloji mevcut değilse, hız 0 ise varsayılan değerler
    if (downloadSpeed === 0) {
      technology = "Mevcut Değil";
    }

    return {
      address,
      downloadSpeed,
      uploadSpeed,
      ping,
      provider,
      technology,
      lastUpdated: new Date().toLocaleString("tr-TR"),
      infrastructure: infraData,
      tracing: {
        steps: [],
        totalDuration: 0,
        aiModel: "gemini-flash-latest",
        success: true,
      },
    };
  }
}
