'use client';

import { useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowUp, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { getNamaBulan } from '@/lib/utils';
import { useFinanceStore } from '@/lib/store';

export default function FloatingMonthNav() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  
  const activeMonth = useFinanceStore((s) => s.activeMonth);
  const setActiveMonth = useFinanceStore((s) => s.setActiveMonth);
  const lastScrollY = useRef(0);

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
          initial={{ y: 100, opacity: 0, x: '-50%', scale: 0.9 }}
          animate={{ y: 0, opacity: 1, x: '-50%', scale: 1 }}
          exit={{ y: 100, opacity: 0, x: '-50%', scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25, mass: 0.8 }}
          className="fixed bottom-24 lg:bottom-10 left-1/2 z-[60] flex items-center p-1.5 sm:p-2 gap-1 sm:gap-2 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.24)] bg-background/60 dark:bg-background/40 backdrop-blur-2xl saturate-150 border border-white/20 dark:border-white/5 ring-1 ring-black/5 dark:ring-white/10"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollToTop}
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full hover:bg-white/50 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105 active:scale-95 shrink-0 group"
            title="Scroll to Top"
          >
            <ArrowUp size={20} className="group-hover:-translate-y-0.5 transition-transform duration-300" />
          </Button>

          <div className="flex items-center rounded-full p-1 shadow-inner bg-black/5 dark:bg-black/20 border border-black/5 dark:border-white/5">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => navigateMonth(-1)}
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 hover:scale-110 active:scale-90 shrink-0"
            >
              <ChevronLeft size={18} />
            </Button>

            <div className="px-3 sm:px-6 flex flex-col items-center min-w-[120px] sm:min-w-[160px]">
              <span className="text-[9px] font-black uppercase tracking-[0.25em] bg-gradient-to-br from-primary/70 to-primary/40 bg-clip-text text-transparent leading-none mb-1">Periode</span>
              <span className="text-xs sm:text-sm font-black text-foreground display-number tracking-widest sm:tracking-tight whitespace-nowrap drop-shadow-sm">
                {getNamaBulan(activeMonth)}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => navigateMonth(1)}
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 hover:scale-110 active:scale-90 shrink-0"
            >
              <ChevronRight size={18} />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 transition-all duration-300 hover:scale-105 hover:rotate-90 active:scale-95 shrink-0"
            title="Tutup"
          >
            <X size={20} />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
