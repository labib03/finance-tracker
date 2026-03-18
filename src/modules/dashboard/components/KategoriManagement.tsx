'use client';

import { useState } from 'react';
import { useFinanceStore } from '@/lib/store';
import { Edit2, Trash2, Plus, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';
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
        <div className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="font-bold uppercase tracking-wider h-11">Nama Kategori</TableHead>
                        <TableHead className="w-24 text-center font-bold uppercase tracking-wider h-11">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {list.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={2} className="text-center py-10 text-muted-foreground italic">
                                Belum ada data kategori untuk tipe ini.
                            </TableCell>
                        </TableRow>
                    ) : (
                        list.map((k) => (
                            <TableRow key={k.id_kategori} className="group hover:bg-muted/30 transition-colors border-none">
                                <TableCell className="font-bold text-foreground py-4">
                                    <div className="flex items-center gap-2">
                                        <div className={list[0]?.tipe === 'Pemasukan' ? "text-emerald-500" : "text-red-500"}>
                                            {list[0]?.tipe === 'Pemasukan' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                        </div>
                                        {k.nama_kategori}
                                    </div>
                                </TableCell>
                                <TableCell className="py-2">
                                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon-xs"
                                            onClick={() => onEdit(k)}
                                            className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                            title="Edit Kategori"
                                        >
                                            <Edit2 size={14} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon-xs"
                                            onClick={() => handleDelete(k.id_kategori, k.nama_kategori)}
                                            disabled={isDeleting && confirmDelete.id === k.id_kategori}
                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            title="Hapus Kategori"
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );

    return (
        <Card className="border-none shadow-sm overflow-hidden flex flex-col h-full bg-background/50 backdrop-blur-sm">
            <CardHeader className="flex flex-col gap-4 pb-6">
                <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-xl font-bold tracking-tight">Kategori Transaksi</CardTitle>
                        <CardDescription>
                            Pisahkan dan kelola pos keuangan Anda
                        </CardDescription>
                    </div>
                    <Button onClick={onAdd} className="shrink-0 rounded-2xl shadow-lg shadow-primary/10">
                        <Plus size={18} className="mr-2" />
                        Tambah Kategori
                    </Button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                        placeholder="Cari kategori..."
                        className="pl-10 rounded-xl bg-muted/50 border-none h-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1">
                <Tabs defaultValue="pengeluaran" className="w-full">
                    <div className="px-6 border-b border-border/50">
                        <TabsList className="bg-transparent h-12 gap-6 p-0" variant="line">
                            <TabsTrigger value="pengeluaran" className="data-active:text-red-500 after:bg-red-500">
                                Pengeluaran
                                <Badge variant="destructive" className="ml-2 h-5 px-1.5 font-black text-xs">
                                    {pengeluaranKategori.length}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value="pemasukan" className="data-active:text-emerald-500 after:bg-emerald-500">
                                Pemasukan
                                <Badge variant="success" className="ml-2 h-5 px-1.5 font-black text-xs">
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
