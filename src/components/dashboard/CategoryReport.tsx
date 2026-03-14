'use client';

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/store';
import { 
    hitungPerbandinganKategori, 
    hitungTrenBulananKategori,
    formatRupiah,
    CHART_COLORS,
    cn
} from '@/lib/utils';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CategoryIcon } from '@/components/CategoryIcon';
import { 
    TrendingUp, 
    TrendingDown, 
    Minus, 
    BarChart3, 
    LineChart as LineChartIcon,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

export default function CategoryReport() {
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const activeMonth = useFinanceStore((s) => s.activeMonth);

    const perbandinganData = useMemo(
        () => hitungPerbandinganKategori(transaksiList, kategoriList, activeMonth),
        [transaksiList, kategoriList, activeMonth]
    );

    const trenData = useMemo(
        () => hitungTrenBulananKategori(transaksiList, kategoriList, activeMonth, 6),
        [transaksiList, kategoriList, activeMonth]
    );

    const totalBulanIni = useMemo(
        () => perbandinganData.reduce((acc, curr) => acc + curr.totalAktif, 0),
        [perbandinganData]
    );

    const totalBulanLalu = useMemo(
        () => perbandinganData.reduce((acc, curr) => acc + curr.totalLalu, 0),
        [perbandinganData]
    );

    const selisihTotal = totalBulanIni - totalBulanLalu;
    const persentaseTotal = totalBulanLalu > 0 ? Math.round((selisihTotal / totalBulanLalu) * 100) : 100;

    if (perbandinganData.length === 0) {
        return (
            <Card className="border-none shadow-sm flex flex-col items-center justify-center py-20 px-6">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground opacity-20">
                    <BarChart3 size={32} />
                </div>
                <CardTitle className="text-sm font-bold">Data Belum Mencukupi</CardTitle>
                <CardDescription className="text-center mt-1">
                    Tambahkan transaksi pengeluaran untuk melihat laporan analitik kategori.
                </CardDescription>
            </Card>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm overflow-hidden bg-background/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Pengeluaran Bulan Ini</p>
                        <div className="flex items-center justify-between">
                            <h3 className="text-3xl font-black display-number text-foreground leading-tight">
                                {formatRupiah(totalBulanIni)}
                            </h3>
                            <div className={cn(
                                "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black",
                                selisihTotal <= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                            )}>
                                {selisihTotal <= 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                                {Math.abs(persentaseTotal)}%
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-[11px] text-muted-foreground font-medium">
                            {selisihTotal <= 0 
                                ? "Hemat " + formatRupiah(Math.abs(selisihTotal)) + " dibanding bulan lalu." 
                                : "Naik " + formatRupiah(selisihTotal) + " dibanding bulan lalu."}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm overflow-hidden bg-background/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Kategori Terbesar</p>
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-foreground">
                                {perbandinganData[0]?.nama_kategori}
                            </h3>
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <CategoryIcon name={perbandinganData[0]?.icon_name} size={20} />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-[11px] text-muted-foreground font-medium">
                            Menyumbang <span className="text-foreground font-bold">{Math.round((perbandinganData[0]?.totalAktif / totalBulanIni) * 100)}%</span> dari total pengeluaran Anda.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Comparison Bar Chart */}
                <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                <BarChart3 size={16} className="text-primary" />
                                Perbandingan Per Kategori
                            </CardTitle>
                            <CardDescription className="text-[10px]">Aktif ({activeMonth}) vs Bulan Lalu</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[350px] pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={perbandinganData.slice(0, 8)}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--muted))" opacity={0.4} />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="nama_kategori" 
                                    type="category" 
                                    axisLine={false} 
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }}
                                    width={90}
                                />
                                <Tooltip 
                                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                                    formatter={(value: any) => formatRupiah(value)}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '16px',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        padding: '12px'
                                    }}
                                />
                                <Legend 
                                    verticalAlign="top" 
                                    align="right" 
                                    iconType="circle"
                                    formatter={(value: any) => <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">{value === 'totalAktif' ? 'Bulan Ini' : 'Bulan Lalu'}</span>}
                                />
                                <Bar dataKey="totalAktif" name="Bulan Ini" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={12} />
                                <Bar dataKey="totalLalu" name="Bulan Lalu" fill="hsl(var(--muted-foreground))" opacity={0.3} radius={[0, 4, 4, 0]} barSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Spending Trend Chart */}
                <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                <LineChartIcon size={16} className="text-primary" />
                                Tren Pengeluaran Total
                            </CardTitle>
                            <CardDescription className="text-[10px]">Statistik harian selama 6 bulan terakhir</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[350px] pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trenData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" opacity={0.4} />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }}
                                    tickFormatter={(val) => {
                                        if (val >= 1000000) return `Rp ${val / 1000000}jt`;
                                        if (val >= 1000) return `Rp ${val / 1000}rb`;
                                        return `Rp ${val}`;
                                    }}
                                />
                                <Tooltip 
                                    formatter={(value: any) => formatRupiah(value)}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '16px',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        padding: '12px'
                                    }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="total" 
                                    stroke="hsl(var(--primary))" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorTotal)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Table Comparison */}
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider">Detail Perbandingan Kategori</CardTitle>
                    <CardDescription className="text-xs">Analisis mendalam kenaikan/penurunan per kategori</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/30 border-y border-border/50">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Kategori</th>
                                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Bulan Lalu</th>
                                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Bulan Ini</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Selisih (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {perbandinganData.map((item, idx) => (
                                    <tr key={item.nama_kategori} className="group hover:bg-muted/20 transition-colors border-b border-border/10 last:border-0">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                    <CategoryIcon name={item.icon_name} size={16} />
                                                </div>
                                                <span className="text-sm font-bold text-foreground">{item.nama_kategori}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <span className="text-xs font-semibold text-muted-foreground display-number">
                                                {formatRupiah(item.totalLalu)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <span className="text-sm font-black text-foreground display-number">
                                                {formatRupiah(item.totalAktif)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <div className={cn(
                                                    "flex items-center gap-1 font-black text-sm",
                                                    item.selisih <= 0 ? "text-emerald-600" : "text-red-500"
                                                )}>
                                                    {item.selisih > 0 ? (
                                                        <ArrowUpRight size={14} />
                                                    ) : item.selisih < 0 ? (
                                                        <ArrowDownRight size={14} />
                                                    ) : (
                                                        <Minus size={14} className="text-muted-foreground" />
                                                    )}
                                                    <span className="display-number">
                                                        {item.selisih !== 0 ? Math.abs(item.persentase) + '%' : '0%'}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground font-medium">
                                                    {item.selisih === 0 ? "Stabil" : item.selisih > 0 ? "Kenaikan" : "Penurunan"}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
