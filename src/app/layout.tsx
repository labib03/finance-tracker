import type { Metadata, Viewport } from "next";
import { Google_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import PWAInstallPrompt from "@/shared/ui/PWAInstallPrompt";

const googleSans = Google_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "FinanceTracker — Pemantau Keuangan Pribadi",
  description:
    "Aplikasi web pemantau keuangan pribadi. Kelola transaksi, saldo, anggaran, dan laporan keuangan Anda dengan mudah dan elegan.",
  keywords: [
    "finance tracker",
    "keuangan pribadi",
    "pencatatan keuangan",
    "anggaran",
    "budgeting",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FinanceTracker",
  },
  openGraph: {
    title: "FinanceTracker — Pemantau Keuangan Pribadi",
    description: "Aplikasi web pemantau keuangan pribadi. Kelola transaksi, saldo, anggaran, dan laporan keuangan Anda dengan mudah dan elegan.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="font-sans">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${googleSans.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
