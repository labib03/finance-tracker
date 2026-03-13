'use client';

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/store';
import { hitungTrenMingguan, formatRupiah } from '@/lib/utils';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

export default function WeeklyTrendChart() {
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const activeMonth = useFinanceStore((s) => s.activeMonth);

    const data = useMemo(
        () => hitungTrenMingguan(transaksiList, activeMonth),
        [transaksiList, activeMonth]
    );

    const hasData = data.some((d) => d.pemasukan > 0 || d.pengeluaran > 0);

    if (!hasData) {
        return (
            <div className="card h-full">
                <h3
                    className="text-sm font-bold mb-4 uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                >
                    Tren Mingguan
                </h3>
                <div className="flex items-center justify-center h-48">
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Belum ada data transaksi
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="card h-full">
            <h3
                className="text-sm font-bold mb-4 uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
            >
                Tren Mingguan
            </h3>

            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                        dataKey="minggu"
                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => {
                            if (value >= 1000000) return `${(value / 1000000).toFixed(0)}jt`;
                            if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`;
                            return value;
                        }}
                    />
                    <Tooltip
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(value: any, name: any) => [
                            formatRupiah(Number(value)),
                            name === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran',
                        ]}
                        contentStyle={{
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                            fontFamily: 'Plus Jakarta Sans',
                            fontSize: '13px',
                        }}
                    />
                    <Legend
                        formatter={(value: string) => (
                            <span style={{ fontSize: '12px', color: '#475569', fontWeight: 500 }}>
                                {value === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
                            </span>
                        )}
                    />
                    <Bar
                        dataKey="pemasukan"
                        fill="#10b981"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={40}
                    />
                    <Bar
                        dataKey="pengeluaran"
                        fill="#f97316"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={40}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
