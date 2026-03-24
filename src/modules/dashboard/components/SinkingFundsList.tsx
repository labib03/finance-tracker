'use client';

import { useState } from 'react';
import { useFinanceStore } from '@/lib/store';
import { formatRupiah, cn } from '@/lib/utils';
import { MoreHorizontal, Plus, Banknote, ShieldAlert, CheckCircle2, Target, PiggyBank, Car, Home, Plane, GraduationCap, Laptop, Smartphone, HeartPulse, Pencil, Trash2 } from 'lucide-react';
import { 
    DropdownMenu, 
    DropdownMenuTrigger, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuSeparator 
} from '@/shared/ui/dropdown-menu';
import { Tabungan } from '@/lib/types';
import TabunganAksiForm from '@/modules/dashboard/forms/TabunganAksiForm';
import TabunganForm from '@/modules/dashboard/forms/TabunganForm';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { toast } from 'sonner';

type AksiType = 'alokasi_tabungan' | 'tarik_tabungan' | 'eksekusi_tabungan';

const ICON_MAP: Record<string, React.ElementType> = {
    Target, PiggyBank, Car, Home, Plane, GraduationCap, Laptop, Smartphone, HeartPulse,
};

export default function SinkingFundsList() {
    const tabunganList = useFinanceStore((s) => s.tabunganList) || [];
    const getSaldoTabungan = useFinanceStore((s) => s.getSaldoTabungan);
    const getProgresTabungan = useFinanceStore((s) => s.getProgresTabungan);

    const [aksiModal, setAksiModal] = useState<{ tabungan: Tabungan; aksi: AksiType } | null>(null);
    const [editModal, setEditModal] = useState<Tabungan | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<Tabungan | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const removeTabungan = useFinanceStore((s) => s.removeTabungan);

    const calculateTimeRemaining = (targetDateStr: string) => {
        if (!targetDateStr) return '';
        const target = new Date(targetDateStr);
        const today = new Date();
        today.setHours(0,0,0,0);
        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return 'Tenggat Terlewat';
        if (diffDays === 0) return 'Hari Ini';
        const months = Math.floor(diffDays / 30);
        if (months > 0) return `Sisa ${months} Bln`;
        return `Sisa ${diffDays} Hari`;
    };

    const openAksi = (tabungan: Tabungan, aksi: AksiType) => {
        setAksiModal({ tabungan, aksi });
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        setIsDeleting(true);
        try {
            await removeTabungan(confirmDelete.id_tabungan);
            setConfirmDelete(null);
        } catch (error) {
            console.error(error);
            toast.error("Gagal menghapus tabungan.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className="space-y-4">
                <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
                    {tabunganList.length > 0 ? (
                        tabunganList.map((t) => {
                            const saldo = getSaldoTabungan(t.id_tabungan);
                            const progres = getProgresTabungan(t.id_tabungan);
                            const sisaWaktu = calculateTimeRemaining(t.tanggal_target);
                            const isTercapai = progres >= 100;
                            const IconComp = ICON_MAP[t.icon] || Target;

                            return (
                                <div 
                                    key={t.id_tabungan} 
                                    className="bg-white rounded-2xl border border-gray-100 hover:border-indigo-100 shadow-sm hover:shadow-md transition-all duration-300 p-4 sm:p-5 flex flex-col gap-4 group relative"
                                >
                                    {/* Header Row */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className={cn(
                                                "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all",
                                                isTercapai ? "bg-emerald-50 text-emerald-500" : "bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                                            )}>
                                                {isTercapai
                                                    ? <CheckCircle2 size={20} strokeWidth={2.5} />
                                                    : <IconComp size={20} strokeWidth={2} />
                                                }
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest truncate group-hover:text-indigo-700 transition-colors">
                                                    {t.nama_tujuan}
                                                </h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">
                                                    {sisaWaktu} &bull; {t.status === 'aktif' ? 'Aktif' : '✓ Selesai'}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Touch-Friendly Action Menu */}
                                        <div className="shrink-0 ml-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger>
                                                    <div 
                                                        role="button"
                                                        tabIndex={0}
                                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                                                    >
                                                        <MoreHorizontal size={18} strokeWidth={2.5} />
                                                    </div>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-xl border-slate-100">
                                                    <DropdownMenuItem
                                                        onClick={() => openAksi(t, 'alokasi_tabungan')}
                                                        className="py-3 px-3 rounded-xl cursor-pointer font-bold text-xs uppercase tracking-widest text-indigo-600 focus:bg-indigo-50"
                                                    >
                                                        <Plus className="mr-2.5 h-4 w-4" />
                                                        Alokasi Dana
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => openAksi(t, 'tarik_tabungan')}
                                                        className="py-3 px-3 rounded-xl cursor-pointer font-bold text-xs uppercase tracking-widest text-amber-600 focus:bg-amber-50"
                                                    >
                                                        <ShieldAlert className="mr-2.5 h-4 w-4" />
                                                        Tarik Darurat
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-slate-100 my-1" />
                                                    <DropdownMenuItem 
                                                        disabled={!isTercapai}
                                                        onClick={() => isTercapai && openAksi(t, 'eksekusi_tabungan')}
                                                        className="py-3 px-3 rounded-xl cursor-pointer font-bold text-xs uppercase tracking-widest text-emerald-600 focus:bg-emerald-50 data-disabled:opacity-40"
                                                    >
                                                        <Banknote className="mr-2.5 h-4 w-4" />
                                                        Eksekusi Pembelian
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-slate-100 my-1" />
                                                    <DropdownMenuItem
                                                        onClick={() => setEditModal(t)}
                                                        className="py-3 px-3 rounded-xl cursor-pointer font-bold text-xs uppercase tracking-widest text-slate-500 focus:bg-slate-50"
                                                    >
                                                        <Pencil className="mr-2.5 h-4 w-4" />
                                                        Edit Tujuan
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => setConfirmDelete(t)}
                                                        className="py-3 px-3 rounded-xl cursor-pointer font-bold text-xs uppercase tracking-widest text-rose-500 focus:bg-rose-50"
                                                    >
                                                        <Trash2 className="mr-2.5 h-4 w-4" />
                                                        Hapus Tujuan
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    {/* Progress Section */}
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between text-[11px] font-black tracking-widest uppercase">
                                            <span className={cn(isTercapai ? "text-emerald-600" : "text-indigo-700")}>
                                                {formatRupiah(saldo)}
                                            </span>
                                            <span className="text-slate-400">
                                                {formatRupiah(t.target_nominal)}
                                            </span>
                                        </div>
                                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                            <div 
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-1000",
                                                    isTercapai ? "bg-emerald-500" : "bg-indigo-500"
                                                )}
                                                style={{ width: `${Math.min(progres, 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-[9px] font-black text-right tracking-widest uppercase text-slate-300">
                                            {Math.floor(progres)}% Tercapai
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-1 md:col-span-2 py-16 flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center mb-4">
                                <PiggyBank size={28} />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Belum ada Tabungan</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Tekan &ldquo;Buat Tujuan&rdquo; untuk memulai</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Aksi Form Modal */}
            {aksiModal && (
                <TabunganAksiForm
                    tabungan={aksiModal.tabungan}
                    defaultAksi={aksiModal.aksi}
                    onClose={() => setAksiModal(null)}
                />
            )}

            {/* Edit Form Modal */}
            {editModal && (
                <TabunganForm
                    dataToEdit={editModal}
                    onClose={() => setEditModal(null)}
                />
            )}

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={!!confirmDelete}
                onClose={() => !isDeleting && setConfirmDelete(null)}
                onConfirm={handleDelete}
                isLoading={isDeleting}
                title="Hapus Tujuan Tabungan?"
                description={`Apakah Anda yakin ingin menghapus "${confirmDelete?.nama_tujuan}"? Data transaksi terkait tabungan ini akan kehilangan referensi tabungannya, namun saldo riil Anda tetap aman.`}
                confirmText="Ya, Hapus"
            />
        </>
    );
}
