import { ChevronLeft, ChevronRight, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { getNamaBulan, cn } from '@/lib/utils';

interface DashboardHeaderProps {
  activeView: string;
  activeMonth: string;
  isRefreshing: boolean;
  navigateMonth: (direction: -1 | 1) => void;
  handleRefresh: () => void;
}

export default function DashboardHeader({
  activeView,
  activeMonth,
  isRefreshing,
  navigateMonth,
  handleRefresh
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 lg:gap-8 mb-8 lg:mb-12">
      <div className="space-y-3 lg:space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50/80 text-indigo-600 border border-indigo-100/50 backdrop-blur-sm self-start animate-in fade-in slide-in-from-left-4 duration-700">
          <Sparkles size={10} className="animate-pulse lg:size-3" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Intelligence</span>
        </div>
        <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-1.5 lg:mb-2 uppercase lg:normal-case">
            {activeView === 'dashboard' && 'Beranda Keuangan'}
            {activeView === 'saldo' && 'Manajemen Saldo'}
            {activeView === 'transaksi' && 'Daftar Transaksi'}
            {activeView === 'transfer' && 'Transfer Akun'}
            {activeView === 'anggaran' && 'Plan Anggaran'}
            {activeView === 'laporan' && 'Laporan Analitik'}
            {activeView === 'recurring' && 'Tagihan Rutin'}
            {activeView === 'master' && 'Master Data'}
          </h1>
          <p className="text-[11px] sm:text-xs lg:text-sm font-bold text-muted-foreground/60 max-w-lg leading-relaxed uppercase tracking-tighter lg:normal-case lg:tracking-normal">
            {activeView === 'dashboard' && '“Uang adalah hamba yang baik, tapi tuan yang buruk.” Kelola dengan bijak hari ini.'}
            {activeView === 'saldo' && 'Pantau pertumbuhan aset Anda dari waktu ke waktu.'}
            {activeView === 'transaksi' && 'Setiap rupiah memiliki cerita. Lihat jejak pengeluaran Anda.'}
            {activeView === 'transfer' && 'Optimalkan distribusi likuiditas antar instrumen keuangan.'}
            {activeView === 'anggaran' && 'Disiplin anggaran adalah kunci kebebasan finansial jangka panjang.'}
            {activeView === 'laporan' && 'Visualisasi data membantu Anda mengambil keputusan yang lebih cerdas.'}
            {activeView === 'recurring' && 'Otomatisasi kewajiban agar fokus Anda tetap pada pertumbuhan.'}
            {activeView === 'master' && 'Fondasi data yang rapi menghasilkan analisis yang akurat.'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between lg:justify-end gap-3 lg:gap-4 animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
        {/* Month Navigator - Scandi Style */}
        <div className="flex items-center bg-white border border-border/40 rounded-[1.25rem] p-1 shadow-scandi transition-all hover:shadow-float flex-1 lg:flex-none">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => navigateMonth(-1)}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl hover:bg-muted/50 transition-colors shrink-0"
          >
            <ChevronLeft size={16} className="size-6 sm:size-8" />
          </Button>

          <div className="px-2 sm:px-6 flex flex-col items-center flex-1 lg:min-w-[160px]">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 leading-none mb-1">Periode</span>
            <span className="text-xs sm:text-sm font-black text-foreground display-number tracking-widest sm:tracking-tight whitespace-nowrap">
              {getNamaBulan(activeMonth)}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => navigateMonth(1)}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl hover:bg-muted/50 transition-colors shrink-0"
          >
            <ChevronRight size={16} className="size-6 sm:size-8" />
          </Button>
        </div>

        {/* Refresh with Tooltip-like style */}
        <Button
          variant="outline"
          size="icon-xs"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-10 w-10 sm:h-12 sm:w-12 rounded-[1.25rem] shadow-scandi border-border/40 bg-white hover:bg-muted/10 transition-all active:scale-95 group shrink-0"
        >
          <RefreshCw size={16} className={cn("size-6 sm:size-8 transition-all duration-700", isRefreshing ? 'animate-spin' : 'group-hover:rotate-180')} />
        </Button>
      </div>
    </div>
  );
}
