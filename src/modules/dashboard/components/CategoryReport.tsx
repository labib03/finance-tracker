'use client';

import { useMemo, useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import TransactionsTable from '@/modules/dashboard/components/TransactionsTable';
import { CategoryIcon } from '@/shared/ui/CategoryIcon';
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
    const cycleStartDay = useFinanceStore((s) => s.cycleStartDay);

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const perbandinganData = useMemo(
        () => hitungPerbandinganKategori(transaksiList, kategoriList, activeMonth, cycleStartDay),
        [transaksiList, kategoriList, activeMonth, cycleStartDay]
    );

    console.log("perbandinganData", perbandinganData)

    const trenData = useMemo(
        () => hitungTrenBulananKategori(transaksiList, kategoriList, activeMonth, 6, cycleStartDay),
        [transaksiList, kategoriList, activeMonth, cycleStartDay]
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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Minimalist Total Belanja */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-scandi border border-border/40 relative overflow-hidden group transition-all duration-500 hover:shadow-float">
                    <div className="flex flex-col h-full justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/80 mb-3">Total Konsumsi</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-4xl font-black display-number text-foreground tracking-widest">
                                    {formatRupiah(totalBulanIni)}
                                </h3>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-muted/20 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-xs font-black uppercase text-muted-foreground/80 tracking-widest leading-none mb-1">vs Bulan Lalu</span>
                                <span className="text-xs font-black display-number text-foreground/40">{formatRupiah(totalBulanLalu)}</span>
                            </div>
                            <div className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border transition-all duration-500",
                                selisihTotal <= 0
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                    : "bg-rose-50 text-rose-600 border-rose-100"
                            )}>
                                {selisihTotal <= 0 ? <ArrowDownRight size={14} strokeWidth={3} /> : <ArrowUpRight size={14} strokeWidth={3} />}
                                {Math.abs(persentaseTotal)}%
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-scandi border border-border/40 group hover:shadow-float transition-all duration-500">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/80 mb-3">Rata-rata Harian</p>
                    <h3 className="text-3xl font-black display-number text-foreground tracking-widest">
                        {formatRupiah(totalBulanIni / 30)}
                    </h3>
                    <p className="text-xs font-black uppercase text-muted-foreground/80 mt-3 italic tracking-widest">Berdasarkan siklus 30 hari</p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-scandi border border-border/40 group hover:shadow-float transition-all duration-500">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/80 mb-3">Item Transaksi</p>
                    <div className="flex items-center gap-3">
                        <h3 className="text-3xl font-black display-number text-foreground tracking-widest">
                            {transaksiList.filter(t => t.tanggal.includes(activeMonth) && t.jenis === 'Pengeluaran').length}
                        </h3>
                        <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/80 mt-2">Records</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full mt-4 overflow-hidden">
                        <div className="h-full bg-indigo-500 w-[65%]" />
                    </div>
                </div>
            </div>

            {/* Main Insight Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Top Spending Categories List */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="px-2">
                        <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Kategori Terbesar</h4>
                    </div>
                    <div className="space-y-3">
                        {perbandinganData.slice(0, 4).map((item, idx) => (
                            <div
                                key={item.nama_kategori}
                                onClick={() => setSelectedCategory(item.id_kategori)}
                                className="group flex items-center gap-4 bg-white p-4 rounded-[1.75rem] border border-border/40 shadow-sm transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer"
                            >
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-xs",
                                    idx === 0 ? "bg-foreground text-background" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                                )}>
                                    <CategoryIcon name={item.icon_name} size={20} strokeWidth={2.5} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-black text-foreground uppercase tracking-wider">{item.nama_kategori}</p>
                                    <p className="text-xs font-bold text-muted-foreground/80 mt-0.5">
                                        {Math.round((item.totalAktif / totalBulanIni) * 100)}% dari total
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-foreground display-number">{formatRupiah(item.totalAktif)}</p>
                                    <div className={cn(
                                        "text-xs font-black uppercase flex items-center justify-end gap-1 mt-0.5",
                                        item.selisih <= 0 ? "text-emerald-500" : "text-red-400"
                                    )}>
                                        {item.selisih > 0 ? '+' : ''}{item.persentase}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trend Analytics Visualization */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-border/40 shadow-scandi h-full">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <LineChartIcon size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-foreground uppercase tracking-widest">Visualisasi Tren</p>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">6 Bulan Terakhir</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 px-3 py-1 bg-muted/30 rounded-full">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    <span className="text-xs font-black uppercase text-muted-foreground">Total Pengeluaran</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trenData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="premiumGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="hsl(var(--muted))" opacity={0.3} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 900, fill: 'hsl(var(--muted-foreground))', opacity: 0.6 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 900, fill: 'hsl(var(--muted-foreground))', opacity: 0.6 }}
                                        tickFormatter={(val) => val >= 1000000 ? `${val / 1000000}jt` : val >= 1000 ? `${val / 1000}rb` : val}
                                    />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-foreground text-background px-4 py-3 rounded-2xl shadow-xl border-none animate-in zoom-in-95">
                                                        <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">{payload[0].payload.name}</p>
                                                        <p className="text-sm font-black display-number">{formatRupiah(payload[0].value as number)}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#premiumGradient)"
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Ledger Analysis */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <BarChart3 size={14} strokeWidth={3} />
                        Ledger Perbandingan Lengkap
                    </h4>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-border/40 shadow-scandi overflow-hidden transition-all">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-muted/30">
                                    <th className="pl-8 pr-4 py-6 text-xs font-black uppercase tracking-widest text-muted-foreground/80 w-[40%]">Analisis Komponen</th>
                                    <th className="px-4 py-6 text-xs font-black uppercase tracking-widest text-muted-foreground/80 text-right">Periode Lalu</th>
                                    <th className="px-4 py-6 text-xs font-black uppercase tracking-widest text-muted-foreground/80 text-right">Periode Ini</th>
                                    <th className="pl-4 pr-8 py-6 text-xs font-black uppercase tracking-widest text-muted-foreground/80 text-right">Variansi (%)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-muted/10">
                                {perbandinganData.map((item, idx) => (
                                    <tr key={item.nama_kategori} className="group hover:bg-muted/5 transition-colors">
                                        <td className="pl-8 pr-4 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center text-muted-foreground group-hover:bg-foreground group-hover:text-background transition-all duration-300 transform group-hover:rotate-[-8deg] shadow-xs">
                                                    <CategoryIcon name={item.icon_name} size={18} strokeWidth={2.5} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-foreground uppercase tracking-widest">{item.nama_kategori}</span>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <div className="w-16 h-1 bg-muted/40 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary"
                                                                style={{ width: `${Math.min(100, (item.totalAktif / totalBulanIni) * 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-black text-muted-foreground/80">{Math.round((item.totalAktif / totalBulanIni) * 100)}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-5 text-right">
                                            <span className="text-xs font-bold text-muted-foreground/80 display-number">
                                                {formatRupiah(item.totalLalu)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-5 text-right">
                                            <span className="text-sm font-black text-foreground display-number">
                                                {formatRupiah(item.totalAktif)}
                                            </span>
                                        </td>
                                        <td className="pl-4 pr-8 py-5 text-right">
                                            <div className="flex flex-col items-end">
                                                <div className={cn(
                                                    "flex items-center gap-1 font-black text-sm transition-transform group-hover:scale-110 origin-right",
                                                    item.selisih <= 0 ? "text-emerald-500" : "text-red-400"
                                                )}>
                                                    {item.selisih > 0 ? (
                                                        <TrendingUp size={14} strokeWidth={3} />
                                                    ) : item.selisih < 0 ? (
                                                        <TrendingDown size={14} strokeWidth={3} />
                                                    ) : (
                                                        <Minus size={14} className="text-muted-foreground" />
                                                    )}
                                                    <span className="display-number">
                                                        {item.selisih !== 0 ? Math.abs(item.persentase) + '%' : '0%'}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-black uppercase text-muted-foreground/80 mt-0.5 tracking-widest italic">
                                                    {item.selisih === 0 ? "STABIL" : item.selisih > 10 ? "NAIK TAJAM" : item.selisih > 0 ? "NAIK" : "HEMAT"}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Dialog detail transaksi berdasarkan kategori */}
            <Dialog open={!!selectedCategory} onOpenChange={(open) => !open && setSelectedCategory(null)}>
                <DialogContent className="sm:max-w-4xl md:max-w-5xl w-[95vw] p-0 overflow-hidden bg-background border-border/40 rounded-3xl">
                    <DialogHeader className="p-8 pb-0">
                        <DialogTitle className="text-xl font-black uppercase tracking-widest flex flex-col gap-1">
                            Detail Kategori
                            <span className="text-xs font-bold text-muted-foreground/80 italic tracking-normal normal-case">
                                Menampilkan semua transaksi untuk kategori ini di bulan aktif
                            </span>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="p-8 pt-4 overflow-y-auto max-h-[70vh] scrollbar-none">
                        {selectedCategory && (
                            <TransactionsTable
                                showSearch={false}
                                preselectedCategory={selectedCategory}
                                hideHeader={true}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
