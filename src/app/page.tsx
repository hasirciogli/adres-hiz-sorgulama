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
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6">
              <Wifi className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Adres Hız Sorgulama
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Türkiye&apos;deki herhangi bir adresin internet hızını öğrenin. 
              AI destekli teknoloji ile gerçek zamanlı hız verileri.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Ücretsiz
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Hızlı Sonuç
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Güvenilir
              </span>
            </div>
          </div>

          {/* Search Form */}
          <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                Adres Sorgulama
              </CardTitle>
              <CardDescription className="text-base">
                Sorgulamak istediğiniz adresi detaylı bir şekilde girin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Örn: Atatürk Caddesi No:123, Beşiktaş/İstanbul"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="h-12 text-base border-2 focus:border-blue-500"
                    disabled={isLoading}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    💡 İpucu: Mahalle, sokak, bina numarası ve ilçe bilgilerini ekleyin
                  </p>
                </div>
                <Button 
                  onClick={handleSearch} 
                  disabled={isLoading || !address.trim()}
                  className="h-12 px-8 text-base font-medium bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      Sorgulanıyor...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4" />
                      Sorgula
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <Card className="mb-8 border-red-200 bg-red-50 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-800 mb-2">Sorgulama Hatası</h3>
                    <p className="text-red-700 mb-3">{error}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setError(null);
                          setResult(null);
                        }}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Tekrar Dene
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setError(null)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        Kapat
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {result && (
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  Sorgulama Sonucu
                </CardTitle>
                <CardDescription className="text-base">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  {result.address}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {/* Download Speed */}
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full mb-4">
                      <Wifi className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">İndirme Hızı</h3>
                    <div className={`text-3xl font-bold mb-2 ${getSpeedColor(result.downloadSpeed)}`}>
                      {result.downloadSpeed} Mbps
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${
                        getSpeedLabel(result.downloadSpeed) === "Hızlı" ? "bg-green-100 text-green-800" :
                        getSpeedLabel(result.downloadSpeed) === "Orta" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}
                    >
                      {getSpeedLabel(result.downloadSpeed)}
                    </Badge>
                  </div>

                  {/* Upload Speed */}
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 rounded-full mb-4">
                      <Wifi className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">Yükleme Hızı</h3>
                    <div className={`text-3xl font-bold mb-2 ${getSpeedColor(result.uploadSpeed)}`}>
                      {result.uploadSpeed} Mbps
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${
                        getSpeedLabel(result.uploadSpeed) === "Hızlı" ? "bg-green-100 text-green-800" :
                        getSpeedLabel(result.uploadSpeed) === "Orta" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}
                    >
                      {getSpeedLabel(result.uploadSpeed)}
                    </Badge>
                  </div>

                  {/* Ping */}
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-600 rounded-full mb-4">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">Ping</h3>
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {result.ping} ms
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${
                        result.ping < 30 ? "bg-green-100 text-green-800" :
                        result.ping < 60 ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}
                    >
                      {result.ping < 30 ? "Düşük" : result.ping < 60 ? "Orta" : "Yüksek"}
                    </Badge>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Sağlayıcı</h4>
                    <p className="text-gray-600 font-medium">{result.provider}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Teknoloji</h4>
                    <p className="text-gray-600 font-medium">{result.technology}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Son Güncelleme</h4>
                    <p className="text-gray-600 font-medium">{result.lastUpdated}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t">
                  <Button
                    onClick={() => {
                      setResult(null);
                      setError(null);
                      setAddress("");
                    }}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4" />
                    Yeni Sorgulama
                  </Button>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(result.address);
                    }}
                    variant="ghost"
                    className="flex items-center gap-2"
                  >
                    📋 Adresi Kopyala
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Section */}
          <Card id="nasil-calisir" className="mt-12 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                Nasıl Çalışır?
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                AI destekli teknoloji ile adres hız sorgulama süreci
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center group">
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-blue-600 font-bold text-xl">1</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-900">Adres Girin</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Sorgulamak istediğiniz adresi detaylı bir şekilde girin. 
                    Mahalle, sokak, bina numarası ve ilçe bilgilerini ekleyin.
                  </p>
                </div>
                <div className="text-center group">
                  <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-green-600 font-bold text-xl">2</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-900">AI Sorgulama</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Sistem adresinizi AI ile doğrular ve gerçek zamanlı 
                    hız bilgilerini altyapı verilerinden getirir.
                  </p>
                </div>
                <div className="text-center group">
                  <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-purple-600 font-bold text-xl">3</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-900">Detaylı Sonuç</h3>
                  <p className="text-gray-600 leading-relaxed">
                    İndirme/yükleme hızı, ping değeri, sağlayıcı ve 
                    teknoloji bilgilerini detaylı olarak görün.
                  </p>
                </div>
              </div>
              
              {/* Features */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-center text-gray-900 mb-6">
                  Özellikler
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700">Ücretsiz</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700">Hızlı Sonuç</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700">AI Destekli</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700">Güvenilir</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
