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
    Layers,
} from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import type { Kategori, SumberDana } from '@/lib/types';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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

    const [activeTab, setActiveTab] = useState<'kategori' | 'sumber_dana'>('kategori');
    const [search, setSearch] = useState('');
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
        if (search) {
            list = list.filter(k => k.nama_kategori.toLowerCase().includes(search.toLowerCase()));
        }
        return list;
    }, [kategoriList, kategoriTipe, search]);

    const filteredSumberDana = useMemo(() => {
        if (!search) return sumberDanaList;
        return sumberDanaList.filter(s => s.nama_sumber.toLowerCase().includes(search.toLowerCase()));
    }, [sumberDanaList, search]);

    const pengeluaranCount = kategoriList.filter(k => k.tipe === 'Pengeluaran').length;
    const pemasukanCount = kategoriList.filter(k => k.tipe === 'Pemasukan').length;

    const handleDeleteKategori = (id: string, nama: string) => {
        const isUsed = transaksiList.some(t => t.id_kategori === id) || recurringList.some(r => r.id_kategori === id);
        setDeleteRestricted(isUsed);
        setConfirmDelete({ isOpen: true, id, name: nama, type: 'kategori' });
    };

    const handleDeleteSumberDana = (id: string, nama: string) => {
        const isUsed = transaksiList.some(t => t.id_sumber_dana === id || t.id_sumber_dana_tujuan === id) || recurringList.some(r => r.id_sumber_dana === id);
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

    const tabs = [
        { id: 'kategori' as const, label: 'Kategori', icon: Tags, count: kategoriList.length },
        { id: 'sumber_dana' as const, label: 'Sumber Dana', icon: Wallet, count: sumberDanaList.length },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                    <h2 className="text-lg font-black uppercase tracking-[0.15em] text-foreground">Master Data</h2>
                    <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-tighter mt-1">
                        Kelola kategori transaksi dan sumber dana Anda
                    </p>
                </div>
                <Button
                    onClick={activeTab === 'kategori' ? onAddKategori : onAddSumberDana}
                    className="rounded-2xl px-6 h-11 bg-foreground text-background hover:bg-foreground/90 shadow-lg text-[10px] font-black uppercase tracking-widest shrink-0"
                >
                    <Plus size={16} className="mr-2" />
                    {activeTab === 'kategori' ? 'Tambah Kategori' : 'Tambah Akun'}
                </Button>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-[2.5rem] shadow-scandi border border-border/40 overflow-hidden transition-all duration-500 hover:shadow-float">
                <div className="flex border-b border-border/20">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setSearch(''); }}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-3 px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 relative",
                                activeTab === tab.id
                                    ? "text-foreground bg-muted/20"
                                    : "text-muted-foreground/40 hover:text-muted-foreground/70 hover:bg-muted/10"
                            )}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-[9px] font-black transition-colors",
                                activeTab === tab.id ? "bg-foreground text-background" : "bg-muted/40 text-muted-foreground/50"
                            )}>
                                {tab.count}
                            </span>
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-1/4 right-1/4 h-[3px] bg-foreground rounded-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Search + Filters */}
                <div className="px-8 py-5 border-b border-border/10">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30" size={14} />
                            <Input
                                placeholder={activeTab === 'kategori' ? "Cari kategori..." : "Cari sumber dana..."}
                                className="pl-10 h-11 text-xs font-medium rounded-2xl bg-muted/15 border-transparent focus:bg-white focus:border-border/40 focus:ring-0"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        {activeTab === 'kategori' && (
                            <div className="flex items-center gap-1.5 bg-muted/15 rounded-2xl p-1">
                                {[
                                    { value: 'all' as const, label: 'Semua' },
                                    { value: 'Pengeluaran' as const, label: `Keluar (${pengeluaranCount})` },
                                    { value: 'Pemasukan' as const, label: `Masuk (${pemasukanCount})` }
                                ].map(f => (
                                    <button
                                        key={f.value}
                                        onClick={() => setKategoriTipe(f.value)}
                                        className={cn(
                                            "px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300",
                                            kategoriTipe === f.value
                                                ? "bg-white text-foreground shadow-sm"
                                                : "text-muted-foreground/50 hover:text-muted-foreground"
                                        )}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    {activeTab === 'kategori' && (
                        <div className="space-y-1.5">
                            {filteredKategori.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-14 h-14 rounded-2xl bg-muted/20 flex items-center justify-center mx-auto mb-4 text-muted-foreground/20">
                                        <Tags size={28} />
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-widest text-foreground">Tidak ada kategori</p>
                                    <p className="text-[10px] font-medium text-muted-foreground/50 mt-1 uppercase tracking-tighter">Tambahkan kategori baru untuk memulai</p>
                                </div>
                            ) : (
                                filteredKategori.map((k) => (
                                    <div
                                        key={k.id_kategori}
                                        className="group flex items-center justify-between px-6 py-4 rounded-2xl hover:bg-muted/20 transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm",
                                                k.tipe === 'Pemasukan'
                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100/50"
                                                    : "bg-rose-50 text-rose-600 border-rose-100/50"
                                            )}>
                                                {k.tipe === 'Pemasukan' ? <ArrowUpRight size={16} strokeWidth={2.5} /> : <ArrowDownRight size={16} strokeWidth={2.5} />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-foreground leading-tight">{k.nama_kategori}</span>
                                                <span className={cn(
                                                    "text-[9px] font-black uppercase tracking-widest mt-0.5",
                                                    k.tipe === 'Pemasukan' ? "text-emerald-500/60" : "text-rose-500/60"
                                                )}>
                                                    {k.tipe}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            <Button
                                                variant="ghost"
                                                size="icon-xs"
                                                onClick={() => onEditKategori(k)}
                                                className="h-8 w-8 rounded-xl text-indigo-600 hover:bg-indigo-50"
                                            >
                                                <Edit2 size={14} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-xs"
                                                onClick={() => handleDeleteKategori(k.id_kategori, k.nama_kategori)}
                                                className="h-8 w-8 rounded-xl text-rose-500 hover:bg-rose-50"
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'sumber_dana' && (
                        <div className="space-y-1.5">
                            {filteredSumberDana.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-14 h-14 rounded-2xl bg-muted/20 flex items-center justify-center mx-auto mb-4 text-muted-foreground/20">
                                        <Wallet size={28} />
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-widest text-foreground">Belum ada akun</p>
                                    <p className="text-[10px] font-medium text-muted-foreground/50 mt-1 uppercase tracking-tighter">Tambahkan sumber dana baru untuk memulai</p>
                                </div>
                            ) : (
                                filteredSumberDana.map((s) => (
                                    <div
                                        key={s.id_sumber_dana}
                                        className="group flex items-center justify-between px-6 py-4 rounded-2xl hover:bg-muted/20 transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/50 shadow-sm">
                                                <CreditCard size={16} strokeWidth={2.5} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-foreground leading-tight">{s.nama_sumber}</span>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mt-0.5">
                                                    Personal Account
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 leading-none mb-1">Saldo Awal</p>
                                                <span className="display-number text-sm font-black text-foreground/70">
                                                    {formatRupiah(s.saldo_awal)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <Button
                                                    variant="ghost"
                                                    size="icon-xs"
                                                    onClick={() => onEditSumberDana(s)}
                                                    className="h-8 w-8 rounded-xl text-indigo-600 hover:bg-indigo-50"
                                                >
                                                    <Edit2 size={14} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-xs"
                                                    onClick={() => handleDeleteSumberDana(s.id_sumber_dana, s.nama_sumber)}
                                                    className="h-8 w-8 rounded-xl text-rose-500 hover:bg-rose-50"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
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
