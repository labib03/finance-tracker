'use client';

import { useMemo, useState } from 'react';
import { useFinanceStore } from '@/lib/store';
import { Trash2, Plus, Target, Info, Pencil, CheckCircle, AlertTriangle, XCircle, Search, X, Filter } from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { formatRupiah, getNamaBulan, hitungBudgetStatus, cn } from '@/lib/utils';
import { Progress } from '@/shared/ui/progress';
import type { Budget } from '@/lib/types';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/ui/table';
import { Badge } from '@/shared/ui/badge';

interface BudgetManagementProps {
    onAdd: () => void;
    onEdit?: (budget: Budget) => void;
}

export default function BudgetManagement({ onAdd, onEdit }: BudgetManagementProps) {
    const budgetList = useFinanceStore((s) => s.budgetList);
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const activeMonth = useFinanceStore((s) => s.activeMonth);
    const cycleStartDay = useFinanceStore((s) => s.cycleStartDay);
    const removeBudget = useFinanceStore((s) => s.removeBudget);

    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, id: string, name: string }>({
        isOpen: false,
        id: '',
        name: ''
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'aman' | 'peringatan' | 'bahaya'>('all');

    const budgetStatusMap = useMemo(() => {
        const statusList = hitungBudgetStatus(transaksiList, kategoriList, budgetList, activeMonth, cycleStartDay);
        const map = new Map();
        statusList.forEach(s => map.set(s.id_kategori, s));
        return map;
    }, [transaksiList, kategoriList, budgetList, activeMonth, cycleStartDay]);

    const activeBudgets = useMemo(() => {
        const [yearStr, monthStr] = activeMonth.split('-');
        const year = parseInt(yearStr);
        const month = parseInt(monthStr);

        let list = budgetList.filter(b => b.bulan === month && b.tahun === year);

        // Search filter
        if (search) {
            const lowSearch = search.toLowerCase();
            list = list.filter(b =>
                kategoriList.find(k => k.id_kategori === b.id_kategori)?.nama_kategori.toLowerCase().includes(lowSearch)
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            list = list.filter(b => {
                const status = budgetStatusMap.get(b.id_kategori);
                return status?.status === statusFilter;
            });
        }

        return list;
    }, [budgetList, activeMonth, search, kategoriList, statusFilter, budgetStatusMap]);

    const getKategoriName = (id: string) => {
        return kategoriList.find((k) => k.id_kategori === id)?.nama_kategori || 'Kategori Terhapus';
    }

    const handleDelete = (id: string, name: string) => {
        setConfirmDelete({ isOpen: true, id, name });
    };

    const confirmDeleteAction = async () => {
        setIsDeleting(true);
        await removeBudget(confirmDelete.id);
        setIsDeleting(false);
        setConfirmDelete({ ...confirmDelete, isOpen: false });
    };

    return (
        <Card className="border-none shadow-sm overflow-hidden flex flex-col h-full bg-background/50 backdrop-blur-sm">
            <CardHeader className="flex flex-col gap-6 pb-6 pt-6 sm:pt-8 px-6 sm:px-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="text-left">
                        <CardTitle className="text-xl sm:text-2xl font-black uppercase tracking-widest text-foreground">Anggaran {getNamaBulan(activeMonth)}</CardTitle>
                        <CardDescription className="text-xs font-medium text-muted-foreground/80 uppercase tracking-widest mt-1">
                            Tetapkan batas pengeluaran per kategori
                        </CardDescription>
                    </div>
                    <Button 
                        onClick={onAdd} 
                        className="shrink-0 rounded-2xl h-12 px-6 shadow-lg shadow-indigo-600/20 bg-foreground text-background hover:bg-foreground/90 text-xs font-black uppercase tracking-widest w-full sm:w-auto transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                        <Plus size={18} className="mr-2" />
                        Tambah Anggaran
                    </Button>
                </div>

                <div className="space-y-4">
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-primary" size={16} />
                        <Input
                            placeholder="Cari kategori anggaran..."
                            className="pl-11 rounded-2xl bg-white border border-border/40 h-11 text-xs font-medium tracking-wide shadow-scandi focus-visible:ring-primary/20"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 p-1.5 bg-muted/20 border border-border/40 rounded-2xl w-full sm:w-fit overflow-x-auto scrollbar-none">
                        {[
                            { id: 'all', label: 'Semua', color: 'text-foreground' },
                            { id: 'aman', label: 'Aman', color: 'text-emerald-600' },
                            { id: 'peringatan', label: 'Waspada', color: 'text-amber-600' },
                            { id: 'bahaya', label: 'Bahaya', color: 'text-red-600' }
                        ].map((f) => (
                            <button
                                key={f.id}
                                onClick={() => setStatusFilter(f.id as any)}
                                className={cn(
                                    "px-4 py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl transition-all flex-1 sm:flex-none whitespace-nowrap",
                                    statusFilter === f.id ? "bg-white shadow-scandi " + f.color + " scale-[1.02]" : "text-muted-foreground/60 hover:text-foreground"
                                )}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="px-6 sm:px-10 mb-8 sm:mb-10">
                    <div className="bg-white/50 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-primary/10 shadow-scandi flex sm:items-center gap-5 sm:gap-6 relative group overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
                        <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center shrink-0 border border-primary/10 transition-transform group-hover:scale-110 duration-500">
                            <Target size={24} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black uppercase tracking-widest leading-none mb-1.5 text-primary">Status Pencarian</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wide leading-relaxed">
                                {search || statusFilter !== 'all'
                                    ? `Ditemukan ${activeBudgets.length} kategori yang sesuai dengan kriteria filter Anda.`
                                    : "Klik tambah anggaran untuk menetapkan batas pengeluaran bulanan agar keuangan tetap terkendali."}
                            </p>
                        </div>
                        {(search || statusFilter !== 'all') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-xl self-center"
                                onClick={() => {
                                    setSearch('');
                                    setStatusFilter('all');
                                }}
                            >
                                Reset
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex-1">
                    {activeBudgets.length === 0 ? (
                        <div className="text-center py-20 px-6">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                                {search || statusFilter !== 'all' ? <Filter size={32} className="opacity-20" /> : <Target size={32} />}
                            </div>
                            <p className="text-sm font-bold text-foreground">
                                {search || statusFilter !== 'all' ? "Tidak ada anggaran ditemukan" : "Belum ada anggaran bulan ini"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 text-balance max-w-[250px] mx-auto">
                                {search || statusFilter !== 'all'
                                    ? "Coba sesuaikan pencarian atau filter status Anda."
                                    : "Klik tombol di atas untuk mulai memantau pengeluaran bulanan Anda."}
                            </p>
                        </div>
                    ) : (
                        <div className="px-6 sm:px-10 pb-10">
                            <div className="hidden md:block overflow-hidden rounded-3xl border border-border/40 shadow-scandi bg-white">
                                <Table>
                                    <TableHeader className="bg-muted/10">
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableHead className="font-black h-14 px-8 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">Kategori</TableHead>
                                            <TableHead className="text-right font-black h-14 px-8 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">Status & Progress</TableHead>
                                            <TableHead className="text-right font-black h-14 px-8 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">Limit Anggaran</TableHead>
                                            <TableHead className="w-24 text-center font-black h-14 pr-8 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">Opsi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activeBudgets.map((b) => {
                                            const katName = getKategoriName(b.id_kategori);
                                            const status = budgetStatusMap.get(b.id_kategori);

                                            return (
                                                <TableRow key={b.id_anggaran} className="group hover:bg-muted/5 transition-all border-b border-border/10 cursor-pointer" onClick={() => onEdit?.(b)}>
                                                    <TableCell className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-indigo-50/50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/20 group-hover:scale-110 transition-transform duration-500">
                                                                <Target size={20} strokeWidth={2.5} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[11px] font-black text-foreground uppercase tracking-widest">
                                                                    {katName}
                                                                </p>
                                                                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter mt-1">
                                                                    Bulan {getNamaBulan(activeMonth)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-8 py-6">
                                                        <div className="flex flex-col gap-2 min-w-[150px]">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-1.5">
                                                                    {status?.status === 'aman' && <CheckCircle size={12} className="text-emerald-500" />}
                                                                    {status?.status === 'peringatan' && <AlertTriangle size={12} className="text-amber-500" />}
                                                                    {status?.status === 'bahaya' && <XCircle size={12} className="text-red-500" />}
                                                                    <span className={cn(
                                                                        "text-[10px] font-black uppercase tracking-widest",
                                                                        status?.status === 'aman' ? 'text-emerald-600' :
                                                                            status?.status === 'peringatan' ? 'text-amber-600' : 'text-red-600'
                                                                    )}>
                                                                        {status?.status === 'peringatan' ? 'Waspada' : status?.status || 'Active'}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[10px] font-black tracking-widest text-foreground">{status?.persentase || 0}%</span>
                                                            </div>
                                                            <Progress 
                                                                value={Math.min(status?.persentase || 0, 100)} 
                                                                className={cn(
                                                                    "h-1.5 rounded-full bg-muted/30",
                                                                    status?.status === 'aman' ? '*:data-[slot=progress-indicator]:bg-emerald-500' :
                                                                        status?.status === 'peringatan' ? '*:data-[slot=progress-indicator]:bg-amber-500' : '*:data-[slot=progress-indicator]:bg-red-500'
                                                                )}
                                                            />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-8 py-6 text-right">
                                                        <div className="flex flex-col items-end gap-1">
                                                            <span className="display-number text-sm font-black text-foreground tracking-widest">
                                                                {formatRupiah(status?.terpakai || 0)}
                                                            </span>
                                                            <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                                                                TOTAL DARI {formatRupiah(b.nominal_limit)}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="pr-8 py-6">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon-xs"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onEdit?.(b);
                                                                }}
                                                                className="h-8 w-8 text-indigo-600 hover:bg-indigo-50 rounded-xl"
                                                            >
                                                                <Pencil size={14} strokeWidth={2.5} />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon-xs"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDelete(b.id_anggaran, katName);
                                                                }}
                                                                className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-xl"
                                                            >
                                                                <Trash2 size={14} strokeWidth={2.5} />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile Grid Layout */}
                            <div className="grid grid-cols-1 gap-4 md:hidden">
                                {activeBudgets.map((b) => {
                                    const katName = getKategoriName(b.id_kategori);
                                    const status = budgetStatusMap.get(b.id_kategori);

                                    return (
                                        <Card key={b.id_anggaran} className="group overflow-hidden bg-white rounded-[1.75rem] border border-border/40 shadow-scandi hover:shadow-float transition-all duration-300 active:scale-[0.98]" onClick={() => onEdit?.(b)}>
                                            <CardContent className="p-5 flex flex-col gap-5">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3.5">
                                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50/50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/20 group-hover:scale-110 transition-transform duration-500">
                                                            <Target size={22} strokeWidth={2.5} />
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-[11px] font-black text-foreground uppercase tracking-widest truncate">
                                                                {katName}
                                                            </span>
                                                            <div className="flex items-center gap-1.5 mt-1">
                                                                {status?.status === 'aman' && <CheckCircle size={10} className="text-emerald-500" />}
                                                                {status?.status === 'peringatan' && <AlertTriangle size={10} className="text-amber-500" />}
                                                                {status?.status === 'bahaya' && <XCircle size={10} className="text-red-500" />}
                                                                <span className={cn(
                                                                    "text-[9px] font-black uppercase tracking-widest",
                                                                    status?.status === 'aman' ? 'text-emerald-600' :
                                                                        status?.status === 'peringatan' ? 'text-amber-600' : 'text-red-600'
                                                                )}>
                                                                    {status?.status === 'peringatan' ? 'WASPADA' : status?.status?.toUpperCase() || 'ACTIVE'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-60">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-xs"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onEdit?.(b);
                                                            }}
                                                            className="h-8 w-8 text-primary hover:bg-primary/5 rounded-xl"
                                                        >
                                                            <Pencil size={14} strokeWidth={2.5} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-xs"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(b.id_anggaran, katName);
                                                            }}
                                                            className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-xl"
                                                        >
                                                            <Trash2 size={14} strokeWidth={2.5} />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Progress Pemakaian</span>
                                                        <span className="text-[11px] font-black tracking-widest text-foreground">{status?.persentase || 0}%</span>
                                                    </div>
                                                    <Progress 
                                                        value={Math.min(status?.persentase || 0, 100)} 
                                                        className={cn(
                                                            "h-2 rounded-full bg-muted/30",
                                                            status?.status === 'aman' ? '*:data-[slot=progress-indicator]:bg-emerald-500' :
                                                                status?.status === 'peringatan' ? '*:data-[slot=progress-indicator]:bg-amber-500' : '*:data-[slot=progress-indicator]:bg-red-500'
                                                        )}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between pt-1 border-t border-border/10">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none mb-1.5">Terpakai</span>
                                                        <span className="display-number text-xs font-black text-foreground tracking-widest leading-none">
                                                            {formatRupiah(status?.terpakai || 0)}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none mb-1.5 text-right">Limit</span>
                                                        <span className="display-number text-xs font-black text-indigo-600 tracking-widest leading-none text-right">
                                                            {formatRupiah(b.nominal_limit)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>

            <ConfirmDialog
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}
                onConfirm={confirmDeleteAction}
                isLoading={isDeleting}
                title="Hapus Anggaran?"
                description={`Apakah Anda yakin ingin menghapus anggaran untuk kategori "${confirmDelete.name}"?`}
            />
        </Card>
    );
}
