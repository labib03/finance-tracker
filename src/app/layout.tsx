import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
