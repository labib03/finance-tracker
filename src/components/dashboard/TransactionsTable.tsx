'use client';

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/store';
import { formatRupiah, formatTanggal, formatTanggalPendek, isInCustomMonth } from '@/lib/utils';
import {
    ArrowUpRight,
    ArrowDownRight,
    ArrowLeftRight,
    Trash2,
    Pencil,
} from 'lucide-react';
import type { Transaksi } from '@/lib/types';
import { CategoryIcon } from '@/components/CategoryIcon';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Filter, X } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TransactionsTableProps {
    limit?: number;
    showDelete?: boolean;
    showEdit?: boolean;
    onEdit?: (transaksi: Transaksi) => void;
    title?: string;
    description?: string;
}

export default function TransactionsTable({
    limit,
    showDelete = false,
    showEdit = false,
    onEdit,
    title = "Riwayat Transaksi",
    description,
}: TransactionsTableProps) {
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
    const activeMonth = useFinanceStore((s) => s.activeMonth);
    const cycleStartDay = useFinanceStore((s) => s.cycleStartDay);
    const removeTransaksi = useFinanceStore((s) => s.removeTransaksi);

    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, id: string }>({
        isOpen: false,
        id: ''
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    const handleDeleteClick = (id: string) => {
        setConfirmDelete({ isOpen: true, id });
    };

    const confirmDeleteAction = async () => {
        setIsDeleting(true);
        await removeTransaksi(confirmDelete.id);
        setIsDeleting(false);
        setConfirmDelete({ ...confirmDelete, isOpen: false });
    };

    const filteredTransaksi = useMemo(() => {
        let list = transaksiList
            .filter((t) => isInCustomMonth(t.tanggal, activeMonth, cycleStartDay))
            .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
        
        // Search filter (catatan)
        if (search) {
            const lowSearch = search.toLowerCase();
            list = list.filter(t => 
                (t.catatan?.toLowerCase().includes(lowSearch)) || 
                (kategoriList.find(k => k.id_kategori === t.id_kategori)?.nama_kategori.toLowerCase().includes(lowSearch))
            );
        }

        // Type filter
        if (typeFilter !== 'all') {
            list = list.filter(t => t.jenis === typeFilter);
        }

        // Category filter
        if (categoryFilter !== 'all') {
            list = list.filter(t => t.id_kategori === categoryFilter);
        }

        if (limit) {
            list = list.slice(0, limit);
        }
        return list;
    }, [transaksiList, activeMonth, limit, search, typeFilter, categoryFilter, kategoriList]);

    const getKategori = (id: string) =>
        kategoriList.find((k) => k.id_kategori === id);

    const getSumberDanaName = (id: string) =>
        sumberDanaList.find((s) => s.id_sumber_dana === id)?.nama_sumber || '-';


    return (
        <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="px-6 py-5">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-bold tracking-tight">{title}</CardTitle>
                            {description && <CardDescription>{description}</CardDescription>}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            <Input
                                placeholder="Cari catatan atau kategori..."
                                className="pl-9 h-9 text-xs rounded-xl bg-muted/50 border-none"
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

                        <div className="flex items-center gap-2">
                            <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val || 'all')}>
                                <SelectTrigger className="h-9 min-w-[120px] text-xs rounded-xl bg-muted/50 border-none">
                                    <SelectValue placeholder="Semua Tipe" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-none shadow-xl">
                                    <SelectItem value="all">Semua Tipe</SelectItem>
                                    <SelectItem value="Pengeluaran">Pengeluaran</SelectItem>
                                    <SelectItem value="Pemasukan">Pemasukan</SelectItem>
                                    <SelectItem value="Transfer">Transfer</SelectItem>
                                </SelectContent>
                            </Select>

                            <SearchableSelect
                                options={[
                                    { value: 'all', label: 'Semua Kategori' },
                                    ...kategoriList.map(k => ({
                                        value: k.id_kategori,
                                        label: k.nama_kategori
                                    }))
                                ]}
                                value={categoryFilter}
                                onValueChange={(val) => setCategoryFilter(val || 'all')}
                                placeholder="Semua Kategori"
                                searchPlaceholder="Cari kategori..."
                                className="h-9 min-w-[160px] text-xs rounded-xl bg-muted/50 border-none shadow-none"
                            />
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[80px] px-6">Tipe</TableHead>
                            <TableHead className="px-4">Kategori</TableHead>
                            <TableHead className="px-4">Akun</TableHead>
                            <TableHead className="px-4 hidden md:table-cell">Catatan</TableHead>
                            <TableHead className="px-4 text-right">Nominal</TableHead>
                            <TableHead className="px-4 text-right">Tanggal</TableHead>
                            {(showDelete || showEdit) && <TableHead className="w-[80px] pr-6"></TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTransaksi.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-20 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <Filter size={40} className="mb-4 opacity-20" />
                                        <p className="text-sm font-medium">Tidak ada transaksi ditemukan</p>
                                        <p className="text-xs opacity-60">Coba sesuaikan filter atau pencarian Anda</p>
                                        {(search || typeFilter !== 'all' || categoryFilter !== 'all') && (
                                            <Button 
                                                variant="link" 
                                                size="sm" 
                                                className="mt-2 text-primary"
                                                onClick={() => {
                                                    setSearch('');
                                                    setTypeFilter('all');
                                                    setCategoryFilter('all');
                                                }}
                                            >
                                                Bersihkan semua filter
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTransaksi.map((t) => {
                                const isIncome = t.jenis === 'Pemasukan';
                                const isTransfer = t.jenis === 'Transfer';

                                return (
                                    <TableRow key={t.id} className="group hover:bg-muted/30 transition-colors">
                                        <TableCell className="px-6 py-4">
                                            <div className={cn(
                                                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border",
                                                isTransfer 
                                                    ? "bg-indigo-50 text-indigo-600 border-indigo-100" 
                                                    : isIncome 
                                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                                        : "bg-red-50 text-red-600 border-red-100"
                                            )}>
                                                {isTransfer ? (
                                                    <ArrowLeftRight size={18} />
                                                ) : (
                                                    <CategoryIcon name={getKategori(t.id_kategori)?.icon_name || 'Circle'} size={18} />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 font-bold text-foreground">
                                            {getKategori(t.id_kategori)?.nama_kategori || 'Transfer'}
                                        </TableCell>
                                        <TableCell className="px-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-semibold text-foreground/80">
                                                    {getSumberDanaName(t.id_sumber_dana)}
                                                </span>
                                                {isTransfer && t.id_sumber_dana_tujuan && (
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                        <ArrowLeftRight size={10} className="rotate-90 md:rotate-0" />
                                                        {getSumberDanaName(t.id_sumber_dana_tujuan)}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 hidden md:table-cell max-w-[200px] truncate">
                                            <span className="text-xs text-muted-foreground italic">
                                                {t.catatan || '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 text-right">
                                            <span className={cn(
                                                "display-number text-sm font-black",
                                                isTransfer 
                                                    ? "text-indigo-600" 
                                                    : isIncome 
                                                        ? "text-emerald-600" 
                                                        : "text-orange-600"
                                            )}>
                                                {isIncome ? '+' : isTransfer ? '' : '-'}
                                                {formatRupiah(t.nominal)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-bold text-foreground">
                                                    {formatTanggalPendek(t.tanggal)}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground hidden sm:inline">
                                                    {formatTanggal(t.tanggal).split(' ').slice(2).join(' ')}
                                                </span>
                                            </div>
                                        </TableCell>
                                        {(showDelete || showEdit) && (
                                            <TableCell className="pr-6 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {showEdit && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-xs"
                                                            onClick={() => onEdit?.(t)}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:bg-primary/10 rounded-lg"
                                                            title="Edit"
                                                        >
                                                            <Pencil size={14} />
                                                        </Button>
                                                    )}
                                                    {showDelete && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-xs"
                                                            onClick={() => handleDeleteClick(t.id)}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 rounded-lg"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </CardContent>

            <ConfirmDialog 
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}
                onConfirm={confirmDeleteAction}
                isLoading={isDeleting}
                title="Hapus Transaksi?"
                description="Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan."
            />
        </Card>
    );
}
