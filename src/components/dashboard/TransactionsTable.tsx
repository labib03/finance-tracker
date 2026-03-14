'use client';

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/store';
import { formatRupiah, formatTanggal, formatTanggalPendek, isInCustomMonth } from '@/lib/utils';
import {
    ArrowUpRight,
    ArrowDownRight,
    ArrowLeftRight,
    ArrowRight,
    Trash2,
    Pencil,
    Eye,
} from 'lucide-react';
import type { Transaksi } from '@/lib/types';
import { CategoryIcon } from '@/components/CategoryIcon';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TransactionDetailDialog } from './TransactionDetailDialog';
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
    const [selectedDetail, setSelectedDetail] = useState<Transaksi | null>(null);

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
        <Card className="bg-white rounded-[2.5rem] border border-border/40 shadow-scandi overflow-hidden transition-all duration-500 hover:shadow-float">
            <CardHeader className="px-8 py-8">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em]">{title}</CardTitle>
                            {description && <CardDescription className="text-[10px] font-medium uppercase tracking-widest mt-1 opacity-60">{description}</CardDescription>}
                        </div>
                    </div>
 
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[240px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={14} />
                            <Input
                                placeholder="Cari catatan atau kategori..."
                                className="pl-10 h-11 text-xs font-medium rounded-2xl bg-muted/20 border-transparent transition-all focus:bg-white focus:border-border/40 focus:ring-0"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && (
                                <button 
                                    onClick={() => setSearch('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
 
                        <div className="flex items-center gap-3">
                            <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val || 'all')}>
                                <SelectTrigger className="h-11 min-w-[130px] text-[10px] font-black uppercase tracking-widest rounded-2xl bg-muted/20 border-transparent shadow-none hover:bg-muted/30 transition-all">
                                    <SelectValue placeholder="Semua Tipe" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-border/40 shadow-float overflow-hidden">
                                    <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest">Semua Tipe</SelectItem>
                                    <SelectItem value="Pengeluaran" className="text-[10px] font-black uppercase tracking-widest text-orange-600">Pengeluaran</SelectItem>
                                    <SelectItem value="Pemasukan" className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Pemasukan</SelectItem>
                                    <SelectItem value="Transfer" className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Transfer</SelectItem>
                                </SelectContent>
                            </Select>
 
                            <SearchableSelect
                                options={[
                                    { value: 'all', label: 'SEMUA KATEGORI' },
                                    ...kategoriList.map(k => ({
                                        value: k.id_kategori,
                                        label: k.nama_kategori.toUpperCase()
                                    }))
                                ]}
                                value={categoryFilter}
                                onValueChange={(val) => setCategoryFilter(val || 'all')}
                                placeholder="PILIH KATEGORI"
                                className="h-11 min-w-[180px] text-[10px] font-black uppercase tracking-widest rounded-2xl bg-muted/20 border-transparent shadow-none hover:bg-muted/30 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-muted/10">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[80px] px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Item</TableHead>
                            <TableHead className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Kategori</TableHead>
                            <TableHead className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Akun</TableHead>
                            <TableHead className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 hidden md:table-cell">Catatan</TableHead>
                            <TableHead className="px-4 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Nominal</TableHead>
                            <TableHead className="px-4 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Tanggal</TableHead>
                            {(showDelete || showEdit) && <TableHead className="w-[80px] pr-8 py-4"></TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTransaksi.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-24 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 rounded-[2rem] bg-muted/20 flex items-center justify-center text-muted-foreground/20 mb-6">
                                            <Filter size={32} />
                                        </div>
                                        <p className="text-sm font-black uppercase tracking-widest text-foreground">Tidak ada transaksi</p>
                                        <p className="text-[10px] font-medium uppercase tracking-tighter text-muted-foreground mt-1">Coba sesuaikan filter pencarian Anda</p>
                                        {(search || typeFilter !== 'all' || categoryFilter !== 'all') && (
                                            <Button 
                                                variant="link" 
                                                size="sm" 
                                                className="mt-4 text-[10px] font-black uppercase tracking-widest text-primary hover:no-underline"
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
                                    <TableRow 
                                        key={t.id} 
                                        className="group hover:bg-muted/10 border-b border-border/20 transition-all cursor-pointer"
                                        onClick={() => setSelectedDetail(t)}
                                    >
                                        <TableCell className="px-8 py-5">
                                            <div className={cn(
                                                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs border transition-transform duration-500 group-hover:scale-110",
                                                isTransfer 
                                                    ? "bg-indigo-50 text-indigo-600 border-indigo-100" 
                                                    : isIncome 
                                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                                        : "bg-rose-50 text-rose-600 border-rose-100"
                                            )}>
                                                {isTransfer ? (
                                                    <ArrowLeftRight size={18} strokeWidth={2.5} />
                                                ) : (
                                                    <CategoryIcon name={getKategori(t.id_kategori)?.icon_name || 'Circle'} size={18} strokeWidth={2.5} />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-5">
                                            <span className="text-xs font-black text-foreground uppercase tracking-wider">
                                                {getKategori(t.id_kategori)?.nama_kategori || 'Transfer'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-foreground/70 uppercase tracking-tighter">
                                                    {getSumberDanaName(t.id_sumber_dana)}
                                                </span>
                                                {isTransfer && t.id_sumber_dana_tujuan && (
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <ArrowRight size={10} className="text-muted-foreground/40" />
                                                        <span className="text-[9px] font-semibold text-muted-foreground uppercase">
                                                            {getSumberDanaName(t.id_sumber_dana_tujuan)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-5 hidden md:table-cell max-w-[200px] truncate">
                                            <span className="text-xs font-medium text-muted-foreground italic opacity-60">
                                                {t.catatan || '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 py-5 text-right">
                                            <span className={cn(
                                                "display-number text-sm font-black tracking-tighter",
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
                                        <TableCell className="px-4 py-5 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-xs font-black text-foreground uppercase tracking-widest">
                                                    {formatTanggalPendek(t.tanggal)}
                                                </span>
                                                <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-tighter hidden sm:inline">
                                                    {formatTanggal(t.tanggal).split(' ').slice(2).join(' ')}
                                                </span>
                                            </div>
                                        </TableCell>
                                        {(showDelete || showEdit) && (
                                            <TableCell className="pr-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {showEdit && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-xs"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onEdit?.(t);
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 transition-all text-blue-600 hover:bg-blue-50 rounded-xl"
                                                        >
                                                            <Pencil size={14} strokeWidth={2.5} />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-xs"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedDetail(t);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 transition-all text-muted-foreground hover:bg-muted/50 rounded-xl"
                                                    >
                                                        <Eye size={14} strokeWidth={2.5} />
                                                    </Button>
                                                    {showDelete && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-xs"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteClick(t.id);
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 transition-all text-rose-500 hover:bg-rose-50 rounded-xl"
                                                        >
                                                            <Trash2 size={14} strokeWidth={2.5} />
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

            <TransactionDetailDialog 
                transaksi={selectedDetail}
                open={!!selectedDetail}
                onOpenChange={(open) => !open && setSelectedDetail(null)}
                onEdit={onEdit}
                onDelete={removeTransaksi}
            />
        </Card>
    );
}
