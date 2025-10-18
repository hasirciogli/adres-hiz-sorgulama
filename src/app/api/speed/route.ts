/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { AddressProcessor } from '@/lib/address-processor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address || typeof address !== 'string' || address.trim().length === 0) {
      return NextResponse.json(
        { error: 'Geçerli bir adres giriniz' },
        { status: 400 }
      );
    }

    // Adres doğrulama
    const trimmedAddress = address.trim();
    if (trimmedAddress.length < 10) {
      return NextResponse.json(
        { error: 'Adres çok kısa. Lütfen daha detaylı bir adres giriniz.' },
        { status: 400 }
      );
    }

    // AI ile adres işleme (function calling ile)
    const processor = new AddressProcessor();
    const result = await processor.processAddress(trimmedAddress);
    
    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('API Error:', error);
    
    // Error'da tracing varsa onu da döndür
    const errorResponse: any = {
      success: false,
      error: error instanceof Error ? error.message : 'Sunucu hatası oluştu. Lütfen tekrar deneyin.'
    };
    
    // Eğer error'da tracing bilgisi varsa ekle
    if (error && typeof error === 'object' && 'tracing' in error) {
      errorResponse.tracing = (error as any).tracing;
    }
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Adres Hız Sorgulama API',
    version: '2.0.0',
    features: [
      'AI-powered address processing',
      'NetSpeed API integration',
      'Real infrastructure data',
      'Fallback mock data'
    ],
    endpoints: {
      POST: '/api/speed - Adres hız sorgulama'
    }
  });
}