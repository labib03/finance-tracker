import { Card, CardContent } from '@/components/ui/card';
import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/store';
import {
    formatRupiah,
    hitungRingkasanBulanan,
    hitungSaldoAkun,
    getNamaBulan,
    cn
} from '@/lib/utils';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';

export default function SummaryCards() {
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
    const activeMonth = useFinanceStore((s) => s.activeMonth);
    const cycleStartDay = useFinanceStore((s) => s.cycleStartDay);

    const ringkasan = useMemo(
        () => hitungRingkasanBulanan(transaksiList, activeMonth, cycleStartDay),
        [transaksiList, activeMonth, cycleStartDay]
    );

    const saldoAkun = useMemo(
        () => hitungSaldoAkun(sumberDanaList, transaksiList),
        [sumberDanaList, transaksiList]
    );

    const totalSaldo = useMemo(
        () => saldoAkun.reduce((sum: number, s) => sum + s.saldo, 0),
        [saldoAkun]
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
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cards.map((card, idx) => {
                const Icon = card.icon;
                return (
                    <div 
                        key={card.label} 
                        className={cn(
                            "group relative overflow-hidden bg-white p-8 rounded-[2.5rem] border border-border/40 shadow-scandi transition-all duration-500 hover:shadow-float hover:-translate-y-1",
                            idx === 0 ? "md:col-span-1" : ""
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
                                <h3 className="text-3xl font-black text-foreground display-number tracking-widest">
                                    {formatRupiah(card.value)}
                                </h3>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
