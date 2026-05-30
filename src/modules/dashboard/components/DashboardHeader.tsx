'use client';
import { TRANSACTION_TYPES } from '@/lib/constants';

import { useState, useEffect } from 'react';

import { usePathname } from 'next/navigation';

export default function DashboardHeader() {
  const pathname = usePathname();
  const activeView = pathname === '/' ? 'dashboard' : pathname.replace('/', '');
  const [isStandalone, setIsStandalone] = useState(true); // default true to avoid flash

  useEffect(() => {
    // Check if already installed or in standalone mode
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
        || (window.navigator as any).standalone 
        || document.referrer.includes('android-app://');
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsStandalone(isStandaloneMode);
  }, []);

  const triggerPwaPrompt = () => {
    window.dispatchEvent(new CustomEvent('force-pwa-prompt'));
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 lg:gap-8 mb-8 lg:mb-12">
      <div className="space-y-3 lg:space-y-4">
        
        <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-1.5 lg:mb-2 uppercase lg:normal-case">
            {activeView === 'dashboard' && 'Beranda Keuangan'}
            {activeView === 'saldo' && 'Manajemen Saldo'}
            {activeView === 'transaksi' && 'Daftar Transaksi'}
            {activeView === 'inquiry' && 'Inquiry Transaksi'}
            {activeView === TRANSACTION_TYPES.TRANSFER && 'Transfer Akun'}
            {activeView === 'anggaran' && 'Plan Anggaran'}
            {activeView === 'tabungan' && 'Sinking Funds'}
            {activeView === 'laporan' && 'Laporan Analitik'}
            {activeView === 'recurring' && 'Tagihan Rutin'}
            {activeView === 'master' && 'Master Data'}
          </h1>
          <p className="text-[11px] sm:text-xs lg:text-sm font-bold text-muted-foreground/60 max-w-lg leading-relaxed uppercase tracking-tighter lg:normal-case lg:tracking-normal">
            {activeView === 'dashboard' && '“Uang adalah hamba yang baik, tapi tuan yang buruk.” Kelola dengan bijak hari ini.'}
            {activeView === 'saldo' && 'Pantau pertumbuhan aset Anda dari waktu ke waktu.'}
            {activeView === 'transaksi' && 'Setiap rupiah memiliki cerita. Lihat jejak pengeluaran Anda.'}
            {activeView === TRANSACTION_TYPES.TRANSFER && 'Optimalkan distribusi likuiditas antar instrumen keuangan.'}
            {activeView === 'anggaran' && 'Disiplin anggaran adalah kunci kebebasan finansial jangka panjang.'}
            {activeView === 'tabungan' && 'Sisihkan untuk tujuan masa depan Anda.'}
            {activeView === 'laporan' && 'Visualisasi data membantu Anda mengambil keputusan yang lebih cerdas.'}
            {activeView === 'recurring' && 'Otomatisasi kewajiban agar fokus Anda tetap pada pertumbuhan.'}
            {activeView === 'master' && 'Fondasi data yang rapi menghasilkan analisis yang akurat.'}
          </p>
        </div>
      </div>
    </div>
  );
}
