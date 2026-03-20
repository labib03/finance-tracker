'use client';

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/store';
import { hitungBudgetStatus, formatRupiah } from '@/lib/utils';
import { AlertTriangle, CheckCircle, XCircle, ShieldAlert, Sparkles, Maximize2, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/shared/ui/dialog';

export default function BudgetStatusCard() {
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const budgetList = useFinanceStore((s) => s.budgetList);
    const activeMonth = useFinanceStore((s) => s.activeMonth);
    const cycleStartDay = useFinanceStore((s) => s.cycleStartDay);

    const budgetStatus = useMemo(
        () => hitungBudgetStatus(transaksiList, kategoriList, budgetList, activeMonth, cycleStartDay),
        [transaksiList, kategoriList, budgetList, activeMonth, cycleStartDay]
    );

    if (budgetStatus.length === 0) {
        return (
            <Card className="h-full border-none shadow-sm bg-background/50 backdrop-blur-sm">
                <CardHeader className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
                        <ShieldAlert size={24} className="text-muted-foreground" />
                    </div>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        Status Anggaran
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                        Belum ada anggaran yang diatur untuk bulan ini.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const statusIcon = {
        aman: <CheckCircle size={16} className="text-emerald-500" />,
        peringatan: <AlertTriangle size={16} className="text-amber-500" />,
        bahaya: <XCircle size={16} className="text-red-500" />,
    };

    return (
        <Dialog>
            <Card className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-border/40 shadow-scandi overflow-hidden transition-all duration-500 hover:shadow-float h-[750px] flex flex-col relative group">
                <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 sm:pt-8 px-6 sm:px-8 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                            <Sparkles size={18} />
                        </div>
                        <div>
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-foreground">
                                Status Anggaran
                            </CardTitle>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-0.5">Pemantauan Real-time</p>
                        </div>
                    </div>

                    {/* Expand Trigger */}
                    <DialogTrigger 
                        data-slot="dialog-trigger"
                        className="p-2 rounded-full text-gray-300 group-hover:text-gray-500 hover:bg-gray-100 transition-all duration-300 ease-scandi cursor-pointer"
                    >
                        <Maximize2 size={18} />
                    </DialogTrigger>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto pt-2 sm:pt-4 pb-16 sm:pb-24 px-6 sm:px-8 custom-scrollbar space-y-8 sm:space-y-10">
                    {budgetStatus.map((bs) => (
                        <div key={bs.id_kategori} className="group space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-xs",
                                        bs.status === 'aman' ? 'bg-emerald-50 text-emerald-600' :
                                            bs.status === 'peringatan' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                                    )}>
                                        {statusIcon[bs.status]}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-foreground uppercase tracking-wider">{bs.nama_kategori}</span>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest leading-none mt-0.5",
                                            bs.status === 'aman' ? 'text-emerald-500/70' :
                                                bs.status === 'peringatan' ? 'text-amber-500/70' : 'text-red-500/70'
                                        )}>
                                            {bs.persentase}% Terpakai
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black display-number text-foreground leading-none">
                                        {formatRupiah(bs.terpakai)}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1 opacity-60">
                                        /{formatRupiah(bs.batas)}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="h-2 w-full rounded-full bg-muted/30 overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full transition-all duration-1000 ease-out rounded-full",
                                            bs.status === 'aman' ? 'bg-emerald-500' :
                                                bs.status === 'peringatan' ? 'bg-amber-500' : 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                                        )}
                                        style={{ width: `${Math.min(bs.persentase, 100)}%` }}
                                    />
                                </div>

                                {bs.status !== 'aman' && (
                                    <div className={cn(
                                        "flex items-start gap-2.5 py-3 px-4 rounded-2xl border animate-in fade-in slide-in-from-top-2 duration-500",
                                        bs.status === 'peringatan'
                                            ? "bg-amber-50/30 border-amber-100/50 text-amber-800"
                                            : "bg-red-50/30 border-red-100/50 text-red-800"
                                    )}>
                                        <div className="mt-0.5">
                                            {bs.status === 'peringatan' ? <AlertTriangle size={14} className="text-amber-500" /> : <XCircle size={14} className="text-red-500" />}
                                        </div>
                                        <p className="text-[10px] font-bold leading-relaxed tracking-tight">
                                            {bs.status === 'peringatan'
                                                ? `Hampir penuh! Batasi pengeluaran kategori ${bs.nama_kategori}.`
                                                : `Anggaran ${bs.nama_kategori} telah terlampaui ${formatRupiah(bs.terpakai - bs.batas)}!`}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <DialogContent className="sm:max-w-4xl min-h-[60vh]">
                <DialogHeader>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <DialogTitle>Detail Status Anggaran</DialogTitle>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">
                                Monitoring Kategori & Limit Bulanan
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="mt-8 flex-1 flex flex-col gap-8">
                    {/* Placeholder for future Charts/Tables */}
                    <div className="flex-1 min-h-[400px] rounded-[2rem] border border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center p-12 text-center group/placeholder">
                        <div className="w-16 h-16 rounded-3xl bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-6 group-hover/placeholder:scale-110 transition-transform duration-500">
                            <PieChart className="text-gray-300" size={32} />
                        </div>
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Detailed Category Analysis</h4>
                        <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                            Area ini disiapkan untuk Visualisasi Kategori penuh (Pie/Bar Chart) atau Tabel breakdown detail transaksi per kategori.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-[1.5rem] bg-[#F9FAFB] border border-[#F3F4F6]">
                            <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.15em] mb-1">Kategori Terpanantau</p>
                            <p className="text-xl font-black text-foreground">{budgetStatus.length} Kategori</p>
                        </div>
                        <div className="p-6 rounded-[1.5rem] bg-[#F9FAFB] border border-[#F3F4F6]">
                            <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.15em] mb-1">Status Kritis</p>
                            <p className="text-xl font-black text-rose-500">
                                {budgetStatus.filter(b => b.status === 'bahaya').length} Bahaya
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
