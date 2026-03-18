import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import PWAInstallPrompt from "@/shared/ui/PWAInstallPrompt";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#4f46e5",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn("font-sans", geist.variable)}>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
