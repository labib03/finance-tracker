'use client';

import { useMemo, useState } from 'react';
import { useFinanceStore } from '@/lib/store';
import { Trash2, Plus, Target, Info, Pencil, CheckCircle, AlertTriangle, XCircle, Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatRupiah, getNamaBulan, hitungBudgetStatus, cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import type { Budget } from '@/lib/types';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

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
            <CardHeader className="flex flex-col gap-6 pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-xl font-bold tracking-tight">Anggaran {getNamaBulan(activeMonth)}</CardTitle>
                        <CardDescription>
                            Tetapkan batas pengeluaran per kategori
                        </CardDescription>
                    </div>
                    <Button onClick={onAdd} className="shrink-0 rounded-2xl shadow-lg shadow-primary/10 bg-indigo-600 hover:bg-indigo-700">
                        <Plus size={18} className="mr-2" />
                        Tambah Anggaran
                    </Button>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                            placeholder="Cari kategori anggaran..."
                            className="pl-9 rounded-xl bg-muted/50 border-none h-10 text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/30 rounded-2xl w-fit">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={cn(
                                "px-4 py-1.5 text-xs font-bold rounded-xl transition-all",
                                statusFilter === 'all' ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Semua
                        </button>
                        <button
                            onClick={() => setStatusFilter('aman')}
                            className={cn(
                                "px-4 py-1.5 text-xs font-bold rounded-xl transition-all",
                                statusFilter === 'aman' ? "bg-white shadow-sm text-emerald-600" : "text-muted-foreground hover:text-emerald-600"
                            )}
                        >
                            Aman
                        </button>
                        <button
                            onClick={() => setStatusFilter('peringatan')}
                            className={cn(
                                "px-4 py-1.5 text-xs font-bold rounded-xl transition-all",
                                statusFilter === 'peringatan' ? "bg-white shadow-sm text-amber-600" : "text-muted-foreground hover:text-amber-600"
                            )}
                        >
                            Waspada
                        </button>
                        <button
                            onClick={() => setStatusFilter('bahaya')}
                            className={cn(
                                "px-4 py-1.5 text-xs font-bold rounded-xl transition-all",
                                statusFilter === 'bahaya' ? "bg-white shadow-sm text-red-600" : "text-muted-foreground hover:text-red-600"
                            )}
                        >
                            Bahaya
                        </button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="px-6 mb-6">
                    <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <Search size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold uppercase tracking-widest leading-none mb-1 text-primary">Status Pencarian</p>
                            <p className="text-[11px] text-indigo-700/80 font-medium">
                                {search || statusFilter !== 'all'
                                    ? `Menampilkan anggaran yang sesuai dengan filter Anda.`
                                    : "Batas anggaran membantu Anda mengontrol pengeluaran agar tidak over-budget."}
                            </p>
                        </div>
                        {(search || statusFilter !== 'all') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs font-bold text-indigo-600 hover:bg-indigo-100 rounded-lg"
                                onClick={() => {
                                    setSearch('');
                                    setStatusFilter('all');
                                }}
                            >
                                Reset Filter
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
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="font-bold uppercase tracking-wider h-11 px-6">Kategori</TableHead>
                                        <TableHead className="text-right font-bold uppercase tracking-wider h-11 px-6">Limit Anggaran</TableHead>
                                        <TableHead className="w-24 text-center font-bold uppercase tracking-wider h-11 pr-6">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activeBudgets.map((b) => {
                                        const katName = getKategoriName(b.id_kategori);
                                        const status = budgetStatusMap.get(b.id_kategori);

                                        return (
                                            <TableRow key={b.id_anggaran} className="group hover:bg-muted/30 transition-colors border-none">
                                                <TableCell className="px-6 py-4">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm border border-indigo-100/30">
                                                            <Target size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-foreground leading-tight">
                                                                {katName}
                                                            </p>
                                                            <div className="flex items-center gap-1.5 mt-1">
                                                                {status?.status === 'aman' && <CheckCircle size={12} className="text-emerald-500" />}
                                                                {status?.status === 'peringatan' && <AlertTriangle size={12} className="text-amber-500" />}
                                                                {status?.status === 'bahaya' && <XCircle size={12} className="text-red-500" />}
                                                                <span className={cn(
                                                                    "text-xs font-bold uppercase tracking-wider",
                                                                    status?.status === 'aman' ? 'text-emerald-600' :
                                                                        status?.status === 'peringatan' ? 'text-amber-600' : 'text-red-600'
                                                                )}>
                                                                    {status?.status || 'Active'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {status && (
                                                        <div className="max-w-[200px]">
                                                            <Progress
                                                                value={Math.min(status.persentase, 100)}
                                                                className={cn(
                                                                    "h-1.5",
                                                                    status.status === 'aman' ? '*:data-[slot=progress-indicator]:bg-emerald-500' :
                                                                        status.status === 'peringatan' ? '*:data-[slot=progress-indicator]:bg-amber-500' : '*:data-[slot=progress-indicator]:bg-red-500'
                                                                )}
                                                            />
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-6 text-right">
                                                    <div className="flex flex-col items-end gap-1">
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Terpakai</span>
                                                            <span className="display-number text-sm font-bold text-foreground">
                                                                {formatRupiah(status?.terpakai || 0)}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col items-end pt-1 border-t border-border/50 w-24">
                                                            <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Limit</span>
                                                            <span className="display-number text-xs font-medium text-indigo-600/80">
                                                                {formatRupiah(b.nominal_limit)}
                                                            </span>
                                                        </div>
                                                        {status && (
                                                            <Badge variant="outline" className={cn(
                                                                "mt-1 px-1.5 py-0 h-4 text-xs font-black border-none",
                                                                status.status === 'aman' ? 'bg-emerald-50 text-emerald-700' :
                                                                    status.status === 'peringatan' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                                                            )}>
                                                                {status.persentase}%
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="pr-6">
                                                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-xs"
                                                            onClick={() => onEdit?.(b)}
                                                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                                            title="Edit Anggaran"
                                                        >
                                                            <Pencil size={14} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-xs"
                                                            onClick={() => handleDelete(b.id_anggaran, katName)}
                                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            title="Hapus Anggaran"
                                                        >
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
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
