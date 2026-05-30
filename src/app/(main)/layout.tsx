'use client';

import { useEffect } from 'react';
import { useFinanceStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import Sidebar from '@/shared/layout/Sidebar';
import BottomNav from '@/shared/layout/BottomNav';
import LiquidBackground from '@/shared/ui/LiquidBackground';
import LoadingScreen from '@/shared/ui/LoadingScreen';
import DashboardHeader from '@/modules/dashboard/components/DashboardHeader';
import ModalOrchestrator from '@/modules/dashboard/components/ModalOrchestrator';
import FloatingMonthNav from '@/modules/dashboard/components/FloatingMonthNav';
import { Toaster } from 'sonner';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const initialize = useFinanceStore((s) => s.initialize);
  const isLoading = useFinanceStore((s) => s.isLoading);
  const isInitialized = useFinanceStore((s) => s.isInitialized);
  const isSidebarCollapsed = useFinanceStore((s) => s.isSidebarCollapsed);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading && !isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex min-h-dvh w-full relative bg-background overflow-x-hidden">
      <LiquidBackground />
      <Toaster richColors position="top-right" />

      <Sidebar />

      <div className={cn(
        "flex-1 w-full min-w-0 flex flex-col relative z-10 transition-[margin] duration-300 ease-out will-change-[margin] transform-gpu",
        isSidebarCollapsed ? "lg:ml-[76px]" : "lg:ml-[320px]"
      )}>
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 xl:p-10 pt-8 pb-32 lg:pb-8">
          <div className="mx-auto w-full max-w-[2000px]">
            {/* Premium Header Bar */}
            <DashboardHeader />

            {/* Content Views (Animated via template.tsx) */}
            {children}
          </div>
        </main>
      </div>

      <BottomNav />
      <FloatingMonthNav />

      {/* ======================== MODALS ======================== */}
      <ModalOrchestrator />
    </div>
  );
}
