'use client';

import { useEffect, useState, useCallback } from 'react';
import { useFinanceStore } from '@/lib/store';
import { getNamaBulan, getCurrentMonth } from '@/lib/utils';

// Layout
import Sidebar from '@/components/layout/Sidebar';
import LiquidBackground from '@/components/ui/LiquidBackground';
import LoadingScreen from '@/components/ui/LoadingScreen';
import ToastContainer from '@/components/ui/ToastContainer';

// Dashboard Components
import SummaryCards from '@/components/dashboard/SummaryCards';
import SaldoCards from '@/components/dashboard/SaldoCards';
import ExpensePieChart from '@/components/dashboard/ExpensePieChart';
import WeeklyTrendChart from '@/components/dashboard/WeeklyTrendChart';
import BudgetStatusCard from '@/components/dashboard/BudgetStatusCard';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import RecurringList from '@/components/dashboard/RecurringList';

// Forms
import TransaksiForm from '@/components/forms/TransaksiForm';
import TransferForm from '@/components/forms/TransferForm';
import RecurringForm from '@/components/forms/RecurringForm';
import BudgetForm from '@/components/forms/BudgetForm';
import KategoriForm from '@/components/forms/KategoriForm';
import SumberDanaForm from '@/components/forms/SumberDanaForm';
import KategoriManagement from '@/components/dashboard/KategoriManagement';
import SumberDanaManagement from '@/components/dashboard/SumberDanaManagement';

import {
  Plus,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
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

  // State for editing master data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [kategoriToEdit, setKategoriToEdit] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sumberDanaToEdit, setSumberDanaToEdit] = useState<any>(null);

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
    <div className="flex min-h-screen w-full relative">
      <LiquidBackground />
      <ToastContainer />

      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      {/* Content Container fully independent from Sidebar mechanism */}
      <div className="flex-1 lg:ml-[260px] w-full min-w-0 flex flex-col relative z-10 transition-all duration-300">
        <main className="flex-1 w-full p-5 sm:p-6 lg:p-8 xl:p-10">
          <div className="mx-auto w-full max-w-[2000px]">
            {/* Header Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  {activeView === 'dashboard' && 'Dashboard Keuangan'}
                  {activeView === 'saldo' && 'Manajemen Saldo'}
                  {activeView === 'transaksi' && 'Input Transaksi'}
                  {activeView === 'transfer' && 'Transfer Antar Akun'}
                  {activeView === 'anggaran' && 'Anggaran Bulanan'}
                  {activeView === 'recurring' && 'Transaksi Berulang'}
                  {activeView === 'master' && 'Master Data'}
                </h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {activeView === 'dashboard' && 'Ringkasan keuangan Anda'}
                  {activeView === 'saldo' && 'Pantau saldo setiap akun secara real-time'}
                  {activeView === 'transaksi' && 'Catat pemasukan dan pengeluaran baru'}
                  {activeView === 'transfer' && 'Pindahkan saldo antar akun'}
                  {activeView === 'anggaran' && 'Atur dan pantau batas pengeluaran'}
                  {activeView === 'recurring' && 'Kelola transaksi terjadwal'}
                  {activeView === 'master' && 'Kelola kategori dan sumber dana Anda'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Month Navigator */}
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-1 py-1 shadow-sm">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Bulan sebelumnya"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm font-semibold px-3 min-w-[130px] text-center display-number">
                    {getNamaBulan(activeMonth)}
                  </span>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Bulan berikutnya"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                {/* Refresh */}
                <button
                  onClick={handleRefresh}
                  className="btn-secondary p-2.5! rounded-xl!"
                  aria-label="Refresh data"
                >
                  <RefreshCw
                    size={18}
                    className={isRefreshing ? 'animate-spin' : ''}
                  />
                </button>
              </div>
            </div>

            {/* ======================== VIEWS ======================== */}

            {/* Dashboard View */}
            {activeView === 'dashboard' && (
              <div className="space-y-6">
                <SummaryCards />
                <SaldoCards />
                <div className="chart-grid">
                  <ExpensePieChart />
                  <WeeklyTrendChart />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RecentTransactions limit={6} />
                  <BudgetStatusCard />
                </div>
              </div>
            )}

            {/* Saldo View */}
            {activeView === 'saldo' && (
              <div className="space-y-6">
                <SaldoCards />
                <RecentTransactions limit={20} showDelete />
              </div>
            )}

            {/* Transaksi View */}
            {activeView === 'transaksi' && (
              <div className="space-y-6">
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      Tambah Transaksi Baru
                    </h3>
                  </div>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Klik tombol di bawah untuk mencatat transaksi baru. Pilihan sumber dana dan kategori
                    otomatis terisi dari data master.
                  </p>
                  <button
                    onClick={() => setActiveModal('transaksi')}
                    className="btn-primary"
                  >
                    <Plus size={18} />
                    Input Transaksi
                  </button>
                </div>
                <RecentTransactions limit={30} showDelete />
              </div>
            )}

            {/* Transfer View */}
            {activeView === 'transfer' && (
              <div className="space-y-6">
                <SaldoCards />
                <div className="card">
                  <h3
                    className="text-sm font-bold uppercase tracking-wider mb-4"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Transfer Antar Akun
                  </h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Pindahkan saldo antar rekening tanpa memengaruhi total pemasukan atau pengeluaran.
                    Contoh: Tarik tunai dari ATM ke Cash, atau isi saldo E-Wallet.
                  </p>
                  <button
                    onClick={() => setActiveModal('transfer')}
                    className="btn-primary"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)' }}
                  >
                    <Plus size={18} />
                    Buat Transfer
                  </button>
                </div>
              </div>
            )}

            {/* Anggaran View */}
            {activeView === 'anggaran' && (
              <div className="space-y-6">
                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3
                        className="text-sm font-bold uppercase tracking-wider mb-1"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Pengaturan Anggaran
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Tetapkan batas pengeluaran per kategori untuk bulan ini.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveModal('budget')}
                      className="btn-primary"
                    >
                      <Plus size={18} />
                      Tambah Anggaran
                    </button>
                  </div>
                </div>
                <BudgetStatusCard />
              </div>
            )}

            {/* Recurring View */}
            {activeView === 'recurring' && (
              <div className="space-y-6">
                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3
                        className="text-sm font-bold uppercase tracking-wider mb-1"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Jadwal Transaksi
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Kelola tagihan bulanan dan pemasukan rutin otomatis.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveModal('recurring')}
                      className="btn-primary"
                    >
                      <Plus size={18} />
                      Buat Jadwal
                    </button>
                  </div>
                </div>
                <RecurringList />
              </div>
            )}

            {/* Master Data View */}
            {activeView === 'master' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
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
        </main>
      </div>

      {/* ======================== FAB (Mobile) ======================== */}
      <button
        className="fab"
        onClick={() => setActiveModal('transaksi')}
        aria-label="Tambah transaksi"
      >
        <Plus size={26} />
      </button>

      {/* ======================== MODALS ======================== */}
      {activeModal === 'transaksi' && (
        <TransaksiForm onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'transfer' && (
        <TransferForm onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'recurring' && (
        <RecurringForm onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'budget' && (
        <BudgetForm onClose={() => setActiveModal(null)} />
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
    </div>
  );
}
