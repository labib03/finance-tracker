'use client';

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/store';
import { hitungBudgetStatus, formatRupiah } from '@/lib/utils';
import { AlertTriangle, CheckCircle, XCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Progress, ProgressTrack, ProgressIndicator } from '@/shared/ui/progress';
import { cn } from '@/lib/utils';

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

    console.log("kategoriList", kategoriList);
    console.log("budgetList", budgetList);


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
        <Card className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-border/40 shadow-scandi overflow-hidden transition-all duration-500 hover:shadow-float lg:min-h-[400px]">
            <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 sm:pt-8 px-6 sm:px-8">
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
            </CardHeader>
            <CardContent className="space-y-6 sm:space-y-8 pt-2 sm:pt-4 pb-6 sm:pb-8 px-6 sm:px-8">
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
                                <span className="text-xs font-black text-foreground uppercase tracking-wider">{bs.nama_kategori}</span>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black display-number text-foreground leading-none">
                                    {formatRupiah(bs.terpakai)}
                                </p>
                                <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mt-1 opacity-60">
                                    Batas: {formatRupiah(bs.batas)}
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

                            {/* Percentage Indicator */}
                            <div className="flex items-center justify-between mt-2">
                                <p className={cn(
                                    "text-xs font-black italic",
                                    bs.status === 'aman' ? 'text-emerald-600/60' :
                                        bs.status === 'peringatan' ? 'text-amber-600/60' : 'text-red-600/60'
                                )}>
                                    {bs.status === 'aman' ? 'Terjaga' : bs.status === 'peringatan' ? 'Hampir Penuh' : 'Terlampaui!'}
                                </p>
                                <span className={cn(
                                    "text-[11px] font-black display-number",
                                    bs.status === 'aman' ? 'text-emerald-600' :
                                        bs.status === 'peringatan' ? 'text-amber-600' : 'text-red-600'
                                )}>
                                    {bs.persentase}%
                                </span>
                            </div>
                        </div>

                        {bs.status !== 'aman' && (
                            <div className={cn(
                                "flex items-start gap-2.5 py-3 px-4 rounded-2xl border animate-in fade-in slide-in-from-top-2 duration-500",
                                bs.status === 'peringatan'
                                    ? "bg-amber-50/30 border-amber-100/50 text-amber-800"
                                    : "bg-red-50/30 border-red-100/50 text-red-800"
                            )}>
                                <div className="mt-0.5">
                                    {bs.status === 'peringatan' ? <AlertTriangle size={14} strokeWidth={2.5} /> : <XCircle size={14} strokeWidth={2.5} />}
                                </div>
                                <p className="text-xs font-bold leading-relaxed tracking-tight">
                                    {bs.status === 'peringatan'
                                        ? `Penggunaan telah mencapai ${bs.persentase}%. Pertimbangkan untuk membatasi pengeluaran kategori ini.`
                                        : `Anggaran ${bs.nama_kategori} telah terlampaui. Disarankan untuk meninjau kembali prioritas pengeluaran Anda.`}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
