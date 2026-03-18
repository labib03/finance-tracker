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
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
          <Sparkles size={12} className="animate-pulse" />
          <span className="text-xs font-black uppercase tracking-widest">Premium Intelligence</span>
        </div>
        <div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-widest text-foreground mb-2">
            {activeView === 'dashboard' && 'Beranda Keuangan'}
            {activeView === 'saldo' && 'Manajemen Saldo'}
            {activeView === 'transaksi' && 'Daftar Transaksi'}
            {activeView === 'transfer' && 'Transfer Akun'}
            {activeView === 'anggaran' && 'Plan Anggaran'}
            {activeView === 'laporan' && 'Laporan Analitik'}
            {activeView === 'recurring' && 'Tagihan Rutin'}
            {activeView === 'master' && 'Master Data'}
          </h1>
          <p className="text-sm font-medium text-muted-foreground/80 max-w-lg leading-relaxed italic">
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

      <div className="flex items-center gap-4">
        {/* Month Navigator - Scandi Style */}
        <div className="flex items-center bg-white border border-border/40 rounded-[1.25rem] p-1.5 shadow-scandi transition-all hover:shadow-float">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth(-1)}
            className="h-9 w-9 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <ChevronLeft size={18} />
          </Button>
          
          <div className="px-6 flex flex-col items-center min-w-[160px]">
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/80 leading-none mb-1">Periode</span>
            <span className="text-sm font-black text-foreground display-number tracking-tight">
              {getNamaBulan(activeMonth)}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth(1)}
            className="h-9 w-9 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <ChevronRight size={18} />
          </Button>
        </div>

        {/* Refresh with Tooltip-like style */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-12 w-12 rounded-[1.25rem] shadow-scandi border-border/40 bg-white hover:bg-muted/10 transition-all active:scale-95 group"
        >
          <RefreshCw size={18} className={cn("transition-all duration-700", isRefreshing ? 'animate-spin' : 'group-hover:rotate-180')} />
        </Button>
      </div>
    </div>
  );
}
