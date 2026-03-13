'use client';

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/store';
import {
    formatRupiah,
    hitungRingkasanBulanan,
    hitungSaldoAkun,
    getNamaBulan,
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

    const ringkasan = useMemo(
        () => hitungRingkasanBulanan(transaksiList, activeMonth),
        [transaksiList, activeMonth]
    );

    const saldoAkun = useMemo(
        () => hitungSaldoAkun(sumberDanaList, transaksiList),
        [sumberDanaList, transaksiList]
    );

    const totalSaldo = useMemo(
        () => saldoAkun.reduce((sum, s) => sum + s.saldo, 0),
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <div key={card.label} className="card group">
                        <div className="flex items-start justify-between mb-4">
                            <div
                                className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center`}
                            >
                                <Icon size={22} className={card.iconColor} />
                            </div>
                            {card.trend && (
                                <div
                                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${card.trend === 'up'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-orange-50 text-orange-700'
                                        }`}
                                >
                                    {card.trend === 'up' ? (
                                        <ArrowUpRight size={14} />
                                    ) : (
                                        <ArrowDownRight size={14} />
                                    )}
                                    <span>{card.subtitle}</span>
                                </div>
                            )}
                        </div>

                        <p
                            className="text-xs font-semibold mb-1 uppercase tracking-wider"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            {card.label}
                        </p>
                        <p className="display-number text-2xl">
                            {formatRupiah(card.value)}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
