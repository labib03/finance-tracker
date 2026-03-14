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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PieChart as PieChartIcon } from 'lucide-react';

export default function ExpensePieChart() {
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const activeMonth = useFinanceStore((s) => s.activeMonth);
    const cycleStartDay = useFinanceStore((s) => s.cycleStartDay);

    const data = useMemo(
        () => hitungPengeluaranPerKategori(transaksiList, kategoriList, activeMonth, cycleStartDay),
        [transaksiList, kategoriList, activeMonth, cycleStartDay]
    );

    if (data.length === 0) {
        return (
            <Card className="h-full border-dashed">
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                    <PieChartIcon size={18} className="text-muted-foreground" />
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        Porsi Pengeluaran
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-48">
                    <p className="text-sm text-muted-foreground italic">
                        Belum ada data pengeluaran
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center gap-2 pb-4">
                <PieChartIcon size={18} className="text-primary" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider">
                    Porsi Pengeluaran
                </CardTitle>
            </CardHeader>

            <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={100}
                            paddingAngle={4}
                            dataKey="total"
                            nameKey="nama_kategori"
                            stroke="none"
                            animationDuration={1500}
                        >
                            {data.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                                    className="outline-none hover:opacity-80 transition-opacity"
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            formatter={(value: any) => formatRupiah(Number(value))}
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                borderColor: 'hsl(var(--border))',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.1)',
                                fontSize: '13px',
                                fontWeight: 'semibold',
                                padding: '8px 12px',
                            }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value: string) => (
                                <span className="text-[11px] font-semibold text-muted-foreground capitalize">
                                    {value}
                                </span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Category breakdown list */}
                <div className="mt-6 space-y-2.5">
                    {data.slice(0, 5).map((item, index) => (
                        <div key={item.nama_kategori} className="flex items-center gap-3">
                            <div
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{
                                    backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                                }}
                            />
                            <span className="text-xs font-medium flex-1 truncate text-muted-foreground">
                                {item.nama_kategori}
                            </span>
                            <span className="text-xs font-bold tabular-nums">
                                {item.persentase}%
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
