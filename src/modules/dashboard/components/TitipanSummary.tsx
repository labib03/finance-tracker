'use client';

import React, { useMemo, useState } from 'react';
import { useFinanceStore } from '@/lib/store';
import { formatRupiah, cn } from '@/lib/utils';
import { 
    CheckCircle2, 
    Plus,
    History,
    MoreHorizontal,
    LayoutList,
    PackageCheck,
    User,
    Briefcase,
    Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TitipanDetailPanel from './TitipanDetailPanel';
import { CardDescription } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/shared/ui/dropdown-menu';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle 
} from '@/shared/ui/dialog';
import { useRouter } from 'next/navigation';

interface TitipanSummaryProps {
    onAddClick?: () => void;
    onEditClick: (titipan: any) => void;
}

export default function TitipanSummary({ onAddClick, onEditClick }: TitipanSummaryProps) {
    const getTitipanAktif = useFinanceStore((s) => s.getTitipanAktif);
    const getSisaSaldoTitipan = useFinanceStore((s) => s.getSisaSaldoTitipan);
    const archiveTitipan = useFinanceStore((s) => s.archiveTitipan);
    const getTotalSaldoTitipanAktif = useFinanceStore((s) => s.getTotalSaldoTitipanAktif);
    const router = useRouter();

    const [detailId, setDetailId] = useState<string | null>(null);
    const [showArchive, setShowArchive] = useState(false);

    const activeTitipan = useMemo(() => getTitipanAktif(), [getTitipanAktif]);
    const totalSaldo = useMemo(() => getTotalSaldoTitipanAktif(), [getTotalSaldoTitipanAktif]);

    const handleAddTransactionFromDetail = (id: string) => {
        router.push('/transaksi/baru');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                        <PackageCheck size={24} strokeWidth={2} />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Total Dana Titipan
                        </p>
                        <h2 className="text-2xl font-black display-number text-slate-900 leading-none">
                            {formatRupiah(totalSaldo)}
                        </h2>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button 
                        variant="outline" 
                        onClick={() => setShowArchive(true)}
                        className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl flex-1 sm:flex-none flex items-center justify-center gap-2"
                    >
                        <History size={16} />
                        <span>Arsip ({useFinanceStore.getState().getTitipanSelesai().length})</span>
                    </Button>
                    {onAddClick && (
                        <Button 
                            variant="outline" 
                            onClick={onAddClick}
                            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl flex-1 sm:flex-none flex items-center justify-center gap-2"
                        >
                            <Plus size={16} />
                            <span>Titipan Baru</span>
                        </Button>
                    )}
                </div>
            </div>
            
            {activeTitipan.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-3xl border border-slate-100">
                     <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                        <PackageCheck size={24} className="text-slate-300" />
                     </div>
                     <p className="text-sm font-medium text-slate-500">Belum ada titipan aktif</p>
                     {onAddClick && (
                         <Button variant="ghost" onClick={onAddClick} className="mt-4 text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                             Buat Titipan
                         </Button>
                     )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <AnimatePresence mode='popLayout'>
                        {activeTitipan.map((t) => {
                            const sisaSaldo = getSisaSaldoTitipan(t.id_titipan);
                            const isZero = sisaSaldo === 0;
                            const isProyek = t.nama_konteks.toLowerCase().includes('proyek');
                            const iconColorClass = isZero 
                                ? "bg-slate-50 text-slate-400" 
                                : (isProyek ? "bg-sky-50 text-sky-600" : "bg-fuchsia-50 text-fuchsia-600");

                            return (
                                <motion.div 
                                    key={t.id_titipan}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    onClick={() => setDetailId(t.id_titipan)}
                                    className="group cursor-pointer p-5 rounded-[1.5rem] bg-white border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all duration-200 flex flex-col gap-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconColorClass)}>
                                            {isProyek ? <Briefcase size={18} strokeWidth={2} /> : <User size={18} strokeWidth={2} />}
                                        </div>
                                        
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    render={(props) => (
                                                        <Button 
                                                            {...props} 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <MoreHorizontal size={14} />
                                                        </Button>
                                                    )}
                                                />
                                                <DropdownMenuContent align="end" className="rounded-xl border-slate-200 bg-white shadow-lg min-w-[160px] p-1.5">
                                                    <DropdownMenuItem 
                                                        onClick={() => setDetailId(t.id_titipan)}
                                                        className="rounded-lg flex items-center gap-2 text-slate-700 cursor-pointer p-2.5 text-xs font-medium"
                                                    >
                                                        <LayoutList size={14} className="text-slate-400" />
                                                        Buka Detail
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => onEditClick(t)}
                                                        className="rounded-lg flex items-center gap-2 text-slate-700 cursor-pointer p-2.5 text-xs font-medium"
                                                    >
                                                        <Edit2 size={14} className="text-slate-400" />
                                                        Edit Nama
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        disabled={!isZero}
                                                        onClick={() => archiveTitipan(t.id_titipan)}
                                                        className={cn(
                                                            "rounded-lg flex items-center gap-2 p-2.5 text-xs font-medium mt-1 border-t border-slate-100",
                                                            isZero ? "text-rose-600 focus:text-rose-600 focus:bg-rose-50 cursor-pointer" : "text-slate-300 cursor-not-allowed"
                                                        )}
                                                    >
                                                        <CheckCircle2 size={14} className={isZero ? "text-rose-500" : "text-slate-200"} />
                                                        Tutup Amplop
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    <div>
                                        <span className={cn(
                                            "text-xs font-semibold block mb-1 truncate",
                                            isZero ? "text-slate-400" : "text-slate-500"
                                        )}>
                                            {t.nama_konteks}
                                        </span>
                                        <p className={cn(
                                            "text-lg font-bold display-number",
                                            isZero ? "text-slate-400" : "text-slate-900"
                                        )}>
                                            {formatRupiah(sisaSaldo)}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            <TitipanDetailPanel 
                titipanId={detailId}
                open={!!detailId}
                onOpenChange={(open) => !open && setDetailId(null)}
                onAddTransaction={handleAddTransactionFromDetail}
            />

            <TitipanArchiveModal 
                open={showArchive}
                onOpenChange={setShowArchive}
                onSelect={(id) => {
                    setShowArchive(false);
                    setDetailId(id);
                }}
            />
        </div>
    );
}

function TitipanArchiveModal({ open, onOpenChange, onSelect }: { open: boolean, onOpenChange: (open: boolean) => void, onSelect: (id: string) => void }) {
    const getTitipanSelesai = useFinanceStore((s) => s.getTitipanSelesai);
    const archivedList = useMemo(() => getTitipanSelesai(), [getTitipanSelesai]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-white shadow-2xl rounded-[2.5rem] flex flex-col max-h-[80vh]">
                <DialogHeader className="p-8 pb-6 bg-slate-50/50 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                            <History size={20} className="text-slate-700" strokeWidth={2.5} />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-black text-slate-900">Ruang Arsip</DialogTitle>
                            <CardDescription className="text-xs font-medium text-slate-500 mt-1">Daftar amplop yang telah diselesaikan</CardDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                    {archivedList.length === 0 ? (
                        <div className="text-center py-12">
                             <PackageCheck size={40} className="mx-auto mb-3 text-slate-200" />
                             <p className="text-xs font-bold italic text-slate-400">Belum ada arsip</p>
                        </div>
                    ) : (
                        archivedList.map((t) => (
                            <div 
                                key={t.id_titipan}
                                onClick={() => onSelect(t.id_titipan)}
                                className="flex items-center justify-between p-4 bg-slate-50 overflow-hidden hover:bg-slate-100 rounded-[1.5rem] border border-slate-100 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                                        <User size={16} className="text-slate-400 group-hover:text-slate-800 transition-colors" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{t.nama_konteks}</span>
                                </div>
                                <LayoutList size={16} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                            </div>
                        ))
                    )}
                </div>
                <div className="p-6 bg-slate-50/80 border-t border-slate-100">
                    <Button 
                        variant="ghost" 
                        onClick={() => onOpenChange(false)}
                        className="w-full text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 hover:text-slate-900 rounded-2xl h-14"
                    >
                        Tutup
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
