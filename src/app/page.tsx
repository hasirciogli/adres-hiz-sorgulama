/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Wifi, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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

export default function Home() {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SpeedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!address.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/speed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: address.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API hatası oluştu');
      }

      if (data.success && data.data) {
        setResult(data.data);
      } else {
        throw new Error('Geçersiz API yanıtı');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Adres sorgulanırken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  const getSpeedColor = (speed: number) => {
    if (speed >= 50) return "text-green-600";
    if (speed >= 25) return "text-yellow-600";
    return "text-red-600";
  };

  const getSpeedLabel = (speed: number) => {
    if (speed >= 50) return "Hızlı";
    if (speed >= 25) return "Orta";
    return "Yavaş";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Adres Hız Sorgulama
            </h1>
            <p className="text-lg text-gray-600">
              Türkiye&apos;deki herhangi bir adresin internet hızını öğrenin
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Adres Sorgulama
              </CardTitle>
              <CardDescription>
                Sorgulamak istediğiniz adresi girin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="Örn: Atatürk Caddesi No:123, Beşiktaş/İstanbul"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={isLoading || !address.trim()}
                  className="px-8"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      Sorgulanıyor...
                    </div>
                  ) : (
                    "Sorgula"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <Card className="mb-8 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Sorgulama Sonucu
                </CardTitle>
                <CardDescription>
                  {result.address}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Download Speed */}
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Wifi className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <h3 className="font-semibold text-gray-900 mb-1">İndirme Hızı</h3>
                    <div className={`text-2xl font-bold ${getSpeedColor(result.downloadSpeed)}`}>
                      {result.downloadSpeed} Mbps
                    </div>
                    <Badge variant="secondary" className="mt-2">
                      {getSpeedLabel(result.downloadSpeed)}
                    </Badge>
                  </div>

                  {/* Upload Speed */}
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Wifi className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h3 className="font-semibold text-gray-900 mb-1">Yükleme Hızı</h3>
                    <div className={`text-2xl font-bold ${getSpeedColor(result.uploadSpeed)}`}>
                      {result.uploadSpeed} Mbps
                    </div>
                    <Badge variant="secondary" className="mt-2">
                      {getSpeedLabel(result.uploadSpeed)}
                    </Badge>
                  </div>

                  {/* Ping */}
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <h3 className="font-semibold text-gray-900 mb-1">Ping</h3>
                    <div className="text-2xl font-bold text-purple-600">
                      {result.ping} ms
                    </div>
                    <Badge variant="secondary" className="mt-2">
                      {result.ping < 30 ? "Düşük" : result.ping < 60 ? "Orta" : "Yüksek"}
                    </Badge>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Sağlayıcı</h4>
                    <p className="text-gray-600">{result.provider}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Teknoloji</h4>
                    <p className="text-gray-600">{result.technology}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Son Güncelleme</h4>
                    <p className="text-gray-600">{result.lastUpdated}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Nasıl Çalışır?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Adres Girin</h3>
                  <p className="text-gray-600 text-sm">
                    Sorgulamak istediğiniz adresi detaylı bir şekilde girin
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 font-bold">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Sorgulama</h3>
                  <p className="text-gray-600 text-sm">
                    Sistem adresinizi doğrular ve hız bilgilerini getirir
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Sonuç</h3>
                  <p className="text-gray-600 text-sm">
                    Detaylı hız bilgilerini ve sağlayıcı bilgilerini görün
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
