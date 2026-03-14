'use client';

import { useState } from 'react';
import { useFinanceStore } from '@/lib/store';
import { Edit2, Trash2, Plus, Wallet, ShieldCheck, CreditCard } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import type { SumberDana } from '@/lib/types';
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

interface SumberDanaManagementProps {
    onAdd: () => void;
    onEdit: (sumberDana: SumberDana) => void;
}

export default function SumberDanaManagement({ onAdd, onEdit }: SumberDanaManagementProps) {
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const recurringList = useFinanceStore((s) => s.recurringList);
    const removeSumberDana = useFinanceStore((s) => s.removeSumberDana);

    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, id: string, name: string }>({
        isOpen: false,
        id: '',
        name: ''
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const [deleteRestricted, setDeleteRestricted] = useState(false);

    const handleDelete = (id: string, nama: string) => {
        // Check if source is used in transactions (from or to) or recurring
        const isUsedInTransaksi = transaksiList.some(t => 
            t.id_sumber_dana === id || t.id_sumber_dana_tujuan === id
        );
        const isUsedInRecurring = recurringList.some(r => r.id_sumber_dana === id);
        
        if (isUsedInTransaksi || isUsedInRecurring) {
            setDeleteRestricted(true);
        } else {
            setDeleteRestricted(false);
        }
        
        setConfirmDelete({ isOpen: true, id, name: nama });
    };

    const confirmDeleteAction = async () => {
        setIsDeleting(true);
        await removeSumberDana(confirmDelete.id);
        setIsDeleting(false);
        setConfirmDelete({ ...confirmDelete, isOpen: false });
    };

    return (
        <Card className="border-none shadow-sm overflow-hidden flex flex-col h-full bg-background/50 backdrop-blur-sm">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8">
                <div>
                    <CardTitle className="text-xl font-bold tracking-tight">Sumber Dana</CardTitle>
                    <CardDescription>
                        Kelola akun dan dompet digital Anda
                    </CardDescription>
                </div>
                <Button onClick={onAdd} className="shrink-0 rounded-2xl shadow-lg shadow-primary/10 bg-indigo-600 hover:bg-indigo-700">
                    <Plus size={18} className="mr-2" />
                    Tambah Akun
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <div className="px-6 mb-6">
                    <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-indigo-900 uppercase tracking-widest leading-none mb-1">Status Keamanan</p>
                            <p className="text-[11px] text-indigo-700/80 font-medium">Semua data akun tersimpan secara lokal di browser Anda.</p>
                        </div>
                    </div>
                </div>

                {sumberDanaList.length === 0 ? (
                    <div className="text-center py-20 px-6">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                            <Wallet size={32} />
                        </div>
                        <p className="text-sm font-bold text-foreground">Belum ada akun terdaftar</p>
                        <p className="text-xs text-muted-foreground mt-1">Klik tombol di atas untuk menambah sumber dana baru.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="font-bold uppercase tracking-wider h-11 px-6">Nama Akun/Sumber</TableHead>
                                    <TableHead className="text-right font-bold uppercase tracking-wider h-11 px-6">Saldo Awal</TableHead>
                                    <TableHead className="w-24 text-center font-bold uppercase tracking-wider h-11 pr-6">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sumberDanaList.map((s) => (
                                    <TableRow key={s.id_sumber_dana} className="group hover:bg-muted/30 transition-colors border-none">
                                        <TableCell className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm border border-indigo-100/30">
                                                    <CreditCard size={18} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-foreground leading-tight">
                                                        {s.nama_sumber}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground uppercase font-black tracking-widest mt-0.5">
                                                        Personal Account
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 text-right">
                                            <span className="display-number text-sm font-black text-indigo-700/80">
                                                {formatRupiah(s.saldo_awal)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="pr-6">
                                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon-xs"
                                                    onClick={() => onEdit(s)}
                                                    className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                                    title="Edit Sumber Dana"
                                                >
                                                    <Edit2 size={14} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-xs"
                                                    onClick={() => handleDelete(s.id_sumber_dana, s.nama_sumber)}
                                                    disabled={isDeleting && confirmDelete.id === s.id_sumber_dana}
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    title="Hapus Sumber Dana"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>

            <ConfirmDialog 
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}
                onConfirm={deleteRestricted ? () => setConfirmDelete({ ...confirmDelete, isOpen: false }) : confirmDeleteAction}
                isLoading={isDeleting}
                title={deleteRestricted ? "Tidak Bisa Menghapus" : "Hapus Sumber Dana?"}
                confirmText={deleteRestricted ? "Mengerti" : "Hapus"}
                variant={deleteRestricted ? "info" : "destructive"}
                description={
                    deleteRestricted 
                        ? `Sumber dana "${confirmDelete.name}" tidak bisa dihapus karena masih digunakan dalam riwayat transaksi atau jadwal rutin Anda.` 
                        : `Apakah Anda yakin ingin menghapus sumber dana "${confirmDelete.name}"?`
                }
            />
        </Card>
    );
}
