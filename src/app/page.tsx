'use client';

import { useEffect, useState, useCallback } from 'react';
import { useFinanceStore } from '@/lib/store';
import { getNamaBulan, cn, getToday } from '@/lib/utils';

// Layout
import Sidebar from '@/components/layout/Sidebar';
import LiquidBackground from '@/components/ui/LiquidBackground';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Toaster } from 'sonner';

// Dashboard Components
import SummaryCards from '@/components/dashboard/SummaryCards';
import SaldoCards from '@/components/dashboard/SaldoCards';
import ExpensePieChart from '@/components/dashboard/ExpensePieChart';
import WeeklyTrendChart from '@/components/dashboard/WeeklyTrendChart';
import BudgetStatusCard from '@/components/dashboard/BudgetStatusCard';
import RecurringReminder from '@/components/dashboard/RecurringReminder';
import TransactionsTable from '@/components/dashboard/TransactionsTable';
import RecurringList from '@/components/dashboard/RecurringList';
import CategoryReport from '@/components/dashboard/CategoryReport';

// Forms
import TransaksiForm from '@/components/forms/TransaksiForm';
import TransferForm from '@/components/forms/TransferForm';
import RecurringForm from '@/components/forms/RecurringForm';
import BudgetForm from '@/components/forms/BudgetForm';
import BudgetManagement from '@/components/dashboard/BudgetManagement';
import KategoriForm from '@/components/forms/KategoriForm';
import SumberDanaForm from '@/components/forms/SumberDanaForm';
import MasterDataManagement from '@/components/dashboard/MasterDataManagement';
import CycleSettingsForm from '@/components/forms/CycleSettingsForm';

import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function HomePage() {
  const initialize = useFinanceStore((s) => s.initialize);
  const isLoading = useFinanceStore((s) => s.isLoading);
  const isInitialized = useFinanceStore((s) => s.isInitialized);
  const activeMonth = useFinanceStore((s) => s.activeMonth);
  const setActiveMonth = useFinanceStore((s) => s.setActiveMonth);
  const activeModal = useFinanceStore((s) => s.activeModal);
  const setActiveModal = useFinanceStore((s) => s.setActiveModal);
  const refreshData = useFinanceStore((s) => s.refreshData);
  const isSidebarCollapsed = useFinanceStore((s) => s.isSidebarCollapsed);

  const [activeView, setActiveView] = useState('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // State for editing data
  const [kategoriToEdit, setKategoriToEdit] = useState<any>(null);
  const [sumberDanaToEdit, setSumberDanaToEdit] = useState<any>(null);
  const [transaksiToEdit, setTransaksiToEdit] = useState<any>(null);
  const [recurringToEdit, setRecurringToEdit] = useState<any>(null);
  const [budgetToEdit, setBudgetToEdit] = useState<any>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 600);
  }, [refreshData]);

  const navigateMonth = useCallback(
    (direction: -1 | 1) => {
      const [year, month] = activeMonth.split('-').map(Number);
      const date = new Date(year, month - 1 + direction, 1);
      const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      setActiveMonth(newMonth);
    },
    [activeMonth, setActiveMonth]
  );

  if (isLoading && !isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex min-h-screen w-full relative bg-background">
      <LiquidBackground />
      <Toaster richColors position="top-right" />

      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      <div className={cn(
          "flex-1 w-full min-w-0 flex flex-col relative z-10 transition-[margin] duration-300 ease-out will-change-[margin] transform-gpu",
          isSidebarCollapsed ? "lg:ml-[76px]" : "lg:ml-[320px]"
      )}>
        <main className="flex-1 w-full p-5 sm:p-6 lg:p-8 xl:p-10 pt-20 lg:pt-8">
          <div className="mx-auto w-full max-w-[2000px]">
            {/* Premium Header Bar */}
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

            {/* Content Views */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              {activeView === 'dashboard' && (
                <div className="space-y-8">
                  <SummaryCards />
                  <div className="chart-grid">
                    <ExpensePieChart />
                    <WeeklyTrendChart />
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <BudgetStatusCard />
                    <RecurringReminder 
                      onViewAll={() => setActiveView('recurring')} 
                      onProcess={(r) => {
                        setTransaksiToEdit({
                          id: '', // Kosong agar dideteksi sebagai transaksi baru
                          tanggal: getToday(),
                          jenis: r.jenis,
                          id_sumber_dana: r.id_sumber_dana,
                          id_kategori: r.id_kategori,
                          nominal: r.nominal,
                          label: r.label,
                          catatan: r.catatan,
                          id_target_dana: ''
                        } as any);
                        setActiveModal('transaksi');
                      }}
                    />
                  </div>

                  <TransactionsTable 
                    limit={10} 
                    title="Riwayat Transaksi Terkini" 
                    description="X transaksi terakhir dalam periode ini"
                    showEdit
                    onEdit={(t) => {
                      setTransaksiToEdit(t);
                      if (t.jenis === 'Transfer') {
                        setActiveModal('transfer');
                      } else {
                        setActiveModal('transaksi');
                      }
                    }}
                  />
                </div>
              )}

              {activeView === 'saldo' && (
                <div className="space-y-6">
                  <SaldoCards />
                   <TransactionsTable 
                     limit={20} 
                     showDelete 
                     showEdit
                     onEdit={(t) => {
                       setTransaksiToEdit(t);
                       if (t.jenis === 'Transfer') {
                         setActiveModal('transfer');
                       } else {
                         setActiveModal('transaksi');
                       }
                     }}
                     title="Log Transaksi Akun" 
                   />
                </div>
              )}

              {activeView === 'transaksi' && (
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => {
                        setTransaksiToEdit(null);
                        setActiveModal('transaksi');
                      }} 
                      className="rounded-full px-6"
                    >
                      <Plus size={18} className="mr-2" />
                      Tambah Transaksi
                    </Button>
                  </div>
                  <TransactionsTable 
                    limit={50} 
                    showDelete 
                    showEdit
                    onEdit={(t: any) => {
                      setTransaksiToEdit(t);
                      if (t.jenis === 'Transfer') {
                        setActiveModal('transfer');
                      } else {
                        setActiveModal('transaksi');
                      }
                    }}
                    title="Semua Transaksi" 
                  />
                </div>
              )}

              {activeView === 'transfer' && (
                <div className="space-y-8">
                  <SaldoCards />

                  {/* Transfer Hero Card */}
                  <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-scandi border border-border/40 relative overflow-hidden group transition-all duration-500 hover:shadow-float">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/50 shadow-sm">
                          <Sparkles size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                          <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Transfer Antar Akun</h3>
                          <p className="text-xs font-medium text-muted-foreground/80 uppercase tracking-widest mt-1 max-w-md">
                            Pindahkan saldo antar rekening tanpa memengaruhi total pemasukan atau pengeluaran
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          setTransaksiToEdit(null);
                          setActiveModal('transfer');
                        }}
                        className="rounded-2xl px-6 h-11 bg-foreground text-background hover:bg-foreground/90 shadow-lg text-xs font-black uppercase tracking-widest shrink-0"
                      >
                        <Plus size={16} className="mr-2" />
                        Buat Transfer
                      </Button>
                    </div>
                  </div>

                  {/* Transfer History */}
                  <TransactionsTable 
                    limit={30} 
                    showDelete 
                    showEdit
                    filterType="Transfer"
                    onEdit={(t) => {
                      setTransaksiToEdit(t);
                      setActiveModal('transfer');
                    }}
                    title="Riwayat Transfer" 
                    description="Semua mutasi antar akun"
                  />
                </div>
              )}

              {activeView === 'anggaran' && (
                <div className="space-y-6">
                  <BudgetManagement 
                    onAdd={() => {
                        setBudgetToEdit(null);
                        setActiveModal('budget');
                    }}
                    onEdit={(b: any) => {
                        setBudgetToEdit(b);
                        setActiveModal('budget');
                    }}
                  />
                </div>
              )}

              {activeView === 'laporan' && (
                <div className="space-y-6">
                  <CategoryReport />
                </div>
              )}

              {activeView === 'recurring' && (
                <div className="space-y-6">
                  <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <div>
                        <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Jadwal Transaksi</CardTitle>
                        <CardDescription>Kelola tagihan bulanan dan pemasukan rutin otomatis.</CardDescription>
                      </div>
                      <Button 
                        onClick={() => {
                          setRecurringToEdit(null);
                          setActiveModal('recurring');
                        }} 
                        className="rounded-full px-6"
                      >
                        <Plus size={18} className="mr-2" />
                        Buat Jadwal
                      </Button>
                    </CardHeader>
                  </Card>
                  <RecurringList 
                    onEdit={(r: any) => {
                      setRecurringToEdit(r);
                      setActiveModal('recurring');
                    }}
                  />
                </div>
              )}

              {activeView === 'master' && (
                <MasterDataManagement
                  onAddKategori={() => {
                    setKategoriToEdit(null);
                    setActiveModal('kategori');
                  }}
                  onEditKategori={(k) => {
                    setKategoriToEdit(k);
                    setActiveModal('kategori');
                  }}
                  onAddSumberDana={() => {
                    setSumberDanaToEdit(null);
                    setActiveModal('sumber_dana');
                  }}
                  onEditSumberDana={(s) => {
                    setSumberDanaToEdit(s);
                    setActiveModal('sumber_dana');
                  }}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ======================== FAB (Mobile) ======================== */}
      <Button
        className="fixed bottom-6 right-6 lg:hidden z-40 w-14 h-14 rounded-full shadow-lg"
        onClick={() => setActiveModal('transaksi')}
        aria-label="Tambah transaksi"
      >
        <Plus size={26} />
      </Button>

      {/* ======================== MODALS ======================== */}
      {activeModal === 'transaksi' && (
        <TransaksiForm 
          onClose={() => {
            setActiveModal(null);
            setTransaksiToEdit(null);
          }} 
          transaksiToEdit={transaksiToEdit}
        />
      )}
      {activeModal === 'transfer' && (
        <TransferForm 
          onClose={() => {
            setActiveModal(null);
            setTransaksiToEdit(null);
          }} 
          transferToEdit={transaksiToEdit}
        />
      )}
      {activeModal === 'recurring' && (
        <RecurringForm 
          onClose={() => {
            setActiveModal(null);
            setRecurringToEdit(null);
          }} 
          recurringToEdit={recurringToEdit}
        />
      )}
      {activeModal === 'budget' && (
        <BudgetForm 
          onClose={() => {
            setActiveModal(null);
            setBudgetToEdit(null);
          }} 
          budgetToEdit={budgetToEdit}
        />
      )}
      {activeModal === 'kategori' && (
        <KategoriForm
          onClose={() => {
            setActiveModal(null);
            setKategoriToEdit(null);
          }}
          kategoriToEdit={kategoriToEdit}
        />
      )}
      {activeModal === 'sumber_dana' && (
        <SumberDanaForm
          onClose={() => {
            setActiveModal(null);
            setSumberDanaToEdit(null);
          }}
          sumberDanaToEdit={sumberDanaToEdit}
        />
      )}
      {activeModal === 'cycle_settings' && (
        <CycleSettingsForm
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
