'use client';
import { TRANSACTION_TYPES } from '@/lib/constants';

import { useState, useMemo } from 'react';
import { Card } from '@/shared/ui/card';
import { useFinanceStore } from '@/lib/store';
import { formatRupiah, cn } from '@/lib/utils';
import { getRootLabel } from '@/lib/tipeUtils';
import { format, parseISO, subDays, startOfMonth, endOfMonth, startOfYear, subMonths } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
    Search, 
    Calendar, 
    ArrowLeftRight, 
    X,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
    TrendingUp,
    TrendingDown,
    Activity,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    ArrowDown,
    ArrowUp
} from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/shared/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/shared/ui/dialog";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Calendar as CalendarComponent } from '@/shared/ui/calendar';

export default function InquiryView() {
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
    const tipeList = useFinanceStore((s) => s.tipeList);
    
    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [filterJenis, setFilterJenis] = useState<string>('all');
    const [filterKategori, setFilterKategori] = useState<string>('all');
    const [filterSumber, setFilterSumber] = useState<string>('all');
    const [date, setDate] = useState<DateRange | undefined>();
    const [minNominal, setMinNominal] = useState<string>('');
    const [maxNominal, setMaxNominal] = useState<string>('');
    const [sortConfig, setSortConfig] = useState<{ key: 'tanggal' | 'nominal', direction: 'desc' | 'asc' }>({ key: 'tanggal', direction: 'desc' });

    // Pending Filter States (for Sheet)
    const [pendingJenis, setPendingJenis] = useState<string>('all');
    const [pendingKategori, setPendingKategori] = useState<string>('all');
    const [pendingSumber, setPendingSumber] = useState<string>('all');
    const [pendingMinNominal, setPendingMinNominal] = useState<string>('');
    const [pendingMaxNominal, setPendingMaxNominal] = useState<string>('');

    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

    const selectedTx = useMemo(() => {
        if (!selectedTxId) return null;
        return transaksiList.find(tx => tx.id === selectedTxId) || null;
    }, [selectedTxId, transaksiList]);
    
    // Pagination
    const [page, setPage] = useState(1);
    const itemsPerPage = 30;

    const resetFilters = () => {
        setSearchTerm('');
        setFilterJenis('all');
        setFilterKategori('all');
        setFilterSumber('all');
        setDate(undefined);
        setMinNominal('');
        setMaxNominal('');
        setPendingJenis('all');
        setPendingKategori('all');
        setPendingSumber('all');
        setPendingMinNominal('');
        setPendingMaxNominal('');
        setSortConfig({ key: 'tanggal', direction: 'desc' });
        setPage(1);
    };

    const applyAdvancedFilters = () => {
        setFilterJenis(pendingJenis);
        setFilterKategori(pendingKategori);
        setFilterSumber(pendingSumber);
        setMinNominal(pendingMinNominal);
        setMaxNominal(pendingMaxNominal);
        setPage(1);
        setIsSheetOpen(false);
    };

    // Filter Logic
    const filteredTransactions = useMemo(() => {
        let result = transaksiList;

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(tx => 
                tx.label.toLowerCase().includes(lower) || 
                (tx.catatan && tx.catatan.toLowerCase().includes(lower))
            );
        }

        if (filterJenis !== 'all') {
            result = result.filter(tx => tx.jenis.toLowerCase() === (filterJenis || '').toLowerCase());
        }

        if (filterKategori !== 'all') {
            result = result.filter(tx => tx.id_kategori === filterKategori);
        }

        if (filterSumber !== 'all') {
            result = result.filter(tx => tx.id_sumber_dana === filterSumber || tx.id_target_dana === filterSumber);
        }

        if (date?.from) {
            const startStr = format(date.from, 'yyyy-MM-dd');
            result = result.filter(tx => tx.tanggal >= startStr);
        }
        
        if (date?.to) {
            const endStr = format(date.to, 'yyyy-MM-dd');
            result = result.filter(tx => tx.tanggal <= endStr);
        }

        if (minNominal) {
            const min = parseInt(minNominal.replace(/\D/g, '')) || 0;
            if (min > 0) result = result.filter(tx => tx.nominal >= min);
        }

        if (maxNominal) {
            const max = parseInt(maxNominal.replace(/\D/g, '')) || 0;
            if (max > 0) result = result.filter(tx => tx.nominal <= max);
        }

        // Sort
        result = [...result].sort((a, b) => {
            if (sortConfig.key === 'tanggal') {
                return sortConfig.direction === 'desc' 
                    ? b.tanggal.localeCompare(a.tanggal)
                    : a.tanggal.localeCompare(b.tanggal);
            } else {
                return sortConfig.direction === 'desc'
                    ? b.nominal - a.nominal
                    : a.nominal - b.nominal;
            }
        });

        return result;
    }, [transaksiList, searchTerm, filterJenis, filterKategori, filterSumber, date?.from, date?.to, minNominal, maxNominal, sortConfig]);

    const summary = useMemo(() => {
        let income = 0;
        let expense = 0;
        filteredTransactions.forEach(tx => {
            const rootLabel = getRootLabel(tipeList, tx.jenis).toLowerCase();
            if (rootLabel.includes(TRANSACTION_TYPES.INCOME)) income += tx.nominal;
            else if (rootLabel.includes(TRANSACTION_TYPES.EXPENSE)) expense += tx.nominal;
        });
        return { income, expense, net: income - expense };
    }, [filteredTransactions, tipeList]);

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const paginatedTransactions = filteredTransactions.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const activeFiltersCount = 
        (filterJenis !== 'all' ? 1 : 0) + 
        (filterKategori !== 'all' ? 1 : 0) + 
        (filterSumber !== 'all' ? 1 : 0) + 
        (minNominal ? 1 : 0) + 
        (maxNominal ? 1 : 0);

    const activeFiltersBadges = (
        <div className="flex flex-wrap items-center gap-2 mb-6">
            {filterJenis !== 'all' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] font-bold tracking-wider">
                    Jenis: {tipeList.find(t => t.id_tipe === filterJenis)?.label || filterJenis}
                    <button onClick={() => { setFilterJenis('all'); setPendingJenis('all'); setPage(1); }} className="hover:bg-blue-100 p-0.5 rounded-full"><X size={12} /></button>
                </div>
            )}
            {filterKategori !== 'all' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] font-bold tracking-wider">
                    Kategori: {kategoriList.find(k => k.id_kategori === filterKategori)?.nama_kategori || 'Filter'}
                    <button onClick={() => { setFilterKategori('all'); setPendingKategori('all'); setPage(1); }} className="hover:bg-blue-100 p-0.5 rounded-full"><X size={12} /></button>
                </div>
            )}
            {filterSumber !== 'all' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] font-bold tracking-wider">
                    Sumber: {sumberDanaList.find(s => s.id_sumber_dana === filterSumber)?.nama_sumber || 'Filter'}
                    <button onClick={() => { setFilterSumber('all'); setPendingSumber('all'); setPage(1); }} className="hover:bg-blue-100 p-0.5 rounded-full"><X size={12} /></button>
                </div>
            )}
            {(minNominal || maxNominal) && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] font-bold tracking-wider">
                    Nominal Terfilter
                    <button onClick={() => { setMinNominal(''); setMaxNominal(''); setPendingMinNominal(''); setPendingMaxNominal(''); setPage(1); }} className="hover:bg-blue-100 p-0.5 rounded-full"><X size={12} /></button>
                </div>
            )}
            {activeFiltersCount > 0 && (
                <button onClick={resetFilters} className="text-[11px] font-bold text-muted-foreground hover:text-foreground ml-2 transition-colors">
                    Hapus Semua
                </button>
            )}
        </div>
    );

    const filterFieldsJsx = (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Jenis Transaksi</label>
                <Select value={pendingJenis} onValueChange={(v) => setPendingJenis(v || 'all')}>
                    <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-transparent hover:bg-muted/30 transition-colors">
                        <SelectValue placeholder="Semua Jenis">
                            {pendingJenis === 'all' ? 'Semua Jenis' : tipeList.find(t => t.id_tipe === pendingJenis)?.label || pendingJenis}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Jenis</SelectItem>
                        {tipeList.map(t => (
                            <SelectItem key={t.id_tipe} value={t.id_tipe}>{t.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Kategori</label>
                <Select value={pendingKategori} onValueChange={(v) => setPendingKategori(v || 'all')}>
                    <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-transparent hover:bg-muted/30 transition-colors">
                        <SelectValue placeholder="Semua Kategori">
                            {pendingKategori === 'all' ? 'Semua Kategori' : kategoriList.find(k => k.id_kategori === pendingKategori)?.nama_kategori || 'Semua Kategori'}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Kategori</SelectItem>
                        {kategoriList.map(k => (
                            <SelectItem key={k.id_kategori} value={k.id_kategori}>{k.nama_kategori}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sumber Dana</label>
                <Select value={pendingSumber} onValueChange={(v) => setPendingSumber(v || 'all')}>
                    <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-transparent hover:bg-muted/30 transition-colors">
                        <SelectValue placeholder="Semua Sumber">
                            {pendingSumber === 'all' ? 'Semua Sumber' : sumberDanaList.find(s => s.id_sumber_dana === pendingSumber)?.nama_sumber || 'Semua Sumber'}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Sumber</SelectItem>
                        {sumberDanaList.map(s => (
                            <SelectItem key={s.id_sumber_dana} value={s.id_sumber_dana}>{s.nama_sumber}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Min (Rp)</label>
                    <Input 
                        type="number" 
                        placeholder="0"
                        value={pendingMinNominal} 
                        onChange={(e) => setPendingMinNominal(e.target.value)}
                        className="h-12 rounded-2xl bg-muted/20 border-transparent hover:bg-muted/30 transition-colors"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Max (Rp)</label>
                    <Input 
                        type="number" 
                        placeholder="Tak Terbatas"
                        value={pendingMaxNominal} 
                        onChange={(e) => setPendingMaxNominal(e.target.value)}
                        className="h-12 rounded-2xl bg-muted/20 border-transparent hover:bg-muted/30 transition-colors"
                    />
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header section with minimal styling */}
            <div className="flex flex-col gap-8">
                
                {/* Minimalist Summary KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="rounded-[2rem] border-none bg-emerald-500/5 shadow-none p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp size={64} className="text-emerald-500" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-emerald-600/70 mb-2">Total Inflow</p>
                        <p className="text-3xl font-black text-emerald-600 tracking-tight">
                            {formatRupiah(summary.income)}
                        </p>
                    </Card>
                    <Card className="rounded-[2rem] border-none bg-rose-500/5 shadow-none p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingDown size={64} className="text-rose-500" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-rose-600/70 mb-2">Total Outflow</p>
                        <p className="text-3xl font-black text-rose-600 tracking-tight">
                            {formatRupiah(summary.expense)}
                        </p>
                    </Card>
                    <Card className="rounded-[2rem] border-none bg-blue-500/5 shadow-none p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Activity size={64} className="text-blue-500" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-blue-600/70 mb-2">Net Balance</p>
                        <p className="text-3xl font-black text-blue-600 tracking-tight">
                            {summary.net > 0 ? '+' : ''}{formatRupiah(summary.net)}
                        </p>
                    </Card>
                </div>
            </div>

            {/* Smart Toolbar */}
            <div>
                <div className="flex flex-col md:flex-row items-center gap-2 bg-white p-2 rounded-[2.5rem] md:rounded-full border border-border/40 shadow-scandi">
                    
                    {/* Primary Search */}
                    <div className="flex-1 w-full flex items-center relative px-2">
                        <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                        <Input
                            placeholder="Cari transaksi, deskripsi, atau catatan..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                            className="h-12 border-0 shadow-none focus-visible:ring-0 bg-transparent text-base md:text-sm px-4 w-full placeholder:text-muted-foreground/60"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="text-muted-foreground hover:text-foreground">
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div className="hidden md:block w-px h-8 bg-border/40" />

                    {/* Date Range Picker inside Toolbar */}
                    <div className="w-full md:w-auto px-2 md:px-0 border-t md:border-t-0 border-border/40 pt-2 md:pt-0 relative flex items-center">
                        <Popover>
                            <PopoverTrigger render={
                                <Button 
                                    variant="ghost" 
                                    className={cn(
                                        "w-full md:w-64 h-12 rounded-[1.5rem] md:rounded-full justify-start text-left font-medium hover:bg-muted/40",
                                        date?.from ? "pr-10" : "",
                                        !date && "text-muted-foreground"
                                    )}
                                />
                            }>
                                <Calendar className="mr-3 h-5 w-5 shrink-0 text-muted-foreground" />
                                {date?.from ? (
                                    date.to ? (
                                        <span className="truncate">
                                            {format(date.from, "dd LLL yy", { locale: id })} - {format(date.to, "dd LLL yy", { locale: id })}
                                        </span>
                                    ) : (
                                        <span className="truncate">
                                            {format(date.from, "dd LLL yy", { locale: id })}
                                        </span>
                                    )
                                ) : (
                                    <span>Kapan saja...</span>
                                )}
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-[2rem] shadow-2xl border-border/40 overflow-hidden flex flex-col md:flex-row" align="end">
                                <div className="p-3 border-b md:border-b-0 md:border-r border-border/40 flex flex-col gap-1 min-w-[140px] bg-muted/10">
                                    {[
                                        { label: 'Hari Ini', range: { from: new Date(), to: new Date() } },
                                        { label: '7 Hari Terakhir', range: { from: subDays(new Date(), 6), to: new Date() } },
                                        { label: '30 Hari Terakhir', range: { from: subDays(new Date(), 29), to: new Date() } },
                                        { label: 'Bulan Ini', range: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) } },
                                        { label: 'Bulan Lalu', range: { from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) } },
                                        { label: 'Tahun Ini', range: { from: startOfYear(new Date()), to: endOfMonth(new Date()) } },
                                    ].map((preset, idx) => (
                                        <Button
                                            key={idx}
                                            variant="ghost"
                                            size="sm"
                                            className="justify-start text-xs font-medium rounded-xl hover:bg-white hover:text-blue-600"
                                            onClick={() => {
                                                setDate(preset.range);
                                                setPage(1);
                                            }}
                                        >
                                            {preset.label}
                                        </Button>
                                    ))}
                                </div>
                                <CalendarComponent
                                    initialFocus
                                    mode="range"
                                    defaultMonth={date?.from}
                                    selected={date}
                                    onSelect={(v) => { setDate(v); setPage(1); }}
                                    numberOfMonths={1}
                                />
                            </PopoverContent>
                        </Popover>
                        {date?.from && (
                            <button 
                                onClick={(e) => { 
                                    e.preventDefault(); 
                                    e.stopPropagation(); 
                                    setDate(undefined); 
                                    setPage(1); 
                                }}
                                className="absolute right-4 md:right-3 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors"
                                title="Reset Tanggal"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div className="hidden md:block w-px h-8 bg-border/40" />

                    {/* Advanced Filters Trigger */}
                    <div className="w-full md:w-auto px-2 md:px-0 md:pr-2 border-t md:border-t-0 border-border/40 pt-2 md:pt-0 pb-2 md:pb-0">
                        <Sheet open={isSheetOpen} onOpenChange={(open) => {
                            if (open) {
                                setPendingJenis(filterJenis);
                                setPendingKategori(filterKategori);
                                setPendingSumber(filterSumber);
                                setPendingMinNominal(minNominal);
                                setPendingMaxNominal(maxNominal);
                            }
                            setIsSheetOpen(open);
                        }}>
                            <SheetTrigger render={
                                <Button variant="outline" className="w-full md:w-auto rounded-[1.5rem] md:rounded-full h-12 flex items-center justify-center gap-2 border-border/40 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors" />
                            }>
                                <Filter className="w-4 h-4" />
                                <span className="md:hidden lg:inline">Filters</span>
                                {activeFiltersCount > 0 && (
                                    <span className="ml-1 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </SheetTrigger>
                            <SheetContent side="right" className="w-full sm:max-w-md rounded-l-[2.5rem] px-8 py-10 border-l-0 shadow-2xl overflow-y-auto">
                                <SheetHeader className="mb-8">
                                    <SheetTitle className="text-left text-2xl font-black">Refine Search</SheetTitle>
                                    <p className="text-muted-foreground text-sm">Gunakan filter lanjutan untuk mempersempit hasil pencarian.</p>
                                </SheetHeader>
                                {filterFieldsJsx}
                                <div className="mt-10">
                                    <Button onClick={applyAdvancedFilters} className="w-full h-14 rounded-2xl bg-foreground text-background font-bold text-base hover:bg-foreground/90 transition-transform active:scale-[0.98]">
                                        Terapkan Filter
                                    </Button>
                                    {activeFiltersCount > 0 && (
                                        <Button variant="ghost" onClick={resetFilters} className="w-full h-12 mt-2 rounded-2xl text-muted-foreground hover:text-foreground">
                                            Reset Semua
                                        </Button>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                </div>
            </div>

            {activeFiltersCount > 0 && activeFiltersBadges}

            {/* Main Data View */}
            <Card className="rounded-[2.5rem] border-border/40 shadow-scandi hover:shadow-float overflow-hidden bg-white transition-all duration-500">
                <div className="flex items-center justify-between p-6 border-b border-border/40 bg-muted/5">
                    <h3 className="font-black text-lg">Hasil Pencarian <span className="text-muted-foreground/60 ml-2 font-medium">({filteredTransactions.length})</span></h3>
                    <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-border/40 shadow-sm">
                        <Button 
                            variant={sortConfig.key === 'tanggal' ? 'secondary' : 'ghost'}
                            size="sm"
                            className={cn("h-8 px-2.5 rounded-lg gap-1.5", sortConfig.key === 'tanggal' && "bg-muted")}
                            onClick={() => {
                                setPage(1);
                                if (sortConfig.key === 'tanggal') {
                                    setSortConfig({ key: 'tanggal', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
                                } else {
                                    setSortConfig({ key: 'tanggal', direction: 'desc' });
                                }
                            }}
                            title="Urutkan Tanggal"
                        >
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {sortConfig.key === 'tanggal' && (
                                sortConfig.direction === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />
                            )}
                        </Button>
                        <Button 
                            variant={sortConfig.key === 'nominal' ? 'secondary' : 'ghost'}
                            size="sm"
                            className={cn("h-8 px-2.5 rounded-lg gap-1.5", sortConfig.key === 'nominal' && "bg-muted")}
                            onClick={() => {
                                setPage(1);
                                if (sortConfig.key === 'nominal') {
                                    setSortConfig({ key: 'nominal', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
                                } else {
                                    setSortConfig({ key: 'nominal', direction: 'desc' });
                                }
                            }}
                            title="Urutkan Nominal"
                        >
                            <span className="text-[10px] font-black uppercase text-muted-foreground">Rp</span>
                            {sortConfig.key === 'nominal' && (
                                sortConfig.direction === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />
                            )}
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {/* Desktop Table */}
                    <table className="w-full hidden md:table text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border/40 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
                                <th className="py-4 px-4 font-black w-[120px]">Tanggal</th>
                                <th className="py-4 px-4 font-black">Detail Transaksi</th>
                                <th className="py-4 px-4 font-black w-[180px]">Kategori</th>
                                <th className="py-4 px-4 font-black w-[160px]">Sumber</th>
                                <th className="py-4 px-4 font-black text-right w-[180px]">Nominal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {paginatedTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center">
                                        <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Search className="w-8 h-8 text-muted-foreground/50" />
                                        </div>
                                        <p className="text-lg font-bold text-foreground">Tidak Ditemukan</p>
                                        <p className="text-muted-foreground mt-1">Coba sesuaikan kata kunci atau hapus beberapa filter.</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedTransactions.map((tx) => {
                                    const kategori = kategoriList.find(k => k.id_kategori === tx.id_kategori);
                                    const sumberDana = sumberDanaList.find(s => s.id_sumber_dana === tx.id_sumber_dana);
                                    const rootLabel = getRootLabel(tipeList, tx.jenis).toLowerCase();
                                    const isIncome = rootLabel.includes(TRANSACTION_TYPES.INCOME);
                                    const isExpense = rootLabel.includes(TRANSACTION_TYPES.EXPENSE);

                                    return (
                                        <tr key={tx.id} onClick={() => setSelectedTxId(tx.id)} className="hover:bg-muted/5 transition-colors group cursor-pointer">
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <span className="text-sm font-semibold text-foreground">
                                                    {format(parseISO(tx.tanggal), 'dd MMM yyyy', { locale: id })}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-start gap-3">
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-full flex items-center justify-center mt-0.5 shrink-0 transition-transform group-hover:scale-110",
                                                        isIncome ? "bg-emerald-100 text-emerald-600" :
                                                        isExpense ? "bg-rose-100 text-rose-600" :
                                                        "bg-blue-100 text-blue-600"
                                                    )}>
                                                        {isIncome ? <ArrowUpRight size={14} strokeWidth={3} /> : 
                                                         isExpense ? <ArrowDownRight size={14} strokeWidth={3} /> : 
                                                         <ArrowLeftRight size={14} strokeWidth={3} />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-base text-foreground leading-tight">{tx.label}</p>
                                                        {tx.catatan && <p className="text-[11px] sm:text-xs text-muted-foreground/80 font-medium line-clamp-1 mt-1 max-w-[280px]">{tx.catatan}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-muted/40 text-[11px] sm:text-xs font-bold text-foreground/80 tracking-wide">
                                                    {kategori?.nama_kategori || '-'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                                    {sumberDana?.nama_sumber || '-'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap text-right">
                                                <span className={cn(
                                                    "font-black text-[17px] tracking-tight",
                                                    isIncome ? "text-emerald-600" : isExpense ? "text-foreground" : "text-blue-600"
                                                )}>
                                                    {isIncome ? '+' : isExpense ? '-' : ''}{formatRupiah(tx.nominal)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>

                    {/* Mobile Timeline View */}
                    <div className="md:hidden divide-y divide-border/20">
                        {paginatedTransactions.length === 0 ? (
                            <div className="py-24 text-center">
                                <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="w-8 h-8 text-muted-foreground/50" />
                                </div>
                                <p className="text-lg font-bold text-foreground">Tidak Ditemukan</p>
                            </div>
                        ) : (
                            paginatedTransactions.map((tx) => {
                                const kategori = kategoriList.find(k => k.id_kategori === tx.id_kategori);
                                const sumberDana = sumberDanaList.find(s => s.id_sumber_dana === tx.id_sumber_dana);
                                const rootLabel = getRootLabel(tipeList, tx.jenis).toLowerCase();
                                const isIncome = rootLabel.includes(TRANSACTION_TYPES.INCOME);
                                const isExpense = rootLabel.includes(TRANSACTION_TYPES.EXPENSE);

                                return (
                                    <div key={tx.id} onClick={() => setSelectedTxId(tx.id)} className="flex items-center justify-between p-6 hover:bg-muted/5 transition-colors cursor-pointer">
                                        <div className="flex items-start gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-sm",
                                                isIncome ? "bg-emerald-100 text-emerald-600" :
                                                isExpense ? "bg-rose-100 text-rose-600" :
                                                "bg-blue-100 text-blue-600"
                                            )}>
                                                {isIncome ? <ArrowUpRight size={20} strokeWidth={3} /> : 
                                                 isExpense ? <ArrowDownRight size={20} strokeWidth={3} /> : 
                                                 <ArrowLeftRight size={20} strokeWidth={3} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[15px] text-foreground leading-tight mb-1.5">{tx.label}</p>
                                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-medium">
                                                    <span>{format(parseISO(tx.tanggal), 'dd MMM yy', { locale: id })}</span>
                                                    <span className="w-1 h-1 rounded-full bg-border"></span>
                                                    <span>{kategori?.nama_kategori || tx.jenis}</span>
                                                </div>
                                                {tx.catatan && <p className="text-xs text-muted-foreground/70 mt-1.5 truncate max-w-[180px]">{tx.catatan}</p>}
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 ml-4 flex flex-col justify-between h-12">
                                            <p className={cn(
                                                "font-black text-base tracking-tight",
                                                isIncome ? "text-emerald-600" : isExpense ? "text-foreground" : "text-blue-600"
                                            )}>
                                                {isIncome ? '+' : isExpense ? '-' : ''}{formatRupiah(tx.nominal)}
                                            </p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                {sumberDana?.nama_sumber || '-'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Modern Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 sm:p-6 border-t border-border/40 bg-muted/5 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground font-medium">
                            Halaman <strong className="text-foreground">{page}</strong> dari <strong className="text-foreground">{totalPages}</strong>
                        </span>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="rounded-xl h-10 w-10 p-0 border-border/40 hover:bg-white"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="rounded-xl h-10 w-10 p-0 border-border/40 hover:bg-white"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Transaction Detail Dialog */}
            <Dialog open={!!selectedTxId} onOpenChange={(open) => !open && setSelectedTxId(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Detail Transaksi</DialogTitle>
                    </DialogHeader>
                    {selectedTx && (
                        <div className="space-y-6 pt-4">
                            <div className="flex flex-col items-center justify-center p-6 bg-muted/20 rounded-2xl">
                                {(() => {
                                    const rootLabel = getRootLabel(tipeList, selectedTx.jenis).toLowerCase();
                                    const isIncome = rootLabel.includes(TRANSACTION_TYPES.INCOME);
                                    const isExpense = rootLabel.includes(TRANSACTION_TYPES.EXPENSE);
                                    const isTransfer = rootLabel.includes(TRANSACTION_TYPES.TRANSFER) || selectedTx.jenis.toLowerCase() === TRANSACTION_TYPES.TRANSFER;
                                    
                                    return (
                                        <>
                                            <div className={cn(
                                                "w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-4",
                                                isTransfer ? "bg-blue-100 text-blue-600" :
                                                isIncome ? "bg-emerald-100 text-emerald-600" :
                                                "bg-rose-100 text-rose-600"
                                            )}>
                                                {isTransfer ? <ArrowLeftRight size={32} strokeWidth={3} /> : 
                                                 isIncome ? <ArrowUpRight size={32} strokeWidth={3} /> : 
                                                 <ArrowDownRight size={32} strokeWidth={3} />}
                                            </div>
                                            <h3 className="font-black text-2xl text-center mb-1">{selectedTx.label}</h3>
                                            <p className={cn(
                                                "font-black text-3xl tracking-tight mt-2",
                                                isTransfer ? "text-blue-600" : 
                                                isIncome ? "text-emerald-600" : "text-foreground"
                                            )}>
                                                {isIncome ? '+' : isExpense ? '-' : ''}
                                                {formatRupiah(selectedTx.nominal)}
                                            </p>
                                        </>
                                    );
                                })()}
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between py-2 border-b border-border/40">
                                    <span className="text-muted-foreground font-medium">Tanggal</span>
                                    <span className="font-bold">{format(parseISO(selectedTx.tanggal), 'dd MMMM yyyy', { locale: id })}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border/40">
                                    <span className="text-muted-foreground font-medium">Jenis</span>
                                    <span className="font-bold">{tipeList.find(t => t.id_tipe === selectedTx.jenis)?.label || selectedTx.jenis}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border/40">
                                    <span className="text-muted-foreground font-medium">Kategori</span>
                                    <span className="font-bold">{kategoriList.find(k => k.id_kategori === selectedTx.id_kategori)?.nama_kategori || '-'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border/40">
                                    <span className="text-muted-foreground font-medium">Sumber Dana</span>
                                    <span className="font-bold">{sumberDanaList.find(s => s.id_sumber_dana === selectedTx.id_sumber_dana)?.nama_sumber || '-'}</span>
                                </div>
                                {(getRootLabel(tipeList, selectedTx.jenis).toLowerCase().includes(TRANSACTION_TYPES.TRANSFER) || selectedTx.jenis.toLowerCase() === TRANSACTION_TYPES.TRANSFER) && selectedTx.id_target_dana && (
                                    <div className="flex justify-between py-2 border-b border-border/40">
                                        <span className="text-muted-foreground font-medium">Target Dana</span>
                                        <span className="font-bold">{sumberDanaList.find(s => s.id_sumber_dana === selectedTx.id_target_dana)?.nama_sumber || '-'}</span>
                                    </div>
                                )}
                                {selectedTx.catatan && (
                                    <div className="pt-2">
                                        <span className="text-muted-foreground font-medium block mb-2">Catatan</span>
                                        <p className="font-medium text-sm bg-muted/20 p-3 rounded-xl border border-border/40 whitespace-pre-wrap max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40">{selectedTx.catatan}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
