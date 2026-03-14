'use client';

import { useState } from 'react';
import { useFinanceStore } from '@/lib/store';
import { formatRupiah, formatTanggalPendek } from '@/lib/utils';
import { CalendarClock, Pause, Play, Trash2, Calendar, Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { RecurringTransaction } from '@/lib/types';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

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

    if (recurringList.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <CalendarClock size={48} className="text-muted-foreground/20 mb-4" />
                    <p className="text-sm font-medium text-muted-foreground">
                        Belum ada transaksi berulang
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                        Buat jadwal untuk tagihan & pemasukan rutin
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {recurringList.map((r) => (
                <Card key={r.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                    <CardContent className="p-0">
                        <div className="flex items-center gap-4 p-4">
                            <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                                    r.jenis === 'Pemasukan'
                                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'
                                        : 'bg-orange-50 text-orange-600 dark:bg-orange-500/10'
                                }`}
                            >
                                <CalendarClock size={24} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold truncate">
                                        {getKategoriName(r.id_kategori)}
                                    </p>
                                    <Badge variant={r.aktif ? "success" : "secondary"} className="text-[10px] h-4">
                                        {r.aktif ? 'Aktif' : 'Off'}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {r.frekuensi} · {getSumberDanaName(r.id_sumber_dana)}
                                    {r.catatan && ` · ${r.catatan}`}
                                </p>
                                <div className="flex items-center gap-1.5 mt-2">
                                    <Calendar size={12} className="text-primary" />
                                    <p className="text-[11px] font-semibold text-primary">
                                        Mendatang: {formatTanggalPendek(r.tanggal_berikutnya)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <p
                                    className={`text-sm font-black display-number ${
                                        r.jenis === 'Pemasukan' ? 'text-emerald-600' : 'text-orange-600'
                                    }`}
                                >
                                    {formatRupiah(r.nominal)}
                                </p>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => updateRecurring({ ...r, aktif: !r.aktif })}
                                        title={r.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                                        className={r.aktif ? 'text-orange-600 hover:bg-orange-50' : 'text-emerald-600 hover:bg-emerald-50'}
                                    >
                                        {r.aktif ? <Pause size={14} /> : <Play size={14} />}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => onEdit?.(r)}
                                        title="Edit"
                                        className="text-primary hover:bg-primary/10"
                                    >
                                        <Pencil size={14} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => handleDeleteClick(r.id, r.id_kategori)}
                                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                        title="Hapus"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}

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
