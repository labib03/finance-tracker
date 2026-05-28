'use client';

import { useMemo, useState, useCallback } from 'react';
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
import { TransactionDetailDialog } from '@/modules/dashboard/components/TransactionDetailDialog';
import type { Transaksi } from '@/lib/types';
import {
    TrendingUp,
    TrendingDown,
    Minus,
    BarChart3,
    LineChart as LineChartIcon,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    Copy,
    Check
} from 'lucide-react';
import { toast } from 'sonner';

export default function CategoryReport() {
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const activeMonth = useFinanceStore((s) => s.activeMonth);
    const cycleStartDay = useFinanceStore((s) => s.cycleStartDay);
    const removeTransaksi = useFinanceStore((s) => s.removeTransaksi);

    const budgetList = useFinanceStore((s) => s.budgetList);
    const tabunganList = useFinanceStore((s) => s.tabunganList);
    const recurringList = useFinanceStore((s) => s.recurringList);
    const getSaldoTabungan = useFinanceStore((s) => s.getSaldoTabungan);
    const getProgresTabungan = useFinanceStore((s) => s.getProgresTabungan);

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedDetail, setSelectedDetail] = useState<Transaksi | null>(null);

    // State untuk menyalin prompt AI
    const [isCopied, setIsCopied] = useState(false);

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

    // Hitung total pemasukan bulan ini secara manual dari transaksiList
    const totalPemasukan = useMemo(() => {
        return transaksiList
            .filter(t => t.tanggal.includes(activeMonth) && t.jenis === 'Pemasukan')
            .reduce((sum, t) => sum + t.nominal, 0);
    }, [transaksiList, activeMonth]);

    // Ekstrak Tahun & Bulan dari activeMonth string
    const [activeYear, activeMonthNum] = useMemo(() => {
        if (!activeMonth) return [new Date().getFullYear(), new Date().getMonth() + 1];
        const parts = activeMonth.split('-');
        return [parseInt(parts[0]), parseInt(parts[1])];
    }, [activeMonth]);

    // Nama Bulan Terbaca (id-ID)
    const activeMonthLabel = useMemo(() => {
        if (!activeMonth) return '';
        const d = new Date(activeYear, activeMonthNum - 1, 1);
        return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    }, [activeYear, activeMonthNum, activeMonth]);

    // Cari anggaran aktif bulan ini
    const activeBudgets = useMemo(() => {
        return budgetList.filter(b => b.bulan === activeMonthNum && b.tahun === activeYear);
    }, [budgetList, activeMonthNum, activeYear]);

    // Nama kategori helper
    const getKategoriName = useCallback((id: string) => {
        return kategoriList.find(k => k.id_kategori === id)?.nama_kategori || id;
    }, [kategoriList]);

    // Susun prompt AI lengkap
    const compiledAiPrompt = useMemo(() => {
        // 1. Ringkasan Cashflow
        const surplusDefisit = totalPemasukan - totalBulanIni;
        const cashflowText = `1. RINGKASAN CASHFLOW BULAN INI (${activeMonthLabel})
- Total Pemasukan: ${formatRupiah(totalPemasukan)}
- Total Pengeluaran: ${formatRupiah(totalBulanIni)}
- Saldo Bersih Bulanan (Surplus/Defisit): ${formatRupiah(surplusDefisit)} (${surplusDefisit >= 0 ? 'Surplus' : 'Defisit'})`;

        // 2. 4 Kategori Terbesar
        const topCats = perbandinganData.slice(0, 4);
        const categoriesText = `2. KATEGORI PENGELUARAN TERBESAR (Top 4)
${topCats.length > 0 
    ? topCats.map((item, idx) => `- [Rank ${idx + 1}] ${item.nama_kategori}: ${formatRupiah(item.totalAktif)} (${Math.round((item.totalAktif / totalBulanIni) * 100)}% dari total pengeluaran, perubahan vs bulan lalu: ${item.selisih > 0 ? '+' : ''}${item.persentase}%)`).join('\n')
    : '- Tidak ada data pengeluaran terdaftar untuk bulan ini.'}`;

        // 3. Anggaran Belanja (Budget)
        const budgetText = `3. STATUS ANGGARAN BELANJA (BUDGET)
${activeBudgets.length > 0 
    ? activeBudgets.map(b => {
        const catName = getKategoriName(b.id_kategori);
        const spent = transaksiList
            .filter(t => t.tanggal.includes(activeMonth) && t.id_kategori === b.id_kategori && t.jenis === 'Pengeluaran')
            .reduce((sum, t) => sum + t.nominal, 0);
        return `- ${catName}: Terpakai ${formatRupiah(spent)} dari batas ${formatRupiah(b.nominal_limit)} (${Math.round((spent / b.nominal_limit) * 100)}%)`;
      }).join('\n')
    : '- Tidak ada data anggaran belanja aktif untuk bulan ini.'}`;

        // 4. Target Tabungan (Savings Goals)
        const activeTabungan = tabunganList.filter(t => t.status === 'aktif');
        const tabunganText = `4. TARGET TABUNGAN SAAT INI (SAVINGS GOALS)
${activeTabungan.length > 0 
    ? activeTabungan.map(t => {
        const saldo = getSaldoTabungan(t.id_tabungan);
        const progres = getProgresTabungan(t.id_tabungan);
        return `- ${t.nama_tujuan}: Terkumpul ${formatRupiah(saldo)} dari target ${formatRupiah(t.target_nominal)} (${Math.round(progres)}%, Target Waktu: ${new Date(t.tanggal_target).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })})`;
      }).join('\n')
    : '- Tidak ada data target tabungan/transaksi rutin aktif saat ini.'}`;

        // 5. Transaksi Berulang (Recurring Bills)
        const activeRecurring = recurringList.filter(r => r.aktif);
        const recurringText = `5. TRANSAKSI BERULANG AKTIF (RECURRING BILLS)
${activeRecurring.length > 0 
    ? activeRecurring.map(r => {
        const typeLabel = r.jenis === 'Pemasukan' ? 'Pemasukan' : 'Pengeluaran';
        return `- [${typeLabel}] ${r.label}: ${formatRupiah(r.nominal)} (${r.frekuensi}, Jadwal Berikutnya: ${new Date(r.tanggal_berikutnya).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })})`;
      }).join('\n')
    : '- Tidak ada transaksi berulang aktif saat ini.'}`;

        // Gabungkan seluruh teks prompt AI secara elegan
        return `Halo AI Financial Planner!
Tolong berikan analisis kesehatan keuangan mendalam, evaluasi pola pengeluaran, serta minimal 3 saran tindakan taktis untuk mengoptimalkan kondisi finansial saya berdasarkan data laporan keuangan bulan aktif berikut:

${cashflowText}

${categoriesText}

${budgetText}

${tabunganText}

${recurringText}

Mohon tinjau data di atas secara holistik dan berikan analisis serta rekomendasi finansial terbaik bagi saya. Terima kasih!`;
    }, [totalPemasukan, totalBulanIni, activeMonthLabel, perbandinganData, activeBudgets, transaksiList, activeMonth, tabunganList, getSaldoTabungan, getProgresTabungan, recurringList, getKategoriName]);

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
            {/* AI Advisor Prompt Generator Card (App Consistent Minimalist Style) */}
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-scandi border border-border/40 relative overflow-hidden transition-all duration-500 hover:shadow-float">
                <div className="relative flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                    <div className="space-y-4 max-w-3xl text-left">
                        <div className="flex items-center gap-3 text-primary">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Sparkles size={20} strokeWidth={2} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-primary/80">AI Advisor Prompt</span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-tight">
                            Generate Prompt Laporan Keuangan
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Salin prompt di bawah ini untuk dikirimkan ke AI (ChatGPT, Claude, dsb.) untuk mendapatkan analisis, masukan, dan saran finansial dari data keuangan bulan ini.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col gap-4 shrink-0 justify-end w-full lg:w-auto mt-2">
                        <button
                            type="button"
                            onClick={() => {
                                navigator.clipboard.writeText(compiledAiPrompt);
                                setIsCopied(true);
                                toast.success("Prompt laporan keuangan disalin ke clipboard!");
                                setTimeout(() => setIsCopied(false), 2000);
                            }}
                            className={cn(
                                "flex py-1.5 items-center justify-center gap-3 h-14 px-6 rounded-2xl font-bold text-sm transition-all duration-300 w-full sm:flex-1 lg:w-[200px]",
                                isCopied
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                    : "bg-secondary text-secondary-foreground border-2 border-secondary hover:bg-white hover:cursor-pointer"
                            )}
                        >
                            {isCopied ? (
                                <>
                                    <Check size={18} strokeWidth={2.5} className="animate-in zoom-in" />
                                    Berhasil Disalin
                                </>
                            ) : (
                                <>
                                    <Copy size={18} strokeWidth={2} />
                                    Salin Prompt AI
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Styled Preview area - Minimalist Log */}
                <div className="mt-8 pt-6 border-t border-border/50">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{"// RAW PROMPT PREVIEW"}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-secondary/50 text-secondary-foreground px-2.5 py-1 rounded-md">
                            Bulan: {activeMonthLabel}
                        </span>
                    </div>
                    <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50 max-h-40 overflow-y-auto text-left relative group">
                        <pre className="font-mono text-[11px] text-muted-foreground leading-relaxed whitespace-pre-wrap select-all transition-colors group-hover:text-foreground/80">
                            {compiledAiPrompt}
                        </pre>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {/* Minimalist Total Belanja */}
                <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-scandi border border-border/40 relative overflow-hidden group transition-all duration-500 hover:shadow-float">
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

                <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-scandi border border-border/40 group hover:shadow-float transition-all duration-500">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/80 mb-3">Rata-rata Harian</p>
                    <h3 className="text-3xl font-black display-number text-foreground tracking-widest">
                        {formatRupiah(totalBulanIni / 30)}
                    </h3>
                    <p className="text-xs font-black uppercase text-muted-foreground/80 mt-3 italic tracking-widest">Berdasarkan siklus 30 hari</p>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-scandi border border-border/40 group hover:shadow-float transition-all duration-500">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/80 mb-3">Item Transaksi</p>
                    <div className="flex items-center gap-3">
                        <h3 className="text-3xl font-black display-number text-foreground tracking-widest">
                            {transaksiList.filter(t => t.tanggal.includes(activeMonth) && t.jenis === 'Pengeluaran').length}
                        </h3>
                        <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/80 mt-2">Records</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full mt-4 overflow-hidden">
                        <div className="h-full bg-blue-500 w-[65%]" />
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
                    <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-border/40 shadow-scandi h-full">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
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
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
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
                                {perbandinganData.map((item) => (
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

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-muted/10">
                        {perbandinganData.map((item) => (
                            <div key={item.nama_kategori} className="p-6 space-y-5 animate-in fade-in duration-500">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-2xl bg-muted/20 flex items-center justify-center text-foreground shadow-xs">
                                            <CategoryIcon name={item.icon_name} size={20} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black uppercase tracking-widest text-foreground">{item.nama_kategori}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase mt-0.5 italic">
                                                {Math.round((item.totalAktif / totalBulanIni) * 100)}% dari total
                                            </p>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-[10px] font-black uppercase tracking-tighter",
                                        item.selisih <= 0 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                    )}>
                                        {item.selisih > 0 ? (
                                            <TrendingUp size={12} strokeWidth={3} />
                                        ) : item.selisih < 0 ? (
                                            <TrendingDown size={12} strokeWidth={3} />
                                        ) : (
                                            <Minus size={12} className="text-muted-foreground" />
                                        )}
                                        {Math.abs(item.persentase)}%
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="p-4 bg-muted/5 rounded-2xl border border-transparent">
                                        <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1.5 leading-none">Bulan Lalu</p>
                                        <p className="text-xs font-black text-muted-foreground display-number leading-none">{formatRupiah(item.totalLalu)}</p>
                                    </div>
                                    <div className="p-4 bg-blue-50/30 rounded-2xl border border-blue-100/20">
                                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1.5 leading-none">Bulan Ini</p>
                                        <p className="text-xs font-black text-blue-600 display-number leading-none">{formatRupiah(item.totalAktif)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Dialog detail transaksi berdasarkan kategori */}
            <Dialog open={!!selectedCategory} onOpenChange={(open) => !open && setSelectedCategory(null)}>
                <DialogContent className="sm:max-w-4xl md:max-w-5xl w-[95vw] p-0 overflow-hidden bg-background border-border/40 rounded-2xl sm:rounded-3xl">
                    <DialogHeader className="p-6 sm:p-8 pb-0">
                        <DialogTitle className="text-xl font-black uppercase tracking-widest flex flex-col gap-1">
                            Detail Kategori
                            <span className="text-xs font-bold text-muted-foreground/80 italic tracking-normal normal-case">
                                Menampilkan semua transaksi untuk kategori ini di bulan aktif
                            </span>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="p-4 sm:p-8 sm:pt-4 overflow-y-auto max-h-[70vh] scrollbar-none">
                        {selectedCategory && (
                            <TransactionsTable
                                showSearch={false}
                                preselectedCategory={selectedCategory}
                                hideHeader={true}
                                onTransactionClick={(t) => setSelectedDetail(t)}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <TransactionDetailDialog
                transaksi={selectedDetail}
                open={!!selectedDetail}
                onOpenChange={(open) => !open && setSelectedDetail(null)}
                onDelete={removeTransaksi}
            />
        </div>
    );
}
