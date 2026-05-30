'use client';
import { TRANSACTION_TYPES } from '@/lib/constants';

import React from 'react';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/dialog';
import { DailyTransactionSummary } from '../utils/calendarDataTransform';
import { formatRupiah } from '@/lib/utils';
import { CategoryIcon } from '@/shared/ui/CategoryIcon';
import { Badge } from '@/shared/ui/badge';
import { useFinanceStore } from '@/lib/store';
import { getRootLabel } from '@/lib/tipeUtils';

interface ExpenseDayDetailsModalProps {
  dateStr: string;
  data: DailyTransactionSummary | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExpenseDayDetailsModal({
  dateStr,
  data,
  isOpen,
  onClose,
}: ExpenseDayDetailsModalProps) {
  const { tipeList } = useFinanceStore();
  
  if (!data) return null;

  const dateObj = parseISO(dateStr);
  const formattedDate = format(dateObj, 'EEEE, dd MMMM yyyy', { locale: localeId });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] w-[95vw] max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl">
        <DialogHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <DialogTitle className="text-xl font-bold">Detail Pengeluaran</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            {formattedDate}
          </DialogDescription>
        </DialogHeader>
        
        {/* Total Summary */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Pemasukan</span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatRupiah(data.totalIncome || 0)}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
          <div className="flex flex-col text-center">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Transfer</span>
            <span className="text-xl font-bold text-sky-600 dark:text-sky-400">
              {formatRupiah(data.totalTransfer || 0)}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
          <div className="flex flex-col text-right">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Pengeluaran</span>
            <span className="text-xl font-bold text-rose-600 dark:text-rose-400">
              {formatRupiah(data.totalExpense || 0)}
            </span>
          </div>
        </div>

        {/* Transaction List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {data.transactions.length === 0 ? (
            <div className="text-center text-slate-500 py-8">Tidak ada transaksi</div>
          ) : (
            data.transactions.map((tx) => {
              const cat = data.categories.find(c => c.id_kategori === tx.id_kategori);
              
              const rootLabel = getRootLabel(tipeList, tx.jenis).toLowerCase();
              const isIncome = rootLabel.includes(TRANSACTION_TYPES.INCOME);
              const isTransfer = rootLabel.includes(TRANSACTION_TYPES.TRANSFER) || tx.jenis.toLowerCase() === TRANSACTION_TYPES.TRANSFER;
              const isSavings = rootLabel.includes(TRANSACTION_TYPES.SAVINGS);
              
              let colorClass = 'rose';
              if (isIncome) colorClass = 'emerald';
              if (isTransfer) colorClass = 'sky';
              if (isSavings) colorClass = 'blue';
              
              return (
                <div 
                  key={tx.id} 
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${colorClass}-50 dark:bg-${colorClass}-950/30 text-${colorClass}-500`}>
                      <CategoryIcon name={cat?.icon_name || (isTransfer ? 'ArrowRightLeft' : 'Circle')} className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{tx.label}</p>
                      <div className="flex items-center mt-0.5 space-x-2">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {cat?.nama_kategori || (isTransfer ? 'Transfer' : 'Kategori')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold text-${colorClass}-600 dark:text-${colorClass}-400`}>
                      {isIncome ? '+' : isTransfer ? '⇔' : '-'} {formatRupiah(tx.nominal)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
