'use client';

import { useMemo, useEffect, useState } from 'react';
import { useFinanceStore } from '@/lib/store';
import { formatRupiah, formatTanggal, formatTanggalPendek, isInCustomMonth } from '@/lib/utils';
import {
    ArrowLeftRight,
    ArrowRight,
    Trash2,
    Pencil,
    Eye,
    ChevronLeft,
    ChevronRight,
    CalendarIcon,
} from 'lucide-react';
import type { Transaksi } from '@/lib/types';
import { CategoryIcon } from '@/shared/ui/CategoryIcon';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { TransactionDetailDialog } from './TransactionDetailDialog';
import { Input } from '@/shared/ui/input';
import TransactionFilters from './TransactionFilters';
import { Search, Filter, X } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { SearchableSelect } from '@/shared/ui/SearchableSelect';
import { Button } from '@/shared/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/ui/popover';
import { Calendar } from '@/shared/ui/calendar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/ui/table';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { cn } from '@/lib/utils';

interface TransactionsTableProps {
    limit?: number;
    showDelete?: boolean;
    showEdit?: boolean;
    onEdit?: (transaksi: Transaksi) => void;
    title?: string;
    description?: string;
    filterType?: string;
    showSearch?: boolean;
    preselectedCategory?: string;
    hideHeader?: boolean;
}

export default function TransactionsTable({
    limit,
    showDelete = false,
    showEdit = false,
    onEdit,
    title = "Riwayat Transaksi",
    description,
    filterType,
    showSearch = true,
    preselectedCategory,
    hideHeader = false,
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
    const [categoryFilter, setCategoryFilter] = useState<string>(preselectedCategory || 'all');
    const [accountFilter, setAccountFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('all');
    const [selectedDetail, setSelectedDetail] = useState<Transaksi | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

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

        // Pre-filter by type if provided via prop
        if (filterType) {
            list = list.filter(t => t.jenis === filterType);
        }

        // Search filter (label & catatan)
        if (search) {
            const lowSearch = search.toLowerCase();
            list = list.filter(t => {
                const searchStr = t.label?.toLowerCase() || '';
                const catatanStr = t.catatan?.toLowerCase() || '';
                const kategoriStr = (kategoriList.find(k => k.id_kategori === t.id_kategori)?.nama_kategori || '').toLowerCase();
                
                let transferStr = '';
                if (t.jenis === 'Transfer') {
                    const sourceName = sumberDanaList.find(s => s.id_sumber_dana === t.id_sumber_dana)?.nama_sumber || '';
                    const targetName = t.id_target_dana ? (sumberDanaList.find(s => s.id_sumber_dana === t.id_target_dana)?.nama_sumber || '') : '';
                    transferStr = `${sourceName} ke ${targetName} transfer saldo`.toLowerCase();
                }

                return searchStr.includes(lowSearch) || 
                       catatanStr.includes(lowSearch) || 
                       kategoriStr.includes(lowSearch) ||
                       transferStr.includes(lowSearch);
            });
        }

        // Type filter
        if (typeFilter !== 'all') {
            list = list.filter(t => t.jenis === typeFilter);
        }

        // Category filter
        if (categoryFilter !== 'all') {
            list = list.filter(t => t.id_kategori === categoryFilter);
        }

        // Account filter
        if (accountFilter !== 'all') {
            list = list.filter(t => t.id_sumber_dana === accountFilter || (t.jenis === 'Transfer' && t.id_target_dana === accountFilter));
        }

        // Date filter
        if (dateFilter !== 'all') {
            list = list.filter(t => t.tanggal === dateFilter);
        }

        if (limit) {
            list = list.slice(0, limit);
        }
        return list;
    }, [transaksiList, activeMonth, limit, search, typeFilter, categoryFilter, accountFilter, dateFilter, kategoriList, cycleStartDay]);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, typeFilter, categoryFilter, accountFilter, dateFilter, activeMonth]);

    const totalPages = Math.ceil(filteredTransaksi.length / itemsPerPage);
    const paginatedTransaksi = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredTransaksi.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredTransaksi, currentPage, itemsPerPage]);

    const getKategori = (id: string) =>
        kategoriList.find((k) => k.id_kategori === id);

    const getSumberDanaName = (id: string) =>
        sumberDanaList.find((s) => s.id_sumber_dana === id)?.nama_sumber || '-';


    return (
        <Card className={cn(
            "bg-white rounded-[2.5rem] border border-border/40 overflow-hidden",
            !hideHeader && "shadow-scandi hover:shadow-float"
        )}>
            {!hideHeader && (
                <CardHeader className={cn("px-8 pt-8", showSearch ? "pb-6 border-b border-border/10" : "pb-8")}>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-black uppercase tracking-widest">{title}</CardTitle>
                            {description && <CardDescription className="text-xs font-medium uppercase tracking-widest mt-1 opacity-60">{description}</CardDescription>}
                        </div>
                    </div>
                </CardHeader>
            )}

            {showSearch && (
                <TransactionFilters 
                    filterMode={filterType === 'Transfer' ? 'transfer' : 'all'}
                    search={search}
                    setSearch={setSearch}
                    typeFilter={typeFilter}
                    setTypeFilter={setTypeFilter}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    accountFilter={accountFilter}
                    setAccountFilter={setAccountFilter}
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                    kategoriList={kategoriList}
                    sumberDanaList={sumberDanaList}
                />
            )}
            <CardContent className="p-0">
                <Table className="hidden md:table">
                    <TableHeader className="bg-muted/10">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[80px] px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Info</TableHead>
                            <TableHead className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Kategori</TableHead>
                            <TableHead className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Akun / Metode</TableHead>
                            <TableHead className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 hidden md:table-cell">Keterangan</TableHead>
                            <TableHead className="px-4 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Nominal</TableHead>
                            <TableHead className="px-4 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Tanggal</TableHead>
                            {(showDelete || showEdit) && <TableHead className="w-[80px] pr-8 py-4"></TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTransaksi.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-24 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 rounded-[2rem] bg-muted/20 flex items-center justify-center text-muted-foreground/80 mb-6">
                                            <Filter size={32} />
                                        </div>
                                        <p className="text-sm font-black uppercase tracking-widest text-foreground">Tidak ada transaksi</p>
                                        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mt-1">Coba sesuaikan filter pencarian Anda</p>
                                        {(search || typeFilter !== 'all' || categoryFilter !== 'all') && (
                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="mt-4 text-xs font-black uppercase tracking-widest text-primary hover:no-underline"
                                                onClick={() => {
                                                    setSearch('');
                                                    setTypeFilter('all');
                                                    setCategoryFilter('all');
                                                    setAccountFilter('all');
                                                    setDateFilter('all');
                                                }}
                                            >
                                                Bersihkan semua filter
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedTransaksi.map((t) => {
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
                                            <span className="text-[10px] font-black text-foreground/80 uppercase tracking-[0.15em]">
                                                {getKategori(t.id_kategori)?.nama_kategori || 'Transfer'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 py-5">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[11px] font-black text-foreground uppercase tracking-widest">
                                                    {getSumberDanaName(t.id_sumber_dana)}
                                                </span>
                                                {isTransfer && t.id_target_dana && (
                                                    <div className="flex items-center gap-1.5 opacity-60">
                                                        <ArrowRight size={10} className="text-indigo-500" />
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                                                            {getSumberDanaName(t.id_target_dana)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-5 hidden md:table-cell max-w-[200px]">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[11px] font-black text-foreground uppercase tracking-wider truncate">
                                                    {t.label || (isTransfer ? 'Transfer Saldo' : '-')}
                                                </span>
                                                {t.catatan && (
                                                    <span className="text-[10px] font-bold text-muted-foreground/50 italic truncate lowercase">
                                                        {t.catatan}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-5 text-right">
                                            <span className={cn(
                                                "display-number text-[13px] font-black tracking-widest",
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
                                                <span className="text-xs font-bold text-muted-foreground/80 uppercase tracking-widest hidden sm:inline">
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

                {/* Mobile ListView - Card Based */}
                <div className="md:hidden flex flex-col gap-4 p-4 bg-muted/5">
                    {filteredTransaksi.length === 0 ? (
                        <div className="py-24 text-center px-4">
                            <div className="flex flex-col items-center justify-center">
                                <div className="w-16 h-16 rounded-[2rem] bg-muted/20 flex items-center justify-center text-muted-foreground/80 mb-6">
                                    <Filter size={32} />
                                </div>
                                <p className="text-sm font-black uppercase tracking-widest text-foreground">Tidak ada transaksi</p>
                                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mt-1 text-center">Coba sesuaikan filter</p>
                            </div>
                        </div>
                    ) : (
                        paginatedTransaksi.map((t) => {
                            const isIncome = t.jenis === 'Pemasukan';
                            const isTransfer = t.jenis === 'Transfer';
                            
                            return (
                                <Card
                                    key={t.id}
                                    className="group overflow-hidden bg-white rounded-2xl border border-border/40 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                                    onClick={() => setSelectedDetail(t)}
                                >
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className={cn(
                                                "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs border transition-transform duration-500",
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
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[11px] font-black text-foreground uppercase tracking-widest truncate">
                                                    {getKategori(t.id_kategori)?.nama_kategori || 'Transfer'}
                                                </span>
                                                <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                                                    <span className="text-[10px] font-bold text-muted-foreground/60 truncate uppercase tracking-tighter">
                                                        {getSumberDanaName(t.id_sumber_dana)}
                                                        {isTransfer && t.id_target_dana && ` → ${getSumberDanaName(t.id_target_dana)}`}
                                                    </span>
                                                </div>
                                                {t.label && (
                                                    <span className="text-[10px] font-bold text-foreground/80 truncate mt-0.5 italic lowercase">
                                                        {t.label}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end shrink-0 pl-3">
                                            <span className={cn(
                                                "display-number text-sm font-black tracking-widest leading-none",
                                                isTransfer
                                                    ? "text-indigo-600"
                                                    : isIncome
                                                        ? "text-emerald-600"
                                                        : "text-orange-600"
                                            )}>
                                                {isIncome ? '+' : isTransfer ? '' : '-'}{formatRupiah(t.nominal)}
                                            </span>
                                            <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] mt-2">
                                                {formatTanggalPendek(t.tanggal)}
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })
                    )}
                </div>

                {filteredTransaksi.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-8 py-5 border-t border-border/20 bg-muted/5 gap-4">
                        <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
                            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Baris:</span>
                            <Select
                                value={itemsPerPage.toString()}
                                onValueChange={(val) => {
                                    setItemsPerPage(Number(val));
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="h-8 w-[70px] text-xs font-black tracking-widest rounded-xl bg-white border-border/40 text-foreground">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border/40 shadow-float min-w-[70px]">
                                    <SelectItem value="5" className="text-xs font-black tracking-widest text-foreground">5</SelectItem>
                                    <SelectItem value="10" className="text-xs font-black tracking-widest text-foreground">10</SelectItem>
                                    <SelectItem value="25" className="text-xs font-black tracking-widest text-foreground">25</SelectItem>
                                    <SelectItem value="50" className="text-xs font-black tracking-widest text-foreground">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                            <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground">
                                Hal <span className="text-foreground">{currentPage}</span> / <span className="text-foreground">{totalPages}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon-sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="rounded-xl border-border/40 w-8 h-8 p-0 disabled:opacity-30 flex items-center justify-center text-foreground hover:bg-muted/50"
                                >
                                    <ChevronLeft size={16} strokeWidth={2.5} />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon-sm"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="rounded-xl border-border/40 w-8 h-8 p-0 disabled:opacity-30 flex items-center justify-center text-foreground hover:bg-muted/50"
                                >
                                    <ChevronRight size={16} strokeWidth={2.5} />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
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
