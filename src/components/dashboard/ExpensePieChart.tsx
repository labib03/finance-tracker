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
        <Card className="bg-white rounded-[2.5rem] border border-border/40 shadow-scandi overflow-hidden transition-all duration-500 hover:shadow-float">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-8 px-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <PieChartIcon size={18} />
                    </div>
                    <div>
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-foreground">
                            Porsi Pengeluaran
                        </CardTitle>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-0.5">Segmentasi Kategori</p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="px-8 pb-8 pt-4">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-full md:w-1/2 h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={6}
                                    dataKey="total"
                                    nameKey="nama_kategori"
                                    stroke="none"
                                    animationDuration={2000}
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
                                    formatter={(value: any) => formatRupiah(Number(value))}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-foreground text-background px-4 py-3 rounded-2xl shadow-xl border-none animate-in zoom-in-95">
                                                    <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">{payload[0].name}</p>
                                                    <p className="text-sm font-black display-number">{formatRupiah(payload[0].value as number)}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="w-full md:w-1/2 space-y-4">
                        <div className="px-2">
                             <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground/80 mb-4">Ranking Pengeluaran</h4>
                        </div>
                        <div className="space-y-3">
                            {data.slice(0, 4).map((item, index) => (
                                <div key={item.nama_kategori} className="group flex items-center gap-3 p-3 bg-muted/20 rounded-2xl border border-transparent hover:border-border/40 hover:bg-white transition-all duration-300">
                                    <div
                                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.1)]"
                                        style={{
                                            backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                                        }}
                                    />
                                    <div className="flex-1 flex flex-col">
                                        <span className="text-xs font-black uppercase tracking-widest text-foreground/80 truncate">
                                            {item.nama_kategori}
                                        </span>
                                        <div className="w-full h-1 bg-muted/40 rounded-full mt-1.5 overflow-hidden">
                                            <div 
                                                className="h-full rounded-full transition-all duration-1000"
                                                style={{ 
                                                    width: `${item.persentase}%`,
                                                    backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-black text-foreground display-number">
                                            {item.persentase}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
