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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart as TrendingUp } from 'lucide-react';

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
            <Card className="h-full border-dashed">
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                    <TrendingUp size={18} className="text-muted-foreground" />
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        Tren Mingguan
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-48">
                    <p className="text-sm text-muted-foreground italic">
                        Belum ada data transaksi
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center gap-2 pb-4">
                <TrendingUp size={18} className="text-primary" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider">
                    Tren Mingguan
                </CardTitle>
            </CardHeader>

            <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={data} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" opacity={0.4} />
                        <XAxis
                            dataKey="minggu"
                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => {
                                if (value >= 1000000) return `${(value / 1000000).toFixed(0)}Jt`;
                                if (value >= 1000) return `${(value / 1000).toFixed(0)}Rb`;
                                return value;
                            }}
                        />
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            formatter={(value: any, name: any) => [
                                formatRupiah(Number(value)),
                                name === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran',
                            ]}
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                borderColor: 'hsl(var(--border))',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.1)',
                                fontSize: '12px',
                                fontWeight: 'semibold',
                            }}
                            itemStyle={{ padding: '2px 0' }}
                        />
                        <Legend
                            verticalAlign="top"
                            align="right"
                            wrapperStyle={{ paddingBottom: '20px', fontSize: '11px' }}
                            formatter={(value: string) => (
                                <span className="font-semibold text-muted-foreground capitalize">
                                    {value}
                                </span>
                            )}
                        />
                        <Bar
                            dataKey="pemasukan"
                            fill="#10b981"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={32}
                            animationDuration={1500}
                        />
                        <Bar
                            dataKey="pengeluaran"
                            fill="#f97316"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={32}
                            animationDuration={1500}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
