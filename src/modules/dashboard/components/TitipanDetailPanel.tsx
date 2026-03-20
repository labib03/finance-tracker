'use client';

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/store';
import { formatRupiah, cn } from '@/lib/utils';
import {
    X,
    ArrowUpRight,
    ArrowDownLeft,
    Calendar,
    Plus,
    History,
    TrendingUp
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';

interface TitipanDetailPanelProps {
    titipanId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAddTransaction: (titipanId: string) => void;
}

export default function TitipanDetailPanel({
    titipanId,
    open,
    onOpenChange,
    onAddTransaction
}: TitipanDetailPanelProps) {
    const titipanList = useFinanceStore((s) => s.titipanList);
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
    const getSisaSaldoTitipan = useFinanceStore((s) => s.getSisaSaldoTitipan);

    const titipan = useMemo(() =>
        titipanList.find(t => t.id_titipan === titipanId),
        [titipanList, titipanId]);

    const sisaSaldo = useMemo(() =>
        titipanId ? getSisaSaldoTitipan(titipanId) : 0,
        [getSisaSaldoTitipan, titipanId]);

    const relatedTransactions = useMemo(() => {
        if (!titipanId) return [];
        return transaksiList
            .filter(t => t.is_titipan === titipanId)
            .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
    }, [transaksiList, titipanId]);

    const trendData = useMemo(() => {
        if (!titipanId) return [];
        const now = new Date();
        const sortedAsc = [...relatedTransactions].sort((a, b) =>
            new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
        );

        const monthlyData: Record<string, number> = {};
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = d.toLocaleString('id-ID', { month: 'short' });
            monthlyData[monthKey] = 0;
        }

        let currentBalance = 0;
        sortedAsc.forEach(t => {
            const tDate = new Date(t.tanggal);
            const amount = t.jenis === 'Pemasukan' ? t.nominal : -t.nominal;
            currentBalance += amount;
            const mKey = tDate.toLocaleString('id-ID', { month: 'short' });
            if (monthlyData.hasOwnProperty(mKey)) {
                monthlyData[mKey] = currentBalance;
            }
        });

        let lastKnownBalance = 0;
        return Object.entries(monthlyData).map(([name, value]) => {
            if (value === 0 && lastKnownBalance !== 0) {
                return { name, balance: lastKnownBalance };
            }
            lastKnownBalance = value || lastKnownBalance;
            return { name, balance: value || lastKnownBalance };
        });
    }, [relatedTransactions, titipanId]);

    if (!titipan) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className="max-w-2xl p-0 overflow-hidden border-none bg-white/95 backdrop-blur-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] rounded-[3rem] h-[90vh] flex flex-col">
                <div className="absolute top-0 right-0 p-8 z-50">
                    <DialogClose render={<Button variant="ghost" size="icon" className="rounded-full bg-black/5 hover:bg-black/10 transition-colors border-none shadow-none" />}>
                        <X size={20} strokeWidth={3} />
                    </DialogClose>
                </div>

                <DialogHeader className="p-10 pb-6 shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-amber-500/5 -z-10 blur-3xl opacity-50" />
                    <div className="flex flex-col gap-2">
                        <div>
                            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-100 rounded-lg px-2 py-0 font-black text-[10px] uppercase tracking-wider">
                                Active Envelope
                            </Badge>
                        </div>
                        <DialogTitle className="text-3xl font-black text-foreground tracking-tight">
                            {titipan.nama_konteks}
                        </DialogTitle>
                        <div className="mt-4">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-1">Total Saldo Saat Ini</p>
                            <p className="text-4xl font-black text-amber-600 display-number leading-none tracking-tighter">
                                {formatRupiah(sisaSaldo)}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-10 pb-10 space-y-10">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History size={16} className="text-amber-500" />
                                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Riwayat Transaksi</h3>
                            </div>
                            <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                                {relatedTransactions.length} Transaksi
                            </span>
                        </div>

                        <div className="space-y-4">
                            {relatedTransactions.length === 0 ? (
                                <div className="text-center py-12 bg-muted/5 rounded-[2rem] border border-dashed border-border/40">
                                    <p className="text-xs font-bold text-muted-foreground opacity-40 italic">Belum ada riwayat transaksi</p>
                                </div>
                            ) : (
                                relatedTransactions.map((trx) => (
                                    <div key={trx.id} className="group relative flex items-center justify-between p-4 bg-muted/10 hover:bg-muted/20 rounded-2xl border border-transparent transition-all duration-300">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center",
                                                trx.jenis === 'Pemasukan' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                            )}>
                                                {trx.jenis === 'Pemasukan' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-black text-foreground uppercase tracking-wider truncate max-w-[140px]">{trx.label || 'Tanpa Label'}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Calendar size={10} className="text-muted-foreground/40" />
                                                    <span className="text-[10px] font-bold text-muted-foreground/60">{trx.tanggal}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={cn(
                                                "text-sm font-black display-number",
                                                trx.jenis === 'Pemasukan' ? "text-emerald-600" : "text-red-600"
                                            )}>
                                                {trx.jenis === 'Pemasukan' ? '+' : '-'}{formatRupiah(trx.nominal)}
                                            </p>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 mt-0.5">
                                                {sumberDanaList.find(s => s.id_sumber_dana === trx.id_sumber_dana)?.nama_sumber || '???'}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t border-border/40 shrink-0 bg-white/50 backdrop-blur-md">
                    <Button
                        onClick={() => {
                            onOpenChange(false);
                            onAddTransaction(titipanId!);
                        }}
                        className="w-full h-14 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black uppercase tracking-widest text-xs gap-3 shadow-[0_10px_30px_-10px_rgba(217,119,6,0.5)] transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <Plus size={20} strokeWidth={3} />
                        Tambah Transaksi Terkait
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
