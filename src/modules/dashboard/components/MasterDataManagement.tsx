'use client';

import { useState, useMemo } from 'react';
import { useFinanceStore } from '@/lib/store';
import {
    Edit2,
    Trash2,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    CreditCard,
    Wallet,
    Tags,
    LayoutGrid
} from 'lucide-react';
import { formatRupiah, cn } from '@/lib/utils';
import type { Kategori, SumberDana } from '@/lib/types';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

interface MasterDataManagementProps {
    onAddKategori: () => void;
    onEditKategori: (kategori: Kategori) => void;
    onAddSumberDana: () => void;
    onEditSumberDana: (sumberDana: SumberDana) => void;
}

export default function MasterDataManagement({
    onAddKategori,
    onEditKategori,
    onAddSumberDana,
    onEditSumberDana,
}: MasterDataManagementProps) {
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const recurringList = useFinanceStore((s) => s.recurringList);
    const removeKategori = useFinanceStore((s) => s.removeKategori);
    const removeSumberDana = useFinanceStore((s) => s.removeSumberDana);

    const [searchKategori, setSearchKategori] = useState('');
    const [searchSumberDana, setSearchSumberDana] = useState('');
    const [kategoriTipe, setKategoriTipe] = useState<'all' | 'Pengeluaran' | 'Pemasukan'>('all');
    
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string; name: string; type: 'kategori' | 'sumber_dana' }>({
        isOpen: false, id: '', name: '', type: 'kategori'
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteRestricted, setDeleteRestricted] = useState(false);

    const filteredKategori = useMemo(() => {
        let list = kategoriList;
        if (kategoriTipe !== 'all') {
            list = list.filter(k => k.tipe === kategoriTipe);
        }
        if (searchKategori) {
            list = list.filter(k => k.nama_kategori.toLowerCase().includes(searchKategori.toLowerCase()));
        }
        return list;
    }, [kategoriList, kategoriTipe, searchKategori]);

    const filteredSumberDana = useMemo(() => {
        if (!searchSumberDana) return sumberDanaList;
        return sumberDanaList.filter(s => s.nama_sumber.toLowerCase().includes(searchSumberDana.toLowerCase()));
    }, [sumberDanaList, searchSumberDana]);

    const pengeluaranCount = kategoriList.filter(k => k.tipe === 'Pengeluaran').length;
    const pemasukanCount = kategoriList.filter(k => k.tipe === 'Pemasukan').length;

    const handleDeleteKategori = (id: string, nama: string) => {
        const isUsed = transaksiList.some(t => t.id_kategori === id) || recurringList.some(r => r.id_kategori === id);
        setDeleteRestricted(isUsed);
        setConfirmDelete({ isOpen: true, id, name: nama, type: 'kategori' });
    };

    const handleDeleteSumberDana = (id: string, nama: string) => {
        const isUsed = transaksiList.some(t => t.id_sumber_dana === id || t.id_target_dana === id) || recurringList.some(r => r.id_sumber_dana === id);
        setDeleteRestricted(isUsed);
        setConfirmDelete({ isOpen: true, id, name: nama, type: 'sumber_dana' });
    };

    const confirmDeleteAction = async () => {
        setIsDeleting(true);
        if (confirmDelete.type === 'kategori') {
            await removeKategori(confirmDelete.id);
        } else {
            await removeSumberDana(confirmDelete.id);
        }
        setIsDeleting(false);
        setConfirmDelete({ ...confirmDelete, isOpen: false });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                    <h2 className="text-lg font-black uppercase tracking-widest text-slate-900">Master Data</h2>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">
                        Konfigurasi Struktur Kategori & Rekening Anda
                    </p>
                </div>
            </div>

            {/* Grid Layout (Side-by-side on LG screens) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* ----------------- KATEGORI PANEL ----------------- */}
                <Card className="border border-slate-200 bg-white shadow-sm rounded-[2.5rem] overflow-hidden flex flex-col h-full min-h-[600px] max-h-[750px] relative">
                    <CardHeader className="p-8 pb-6 shrink-0 relative z-20 border-b border-slate-100 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[1rem] bg-slate-100 flex items-center justify-center border border-slate-200/50 text-slate-900 shadow-sm relative">
                                <Tags size={24} strokeWidth={2.5} />
                                <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[8px] font-black text-white border-2 border-white">
                                    {kategoriList.length}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 leading-none mb-1.5">
                                    Klasifikasi
                                </p>
                                <CardTitle className="text-xl font-black text-slate-950 tracking-tight leading-none">
                                    Kategori Transaksi
                                </CardTitle>
                            </div>
                        </div>

                        {/* Filter & Search Header */}
                        <div className="space-y-3">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <Input
                                    placeholder="Cari kategori..."
                                    className="pl-11 h-12 text-sm font-medium rounded-2xl bg-slate-50 border-slate-200/60 focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all placeholder:text-slate-400"
                                    value={searchKategori}
                                    onChange={(e) => setSearchKategori(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                                {[
                                    { value: 'all' as const, label: 'Semua Kategori' },
                                    { value: 'Pengeluaran' as const, label: `Pengeluaran (${pengeluaranCount})` },
                                    { value: 'Pemasukan' as const, label: `Pemasukan (${pemasukanCount})` }
                                ].map(f => (
                                    <button
                                        key={f.value}
                                        onClick={() => setKategoriTipe(f.value)}
                                        className={cn(
                                            "px-4 py-2 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap border placeholder:",
                                            kategoriTipe === f.value
                                                ? "bg-slate-900 text-white border-transparent shadow-sm"
                                                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-800"
                                        )}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-4 flex-1 overflow-y-auto overflow-x-hidden relative z-10 scroll-smooth custom-scrollbar">
                        {filteredKategori.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[200px] text-center p-8">
                                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-dashed border-slate-200">
                                    <Tags size={24} className="text-slate-300" />
                                </div>
                                <p className="text-sm font-bold text-slate-400">Tidak ada kategori ditemukan</p>
                            </div>
                        ) : (
                            <div className="space-y-3 pb-2 z-10 relative">
                                {filteredKategori.map((k) => (
                                    <div
                                        key={k.id_kategori}
                                        className="group relative p-4 rounded-[1.5rem] bg-white border border-slate-100 hover:border-slate-200 transition-all duration-300 flex items-center justify-between gap-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.04)]"
                                    >
                                        <div className="flex items-center gap-4 min-w-0 flex-1">
                                            <div className={cn(
                                                "w-12 h-12 rounded-[1rem] flex items-center justify-center shrink-0 border border-slate-100/50 shadow-sm transition-transform group-hover:scale-105",
                                                k.tipe === 'Pemasukan' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                            )}>
                                                {k.tipe === 'Pemasukan' ? <ArrowUpRight size={20} strokeWidth={2.5} /> : <ArrowDownRight size={20} strokeWidth={2.5} />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-800 leading-tight">{k.nama_kategori}</span>
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-[0.15em] mt-1",
                                                    k.tipe === 'Pemasukan' ? "text-emerald-500" : "text-rose-500"
                                                )}>
                                                    Kategori {k.tipe}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onEditKategori(k)}
                                                className="h-9 w-9 xl:h-10 xl:w-10 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 bg-white border border-transparent hover:border-indigo-100 shadow-sm transition-all"
                                            >
                                                <Edit2 size={16} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteKategori(k.id_kategori, k.nama_kategori)}
                                                className="h-9 w-9 xl:h-10 xl:w-10 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 bg-white border border-transparent hover:border-rose-100 shadow-sm transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>

                    <div className="p-4 shrink-0 relative z-20 border-t border-slate-100 bg-white">
                        <button 
                            onClick={onAddKategori}
                            className="w-full group/add relative flex items-center justify-between p-4 rounded-[1.5rem] bg-slate-900 hover:bg-slate-800 transition-all duration-300 border border-transparent hover:shadow-lg shadow-slate-900/20 active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shadow-sm text-white group-hover/add:bg-white/20 transition-colors border border-white/5">
                                    <Tags size={18} strokeWidth={2.5} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 group-hover/add:text-slate-300 leading-none mb-1.5">
                                        Data Master Baru
                                    </p>
                                    <p className="text-xs font-bold text-white group-hover/add:text-white">
                                        Tambahkan Kategori
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <Plus size={14} className="text-white group-hover/add:rotate-90 transition-transform duration-300" />
                                </div>
                            </div>
                        </button>
                    </div>
                </Card>

                {/* ----------------- SUMBER DANA PANEL ----------------- */}
                <Card className="border border-slate-200 bg-white shadow-sm rounded-[2.5rem] overflow-hidden flex flex-col h-full min-h-[600px] max-h-[750px] relative">
                    <CardHeader className="p-8 pb-6 shrink-0 relative z-20 border-b border-slate-100 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[1rem] bg-slate-100 flex items-center justify-center border border-slate-200/50 text-slate-900 shadow-sm relative">
                                <Wallet size={24} strokeWidth={2.5} />
                                <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[8px] font-black text-white border-2 border-white">
                                    {sumberDanaList.length}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 leading-none mb-1.5">
                                    Alokasi Aset
                                </p>
                                <CardTitle className="text-xl font-black text-slate-950 tracking-tight leading-none">
                                    Rekening & Dompet
                                </CardTitle>
                            </div>
                        </div>

                        {/* Search Header */}
                        <div className="space-y-3">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <Input
                                    placeholder="Cari rekening..."
                                    className="pl-11 h-12 text-sm font-medium rounded-2xl bg-slate-50 border-slate-200/60 focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all placeholder:text-slate-400"
                                    value={searchSumberDana}
                                    onChange={(e) => setSearchSumberDana(e.target.value)}
                                />
                            </div>
                            {/* Empty spacing block just to match exactly with the filters row in the other card */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 invisible h-8">
                                <button className="px-4 py-2 rounded-[1rem] text-[10px] font-black uppercase">Spacing</button>
                            </div>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-4 flex-1 overflow-y-auto overflow-x-hidden relative z-10 scroll-smooth custom-scrollbar">
                        {filteredSumberDana.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[200px] text-center p-8">
                                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-dashed border-slate-200">
                                    <Wallet size={24} className="text-slate-300" />
                                </div>
                                <p className="text-sm font-bold text-slate-400">Tidak ada rekening ditemukan</p>
                            </div>
                        ) : (
                            <div className="space-y-3 pb-2 z-10 relative">
                                {filteredSumberDana.map((s) => (
                                    <div
                                        key={s.id_sumber_dana}
                                        className="group relative p-4 rounded-[1.5rem] bg-white border border-slate-100 hover:border-slate-200 transition-all duration-300 flex items-center justify-between gap-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.04)]"
                                    >
                                        <div className="flex items-center gap-4 min-w-0 flex-1">
                                            <div className="w-12 h-12 rounded-[1rem] flex items-center justify-center shrink-0 border border-slate-200/50 shadow-sm transition-transform group-hover:scale-105 bg-slate-50 text-slate-700">
                                                <CreditCard size={20} strokeWidth={2.5} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-800 leading-tight">{s.nama_sumber}</span>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                                                        Akun Personal
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right hidden sm:block pr-2">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Saldo Net</p>
                                                <span className="display-number text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                    {formatRupiah(s.saldo_awal)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onEditSumberDana(s)}
                                                    className="h-9 w-9 xl:h-10 xl:w-10 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 bg-white border border-transparent hover:border-indigo-100 shadow-sm transition-all"
                                                >
                                                    <Edit2 size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteSumberDana(s.id_sumber_dana, s.nama_sumber)}
                                                    className="h-9 w-9 xl:h-10 xl:w-10 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 bg-white border border-transparent hover:border-rose-100 shadow-sm transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>

                    <div className="p-4 shrink-0 relative z-20 border-t border-slate-100 bg-white">
                        <button 
                            onClick={onAddSumberDana}
                            className="w-full group/add relative flex items-center justify-between p-4 rounded-[1.5rem] bg-slate-900 hover:bg-slate-800 transition-all duration-300 border border-transparent hover:shadow-lg shadow-slate-900/20 active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shadow-sm text-white group-hover/add:bg-white/20 transition-colors border border-white/5">
                                    <CreditCard size={18} strokeWidth={2.5} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 group-hover/add:text-slate-300 leading-none mb-1.5">
                                        Data Master Baru
                                    </p>
                                    <p className="text-xs font-bold text-white group-hover/add:text-white">
                                        Tambahkan Rekening
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <Plus size={14} className="text-white group-hover/add:rotate-90 transition-transform duration-300" />
                                </div>
                            </div>
                        </button>
                    </div>
                </Card>

            </div>

            <ConfirmDialog
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}
                onConfirm={deleteRestricted ? () => setConfirmDelete({ ...confirmDelete, isOpen: false }) : confirmDeleteAction}
                isLoading={isDeleting}
                title={deleteRestricted ? "Tidak Bisa Menghapus" : `Hapus ${confirmDelete.type === 'kategori' ? 'Kategori' : 'Sumber Dana'}?`}
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
