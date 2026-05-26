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
    Tags,
    LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Kategori } from '@/lib/types';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

interface MasterDataManagementProps {
    onAddKategori: () => void;
    onEditKategori: (kategori: Kategori) => void;
}

export default function MasterDataManagement({
    onAddKategori,
    onEditKategori,
}: MasterDataManagementProps) {
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const recurringList = useFinanceStore((s) => s.recurringList);
    const removeKategori = useFinanceStore((s) => s.removeKategori);

    const [searchKategori, setSearchKategori] = useState('');
    const [kategoriTipe, setKategoriTipe] = useState<'all' | 'Pengeluaran' | 'Pemasukan'>('all');
    
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string; name: string }>({
        isOpen: false, id: '', name: ''
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

    const pengeluaranCount = kategoriList.filter(k => k.tipe === 'Pengeluaran').length;
    const pemasukanCount = kategoriList.filter(k => k.tipe === 'Pemasukan').length;

    const handleDeleteKategori = (id: string, nama: string) => {
        const isUsed = transaksiList.some((t: any) => t.id_kategori === id) || (recurringList && recurringList.some((r: any) => r.id_kategori === id));
        setDeleteRestricted(isUsed);
        setConfirmDelete({ isOpen: true, id, name: nama });
    };

    const confirmDeleteAction = async () => {
        setIsDeleting(true);
        await removeKategori(confirmDelete.id);
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
                        Konfigurasi Struktur Kategori Transaksi Anda
                    </p>
                </div>
                <button 
                    onClick={onAddKategori}
                    className="group relative flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 transition-all duration-300 border border-transparent hover:shadow-lg shadow-slate-900/20 active:scale-[0.98] shrink-0"
                >
                    <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-white group-hover:text-white">Tambah Kategori</span>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                        <Plus size={14} className="text-white group-hover:rotate-90 transition-transform duration-300" />
                    </div>
                </button>
            </div>

            {/* Main Content (Full Width) */}
            <Card className="border border-slate-200 bg-white shadow-sm rounded-[2.5rem] overflow-hidden flex flex-col h-full min-h-[600px] relative">
                <CardHeader className="p-8 pb-6 shrink-0 relative z-20 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-[1.25rem] bg-slate-100 flex items-center justify-center border border-slate-200/50 text-slate-900 shadow-sm relative shrink-0">
                            <LayoutGrid size={28} strokeWidth={2.5} />
                            <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-white border-2 border-white shadow-sm">
                                {kategoriList.length}
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 leading-none mb-2">
                                Klasifikasi Transaksi
                            </p>
                            <CardTitle className="text-2xl font-black text-slate-950 tracking-tight leading-none">
                                Kategori Master
                            </CardTitle>
                        </div>
                    </div>

                    {/* Filter & Search Header */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                        <div className="flex items-center p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/60 w-fit shrink-0">
                            {[
                                { value: 'all' as const, label: 'Semua' },
                                { value: 'Pengeluaran' as const, label: `Keluar (${pengeluaranCount})` },
                                { value: 'Pemasukan' as const, label: `Masuk (${pemasukanCount})` }
                            ].map(f => (
                                <button
                                    key={f.value}
                                    onClick={() => setKategoriTipe(f.value)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 whitespace-nowrap",
                                        kategoriTipe === f.value
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
                                placeholder="Cari kategori..."
                                className="pl-11 h-12 text-sm font-medium rounded-2xl bg-slate-50 border-slate-200/60 focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all placeholder:text-slate-400"
                                value={searchKategori}
                                onChange={(e) => setSearchKategori(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                
                <CardContent className="p-8 flex-1 overflow-y-auto overflow-x-hidden relative z-10 bg-slate-50/50">
                    {filteredKategori.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[300px] text-center p-8">
                            <div className="w-20 h-20 rounded-[1.5rem] bg-white flex items-center justify-center mb-6 border border-dashed border-slate-300 shadow-sm">
                                <Tags size={32} className="text-slate-300" />
                            </div>
                            <p className="text-lg font-black text-slate-700 mb-2">Kategori Tidak Ditemukan</p>
                            <p className="text-sm font-medium text-slate-500 max-w-sm">
                                Silakan gunakan kata kunci lain atau tambahkan kategori baru ke dalam sistem.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 z-10 relative">
                            {filteredKategori.map((k) => (
                                <div
                                    key={k.id_kategori}
                                    className="group relative flex flex-col p-5 rounded-[1.5rem] bg-white border border-slate-200 hover:border-slate-300 transition-all duration-300 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.06)] overflow-hidden"
                                >
                                    
                                    <div className="flex items-start justify-between mb-6 relative z-10">
                                        <div className={cn(
                                            "w-12 h-12 rounded-[1rem] flex items-center justify-center shrink-0 shadow-sm transition-transform duration-500 group-hover:scale-110",
                                            k.tipe === 'Pemasukan' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                                        )}>
                                            {k.tipe === 'Pemasukan' ? <ArrowUpRight size={20} strokeWidth={2.5} /> : <ArrowDownRight size={20} strokeWidth={2.5} />}
                                        </div>
                                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onEditKategori(k)}
                                                className="h-8 w-8 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100"
                                            >
                                                <Edit2 size={14} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteKategori(k.id_kategori, k.nama_kategori)}
                                                className="h-8 w-8 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100"
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col mt-auto relative z-10">
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-[0.15em] mb-1.5",
                                            k.tipe === 'Pemasukan' ? "text-emerald-500" : "text-rose-500"
                                        )}>
                                            {k.tipe}
                                        </span>
                                        <span className="text-base font-black text-slate-800 leading-tight group-hover:text-slate-950 transition-colors line-clamp-2">
                                            {k.nama_kategori}
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
                title={deleteRestricted ? "Tidak Bisa Menghapus" : `Hapus Kategori?`}
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
