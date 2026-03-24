'use client';

import { useState } from 'react';
import { useFinanceStore } from '@/lib/store';
import { formatRupiah, formatTanggalPendek, getJadwalTerdekat, getNamaBulan } from '@/lib/utils';
import { CalendarClock, Pause, Play, Trash2, Calendar, Pencil, Search, X, Filter } from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import type { RecurringTransaction } from '@/lib/types';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

interface RecurringListProps {
    onEdit?: (recurring: RecurringTransaction) => void;
}

export default function RecurringList({ onEdit }: RecurringListProps) {
    const recurringList = useFinanceStore((s) => s.recurringList);
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
    const updateRecurring = useFinanceStore((s) => s.updateRecurring);
    const removeRecurring = useFinanceStore((s) => s.removeRecurring);

    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, id: string, name: string }>({
        isOpen: false,
        id: '',
        name: ''
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

    const handleDeleteClick = (id: string, katId: string) => {
        const katName = kategoriList.find(k => k.id_kategori === katId)?.nama_kategori || 'Transaksi Berulang';
        setConfirmDelete({ isOpen: true, id, name: katName });
    };

    const confirmDeleteAction = async () => {
        setIsDeleting(true);
        await removeRecurring(confirmDelete.id);
        setIsDeleting(false);
        setConfirmDelete({ ...confirmDelete, isOpen: false });
    };

    const getKategoriName = (id: string) =>
        kategoriList.find((k) => k.id_kategori === id)?.nama_kategori || '-';

    const getSumberDanaName = (id: string) =>
        sumberDanaList.find((s) => s.id_sumber_dana === id)?.nama_sumber || '-';

    const filteredRecurring = useMemo(() => {
        let list = [...recurringList];

        // Search filter
        if (search) {
            const lowSearch = search.toLowerCase();
            list = list.filter(r =>
                getKategoriName(r.id_kategori).toLowerCase().includes(lowSearch) ||
                r.catatan?.toLowerCase().includes(lowSearch)
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            const target = statusFilter === 'active';
            list = list.filter(r => r.aktif === target);
        }

        // Sort by effective next date (nearest first)
        list.sort((a, b) => {
            const dateA = getJadwalTerdekat(a.tanggal_mulai, a.tanggal_berikutnya);
            const dateB = getJadwalTerdekat(b.tanggal_mulai, b.tanggal_berikutnya);
            return new Date(dateA).getTime() - new Date(dateB).getTime();
        });

        return list;
    }, [recurringList, search, statusFilter, kategoriList]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 mb-8">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={16} />
                    <Input
                        placeholder="Cari transaksi berulang..."
                        className="pl-10 rounded-2xl bg-white border border-border/40 h-11 text-xs font-medium tracking-wide shadow-scandi focus-visible:ring-primary/20"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-1.5 p-1.5 bg-muted/20 border border-border/40 rounded-2xl w-full sm:w-fit overflow-x-auto scrollbar-none">
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={cn(
                            "px-4 py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl transition-all flex-1 sm:flex-none",
                            statusFilter === 'all' ? "bg-white shadow-scandi text-foreground scale-[1.02]" : "text-muted-foreground/60 hover:text-foreground"
                        )}
                    >
                        Semua
                    </button>
                    <button
                        onClick={() => setStatusFilter('active')}
                        className={cn(
                            "px-4 py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl transition-all flex-1 sm:flex-none",
                            statusFilter === 'active' ? "bg-white shadow-scandi text-emerald-600 scale-[1.02]" : "text-muted-foreground/60 hover:text-emerald-600"
                        )}
                    >
                        Aktif
                    </button>
                    <button
                        onClick={() => setStatusFilter('inactive')}
                        className={cn(
                            "px-4 py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl transition-all flex-1 sm:flex-none",
                            statusFilter === 'inactive' ? "bg-white shadow-scandi text-orange-600 scale-[1.02]" : "text-muted-foreground/60 hover:text-orange-600"
                        )}
                    >
                        Mati
                    </button>
                </div>
            </div>

            <div className="flex-1">
                {recurringList.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <CalendarClock size={48} className="text-muted-foreground/80 mb-4" />
                            <p className="text-sm font-medium text-muted-foreground">
                                Belum ada transaksi berulang
                            </p>
                            <p className="text-xs text-muted-foreground/80 mt-1">
                                Buat jadwal untuk tagihan & pemasukan rutin
                            </p>
                        </CardContent>
                    </Card>
                ) : filteredRecurring.length === 0 ? (
                    <div className="text-center py-20 px-6 bg-muted/20 rounded-3xl border border-dashed">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                            <Filter size={32} className="opacity-20" />
                        </div>
                        <p className="text-sm font-bold text-foreground">Tidak ada jadwal ditemukan</p>
                        <p className="text-xs text-muted-foreground mt-1">Coba sesuaikan pencarian atau filter status Anda.</p>
                        <Button
                            variant="link"
                            size="sm"
                            className="mt-2 text-primary"
                            onClick={() => {
                                setSearch('');
                                setStatusFilter('all');
                            }}
                        >
                            Bersihkan filter
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredRecurring.map((r) => (
                            <div key={r.id} className="group overflow-hidden bg-white rounded-[1.5rem] border border-slate-100 hover:border-slate-200 shadow-sm transition-all duration-300">
                                <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className={cn("w-12 h-12 rounded-[1rem] flex items-center justify-center shrink-0 border border-slate-100/50 shadow-sm transition-transform group-hover:scale-110 duration-500",
                                                r.jenis === 'Pemasukan' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                                        )}>
                                            <CalendarClock size={20} strokeWidth={2.5} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 min-w-0">
                                                <p className="text-sm font-black text-slate-800 leading-tight truncate">
                                                    {r.label}
                                                </p>
                                                <span className={cn(
                                                    "shrink-0 text-[8px] font-black uppercase tracking-[0.15em] px-1.5 py-0.5 rounded-md",
                                                    r.aktif ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                                                )}>
                                                    {r.aktif ? 'AKTIF' : 'OFF'}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-1.5 mt-1 min-w-0">
                                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                                                    {r.frekuensi}
                                                </span>
                                                <span className="text-slate-300">•</span>
                                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                                                    {getKategoriName(r.id_kategori)}
                                                </span>
                                                <span className="text-slate-300 hidden xs:inline">•</span>
                                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 truncate hidden xs:inline">
                                                    {getSumberDanaName(r.id_sumber_dana)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 sm:gap-2 border-t border-slate-100 sm:border-transparent pt-4 sm:pt-0">
                                        <div className="flex flex-col items-start sm:items-end">
                                            <p className={cn("text-base sm:text-lg font-black display-number tracking-tight leading-none mb-1.5", r.jenis === 'Pemasukan' ? 'text-emerald-600' : 'text-slate-900')}>
                                                {formatRupiah(r.nominal)}
                                            </p>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                                                NEXT: {formatTanggalPendek(getJadwalTerdekat(r.tanggal_mulai, r.tanggal_berikutnya))}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <Button variant="ghost" size="icon-xs" onClick={() => updateRecurring({ ...r, aktif: !r.aktif })} title={r.aktif ? 'Pause' : 'Play'} className={cn("h-8 w-8 rounded-lg shadow-xs border border-slate-100 bg-white hover:bg-slate-50 transition-all", r.aktif ? 'text-amber-500 border-amber-100 hover:border-amber-200 hover:bg-amber-50' : 'text-emerald-500 border-emerald-100 hover:border-emerald-200 hover:bg-emerald-50')}>
                                                {r.aktif ? <Pause size={14} strokeWidth={2.5} /> : <Play size={14} strokeWidth={2.5} />}
                                            </Button>
                                            <Button variant="ghost" size="icon-xs" onClick={() => onEdit?.(r)} className="h-8 w-8 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 shadow-xs rounded-lg transition-all bg-white">
                                                <Pencil size={14} strokeWidth={2.5} />
                                            </Button>
                                            <Button variant="ghost" size="icon-xs" onClick={() => handleDeleteClick(r.id, r.id_kategori)} className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-100 hover:border-rose-200 shadow-xs rounded-lg transition-all bg-white">
                                                <Trash2 size={14} strokeWidth={2.5} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}
                onConfirm={confirmDeleteAction}
                isLoading={isDeleting}
                title="Hapus Jadwal?"
                description={`Apakah Anda yakin ingin menghapus jadwal transaksi berulang "${confirmDelete.name}"?`}
            />
        </div>
    );
}
