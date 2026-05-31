'use client';
import { TRANSACTION_TYPES } from '@/lib/constants';

import React from 'react';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/shared/ui/dialog';
import { DailyTransactionSummary } from '../utils/calendarDataTransform';
import { formatRupiah } from '@/lib/utils';
import { CategoryIcon } from '@/shared/ui/CategoryIcon';
import { useFinanceStore } from '@/lib/store';
import { getRootLabel } from '@/lib/tipeUtils';

interface ExpenseDayDetailsModalProps {
  dateStr: string;
  data: DailyTransactionSummary | undefined;
  isOpen: boolean;
  onClose: () => void;
}

const getTheme = (isIncome: boolean, isTransfer: boolean, isSavings: boolean) => {
  if (isIncome) return {
    iconBg: 'bg-[#E8F5E9] dark:bg-emerald-900/30',
    iconColor: 'text-[#2E7D32] dark:text-emerald-400',
    amountColor: 'text-[#2E7D32] dark:text-emerald-400',
    prefix: '+'
  };
  if (isTransfer) return {
    iconBg: 'bg-[#E3F2FD] dark:bg-sky-900/30',
    iconColor: 'text-[#1565C0] dark:text-sky-400',
    amountColor: 'text-[#1565C0] dark:text-sky-400',
    prefix: ''
  };
  if (isSavings) return {
    iconBg: 'bg-[#F3E5F5] dark:bg-indigo-900/30',
    iconColor: 'text-[#6A1B9A] dark:text-indigo-400',
    amountColor: 'text-[#6A1B9A] dark:text-indigo-400',
    prefix: ''
  };
  return {
    iconBg: 'bg-[#FFEBEE] dark:bg-rose-900/30',
    iconColor: 'text-[#C62828] dark:text-rose-400',
    amountColor: 'text-[#C62828] dark:text-rose-400',
    prefix: '-'
  };
};

export default function ExpenseDayDetailsModal({
  dateStr,
  data,
  isOpen,
  onClose,
}: ExpenseDayDetailsModalProps) {
  const { tipeList } = useFinanceStore();
  
  if (!data) return null;

  const dateObj = parseISO(dateStr);
  const dayName = format(dateObj, 'EEEE', { locale: localeId });
  const dayNumber = format(dateObj, 'dd');
  const monthYear = format(dateObj, 'MMMM yyyy', { locale: localeId });

  const showIncome = data.totalIncome > 0;
  const showExpense = data.totalExpense > 0;
  const showTransfer = data.totalTransfer > 0;
  const showSavings = data.totalSavings > 0;
  
  const blocks = [
    ...(showIncome ? [{ title: 'Pemasukan', amount: data.totalIncome, color: 'text-[#2E7D32] dark:text-emerald-400', bg: 'bg-[#E8F5E9] dark:bg-emerald-950/40' }] : []),
    ...(showExpense ? [{ title: 'Pengeluaran', amount: data.totalExpense, color: 'text-[#C62828] dark:text-rose-400', bg: 'bg-[#FFEBEE] dark:bg-rose-950/40' }] : []),
    ...(showSavings ? [{ title: 'Tabungan', amount: data.totalSavings, color: 'text-[#6A1B9A] dark:text-indigo-400', bg: 'bg-[#F3E5F5] dark:bg-indigo-950/40' }] : []),
    ...(showTransfer ? [{ title: 'Transfer', amount: data.totalTransfer, color: 'text-[#1565C0] dark:text-sky-400', bg: 'bg-[#E3F2FD] dark:bg-sky-950/40' }] : [])
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[85vh] p-6 sm:p-8 bg-white dark:bg-slate-950 border-0 shadow-2xl rounded-[2rem] gap-6 flex flex-col">
        {/* Hidden but required for accessibility */}
        <DialogTitle className="sr-only">Detail Transaksi {dateStr}</DialogTitle>
        <DialogDescription className="sr-only">Daftar transaksi pada tanggal {dateStr}</DialogDescription>

        {/* Custom Header */}
        <div className="flex justify-between items-start shrink-0 pr-8 mt-2">
          <div className="flex flex-col">
            <span className="text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tighter leading-none mb-1">
              {dayNumber}
            </span>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              {monthYear}
            </span>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {dayName}
            </span>
          </div>
        </div>
        
        {/* Summary Blocks */}
        {blocks.length > 0 && (
          <div className={`grid gap-3 shrink-0 ${blocks.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {blocks.map((b, i) => (
              <div 
                key={b.title} 
                className={`${b.bg} p-4 rounded-3xl flex flex-col justify-center ${blocks.length === 3 && i === 2 ? 'col-span-2' : ''}`}
              >
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 truncate">{b.title}</span>
                <span className={`text-sm sm:text-lg font-black tracking-tight truncate ${b.color}`}>
                  {formatRupiah(b.amount)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Transaction List */}
        <div className="flex-1 overflow-y-auto space-y-0 pr-2 -mr-2 pb-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full">
          {data.transactions.length === 0 ? (
            <div className="text-center text-slate-400 font-medium py-10">
              Tidak ada transaksi
            </div>
          ) : (
            data.transactions.map((tx) => {
              const cat = data.categories.find(c => c.id_kategori === tx.id_kategori);
              const rootLabel = getRootLabel(tipeList, tx.jenis).toLowerCase();
              const isIncome = rootLabel.includes(TRANSACTION_TYPES.INCOME);
              const isTransfer = rootLabel.includes(TRANSACTION_TYPES.TRANSFER) || tx.jenis.toLowerCase() === TRANSACTION_TYPES.TRANSFER;
              const isSavings = rootLabel.includes(TRANSACTION_TYPES.SAVINGS);
              
              const theme = getTheme(isIncome, isTransfer, isSavings);
              
              return (
                <div 
                  key={tx.id} 
                  className="flex items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-800/50 last:border-0 group"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${theme.iconBg} ${theme.iconColor}`}>
                    <CategoryIcon name={cat?.icon_name || (isTransfer ? 'ArrowRightLeft' : 'Circle')} className="w-5 h-5" strokeWidth={2} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                      {tx.label}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate mt-0.5">
                      {cat?.nama_kategori || (isTransfer ? 'Transfer' : 'Kategori')}
                    </p>
                  </div>
                  
                  <div className="text-right shrink-0 pl-2">
                    <p className={`text-sm font-black tracking-tight ${theme.amountColor}`}>
                      {theme.prefix} {formatRupiah(tx.nominal)}
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
