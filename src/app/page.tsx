'use client';

import { useEffect, useState, useCallback } from 'react';
import { useFinanceStore } from '@/lib/store';
import { getNamaBulan, cn, getToday } from '@/lib/utils';

// Layout
import Sidebar from '@/shared/layout/Sidebar';
import LiquidBackground from '@/shared/ui/LiquidBackground';
import LoadingScreen from '@/shared/ui/LoadingScreen';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Toaster } from 'sonner';

// Dashboard Views
import DashboardView from '@/modules/dashboard/views/DashboardView';
import SaldoView from '@/modules/dashboard/views/SaldoView';
import TransaksiView from '@/modules/dashboard/views/TransaksiView';
import TransferView from '@/modules/dashboard/views/TransferView';
import AnggaranView from '@/modules/dashboard/views/AnggaranView';
import LaporanView from '@/modules/dashboard/views/LaporanView';
import RecurringView from '@/modules/dashboard/views/RecurringView';
import MasterView from '@/modules/dashboard/views/MasterView';

// Forms & Modals
import ModalOrchestrator from '@/modules/dashboard/components/ModalOrchestrator';
import DashboardHeader from '@/modules/dashboard/components/DashboardHeader';

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
            <DashboardHeader 
              activeView={activeView}
              activeMonth={activeMonth}
              isRefreshing={isRefreshing}
              navigateMonth={navigateMonth}
              handleRefresh={handleRefresh}
            />

            {/* Content Views */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              {activeView === 'dashboard' && (
                <DashboardView
                  setActiveView={setActiveView}
                  setActiveModal={setActiveModal}
                  setTransaksiToEdit={setTransaksiToEdit}
                />
              )}

              {activeView === 'saldo' && (
                <SaldoView
                  setActiveModal={setActiveModal}
                  setTransaksiToEdit={setTransaksiToEdit}
                />
              )}

              {activeView === 'transaksi' && (
                <TransaksiView
                  setActiveModal={setActiveModal}
                  setTransaksiToEdit={setTransaksiToEdit}
                />
              )}

              {activeView === 'transfer' && (
                <TransferView
                  setActiveModal={setActiveModal}
                  setTransaksiToEdit={setTransaksiToEdit}
                />
              )}

              {activeView === 'anggaran' && (
                <AnggaranView
                  setActiveModal={setActiveModal}
                  setBudgetToEdit={setBudgetToEdit}
                />
              )}

              {activeView === 'laporan' && <LaporanView />}

              {activeView === 'recurring' && (
                <RecurringView
                  setActiveModal={setActiveModal}
                  setRecurringToEdit={setRecurringToEdit}
                />
              )}

              {activeView === 'master' && (
                <MasterView
                  setActiveModal={setActiveModal}
                  setKategoriToEdit={setKategoriToEdit}
                  setSumberDanaToEdit={setSumberDanaToEdit}
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
      <ModalOrchestrator 
        transaksiToEdit={transaksiToEdit}
        setTransaksiToEdit={setTransaksiToEdit}
        recurringToEdit={recurringToEdit}
        setRecurringToEdit={setRecurringToEdit}
        budgetToEdit={budgetToEdit}
        setBudgetToEdit={setBudgetToEdit}
        kategoriToEdit={kategoriToEdit}
        setKategoriToEdit={setKategoriToEdit}
        sumberDanaToEdit={sumberDanaToEdit}
        setSumberDanaToEdit={setSumberDanaToEdit}
      />
    </div>
  );
}
