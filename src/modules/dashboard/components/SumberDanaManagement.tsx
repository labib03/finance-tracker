'use client';

import { useState } from 'react';
import { useFinanceStore } from '@/lib/store';
import { Edit2, Trash2, Plus, Wallet, ShieldCheck, CreditCard } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import type { SumberDana } from '@/lib/types';
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
            t.id_sumber_dana === id || t.id_target_dana === id
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
                <div className="px-6 sm:px-8 mb-8">
                    <div className="bg-indigo-50/40 rounded-3xl p-5 border border-indigo-100/50 flex items-center gap-5 transition-all hover:bg-indigo-50/60 shadow-xs">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-scandi shrink-0">
                            <ShieldCheck size={24} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-[10px] sm:text-xs font-black text-indigo-900 uppercase tracking-widest leading-none">Status Keamanan</p>
                            <p className="text-[11px] text-indigo-700/70 font-bold uppercase tracking-tight italic">Eksklusif: Data tersimpan lokal di peranti Anda.</p>
                        </div>
                    </div>
                </div>

                {sumberDanaList.length === 0 ? (
                    <div className="text-center py-24 sm:py-32 px-8">
                        <div className="w-20 h-20 bg-muted/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <Wallet size={40} className="text-muted-foreground/40" />
                        </div>
                        <p className="text-sm font-black uppercase tracking-widest text-foreground">Dompet Anda Kosong</p>
                        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60 mt-2 italic">Mulai perjalanan finansial Anda dengan menambah satu akun.</p>
                        <Button onClick={onAdd} variant="link" className="mt-6 text-xs font-black uppercase tracking-widest text-indigo-600 hover:no-underline">
                            Daftarkan Akun Pertama Sekarang
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block">
                            <Table>
                                <TableHeader className="bg-muted/5">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Info Sumber Dana</TableHead>
                                        <TableHead className="px-8 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Saldo Awal</TableHead>
                                        <TableHead className="w-24 text-center px-8 py-4"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sumberDanaList.map((s) => (
                                        <TableRow key={s.id_sumber_dana} className="group hover:bg-muted/10 border-b border-border/10 transition-all duration-300">
                                            <TableCell className="px-8 py-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-2xl bg-white border border-border/40 text-indigo-600 flex items-center justify-center shrink-0 shadow-scandi transition-all duration-500 group-hover:scale-110 group-hover:bg-indigo-50 group-hover:border-indigo-100">
                                                        <CreditCard size={20} strokeWidth={2.5} />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm font-black text-foreground uppercase tracking-widest transition-colors group-hover:text-indigo-600 leading-none">
                                                            {s.nama_sumber}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest">
                                                            Instrumen Keuangan
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-8 py-6 text-right">
                                                <span className="display-number text-base font-black text-foreground tracking-widest">
                                                    {formatRupiah(s.saldo_awal)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-8 py-6">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100 translate-x-2 group-hover:translate-x-0">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-xs"
                                                        onClick={() => onEdit(s)}
                                                        className="h-9 w-9 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl shadow-sm border border-transparent hover:border-indigo-100/50"
                                                    >
                                                        <Edit2 size={16} strokeWidth={2.5} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-xs"
                                                        onClick={() => handleDelete(s.id_sumber_dana, s.nama_sumber)}
                                                        disabled={isDeleting && confirmDelete.id === s.id_sumber_dana}
                                                        className="h-9 w-9 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl shadow-sm border border-transparent hover:border-rose-100/50"
                                                    >
                                                        <Trash2 size={16} strokeWidth={2.5} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile Grid View */}
                        <div className="md:hidden grid grid-cols-1 gap-4 px-6 pb-12">
                            {sumberDanaList.map((s) => (
                                <div 
                                    key={s.id_sumber_dana}
                                    className="group relative bg-white rounded-3xl p-5 border border-border/40 shadow-scandi active:scale-[0.98] transition-all"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/30">
                                                <CreditCard size={18} strokeWidth={2.5} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-foreground uppercase tracking-widest">
                                                    {s.nama_sumber}
                                                </span>
                                                <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest mt-0.5">Akun Personal</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon-xs"
                                                onClick={() => onEdit(s)}
                                                className="h-9 w-9 text-indigo-600 hover:bg-indigo-50 rounded-xl"
                                            >
                                                <Edit2 size={15} strokeWidth={2.5} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-xs"
                                                onClick={() => handleDelete(s.id_sumber_dana, s.nama_sumber)}
                                                disabled={isDeleting && confirmDelete.id === s.id_sumber_dana}
                                                className="h-9 w-9 text-rose-500 hover:bg-rose-50 rounded-xl"
                                            >
                                                <Trash2 size={15} strokeWidth={2.5} />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="bg-muted/5 rounded-2xl p-4 flex flex-col gap-1 border border-border/10">
                                        <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">Saldo Inisial</span>
                                        <span className="display-number text-lg font-black text-foreground tracking-widest">
                                            {formatRupiah(s.saldo_awal)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
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
