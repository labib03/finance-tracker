'use client';
import { TRANSACTION_TYPES } from '@/lib/constants';

import React, { useState, useMemo } from 'react';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, isSameMonth, isSameDay, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, LayoutList, PiggyBank } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { useFinanceStore } from '@/lib/store';
import { aggregateTransactionsByDay } from '../utils/calendarDataTransform';
import { formatRupiah } from '@/lib/utils';
import ExpenseDayDetailsModal from './ExpenseDayDetailsModal';
import { CategoryIcon } from '@/shared/ui/CategoryIcon';
import { Badge } from '@/shared/ui/badge';
import { getRootLabel } from '@/lib/tipeUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';

type ViewMode = 'Month' | 'Week' | 'Day';

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

export default function ExpenseCalendar() {
  const { transaksiList, kategoriList, tipeList } = useFinanceStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('Month');
  const [selectedDayStr, setSelectedDayStr] = useState<string | null>(null);

  // Aggregated data
  const dailyData = useMemo(() => {
    return aggregateTransactionsByDay(transaksiList, kategoriList, tipeList);
  }, [transaksiList, kategoriList, tipeList]);

  // Navigation handlers
  const next = () => {
    if (viewMode === 'Month') setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === 'Week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const prev = () => {
    if (viewMode === 'Month') setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === 'Week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const today = () => setCurrentDate(new Date());

  // Generate days based on view
  const days = useMemo(() => {
    if (viewMode === 'Month') {
      const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
      const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    } else if (viewMode === 'Week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    } else {
      return [currentDate];
    }
  }, [currentDate, viewMode]);

  const weekDays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  return (
    <Card className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <CardHeader className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-5 h-5 text-indigo-500" />
          <CardTitle className="text-xl font-bold">Kalender Pengeluaran</CardTitle>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          {/* View Toggle */}
          <Select value={viewMode} onValueChange={(val) => setViewMode(val as ViewMode)}>
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue placeholder="Pilih Tampilan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Month">Bulan</SelectItem>
              <SelectItem value="Week">Minggu</SelectItem>
              <SelectItem value="Day">Hari</SelectItem>
            </SelectContent>
          </Select>

          {/* Navigation */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-start">
            <Button variant="outline" size="icon" onClick={prev}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={today} className="text-sm px-4">
              Hari Ini
            </Button>
            <Button variant="outline" size="icon" onClick={next}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4 text-center">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {format(currentDate, 'MMMM yyyy', { locale: localeId })}
          </h2>
        </div>

        {/* Grid Header (Days of week) - hidden on Day view */}
        {viewMode !== 'Day' && (
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider py-1">
                {day}
              </div>
            ))}
          </div>
        )}

        {/* Calendar Grid or Day Detail */}
        {viewMode === 'Day' ? (
          <DayViewDetail 
            dateStr={format(currentDate, 'yyyy-MM-dd')} 
            data={dailyData[format(currentDate, 'yyyy-MM-dd')]} 
            tipeList={tipeList}
          />
        ) : (
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {days.map((day, idx) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const data = dailyData[dateStr];
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = viewMode === 'Month' ? isSameMonth(day, currentDate) : true;
              const hasData = !!data && (data.totalExpense > 0 || data.totalIncome > 0 || data.totalTransfer > 0 || data.totalSavings > 0);

              return (
                <div
                  key={day.toISOString() + idx}
                  onClick={() => hasData && setSelectedDayStr(dateStr)}
                  className={`
                    min-h-[85px] sm:min-h-[135px] ${viewMode === 'Week' ? 'sm:min-h-[180px]' : ''} p-1 sm:p-2 border rounded-xl transition-all flex flex-col
                    ${!isCurrentMonth ? 'bg-slate-50 dark:bg-slate-900/50 opacity-50' : 'bg-white dark:bg-slate-900'}
                    ${isToday ? 'border-indigo-500 shadow-sm ring-1 ring-indigo-500/20' : 'border-slate-100 dark:border-slate-800'}
                    ${hasData ? 'cursor-pointer hover:border-indigo-300 hover:shadow-md' : 'cursor-default'}
                    relative group
                  `}
                >
                  {/* Date Label */}
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-xs sm:text-sm font-medium ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {format(day, 'd')}
                    </span>
                  </div>

                  {/* Content */}
                  {hasData && (
                    <div className="flex flex-col flex-1 h-full">
                      {/* Desktop View: Show amount */}
                      <div className="hidden sm:flex flex-col gap-0.5">
                        {data.totalIncome > 0 && (
                          <div className="text-[10px] xl:text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate" title={`Pemasukan: ${formatRupiah(data.totalIncome)}`}>
                            + {formatRupiah(data.totalIncome)}
                          </div>
                        )}
                        {data.totalExpense > 0 && (
                          <div className="text-[10px] xl:text-xs font-bold text-rose-600 dark:text-rose-400 truncate" title={`Pengeluaran: ${formatRupiah(data.totalExpense)}`}>
                            - {formatRupiah(data.totalExpense)}
                          </div>
                        )}
                        {data.totalSavings > 0 && (
                          <div className="text-[10px] xl:text-xs font-bold text-[#6A1B9A] dark:text-indigo-400 truncate flex items-center gap-0.5" title={`Tabungan: ${formatRupiah(data.totalSavings)}`}>
                            <PiggyBank className="w-3 h-3 shrink-0" /> {formatRupiah(data.totalSavings)}
                          </div>
                        )}
                        {data.totalTransfer > 0 && (
                          <div className="text-[10px] xl:text-xs font-bold text-sky-600 dark:text-sky-400 truncate" title={`Transfer: ${formatRupiah(data.totalTransfer)}`}>
                            ⇔ {formatRupiah(data.totalTransfer)}
                          </div>
                        )}
                      </div>
                      
                      {/* Categories UI */}
                      <div className={`flex flex-wrap gap-1 mt-auto pt-2 ${viewMode === 'Month' ? 'justify-end' : 'justify-start'}`}>
                        {data.categories.slice(0, 4).map(cat => {
                          const rootLabel = getRootLabel(tipeList, cat.tipe).toLowerCase();
                          const isTransfer = rootLabel.includes(TRANSACTION_TYPES.TRANSFER) || cat.tipe.toLowerCase() === TRANSACTION_TYPES.TRANSFER;
                          const isIncome = rootLabel.includes(TRANSACTION_TYPES.INCOME);
                          const isSavings = rootLabel.includes(TRANSACTION_TYPES.SAVINGS);
                          const baseColor = isIncome ? 'emerald' : isTransfer ? 'sky' : isSavings ? 'indigo' : 'rose';
                          
                          if (viewMode === 'Month') {
                            // Month: Compact Box with tiny icon
                            return (
                              <div 
                                key={cat.id_kategori} 
                                title={cat.nama_kategori}
                                className={`w-4 h-4 rounded-md flex items-center justify-center bg-${baseColor}-100 dark:bg-${baseColor}-900/30 text-${baseColor}-600 dark:text-${baseColor}-400`}
                              >
                                <CategoryIcon name={cat.icon_name} className="w-2.5 h-2.5" />
                              </div>
                            );
                          } else {
                            // Week: Detailed Badge
                            return (
                              <Badge 
                                key={cat.id_kategori} 
                                variant="outline" 
                                className={`text-[9px] px-1.5 py-0 border-${baseColor}-200 bg-${baseColor}-50 text-${baseColor}-700 dark:bg-${baseColor}-950/30 dark:text-${baseColor}-300 dark:border-${baseColor}-800`}
                              >
                                <CategoryIcon name={cat.icon_name} className="w-2 h-2 mr-1 inline" />
                                {cat.nama_kategori}
                              </Badge>
                            );
                          }
                        })}
                        {data.categories.length > 4 && (
                          <div className="w-4 h-4 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <span className="text-[8px] text-slate-500">+{data.categories.length - 4}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Details Modal (Only shown in Month/Week view) */}
      {selectedDayStr && viewMode !== 'Day' && (
        <ExpenseDayDetailsModal
          dateStr={selectedDayStr}
          data={dailyData[selectedDayStr]}
          isOpen={!!selectedDayStr}
          onClose={() => setSelectedDayStr(null)}
        />
      )}
    </Card>
  );
}

/**
 * Sub-component for rendering the Day view directly inline
 * instead of popping up a modal.
 */
function DayViewDetail({ dateStr, data, tipeList }: { dateStr: string, data: any, tipeList: any[] }) {
  const dateObj = parseISO(dateStr);
  const formattedDate = format(dateObj, 'EEEE, dd MMMM yyyy', { locale: localeId });

  if (!data || data.transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
        <LayoutList className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">{formattedDate}</h3>
        <p className="text-sm text-slate-400 text-center mt-1">Belum ada pemasukan atau pengeluaran di hari ini.</p>
      </div>
    );
  }

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
    <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      {/* Date Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-950">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{formattedDate}</h3>
        <Badge variant="outline" className="text-slate-500">{data.transactions.length} Transaksi</Badge>
      </div>
      
      {/* Summary Header */}
      {blocks.length > 0 && (
        <div className="px-4 sm:px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
          <div className={`grid gap-3 ${blocks.length === 1 ? 'grid-cols-1' : blocks.length === 2 ? 'grid-cols-2' : blocks.length === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
            {blocks.map((b) => (
              <div 
                key={b.title} 
                className={`${b.bg} p-3 rounded-2xl flex flex-col justify-center`}
              >
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 truncate">{b.title}</span>
                <span className={`text-sm sm:text-base font-black tracking-tight truncate ${b.color}`}>
                  {formatRupiah(b.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List */}
      <div className="p-4 sm:p-6 space-y-0">
        {data.transactions.map((tx: any) => {
          const cat = data.categories.find((c: any) => c.id_kategori === tx.id_kategori);
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
        })}
      </div>
    </div>
  );
}
