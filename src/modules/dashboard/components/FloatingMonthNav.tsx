'use client';

import { useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowUp, X, CalendarDays } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { getNamaBulan, getCurrentMonth } from '@/lib/utils';
import { useFinanceStore } from '@/lib/store';

export default function FloatingMonthNav() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  
  const activeMonth = useFinanceStore((s) => s.activeMonth);
  const setActiveMonth = useFinanceStore((s) => s.setActiveMonth);
  const cycleStartDay = useFinanceStore((s) => s.cycleStartDay);
  const lastScrollY = useRef(0);

  const isCurrentMonth = activeMonth === getCurrentMonth(cycleStartDay);

  const goToCurrentMonth = () => {
    setActiveMonth(getCurrentMonth(cycleStartDay));
  };

  const navigateMonth = (direction: -1 | 1) => {
    const [year, month] = activeMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + direction, 1);
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setActiveMonth(newMonth);
  };

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY.current;
    const diff = latest - previous;

    // Reset visibility near top
    if (latest < 50) {
      setIsVisible(true);
      setIsDismissed(false);
      lastScrollY.current = latest;
      return;
    }

    // Accumulate scroll difference until it hits a small threshold (prevents jitter, allows slow scroll)
    if (Math.abs(diff) < 15) return;

    // Update the reference only when threshold is met
    lastScrollY.current = latest;

    if (diff > 0) {
      // Scrolling down -> hide
      setIsVisible(false);
    } else {
      // Scrolling up -> show
      setIsVisible(true);
      setIsDismissed(false);
    }
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  const isFormPage = pathname.includes('/baru') || pathname.includes('/edit');
  if (isFormPage) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0, x: '-50%', scale: 0.95 }}
          animate={{ y: 0, opacity: 1, x: '-50%', scale: 1 }}
          exit={{ y: 100, opacity: 0, x: '-50%', scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.5 }}
          className="fixed bottom-24 lg:bottom-10 left-1/2 z-40 flex items-center p-1.5 gap-1 rounded-full shadow-lg shadow-slate-200/20 dark:shadow-none bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50"
        >
          {/* Scroll to Top */}
          <button
            onClick={scrollToTop}
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
            title="Ke Atas"
          >
            <ArrowUp size={18} strokeWidth={2} />
          </button>

          {/* Divider */}
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-800" />

          {/* Month Navigator */}
          <div className="flex items-center px-1">
            <button
              onClick={() => navigateMonth(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
            >
              <ChevronLeft size={18} strokeWidth={2} />
            </button>

            <div className="px-3 flex items-center justify-center min-w-[120px]">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 tracking-tight">
                {getNamaBulan(activeMonth)}
              </span>
            </div>

            <button
              onClick={() => navigateMonth(1)}
              className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
            >
              <ChevronRight size={18} strokeWidth={2} />
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-800" />

          {/* Go to Current Month */}
          {!isCurrentMonth && (
            <>
              <button
                onClick={goToCurrentMonth}
                className="w-10 h-10 flex items-center justify-center rounded-full text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors active:scale-95"
                title="Ke Periode Berjalan"
              >
                <CalendarDays size={18} strokeWidth={2} />
              </button>
              
              {/* Divider */}
              <div className="w-px h-4 bg-slate-200 dark:bg-slate-800" />
            </>
          )}

          {/* Close */}
          <button
            onClick={handleDismiss}
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors active:scale-95"
            title="Tutup"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
