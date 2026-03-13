'use client';

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/store';
import {
    hitungPengeluaranPerKategori,
    formatRupiah,
    CHART_COLORS,
} from '@/lib/utils';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

export default function ExpensePieChart() {
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const activeMonth = useFinanceStore((s) => s.activeMonth);

    const data = useMemo(
        () => hitungPengeluaranPerKategori(transaksiList, kategoriList, activeMonth),
        [transaksiList, kategoriList, activeMonth]
    );

    if (data.length === 0) {
        return (
            <div className="card h-full">
                <h3
                    className="text-sm font-bold mb-4 uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                >
                    Porsi Pengeluaran
                </h3>
                <div className="flex items-center justify-center h-48">
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Belum ada data pengeluaran
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
                Porsi Pengeluaran
            </h3>

            <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="total"
                        nameKey="nama_kategori"
                        stroke="none"
                    >
                        {data.map((_, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(value: any) => formatRupiah(Number(value))}
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
                                {value}
                            </span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>

            {/* Category breakdown list */}
            <div className="mt-4 space-y-2">
                {data.slice(0, 4).map((item, index) => (
                    <div key={item.nama_kategori} className="flex items-center gap-3">
                        <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{
                                backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                            }}
                        />
                        <span
                            className="text-sm flex-1 truncate"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            {item.nama_kategori}
                        </span>
                        <span className="text-sm font-semibold display-number">
                            {item.persentase}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
