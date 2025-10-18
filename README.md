# 🚀 Adres Hız Sorgulama

> Türkiye'deki herhangi bir adresin internet hızını AI destekli teknoloji ile öğrenin

[![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3+-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Bun](https://img.shields.io/badge/Bun-1+-000000?style=for-the-badge&logo=bun)](https://bun.sh/)

## ✨ Özellikler

- 🔍 **AI Destekli Adres Sorgulama** - Gelişmiş AI teknolojisi ile adres doğrulama
- ⚡ **Gerçek Zamanlı Hız Verileri** - İndirme/yükleme hızı ve ping bilgileri
- 🏢 **Sağlayıcı Bilgileri** - İnternet sağlayıcısı ve teknoloji detayları
- 📱 **Responsive Tasarım** - Tüm cihazlarda mükemmel deneyim
- 🎨 **Modern UI/UX** - Glassmorphism efektleri ve gradient tasarımlar
- ⚡ **Hızlı Performans** - Optimized loading ve smooth animations
- 🔒 **Güvenli** - API güvenliği ve hata yönetimi

## 🛠️ Teknolojiler

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Package Manager**: Bun
- **Icons**: Lucide React
- **Analytics**: Vercel Analytics

## 🚀 Hızlı Başlangıç

### Gereksinimler

- [Bun](https://bun.sh/) (önerilen) veya Node.js 18+
- Git

### Kurulum

1. **Repository'yi klonlayın**
   ```bash
   git clone https://github.com/hasirciogli/adres-hiz-sorgulama.git
   cd adres-hiz-sorgulama
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   bun install
   ```

3. **Geliştirme sunucusunu başlatın**
   ```bash
   bun dev
   ```

4. **Tarayıcıda açın**
   ```
   http://localhost:3000
   ```

## 📁 Proje Yapısı

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── speed/         # Hız sorgulama API
│   ├── globals.css        # Global stiller
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Ana sayfa
├── components/            # React komponentleri
│   ├── ui/               # shadcn/ui komponentleri
│   └── navbar.tsx        # Navigation bar
├── hooks/                # Custom React hooks
├── lib/                  # Utility fonksiyonları
│   ├── address-processor.ts
│   └── utils.ts
└── types/                # TypeScript tip tanımları
```

## 🔧 API Kullanımı

### POST `/api/speed`

Adres hız sorgulama endpoint'i.

**Request:**
```json
{
  "address": "Atatürk Caddesi No:123, Beşiktaş/İstanbul"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "Atatürk Caddesi No:123, Beşiktaş/İstanbul",
    "downloadSpeed": 100,
    "uploadSpeed": 50,
    "ping": 15,
    "provider": "Türk Telekom",
    "technology": "Fiber",
    "lastUpdated": "2024-01-15T10:30:00Z",
    "infrastructure": { ... },
    "tracing": { ... }
  }
}
```

## 🎨 Tasarım Sistemi

Proje, modern ve minimalist bir tasarım sistemi kullanır:

- **Renkler**: Mavi tonları ve gradient efektleri
- **Tipografi**: Geist font ailesi
- **Spacing**: 8px grid sistemi
- **Animasyonlar**: 150-200ms smooth transitions
- **Responsive**: Mobile-first yaklaşım

## 🚀 Deployment

### Vercel (Önerilen)

1. [Vercel](https://vercel.com) hesabınızla giriş yapın
2. GitHub repository'nizi bağlayın
3. Otomatik deployment başlayacak

### Railway

1. [Railway](https://railway.app) hesabınızla giriş yapın
2. "Deploy from GitHub repo" seçin
3. Repository'nizi seçin ve deploy edin

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👨‍💻 Geliştirici

**Hasan İrcioğlu**
- GitHub: [@hasirciogli](https://github.com/hasirciogli)
- LinkedIn: [Hasan İrcioğlu](https://linkedin.com/in/hasircioglu)

## 🙏 Teşekkürler

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI komponentleri
- [Lucide](https://lucide.dev/) - Icon library
- [Vercel](https://vercel.com/) - Deployment platform

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!