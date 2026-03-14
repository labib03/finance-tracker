'use client';

import { useEffect, useState, useCallback } from 'react';
import { useFinanceStore } from '@/lib/store';
import { getNamaBulan } from '@/lib/utils';

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
import KategoriManagement from '@/components/dashboard/KategoriManagement';
import SumberDanaManagement from '@/components/dashboard/SumberDanaManagement';
import CycleSettingsForm from '@/components/forms/CycleSettingsForm';

import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw 
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

      {/* Content Container fully independent from Sidebar mechanism */}
      <div className="flex-1 lg:ml-[280px] w-full min-w-0 flex flex-col relative z-10 transition-all duration-300">
        <main className="flex-1 w-full p-5 sm:p-6 lg:p-8 xl:p-10 pt-20 lg:pt-8">
          <div className="mx-auto w-full max-w-[2000px]">
            {/* Header Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {activeView === 'dashboard' && 'Dashboard Keuangan'}
                  {activeView === 'saldo' && 'Manajemen Saldo'}
                  {activeView === 'transaksi' && 'Daftar Transaksi'}
                  {activeView === 'transfer' && 'Transfer Antar Akun'}
                  {activeView === 'anggaran' && 'Anggaran Bulanan'}
                  {activeView === 'laporan' && 'Laporan Analitik'}
                  {activeView === 'recurring' && 'Transaksi Berulang'}
                  {activeView === 'master' && 'Master Data'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeView === 'dashboard' && 'Ringkasan keuangan Anda'}
                  {activeView === 'saldo' && 'Pantau saldo setiap akun secara real-time'}
                  {activeView === 'transaksi' && 'Lihat dan kelola riwayat transaksi'}
                  {activeView === 'transfer' && 'Pindahkan saldo antar akun'}
                  {activeView === 'anggaran' && 'Atur dan pantau batas pengeluaran'}
                  {activeView === 'laporan' && 'Analisis perbandingan pengeluaran per kategori'}
                  {activeView === 'recurring' && 'Kelola transaksi terjadwal'}
                  {activeView === 'master' && 'Kelola kategori dan sumber dana Anda'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Month Navigator */}
                <div className="flex items-center gap-1 bg-white border border-border rounded-xl px-1 py-1 shadow-sm">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateMonth(-1)}
                    className="h-8 w-8 rounded-lg"
                    aria-label="Bulan sebelumnya"
                  >
                    <ChevronLeft size={18} />
                  </Button>
                  <span className="text-sm font-semibold px-3 min-w-[130px] text-center display-number">
                    {getNamaBulan(activeMonth)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateMonth(1)}
                    className="h-8 w-8 rounded-lg"
                    aria-label="Bulan berikutnya"
                  >
                    <ChevronRight size={18} />
                  </Button>
                </div>

                {/* Refresh */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="rounded-xl shadow-sm bg-white"
                >
                  <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
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
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                      <div className="xl:col-span-2">
                         <TransactionsTable 
                           limit={6} 
                           title="Transaksi Terakhir" 
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
                      <div className="grid grid-cols-1 gap-8 content-start h-fit">
                        <RecurringReminder onViewAll={() => setActiveView('recurring')} />
                        <BudgetStatusCard />
                      </div>
                    </div>
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
                <div className="space-y-6">
                  <SaldoCards />
                  <Card className="max-w-3xl border-none shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Transfer Antar Akun</CardTitle>
                      <CardDescription>
                        Pindahkan saldo antar rekening tanpa memengaruhi total pemasukan atau pengeluaran.
                        Contoh: Tarik tunai dari ATM ke Cash, atau isi saldo E-Wallet.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => setActiveModal('transfer')}
                        className="rounded-full px-6"
                      >
                        <Plus size={18} className="mr-2" />
                        Buat Transfer
                      </Button>
                    </CardContent>
                  </Card>
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
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                  <KategoriManagement
                    onAdd={() => {
                      setKategoriToEdit(null);
                      setActiveModal('kategori');
                    }}
                    onEdit={(k) => {
                      setKategoriToEdit(k);
                      setActiveModal('kategori');
                    }}
                  />
                  <SumberDanaManagement
                    onAdd={() => {
                      setSumberDanaToEdit(null);
                      setActiveModal('sumber_dana');
                    }}
                    onEdit={(s) => {
                      setSumberDanaToEdit(s);
                      setActiveModal('sumber_dana');
                    }}
                  />
                </div>
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
