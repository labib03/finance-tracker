'use client';

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/store';
import { 
    formatRupiah, 
    formatTanggalPendek, 
    getJadwalTerdekat,
    cn 
} from '@/lib/utils';
import { 
    Wallet, 
    TrendingUp, 
    CalendarClock, 
    AlertTriangle,
    Plus,
    Maximize2,
    Coffee
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/shared/ui/dialog';

interface ProyeksiKasCardProps {
    onViewAll: () => void;
    onProcess: (item: any) => void;
}

export default function ProyeksiKasCard({ onViewAll, onProcess }: ProyeksiKasCardProps) {
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const recurringList = useFinanceStore((s) => s.recurringList);
    const cycleStartDay = useFinanceStore((s) => s.cycleStartDay);
    const getRemainingDaysInCycle = useFinanceStore((s) => s.getRemainingDaysInCycle);
    const getDailySafeLimit = useFinanceStore((s) => s.getDailySafeLimit);

    const { sisaBersih, pemasukanSiklus, totalTagihanMendatang, upcomingItems, pengeluaranSiklus } = useMemo(() => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        let startDate = new Date(currentYear, currentMonth, cycleStartDay);
        if (today.getDate() < cycleStartDay) {
            startDate = new Date(currentYear, currentMonth - 1, cycleStartDay);
        }
        
        const endDate = new Date(startDate);
        endDate.setMonth(startDate.getMonth() + 1);
        endDate.setDate(startDate.getDate() - 1);

        const transaksiSiklus = transaksiList.filter(t => {
            const d = new Date(t.tanggal);
            return d >= startDate && d <= endDate && !t.is_titipan;
        });

        const pemasukanActual = transaksiSiklus
            .filter(t => t.jenis === 'Pemasukan')
            .reduce((acc, t) => acc + t.nominal, 0);
        
        const pengeluaranActual = transaksiSiklus
            .filter(t => t.jenis === 'Pengeluaran')
            .reduce((acc, t) => acc + t.nominal, 0);

        const activeRecurring = recurringList.filter(r => r.aktif);
        const cycleBills = activeRecurring.filter(r => {
            const nextDateStr = getJadwalTerdekat(r.tanggal_mulai, r.tanggal_berikutnya);
            const nextDate = new Date(nextDateStr + 'T00:00:00');

            // Cek apakah sudah dibayar (ada transaksi dengan label, tanggal, dan nominal yang sama)
            const isAlreadyPaid = transaksiSiklus.some(t => 
                t.label === r.label && 
                t.nominal === r.nominal && 
                t.tanggal === nextDateStr
            );

            return nextDate >= startDate && nextDate <= endDate && !isAlreadyPaid;
        }).sort((a, b) => {
            const dateA = new Date(getJadwalTerdekat(a.tanggal_mulai, a.tanggal_berikutnya)).getTime();
            const dateB = new Date(getJadwalTerdekat(b.tanggal_mulai, b.tanggal_berikutnya)).getTime();
            return dateA - dateB;
        });

        const tagihanMendatangTotal = cycleBills
            .filter(r => r.jenis === 'Pengeluaran')
            .reduce((acc, r) => acc + r.nominal, 0);

        const sisa = pemasukanActual - (pengeluaranActual + tagihanMendatangTotal);

        return {
            sisaBersih: sisa,
            pemasukanSiklus: pemasukanActual,
            pengeluaranSiklus: pengeluaranActual,
            totalTagihanMendatang: tagihanMendatangTotal,
            upcomingItems: cycleBills,
        };
    }, [transaksiList, recurringList, cycleStartDay]);

    const isNegative = sisaBersih < 0;
    const isBudgetExhausted = sisaBersih <= 0;
    const totalCap = Math.max(pemasukanSiklus, 1);
    const terpakaiWidth = (pengeluaranSiklus / totalCap) * 100;
    const tagihanWidth = (totalTagihanMendatang / totalCap) * 100;
    const sisaWidth = Math.max(0, (sisaBersih / totalCap) * 100);

    const dailyLimit = getDailySafeLimit();
    const daysLeft = getRemainingDaysInCycle();

    return (
        <Dialog>
            <Card className="border border-[#E5E7EB] bg-white shadow-scandi rounded-[2.5rem] group flex flex-col h-[750px] overflow-hidden relative">
                <CardHeader className="p-8 pb-4 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#F9FAFB] flex items-center justify-center border border-[#F3F4F6] text-[#1F2937]">
                                <Wallet size={20} />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-bold text-[#1F2937]">
                                    Sisa Anggaran Bulan Ini
                                </CardTitle>
                                <CardDescription className="text-[10px] font-medium text-[#9CA3AF]">
                                    Forecasting & Jadwal Tagihan
                                </CardDescription>
                            </div>
                        </div>

                        {/* Expand Trigger */}
                        <DialogTrigger 
                            data-slot="dialog-trigger"
                            className="p-2 rounded-full text-gray-300 group-hover:text-gray-500 hover:bg-gray-100 transition-all duration-300 ease-scandi cursor-pointer"
                        >
                            <Maximize2 size={18} />
                        </DialogTrigger>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col min-h-0 pt-2 px-8 pb-8">
                    {/* Fixed Summary Area */}
                    <div className="space-y-6 shrink-0 mb-6">
                        <div className="space-y-1">
                            <h2 className={cn(
                                "text-3xl font-black display-number tracking-tighter",
                                isNegative ? "text-[#EF4444]" : "text-[#1F2937]"
                            )}>
                                {isNegative ? '-' : ''}{formatRupiah(Math.abs(sisaBersih))}
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <div className="h-3 w-full bg-[#F3F4F6] rounded-full overflow-hidden flex shadow-inner">
                                <div className="h-full bg-emerald-500/30 transition-all duration-1000" style={{ width: `${terpakaiWidth}%` }} />
                                <div className="h-full bg-amber-400/40 transition-all duration-1000" style={{ width: `${tagihanWidth}%` }} />
                                <div className="h-full bg-blue-500/20 transition-all duration-1000" style={{ width: `${sisaWidth}%` }} />
                            </div>
                            
                            <div className="flex flex-wrap gap-x-6 gap-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 rounded-full h-2 bg-emerald-500/40" />
                                    <span className="text-[9px] font-black text-[#9CA3AF] uppercase tracking-wider">Terpakai {formatRupiah(pengeluaranSiklus)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 rounded-full h-2 bg-amber-400/50" />
                                    <span className="text-[9px] font-black text-[#9CA3AF] uppercase tracking-wider">Tagihan {formatRupiah(totalTagihanMendatang)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 rounded-full h-2 bg-blue-500/30" />
                                    <span className="text-[9px] font-black text-[#9CA3AF] uppercase tracking-wider">Sisa Aman {formatRupiah(Math.max(0, sisaBersih))}</span>
                                </div>
                            </div>
                        </div>

                        {/* Daily Pacing Indicator */}
                        <div className={cn(
                            "flex items-start sm:items-center gap-4 p-4 rounded-[1.25rem] border transition-all duration-300",
                            isBudgetExhausted 
                                ? "bg-red-50/50 border-red-100" 
                                : "bg-emerald-50/30 border-emerald-100/50"
                        )}>
                            <div className={cn(
                                "w-10 h-10 shrink-0 rounded-[0.85rem] flex items-center justify-center border shadow-xs transition-colors",
                                isBudgetExhausted
                                    ? "bg-white text-rose-500 border-rose-100/80"
                                    : "bg-white text-emerald-500 border-emerald-100/80 hover:scale-105"
                            )}>
                                {isBudgetExhausted ? <AlertTriangle size={18} strokeWidth={2.5} /> : <Coffee size={18} strokeWidth={2.5} className="text-emerald-500/90" />}
                            </div>
                            <div className="flex flex-col">
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-widest",
                                    isBudgetExhausted ? "text-rose-500" : "text-[#9CA3AF]"
                                )}>
                                    Limit Harian Anda
                                </span>
                                <span className={cn(
                                    "text-lg sm:text-xl font-black display-number tracking-tight leading-tight mt-0.5",
                                    isBudgetExhausted ? "text-rose-600" : "text-slate-800"
                                )}>
                                    {formatRupiah(dailyLimit)}
                                </span>
                                <span className={cn(
                                    "text-[10px] font-bold mt-1 leading-relaxed max-w-[90%]",
                                    isBudgetExhausted ? "text-rose-600/80" : "text-[#6B7280]"
                                )}>
                                    {isBudgetExhausted 
                                        ? "Anggaran bulan ini sudah habis. Tunda pengeluaran non-esensial." 
                                        : `Aman untuk dibelanjakan hari ini. Tersisa ${daysLeft} hari dalam siklus.`}
                                </span>
                            </div>
                        </div>

                        {isNegative && (
                            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                                <AlertTriangle className="w-5 h-5 text-[#EF4444] shrink-0" />
                                <p className="text-[10px] font-bold text-[#EF4444] leading-relaxed">
                                    Peringatan: Total tagihan mendatang melebihi sisa pendapatan Anda bulan ini. Harap tinjau pengeluaran atau recurring transactions.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* SCROLLABLE LIST AREA */}
                    <div className="flex-1 min-h-0 flex flex-col border-t border-[#F3F4F6] pt-6">
                        <div className="flex items-center justify-between mb-4 shrink-0 px-1">
                            <div className="flex items-center gap-2 text-[#9CA3AF]">
                                <TrendingUp size={14} />
                                <h3 className="text-[10px] font-black uppercase tracking-wider">Pemasukan Siklus Ini</h3>
                            </div>
                            <span className="text-xs font-black text-emerald-600 display-number">
                                {formatRupiah(pemasukanSiklus)}
                            </span>
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar space-y-3 pb-4">
                            {upcomingItems.length > 0 ? (
                                upcomingItems.map((item) => {
                                    const effectiveDateStr = getJadwalTerdekat(item.tanggal_mulai, item.tanggal_berikutnya);
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const nextDate = new Date(effectiveDateStr + 'T00:00:00');
                                    const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                                    let statusText = formatTanggalPendek(effectiveDateStr);
                                    let statusVariant = "normal";

                                    if (diffDays === 0) {
                                        statusText = 'Hari Ini';
                                        statusVariant = "urgent";
                                    } else if (diffDays === 1) {
                                        statusText = 'Besok';
                                        statusVariant = "warning";
                                    } else if (diffDays > 1 && diffDays <= 3) {
                                        statusText = `${diffDays} Hari Lagi`;
                                        statusVariant = "upcoming";
                                    }
                                    
                                    return (
                                        <div 
                                            key={item.id}
                                            className="flex items-center justify-between p-4 rounded-2xl bg-[#F9FAFB] border border-[#F3F4F6] hover:border-[#E5E7EB] transition-all group/item shrink-0 relative overflow-hidden"
                                        >
                                            <div className="flex items-center gap-4 min-w-0 relative z-10">
                                                <div className={cn(
                                                    "px-2.5 py-1.5 rounded-xl border text-[9px] font-black shrink-0 transition-colors uppercase tracking-wider text-center min-w-[65px]",
                                                    statusVariant === "urgent" && "bg-rose-50 border-rose-100 text-rose-500",
                                                    statusVariant === "warning" && "bg-amber-50 border-amber-100 text-amber-500",
                                                    statusVariant === "upcoming" && "bg-blue-50 border-blue-100 text-blue-500",
                                                    statusVariant === "normal" && "bg-white border-[#F3F4F6] text-[#6B7280]"
                                                )}>
                                                    {statusText}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-xs font-bold text-[#4B5563] truncate group-hover/item:text-[#1F2937] transition-colors uppercase tracking-tight">
                                                        {item.label}
                                                    </span>
                                                    <span className="text-[9px] font-medium text-[#9CA3AF] uppercase">
                                                        {item.frekuensi}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2 relative z-10">
                                                <p className={cn(
                                                    "text-xs font-black display-number shrink-0",
                                                    statusVariant === "urgent" ? "text-rose-500" : "text-[#EF4444]/80"
                                                )}>
                                                    -{formatRupiah(item.nominal)}
                                                </p>
                                                
                                                {diffDays <= 0 && (
                                                    <button 
                                                        onClick={() => onProcess(item)}
                                                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-[9px] font-black text-white uppercase tracking-wider transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center gap-1.5"
                                                    >
                                                        <Plus size={10} strokeWidth={4} />
                                                        Catat
                                                    </button>
                                                )}
                                            </div>

                                            {statusVariant === "urgent" && (
                                                <div className="absolute top-0 right-0 w-24 h-full bg-rose-500/5 -skew-x-12 translate-x-8 pointer-events-none" />
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-8 flex flex-col items-center justify-center bg-[#F9FAFB] rounded-2xl border border-dashed border-[#E5E7EB] opacity-60">
                                    <p className="text-[10px] font-bold text-[#D1D5DB] italic">
                                        Tidak ada tagihan mendatang bulan ini
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-4 shrink-0 pb-2">
                            <Button
                                variant="ghost"
                                className="w-full text-[#9CA3AF] hover:text-[#1F2937] hover:bg-white h-11 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-dashed border-[#E5E7EB] transition-all group/btn"
                                onClick={onViewAll}
                            >
                                Kelola Semua Jadwal 
                                <CalendarClock size={12} className="ml-2 group-hover/btn:rotate-12 transition-transform" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <DialogContent className="sm:max-w-4xl min-h-[60vh]">
                <DialogHeader>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Wallet size={24} />
                        </div>
                        <div>
                            <DialogTitle>Detail Proyeksi Kas</DialogTitle>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">
                                Analisis Mendalam & Forecasting
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="mt-8 flex-1 flex flex-col gap-8">
                    {/* Placeholder for future Charts/Tables */}
                    <div className="flex-1 min-h-[400px] rounded-[2rem] border border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center p-12 text-center group/placeholder">
                        <div className="w-16 h-16 rounded-3xl bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-6 group-hover/placeholder:scale-110 transition-transform duration-500">
                            <TrendingUp className="text-gray-300" size={32} />
                        </div>
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Space for Analytics</h4>
                        <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                            Area ini disiapkan untuk Grafik Recharts penuh atau Tabel Detail transaksi bulanan Anda.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-[1.5rem] bg-[#F9FAFB] border border-[#F3F4F6]">
                            <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.15em] mb-1">Total Pemasukan</p>
                            <p className="text-xl font-black text-emerald-600 display-number">{formatRupiah(pemasukanSiklus)}</p>
                        </div>
                        <div className="p-6 rounded-[1.5rem] bg-[#F9FAFB] border border-[#F3F4F6]">
                            <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.15em] mb-1">Total Pengeluaran</p>
                            <p className="text-xl font-black text-rose-500 display-number">{formatRupiah(pengeluaranSiklus)}</p>
                        </div>
                        <div className="p-6 rounded-[1.5rem] bg-[#F9FAFB] border border-[#F3F4F6]">
                            <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.15em] mb-1">Tagihan Tertunda</p>
                            <p className="text-xl font-black text-amber-500 display-number">{formatRupiah(totalTagihanMendatang)}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
