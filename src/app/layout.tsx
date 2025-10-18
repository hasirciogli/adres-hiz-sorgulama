import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Adres Hız Sorgulama",
  description: "Türkiye'deki herhangi bir adresin internet hızını öğrenin. Hızlı, güvenilir ve ücretsiz adres hız sorgulama servisi.",
  keywords: "adres hız sorgulama, internet hızı, Türkiye, fiber, adsl, vodafone, türk telekom",
  authors: [{ name: "Adres Hız Sorgulama" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
