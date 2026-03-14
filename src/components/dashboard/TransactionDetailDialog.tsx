'use client';

import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useState } from 'react';
import { 
    formatRupiah, 
    formatTanggal, 
    cn 
} from '@/lib/utils';
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
import { CategoryIcon } from '@/components/CategoryIcon';
import { useFinanceStore } from '@/lib/store';

interface TransactionDetailDialogProps {
    transaksi: Transaksi | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit?: (transaksi: Transaksi) => void;
    onDelete?: (id: string) => void;
}

export function TransactionDetailDialog({
    transaksi,
    open,
    onOpenChange,
    onEdit,
    onDelete
}: TransactionDetailDialogProps) {
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    if (!transaksi) return null;

    const isIncome = transaksi.jenis === 'Pemasukan';
    const isTransfer = transaksi.jenis === 'Transfer';
    
    const kategori = kategoriList.find(k => k.id_kategori === transaksi.id_kategori);
    const sumberDana = sumberDanaList.find(s => s.id_sumber_dana === transaksi.id_sumber_dana);
    const sumberDanaTujuan = isTransfer 
        ? sumberDanaList.find(s => s.id_sumber_dana === transaksi.id_sumber_dana_tujuan) 
        : null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent 
                className="sm:max-w-[420px] bg-white p-0 rounded-[2.5rem] border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden"
                showCloseButton={true}
            >
                {/* Minimalist Top Header */}
                <div className="pt-12 pb-8 px-8 flex flex-col items-center">
                    {/* Category Minimal Icon */}
                    <div className={cn(
                        "w-16 h-16 rounded-3xl flex items-center justify-center mb-6 transition-colors duration-500",
                        isTransfer ? "bg-indigo-50 text-indigo-500" : isIncome ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"
                    )}>
                        {isTransfer ? (
                            <ArrowLeftRight size={28} strokeWidth={2} />
                        ) : (
                            <CategoryIcon name={kategori?.icon_name || 'Circle'} size={28} strokeWidth={2} />
                        )}
                    </div>

                    <div className="text-center space-y-1">
                        <p className="text-xs font-black text-muted-foreground/80 uppercase tracking-widest">
                            {isTransfer ? 'Transfer Antar Akun' : kategori?.nama_kategori}
                        </p>
                        <h2 className="text-4xl font-black text-foreground tracking-widest">
                            {isIncome ? '+' : isTransfer ? '' : '-'}
                            {formatRupiah(transaksi.nominal)}
                        </h2>
                    </div>
                </div>

                <div className="px-8 pb-10 space-y-8">
                    {/* Compact Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/30 p-4 rounded-3xl space-y-1">
                            <span className="text-xs font-black text-muted-foreground/80 uppercase tracking-widest">Waktu</span>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                <Calendar size={12} className="text-muted-foreground" />
                                {formatTanggal(transaksi.tanggal)}
                            </div>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-3xl space-y-1">
                            <span className="text-xs font-black text-muted-foreground/80 uppercase tracking-widest">Status</span>
                            <div className={cn(
                                "text-xs font-black uppercase tracking-wider",
                                isTransfer ? "text-indigo-600" : isIncome ? "text-emerald-600" : "text-red-500"
                            )}>
                                {transaksi.jenis}
                            </div>
                        </div>
                    </div>

                    {/* Simple Ledger List */}
                    <div className="space-y-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground">
                                        <Wallet size={18} strokeWidth={2} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-muted-foreground/80 uppercase tracking-widest">{isTransfer ? 'DARI' : 'METODE'}</span>
                                        <span className="text-sm font-bold">{sumberDana?.nama_sumber || '-'}</span>
                                    </div>
                                </div>
                                {isTransfer && (
                                     <ArrowLeftRight size={14} className="text-muted-foreground/80 rotate-90" />
                                )}
                            </div>

                            {isTransfer && (
                                <div className="flex items-center gap-3 px-1">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                                        <Wallet size={18} strokeWidth={2} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">KE UNTUK</span>
                                        <span className="text-sm font-bold text-indigo-600">{sumberDanaTujuan?.nama_sumber || '-'}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Catatan Area */}
                        <div className="pt-6 border-t border-muted/50">
                            <span className="text-xs font-black text-muted-foreground/80 uppercase tracking-widest mb-3 block">Catatan</span>
                            <p className="text-sm text-foreground/70 leading-relaxed italic font-medium">
                                {transaksi.catatan || 'Tidak ada catatan khusus...'}
                            </p>
                        </div>
                    </div>

                    {/* Minimal Action Buttons */}
                    <div className="flex items-center gap-3 pt-4">
                        <Button
                            variant="secondary"
                            className="flex-1 h-12 rounded-2xl font-black text-xs uppercase tracking-widest bg-muted/50 hover:bg-muted text-foreground transition-all"
                            onClick={() => {
                                onEdit?.(transaksi);
                                onOpenChange(false);
                            }}
                        >
                            <Pencil size={14} className="mr-2" />
                            Edit
                        </Button>
                        <Button
                            variant="ghost"
                            className="flex-1 h-12 rounded-2xl font-black text-xs uppercase tracking-widest text-red-500 hover:bg-red-50 hover:text-red-600 transition-all border border-red-100"
                            onClick={() => setShowConfirmDelete(true)}
                        >
                            <Trash2 size={14} className="mr-2" />
                            Hapus
                        </Button>
                    </div>
                </div>

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
                />
            </DialogContent>
        </Dialog>
    );
}
