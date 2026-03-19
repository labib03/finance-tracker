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
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { LineChart as TrendingUp } from 'lucide-react';

export default function WeeklyTrendChart() {
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const activeMonth = useFinanceStore((s) => s.activeMonth);
    const cycleStartDay = useFinanceStore((s) => s.cycleStartDay);

    const data = useMemo(
        () => hitungTrenMingguan(transaksiList, activeMonth, cycleStartDay),
        [transaksiList, activeMonth, cycleStartDay]
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
        <Card className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-border/40 shadow-scandi overflow-hidden transition-all duration-500 hover:shadow-float transform-gpu backface-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 pb-2 pt-6 sm:pt-8 px-6 sm:px-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <TrendingUp size={18} />
                    </div>
                    <div>
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-foreground">
                            Tren Mingguan
                        </CardTitle>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-0.5">Arus Kas Berjalan</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-xs font-black uppercase text-muted-foreground/80">Masuk</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        <span className="text-xs font-black uppercase text-muted-foreground/80">Keluar</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8 pt-4">
                <div className="h-[200px] sm:h-[280px] w-full mt-4 contain-layout -ml-2 sm:ml-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} barGap={8} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="hsl(var(--muted))" opacity={0.3} />
                            <XAxis
                                dataKey="minggu"
                                tick={{ fontSize: 10, fontWeight: 900, fill: 'hsl(var(--muted-foreground))', opacity: 0.6 }}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fontWeight: 900, fill: 'hsl(var(--muted-foreground))', opacity: 0.6 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => {
                                    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}Jt`;
                                    if (value >= 1000) return `${(value / 1000).toFixed(0)}Rb`;
                                    return value;
                                }}
                            />
                            <Tooltip
                                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-foreground text-background px-4 py-4 rounded-2xl shadow-xl border-none animate-in zoom-in-95 space-y-2">
                                                <p className="text-xs font-black uppercase tracking-widest opacity-60 border-b border-background/10 pb-2 mb-2">
                                                    {payload[0].payload.minggu}
                                                </p>
                                                {payload.map((p, idx) => (
                                                    <div key={idx} className="flex items-center justify-between gap-6">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.fill }} />
                                                            <span className="text-xs font-black uppercase tracking-widest opacity-80">{p.name === 'pemasukan' ? 'MASUK' : 'KELUAR'}</span>
                                                        </div>
                                                        <span className="text-xs font-black display-number">{formatRupiah(p.value as number)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar
                                dataKey="pemasukan"
                                name="pemasukan"
                                fill="#10b981"
                                radius={[6, 6, 0, 0]}
                                maxBarSize={16}
                                animationDuration={2000}
                            />
                            <Bar
                                dataKey="pengeluaran"
                                name="pengeluaran"
                                fill="#f97316"
                                radius={[6, 6, 0, 0]}
                                maxBarSize={16}
                                animationDuration={2000}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
