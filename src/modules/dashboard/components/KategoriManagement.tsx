'use client';

import { useState } from 'react';
import { useFinanceStore } from '@/lib/store';
import { Edit2, Trash2, Plus, ArrowUpRight, ArrowDownRight, Search, X } from 'lucide-react';
import type { Kategori } from '@/lib/types';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Input } from '@/shared/ui/input';
import { cn } from '@/lib/utils';

interface KategoriManagementProps {
    onAdd: () => void;
    onEdit: (kategori: Kategori) => void;
}

export default function KategoriManagement({ onAdd, onEdit }: KategoriManagementProps) {
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const recurringList = useFinanceStore((s) => s.recurringList);
    const removeKategori = useFinanceStore((s) => s.removeKategori);

    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, id: string, name: string }>({
        isOpen: false,
        id: '',
        name: ''
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteRestricted, setDeleteRestricted] = useState(false);
    const [search, setSearch] = useState('');

    const handleDelete = (id: string, nama: string) => {
        // Check if category is used in transactions or recurring
        const isUsedInTransaksi = transaksiList.some(t => t.id_kategori === id);
        const isUsedInRecurring = recurringList.some(r => r.id_kategori === id);
        
        if (isUsedInTransaksi || isUsedInRecurring) {
            setDeleteRestricted(true);
        } else {
            setDeleteRestricted(false);
        }
        
        setConfirmDelete({ isOpen: true, id, name: nama });
    };

    const confirmDeleteAction = async () => {
        setIsDeleting(true);
        await removeKategori(confirmDelete.id);
        setIsDeleting(false);
        setConfirmDelete({ ...confirmDelete, isOpen: false });
    };

    const filteredKategori = kategoriList.filter(k =>
        k.nama_kategori.toLowerCase().includes(search.toLowerCase())
    );

    const pengeluaranKategori = filteredKategori.filter(k => k.tipe === 'Pengeluaran');
    const pemasukanKategori = filteredKategori.filter(k => k.tipe === 'Pemasukan');

    const KategoriTable = ({ list }: { list: Kategori[] }) => (
        <div className="px-6 sm:px-10 py-6">
            <div className="hidden md:block overflow-hidden rounded-3xl border border-border/40 shadow-scandi bg-white">
                <Table>
                    <TableHeader className="bg-muted/10">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="font-black h-12 px-8 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">Nama Kategori</TableHead>
                            <TableHead className="w-24 text-center font-black h-12 pr-8 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {list.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center py-20 text-muted-foreground/60 italic text-xs uppercase tracking-widest font-bold">
                                    Belum ada data kategori untuk tipe ini.
                                </TableCell>
                            </TableRow>
                        ) : (
                            list.map((k) => (
                                <TableRow key={k.id_kategori} className="group hover:bg-muted/5 transition-all border-b border-border/10 cursor-pointer" onClick={() => onEdit(k)}>
                                    <TableCell className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs border transition-transform duration-500 group-hover:scale-110",
                                                k.tipe === 'Pemasukan' ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" : "bg-rose-50 text-rose-600 border-rose-100/50"
                                            )}>
                                                {k.tipe === 'Pemasukan' ? <ArrowUpRight size={16} strokeWidth={2.5} /> : <ArrowDownRight size={16} strokeWidth={2.5} />}
                                            </div>
                                            <span className="text-[11px] font-black text-foreground uppercase tracking-widest leading-none">
                                                {k.nama_kategori}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="pr-8 py-5">
                                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon-xs"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit(k);
                                                }}
                                                className="h-8 w-8 text-indigo-600 hover:bg-indigo-50 rounded-xl"
                                            >
                                                <Edit2 size={14} strokeWidth={2.5} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-xs"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(k.id_kategori, k.nama_kategori);
                                                }}
                                                disabled={isDeleting && confirmDelete.id === k.id_kategori}
                                                className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-xl"
                                            >
                                                <Trash2 size={14} strokeWidth={2.5} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Cards Layout */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {list.length === 0 ? (
                    <div className="py-20 text-center bg-muted/10 rounded-3xl border border-dashed border-border/50">
                        <p className="text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Belum ada data</p>
                    </div>
                ) : (
                    list.map((k) => (
                        <Card key={k.id_kategori} className="group overflow-hidden bg-white rounded-[1.5rem] border border-border/40 shadow-scandi hover:shadow-float active:scale-[0.98] transition-all duration-300" onClick={() => onEdit(k)}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className={cn(
                                        "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs border border-border/10 transition-transform duration-500 group-hover:scale-110",
                                        k.tipe === 'Pemasukan' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                    )}>
                                        {k.tipe === 'Pemasukan' ? <ArrowUpRight size={16} strokeWidth={2.5} /> : <ArrowDownRight size={16} strokeWidth={2.5} />}
                                    </div>
                                    <span className="text-[11px] font-black text-foreground uppercase tracking-widest truncate">
                                        {k.nama_kategori}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit(k);
                                        }}
                                        className="h-9 w-9 text-indigo-600 hover:bg-indigo-50 rounded-xl"
                                    >
                                        <Edit2 size={14} strokeWidth={2.5} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(k.id_kategori, k.nama_kategori);
                                        }}
                                        className="h-9 w-9 text-rose-500 hover:bg-rose-50 rounded-xl"
                                    >
                                        <Trash2 size={14} strokeWidth={2.5} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )
                ))}
            </div>
        </div>
    );

    return (
        <Card className="border-none shadow-sm overflow-hidden flex flex-col h-full bg-background/50 backdrop-blur-sm">
            <CardHeader className="flex flex-col gap-6 pb-6 pt-6 sm:pt-8 px-6 sm:px-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="text-left">
                        <CardTitle className="text-xl sm:text-2xl font-black uppercase tracking-widest text-foreground">Kategori Transaksi</CardTitle>
                        <CardDescription className="text-xs font-medium text-muted-foreground/80 uppercase tracking-widest mt-1">
                            Pisahkan dan kelola pos keuangan Anda
                        </CardDescription>
                    </div>
                    <Button 
                        onClick={onAdd} 
                        className="shrink-0 rounded-2xl h-11 px-6 shadow-lg shadow-indigo-600/20 bg-foreground text-background hover:bg-foreground/90 text-xs font-black uppercase tracking-widest w-full sm:w-auto transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                        <Plus size={18} className="mr-2" />
                        Tambah Kategori
                    </Button>
                </div>

                <div className="relative group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-primary" size={16} />
                    <Input
                        placeholder="Cari kategori..."
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
            </CardHeader>
            <CardContent className="p-0 flex-1">
                <Tabs defaultValue="pengeluaran" className="w-full">
                    <div className="px-6 sm:px-10 border-b border-border/10">
                        <TabsList className="bg-transparent h-14 gap-8 p-0" variant="line">
                            <TabsTrigger value="pengeluaran" className="text-[10px] sm:text-xs font-black uppercase tracking-widest data-active:text-red-500 after:bg-red-500">
                                Pengeluaran
                                <Badge variant="destructive" className="ml-3 h-5 px-1.5 font-black text-[10px] border-none scale-90">
                                    {pengeluaranKategori.length}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value="pemasukan" className="text-[10px] sm:text-xs font-black uppercase tracking-widest data-active:text-emerald-500 after:bg-emerald-500">
                                Pemasukan
                                <Badge variant="success" className="ml-3 h-5 px-1.5 font-black text-[10px] border-none scale-90">
                                    {pemasukanKategori.length}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="pengeluaran" className="mt-0">
                        <KategoriTable list={pengeluaranKategori} />
                    </TabsContent>

                    <TabsContent value="pemasukan" className="mt-0">
                        <KategoriTable list={pemasukanKategori} />
                    </TabsContent>
                </Tabs>
            </CardContent>

            <ConfirmDialog 
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}
                onConfirm={deleteRestricted ? () => setConfirmDelete({ ...confirmDelete, isOpen: false }) : confirmDeleteAction}
                isLoading={isDeleting}
                title={deleteRestricted ? "Tidak Bisa Menghapus" : "Hapus Kategori?"}
                confirmText={deleteRestricted ? "Mengerti" : "Hapus"}
                variant={deleteRestricted ? "info" : "destructive"}
                description={
                    deleteRestricted 
                        ? `Kategori "${confirmDelete.name}" tidak bisa dihapus karena masih digunakan dalam riwayat transaksi atau jadwal rutin Anda.` 
                        : `Apakah Anda yakin ingin menghapus kategori "${confirmDelete.name}"?`
                }
            />
        </Card>
    );
}
