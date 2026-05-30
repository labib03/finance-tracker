'use client';
import { TRANSACTION_TYPES } from '@/lib/constants';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/lib/store';
import {
    Edit2,
    Trash2,
    Plus,
    Search,
    Tags,
    LayoutGrid,
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    Wallet
} from 'lucide-react';
import { cn, generateId } from '@/lib/utils';
import { getRootLabel } from '@/lib/tipeUtils';
import type { TipeTransaksi } from '@/lib/types';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export function MasterTipeTab() {
    const router = useRouter();
    const tipeList = useFinanceStore((s) => s.tipeList);
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const addTipeTransaksi = useFinanceStore((s) => s.addTipeTransaksi);
    const updateTipeTransaksi = useFinanceStore((s) => s.updateTipeTransaksi);
    const removeTipeTransaksi = useFinanceStore((s) => s.removeTipeTransaksi);

    const [searchTipe, setSearchTipe] = useState('');
    const [masterFilter, setMasterFilter] = useState<string>('all');
    
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string; name: string }>({
        isOpen: false, id: '', name: ''
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteRestricted, setDeleteRestricted] = useState(false);

    const rootTipes = useMemo(() => tipeList.filter(t => !t.master_tipe), [tipeList]);

    const filteredTipe = useMemo(() => {
        let list = tipeList;
        if (masterFilter !== 'all') {
            list = list.filter(t => t.master_tipe === masterFilter || t.id_tipe === masterFilter);
        }
        if (searchTipe) {
            list = list.filter(t => t.label.toLowerCase().includes(searchTipe.toLowerCase()));
        }
        return list;
    }, [tipeList, masterFilter, searchTipe]);

    const handleDeleteTipe = (id: string, nama: string) => {
        const isUsedInKategori = kategoriList.some((k) => k.tipe.toLowerCase() === (id || '').toLowerCase());
        const isUsedInTransaksi = transaksiList.some((t) => t.jenis.toLowerCase() === (id || '').toLowerCase());
        const isUsed = isUsedInKategori || isUsedInTransaksi;
        setDeleteRestricted(isUsed);
        setConfirmDelete({ isOpen: true, id, name: nama });
    };

    const confirmDeleteAction = async () => {
        setIsDeleting(true);
        await removeTipeTransaksi(confirmDelete.id);
        setIsDeleting(false);
        setConfirmDelete({ ...confirmDelete, isOpen: false });
    };

    const getMasterTipeIcon = (id_tipe: string) => {
        const rootLabel = getRootLabel(tipeList, id_tipe);
        if (rootLabel.includes(TRANSACTION_TYPES.INCOME)) return <ArrowUpRight size={20} className="text-emerald-600" />;
        if (rootLabel.includes(TRANSACTION_TYPES.EXPENSE)) return <ArrowDownRight size={20} className="text-rose-600" />;
        if (rootLabel.includes(TRANSACTION_TYPES.SAVINGS)) return <Wallet size={20} className="text-blue-600" />;
        return <Activity size={20} className="text-slate-600" />;
    };

    const getMasterTipeBg = (id_tipe: string) => {
        const rootLabel = getRootLabel(tipeList, id_tipe);
        if (rootLabel.includes(TRANSACTION_TYPES.INCOME)) return "bg-emerald-50 border-emerald-100";
        if (rootLabel.includes(TRANSACTION_TYPES.EXPENSE)) return "bg-rose-50 border-rose-100";
        if (rootLabel.includes(TRANSACTION_TYPES.SAVINGS)) return "bg-blue-50 border-blue-100";
        return "bg-slate-50 border-slate-100";
    };

    return (
        <div className="space-y-6">

            <Card className="border border-slate-200 bg-white shadow-sm rounded-[2.5rem] overflow-hidden flex flex-col min-h-[500px] relative">
                <CardHeader className="p-8 pb-6 shrink-0 relative z-20 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-[1.25rem] bg-slate-100 flex items-center justify-center border border-slate-200/50 text-slate-900 shadow-sm relative shrink-0">
                            <Activity size={28} strokeWidth={2.5} />
                            <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-white border-2 border-white shadow-sm">
                                {tipeList.length}
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 leading-none mb-2">
                                Hirarki Utama
                            </p>
                            <CardTitle className="text-2xl font-black text-slate-950 tracking-tight leading-none">
                                Daftar Tipe
                            </CardTitle>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                        <div className="flex items-center p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/60 w-fit shrink-0 overflow-x-auto">
                            <button
                                onClick={() => setMasterFilter('all')}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 whitespace-nowrap",
                                    masterFilter === 'all'
                                        ? "bg-white text-slate-900 shadow-sm"
                                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                                )}
                            >
                                Semua
                            </button>
                            {rootTipes.map(f => (
                                <button
                                    key={f.id_tipe}
                                    onClick={() => setMasterFilter(f.id_tipe)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 whitespace-nowrap",
                                        masterFilter === f.id_tipe
                                            ? "bg-white text-slate-900 shadow-sm"
                                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                                    )}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full sm:w-64 shrink-0">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <Input
                                placeholder="Cari tipe..."
                                className="pl-11 h-12 text-sm font-medium rounded-2xl bg-slate-50 border-slate-200/60 focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all placeholder:text-slate-400"
                                value={searchTipe}
                                onChange={(e) => setSearchTipe(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                
                <CardContent className="p-8 flex-1 overflow-y-auto overflow-x-hidden relative z-10 bg-slate-50/50">
                    {filteredTipe.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[200px] text-center p-8">
                            <div className="w-20 h-20 rounded-[1.5rem] bg-white flex items-center justify-center mb-6 border border-dashed border-slate-300 shadow-sm">
                                <Tags size={32} className="text-slate-300" />
                            </div>
                            <p className="text-lg font-black text-slate-700 mb-2">Tipe Tidak Ditemukan</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 z-10 relative">
                            {filteredTipe.map((t) => (
                                <div
                                    key={t.id_tipe}
                                    className="group relative flex flex-col p-5 rounded-[1.5rem] bg-white border border-slate-200 hover:border-slate-300 transition-all duration-300 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.06)] overflow-hidden"
                                >
                                    <div className="flex items-start justify-between mb-6 relative z-10">
                                        <div className={cn(
                                            "w-12 h-12 rounded-[1rem] flex items-center justify-center shrink-0 shadow-sm transition-transform duration-500 group-hover:scale-110 border",
                                            getMasterTipeBg(t.id_tipe)
                                        )}>
                                            {getMasterTipeIcon(t.id_tipe)}
                                        </div>
                                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => router.push(`/master/tipe/edit/${t.id_tipe}`)}
                                                className="h-8 w-8 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100"
                                            >
                                                <Edit2 size={14} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteTipe(t.id_tipe, t.label)}
                                                className="h-8 w-8 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100"
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col mt-auto relative z-10">
                                        <span className="text-[10px] font-black uppercase tracking-[0.15em] mb-1.5 text-slate-500">
                                            Parent: {t.master_tipe ? (tipeList.find(pt => pt.id_tipe === t.master_tipe)?.label || t.master_tipe) : 'Root (Master)'}
                                        </span>
                                        <span className="text-base font-black text-slate-800 leading-tight group-hover:text-slate-950 transition-colors line-clamp-2">
                                            {t.label}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <ConfirmDialog
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}
                onConfirm={deleteRestricted ? () => setConfirmDelete({ ...confirmDelete, isOpen: false }) : confirmDeleteAction}
                isLoading={isDeleting}
                title={deleteRestricted ? "Tidak Bisa Menghapus" : `Hapus Tipe?`}
                confirmText={deleteRestricted ? "Mengerti" : "Hapus"}
                variant={deleteRestricted ? "info" : "destructive"}
                description={
                    deleteRestricted
                        ? `"${confirmDelete.name}" tidak bisa dihapus karena masih digunakan oleh kategori atau transaksi.`
                        : `Apakah Anda yakin ingin menghapus "${confirmDelete.name}"?`
                }
            />
        </div>
    );
}

MasterTipeTab.displayName = "MasterTipeTab";
