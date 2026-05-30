'use client';

import React, { useMemo, useState } from 'react';
import { useFinanceStore } from '@/lib/store';
import { formatRupiah, hitungSaldoAkun } from '@/lib/utils';
import { Banknote, CreditCard, Smartphone, Wallet, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { cn } from '@/lib/utils';

const iconMap: Record<string, typeof Wallet> = {
    Cash: Banknote,
    Mandiri: CreditCard,
    ATM: CreditCard,
    'E-Wallet': Smartphone,
};

const colorMap: Record<string, string> = {
    Cash: 'bg-emerald-50 text-emerald-600',
    Mandiri: 'bg-blue-50 text-blue-600',
    ATM: 'bg-amber-50 text-amber-600',
    'E-Wallet': 'bg-purple-50 text-purple-600',
};


interface SaldoCardsProps {
    onAddAccount?: () => void;
    onEditAccount?: (sumberDana: any) => void;
}

export default function SaldoCards({ onAddAccount, onEditAccount }: SaldoCardsProps) {
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const recurringList = useFinanceStore((s) => s.recurringList);
    const tipeList = useFinanceStore((s) => s.tipeList);
    const tabunganList = useFinanceStore((s) => s.tabunganList);
    const getSaldoTabungan = useFinanceStore((s) => s.getSaldoTabungan);
    const removeSumberDana = useFinanceStore((s) => s.removeSumberDana);

    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string; name: string }>({
        isOpen: false, id: '', name: ''
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteRestricted, setDeleteRestricted] = useState(false);

    const handleDeleteSumberDana = (id: string, nama: string) => {
        const isUsed = transaksiList.some((t: any) => t.id_sumber_dana === id || t.id_target_dana === id) || (recurringList && recurringList.some((r: any) => r.id_sumber_dana === id));
        setDeleteRestricted(isUsed);
        setConfirmDelete({ isOpen: true, id, name: nama });
    };

    const confirmDeleteAction = async () => {
        setIsDeleting(true);
        await removeSumberDana(confirmDelete.id);
        setIsDeleting(false);
        setConfirmDelete({ ...confirmDelete, isOpen: false });
    };

    const saldoAkun = useMemo(
        () => hitungSaldoAkun(sumberDanaList, transaksiList, tipeList, tabunganList),
        [sumberDanaList, transaksiList, tipeList, tabunganList]
    );

    const totalSaldo = useMemo(() => {
        return saldoAkun.reduce((total, akun) => total + akun.saldo, 0);
    }, [saldoAkun]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 relative">
                        <Wallet size={24} strokeWidth={2} />
                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Status Saldo Likuid
                        </p>
                        <h2 className="text-2xl font-black display-number text-slate-900 leading-none">
                            {formatRupiah(totalSaldo)}
                        </h2>
                    </div>
                </div>
                {onAddAccount && (
                    <Button 
                        variant="ghost" 
                        onClick={onAddAccount}
                        className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 hover:text-indigo-800 border-none shadow-none rounded-xl hidden sm:flex items-center gap-2 font-bold"
                    >
                        <Plus size={16} />
                        <span>Tambah Akun</span>
                    </Button>
                )}
            </div>
            
            {saldoAkun.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-3xl border border-slate-100">
                     <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                        <Wallet size={24} className="text-slate-300" />
                     </div>
                     <p className="text-sm font-medium text-slate-500">Belum ada akun dompet</p>
                     {onAddAccount && (
                         <Button variant="ghost" onClick={onAddAccount} className="mt-4 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                             Tambah Sekarang
                         </Button>
                     )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {saldoAkun.map((akun) => {
                        const Icon = iconMap[akun.nama_sumber] || Wallet;
                        const colorClass = colorMap[akun.nama_sumber] || 'bg-slate-50 text-slate-600';
                        return (
                            <div 
                                key={akun.id_sumber_dana}
                                className="group relative p-5 rounded-[1.5rem] bg-white border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all duration-200 flex flex-col gap-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colorClass)}>
                                        <Icon size={18} strokeWidth={2} />
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onEditAccount && onEditAccount(akun)}
                                            className="h-7 w-7 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                        >
                                            <Edit2 size={14} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteSumberDana(akun.id_sumber_dana, akun.nama_sumber)}
                                            className="h-7 w-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-xs font-semibold text-slate-500 block mb-1">
                                        {akun.nama_sumber}
                                    </span>
                                    <p className="text-lg font-bold display-number text-slate-900">
                                        {formatRupiah(akun.saldo)}
                                    </p>
                                </div>

                                {tabunganList.filter(t => !t.is_external && t.id_nama_dompet === akun.id_sumber_dana).length > 0 && (
                                    <div className="mt-auto pt-3 border-t border-slate-50 space-y-1">
                                        {tabunganList.filter(t => !t.is_external && t.id_nama_dompet === akun.id_sumber_dana).map(t => (
                                            <div key={t.id_tabungan} className="flex justify-between items-center text-[10px]">
                                                <span className="text-slate-500 truncate pr-2 flex items-center gap-1.5">
                                                    <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                                                    {t.nama_tujuan}
                                                </span>
                                                <span className="font-semibold text-slate-600 display-number">{formatRupiah(getSaldoTabungan(t.id_tabungan))}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    
                    {onAddAccount && (
                        <button 
                            onClick={onAddAccount}
                            className="sm:hidden flex flex-col items-center justify-center gap-3 p-5 rounded-[1.5rem] border-2 border-dashed border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                                <Plus size={20} />
                            </div>
                            <span className="text-xs font-semibold">Tambah Akun</span>
                        </button>
                    )}
                </div>
            )}

            <ConfirmDialog
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}
                onConfirm={deleteRestricted ? () => setConfirmDelete({ ...confirmDelete, isOpen: false }) : confirmDeleteAction}
                isLoading={isDeleting}
                title={deleteRestricted ? "Tidak Bisa Menghapus" : `Hapus Rekening / Dompet?`}
                confirmText={deleteRestricted ? "Mengerti" : "Hapus"}
                variant={deleteRestricted ? "info" : "destructive"}
                description={
                    deleteRestricted
                        ? `"${confirmDelete.name}" tidak bisa dihapus karena masih digunakan dalam riwayat transaksi atau jadwal rutin.`
                        : `Apakah Anda yakin ingin menghapus "${confirmDelete.name}"?`
                }
            />
        </div>
    );
}
