'use client';

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/store';
import { hitungBudgetStatus, formatRupiah } from '@/lib/utils';
import { AlertTriangle, CheckCircle, XCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress, ProgressTrack, ProgressIndicator } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export default function BudgetStatusCard() {
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const budgetList = useFinanceStore((s) => s.budgetList);
    const activeMonth = useFinanceStore((s) => s.activeMonth);

    const budgetStatus = useMemo(
        () => hitungBudgetStatus(transaksiList, kategoriList, budgetList, activeMonth),
        [transaksiList, kategoriList, budgetList, activeMonth]
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
        <Card className="h-full border-none shadow-sm bg-background/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm border border-indigo-100/30">
                        <Sparkles size={16} />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">
                            Status Anggaran
                        </CardTitle>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Live Monitoring</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-2 pb-6">
                {budgetStatus.map((bs) => (
                    <div key={bs.id_kategori} className="group space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {statusIcon[bs.status]}
                                <span className="text-sm font-black text-foreground">{bs.nama_kategori}</span>
                            </div>
                            <div className="text-right">
                                <p className="text-[11px] font-black display-number text-foreground leading-none">
                                    {formatRupiah(bs.terpakai)}
                                </p>
                                <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter mt-0.5">
                                    dari {formatRupiah(bs.batas)}
                                </p>
                            </div>
                        </div>

                        <div className="relative pt-1">
                            <Progress value={Math.min(bs.persentase, 100)} className="h-2 rounded-full bg-muted/30">
                                <ProgressTrack className="h-2 rounded-full">
                                    <ProgressIndicator 
                                        className={cn(
                                            "h-full transition-all duration-1000 ease-out rounded-full",
                                            bs.status === 'aman' ? 'bg-emerald-500' :
                                            bs.status === 'peringatan' ? 'bg-amber-500' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                                        )}
                                    />
                                </ProgressTrack>
                            </Progress>
                            
                            {/* Percentage Badge */}
                            <div 
                                className={cn(
                                    "absolute -top-4 right-0 px-1.5 py-0.5 rounded-lg text-[10px] font-black display-number transition-all",
                                    bs.status === 'aman' ? 'text-emerald-600 bg-emerald-50' :
                                    bs.status === 'peringatan' ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50'
                                )}
                            >
                                {bs.persentase}%
                            </div>
                        </div>

                        {bs.status !== 'aman' && (
                            <div className={cn(
                                "flex items-center gap-1.5 py-2 px-3 rounded-xl border animate-in fade-in slide-in-from-top-1 duration-300",
                                bs.status === 'peringatan' 
                                    ? "bg-amber-50/50 border-amber-100 text-amber-700" 
                                    : "bg-red-50/50 border-red-100 text-red-700"
                            )}>
                                {bs.status === 'peringatan' ? <AlertTriangle size={12} /> : <XCircle size={12} />}
                                <p className="text-[10px] font-bold leading-tight">
                                    {bs.status === 'peringatan' 
                                        ? `Awas! Penggunaan sudah mencapai ${bs.persentase}%. Simpan untuk sisa bulan ini.` 
                                        : `Gawat! Anggaran Kategori ${bs.nama_kategori} telah terlampaui.`}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
