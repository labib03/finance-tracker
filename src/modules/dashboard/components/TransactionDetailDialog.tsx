'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Separator } from '@/shared/ui/separator';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { useState } from 'react';
import {
    formatRupiah,
    formatTanggal,
    cn
} from '@/lib/utils';
import { TRANSACTION_TYPES } from '@/lib/constants';
import { getRootLabel } from '@/lib/tipeUtils';
import {
    Calendar,
    Tag,
    Wallet,
    FileText,
    ArrowLeftRight,
    Pencil,
    Trash2,
    ArrowDownCircle,
    ArrowUpCircle,
    X as XIcon
} from 'lucide-react';
import type { Transaksi } from '@/lib/types';
import { CategoryIcon } from '@/shared/ui/CategoryIcon';
import { useFinanceStore } from '@/lib/store';

interface TransactionDetailDialogProps {
    transaksi: Transaksi | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit?: (transaksi: Transaksi) => void;
    onDelete?: (id: string) => void;
    hideActions?: boolean;
}

export function TransactionDetailDialog({
    transaksi,
    open,
    onOpenChange,
    onEdit,
    onDelete,
    hideActions = false
}: TransactionDetailDialogProps) {
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
    const tipeList = useFinanceStore((s) => s.tipeList);
    const tabunganList = useFinanceStore((s) => s.tabunganList);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    if (!transaksi) return null;

    const rootLabel = getRootLabel(tipeList, transaksi.jenis).toLowerCase();
    const isIncome = rootLabel === TRANSACTION_TYPES.INCOME;
    const isTransfer = rootLabel === TRANSACTION_TYPES.TRANSFER || transaksi.jenis.toLowerCase() === TRANSACTION_TYPES.TRANSFER;
    const isSaving = rootLabel === TRANSACTION_TYPES.SAVINGS || transaksi.jenis.toLowerCase().includes('tabungan');

    const kategori = kategoriList.find(k => k.id_kategori === transaksi.id_kategori);
    const sumberDana = sumberDanaList.find(s => s.id_sumber_dana === transaksi.id_sumber_dana);
    const hasTargetDana = Boolean(transaksi.id_target_dana);
    const sumberDanaTujuan = (isTransfer || hasTargetDana)
        ? sumberDanaList.find(s => s.id_sumber_dana === transaksi.id_target_dana)
        : null;

    const tabungan = isSaving ? tabunganList.find(t => t.id_tabungan === transaksi.id_tabungan) : null;

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent
                    className="sm:max-w-[420px] bg-white p-0 rounded-[2.5rem] border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[90vh] z-[60]"
                    overlayClassName="z-[60] bg-black/40 backdrop-blur-[4px]"
                    showCloseButton={true}
                >
                    {/* Minimalist Top Header (Fixed) */}
                    <div className="pt-12 pb-8 px-8 flex flex-col items-center shrink-0">
                        {/* Category Minimal Icon */}
                        <div className={cn(
                            "w-16 h-16 rounded-[1.25rem] flex items-center justify-center mb-6 transition-colors duration-500",
                            isTransfer ? "bg-blue-50/80 text-blue-500" : isIncome ? "bg-emerald-50/80 text-emerald-500" : isSaving ? "bg-sky-50/80 text-sky-500" : "bg-red-50/80 text-red-500"
                        )}>
                            {isTransfer ? (
                                <ArrowLeftRight size={28} strokeWidth={2.5} />
                            ) : (
                                <CategoryIcon name={kategori?.icon_name || 'Circle'} size={28} strokeWidth={2.5} />
                            )}
                        </div>

                        <div className="text-center space-y-2">
                            <p className="text-xs font-bold text-muted-foreground/80 uppercase tracking-widest">
                                {transaksi.label || (isTransfer ? 'Transfer Antar Akun' : kategori?.nama_kategori)}
                            </p>
                            <h2 className="text-[2.5rem] leading-none font-black text-foreground tracking-tight tabular-nums">
                                {isIncome ? '+' : isTransfer || isSaving ? '' : '-'}
                                {formatRupiah(transaksi.nominal)}
                            </h2>
                            {!isTransfer && (
                                <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[0.15em] pt-1">
                                    {kategori?.nama_kategori || 'Tanpa Kategori'}
                                </p>
                            )}
                            {transaksi.is_titipan && (
                                <div className="mt-4 flex justify-center">
                                    <Badge variant="secondary" className="bg-amber-100/50 text-amber-700 border border-amber-200/50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                        Uang Titipan
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className={cn(
                        "flex-1 overflow-y-auto px-8 space-y-8 scrollbar-none", // Hide scrollbar for cleaner mobile look
                        hideActions ? "pt-2 pb-12" : "py-2"
                    )}>
                        {/* Compact Info Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted/30 hover:bg-muted/50 transition-colors duration-300 p-4 rounded-3xl flex flex-col gap-2">
                                <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest flex items-center gap-1.5">
                                    <Calendar size={12} strokeWidth={2.5} />
                                    Waktu
                                </span>
                                <div className="text-sm font-bold text-foreground">
                                    {formatTanggal(transaksi.tanggal)}
                                </div>
                            </div>
                            <div className="bg-muted/30 hover:bg-muted/50 transition-colors duration-300 p-4 rounded-3xl flex flex-col gap-2">
                                <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest flex items-center gap-1.5">
                                    <Tag size={12} strokeWidth={2.5} />
                                    Status
                                </span>
                                <div className={cn(
                                    "text-sm font-bold tracking-wide",
                                    isTransfer ? "text-blue-600" : isIncome ? "text-emerald-600" : isSaving ? "text-sky-600" : "text-red-600"
                                )}>
                                    {tipeList.find(t => t.id_tipe === transaksi.jenis)?.label || transaksi.jenis}
                                </div>
                            </div>
                        </div>

                        {/* Simple Ledger List */}
                        <div className="space-y-4">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/20">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-[1rem] bg-background shadow-sm border border-muted/50 flex items-center justify-center text-muted-foreground">
                                            <Wallet size={18} strokeWidth={2.5} />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                {(isTransfer || (isSaving && sumberDanaTujuan)) ? 'DARI' : 'METODE'}
                                            </span>
                                            <span className="text-sm font-bold text-foreground">{sumberDana?.nama_sumber || '-'}</span>
                                        </div>
                                    </div>
                                    {(isTransfer || (isSaving && sumberDanaTujuan)) && (
                                        <ArrowLeftRight size={14} className="text-muted-foreground/50 rotate-90 mx-2" />
                                    )}
                                </div>

                                {(isTransfer || (isSaving && sumberDanaTujuan)) && (
                                    <div className={cn(
                                        "flex items-center gap-4 p-3 rounded-2xl",
                                        isSaving ? "bg-sky-50/50" : "bg-blue-50/50"
                                    )}>
                                        <div className={cn(
                                            "w-10 h-10 rounded-[1rem] bg-white shadow-sm flex items-center justify-center",
                                            isSaving ? "text-sky-500" : "text-blue-500"
                                        )}>
                                            <Wallet size={18} strokeWidth={2.5} />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase tracking-widest",
                                                isSaving ? "text-sky-500/80" : "text-blue-500/80"
                                            )}>
                                                {isSaving ? 'DITABUNG KE' : 'DIKIRIM KE'}
                                            </span>
                                            <span className={cn(
                                                "text-sm font-bold",
                                                isSaving ? "text-sky-700" : "text-blue-700"
                                            )}>
                                                {sumberDanaTujuan?.nama_sumber || '-'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {isSaving && tabungan && (
                                    <div className="flex items-center gap-4 p-3 rounded-2xl bg-indigo-50/50">
                                        <div className="w-10 h-10 rounded-[1rem] bg-white shadow-sm flex items-center justify-center text-indigo-500">
                                            <CategoryIcon name={tabungan.icon || 'Target'} size={18} strokeWidth={2.5} />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-bold text-indigo-500/80 uppercase tracking-widest">
                                                TUJUAN TABUNGAN
                                            </span>
                                            <span className="text-sm font-bold text-indigo-700">
                                                {tabungan.nama_tujuan || '-'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Catatan Area */}
                            <div className="pt-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <FileText size={14} className="text-muted-foreground/70" strokeWidth={2.5} />
                                    <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">Catatan</span>
                                </div>
                                <div className="bg-muted/20 p-4 rounded-3xl min-h-[80px]">
                                    <p className="text-sm text-foreground/80 leading-relaxed font-medium whitespace-pre-wrap">
                                        {transaksi.catatan || <span className="text-muted-foreground/50 italic">Tidak ada catatan tambahan...</span>}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Minimal Action Buttons (Fixed Footer) */}
                    {!hideActions && (
                        <div className="flex items-center gap-3 px-8 pt-4 pb-10 bg-white shrink-0 relative">
                            {/* Subtle fade effect above buttons to indicate scroll */}
                            <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent -translate-y-full pointer-events-none" />
                            
                            <Button
                                variant="secondary"
                                className="flex-1 h-14 rounded-2xl font-bold text-sm bg-muted/40 hover:bg-muted text-foreground transition-all duration-300"
                                onClick={() => {
                                    onEdit?.(transaksi);
                                    onOpenChange(false);
                                }}
                            >
                                <Pencil size={16} strokeWidth={2.5} className="mr-2.5 opacity-70" />
                                Edit
                            </Button>
                            <Button
                                variant="ghost"
                                className="flex-1 h-14 rounded-2xl font-bold text-sm text-red-600 bg-red-50/50 hover:bg-red-100 hover:text-red-700 transition-all duration-300"
                                onClick={() => setShowConfirmDelete(true)}
                            >
                                <Trash2 size={16} strokeWidth={2.5} className="mr-2.5 opacity-70" />
                                Hapus
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                isOpen={showConfirmDelete}
                onClose={() => setShowConfirmDelete(false)}
                onConfirm={() => {
                    onDelete?.(transaksi.id);
                    setShowConfirmDelete(false);
                    onOpenChange(false);
                }}
                title="Hapus Transaksi?"
                description="Tindakan ini permanen. Catatan ini akan dihapus dari riwayat keuangan Anda."
                className="z-[70]"
                overlayClassName="z-[70] bg-black/50 backdrop-blur-[6px]"
            />
        </>
    );
}
