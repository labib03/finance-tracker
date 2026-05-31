import { Card, CardContent } from '@/shared/ui/card';
import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/store';
import {
    formatRupiah,
    hitungRingkasanBulanan,
    hitungSaldoAkun,
    hitungTotalTitipan,
    getNamaBulan,
    cn
} from '@/lib/utils';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    UserCircle2,
} from 'lucide-react';

export default function SummaryCards() {
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
    const activeMonth = useFinanceStore((s) => s.activeMonth);
    const cycleStartDay = useFinanceStore((s) => s.cycleStartDay);
    const tipeList = useFinanceStore((s) => s.tipeList);
    const tabunganList = useFinanceStore((s) => s.tabunganList);

    const ringkasan = useMemo(
        () => hitungRingkasanBulanan(transaksiList, activeMonth, tipeList, cycleStartDay),
        [transaksiList, activeMonth, cycleStartDay, tipeList]
    );

    const saldoAkun = useMemo(
        () => hitungSaldoAkun(sumberDanaList, transaksiList, tipeList, tabunganList),
        [sumberDanaList, transaksiList, tipeList, tabunganList]
    );

    const totalSaldo = useMemo(
        () => saldoAkun.reduce((sum: number, s) => sum + s.saldo, 0),
        [saldoAkun]
    );

    const totalTitipan = useMemo(
        () => hitungTotalTitipan(transaksiList, tipeList),
        [transaksiList, tipeList]
    );

    const cards = [
        {
            label: 'Total Saldo',
            value: totalSaldo,
            icon: Wallet,
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
            trend: null,
            subtitle: 'Semua akun',
        },
        {
            label: `Pemasukan ${getNamaBulan(activeMonth)}`,
            value: ringkasan.total_pemasukan,
            icon: TrendingUp,
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
            trend: 'up' as const,
            subtitle: 'Bulan ini',
        },
        {
            label: `Pengeluaran ${getNamaBulan(activeMonth)}`,
            value: ringkasan.total_pengeluaran,
            icon: TrendingDown,
            iconBg: 'bg-orange-50',
            iconColor: 'text-orange-600',
            trend: 'down' as const,
            subtitle: 'Bulan ini',
        },
        {
            label: 'Uang Titipan',
            value: totalTitipan,
            icon: UserCircle2,
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-600',
            trend: null,
            subtitle: 'Sisa titipan',
        },
    ];

    const renderCard = (card: typeof cards[0], highlight: boolean = false) => {
        const Icon = card.icon;
        return (
            <div 
                key={card.label} 
                className={cn(
                    "group relative overflow-hidden bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border shadow-scandi transition-all duration-500 hover:shadow-float hover:-translate-y-1",
                    highlight ? "border-blue-500/30 ring-4 ring-blue-500/10" : "border-border/40"
                )}
            >
                {/* Soft Accent Background Blur */}
                <div className={cn(
                    "absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20",
                    card.iconColor.replace('text-', 'bg-')
                )} />

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-110 duration-500",
                            card.iconBg
                        )}>
                            <Icon size={20} strokeWidth={2.5} className={card.iconColor} />
                        </div>
                        {card.trend && (
                            <div className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border",
                                card.trend === 'up' 
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                    : 'bg-orange-50 text-orange-600 border-orange-100'
                            )}>
                                {card.trend === 'up' ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownRight size={14} strokeWidth={3} />}
                                {card.subtitle}
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">
                            {card.label}
                        </p>
                        <h3 
                            className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground display-number tracking-tight tabular-nums break-words"
                            title={formatRupiah(card.value)}
                        >
                            {formatRupiah(card.value)}
                        </h3>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Section 1: Posisi Keuangan */}
            <div className="space-y-4">
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Posisi Keuangan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                    {renderCard(cards[0], true)} {/* Total Saldo */}
                    {renderCard(cards[3])}       {/* Uang Titipan */}
                </div>
            </div>

            {/* Section 2: Arus Kas Bulan Ini */}
            <div className="space-y-4">
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Arus Kas Bulan Ini
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                    {renderCard(cards[1])} {/* Pemasukan */}
                    {renderCard(cards[2])} {/* Pengeluaran */}
                </div>
            </div>
        </div>
    );
}
