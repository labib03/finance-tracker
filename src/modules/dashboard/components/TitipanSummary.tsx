'use client';

import { useMemo, useState } from 'react';
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
    Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TitipanDetailPanel from './TitipanDetailPanel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
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

interface TitipanSummaryProps {
    onAddClick?: () => void;
    onEditClick: (titipan: any) => void;
}

export default function TitipanSummary({ onAddClick, onEditClick }: TitipanSummaryProps) {
    const getTitipanAktif = useFinanceStore((s) => s.getTitipanAktif);
    const getSisaSaldoTitipan = useFinanceStore((s) => s.getSisaSaldoTitipan);
    const archiveTitipan = useFinanceStore((s) => s.archiveTitipan);
    const getTotalSaldoTitipanAktif = useFinanceStore((s) => s.getTotalSaldoTitipanAktif);
    const setActiveModal = useFinanceStore((s) => s.setActiveModal);

    const [detailId, setDetailId] = useState<string | null>(null);
    const [showArchive, setShowArchive] = useState(false);

    const activeTitipan = useMemo(() => getTitipanAktif(), [getTitipanAktif]);
    const totalSaldo = useMemo(() => getTotalSaldoTitipanAktif(), [getTotalSaldoTitipanAktif]);

    const handleAddTransactionFromDetail = (id: string) => {
        setActiveModal('transaksi');
    };

    return (
        <>
            <Card className="border border-slate-200 bg-white shadow-sm rounded-[2.5rem] overflow-hidden flex flex-col h-full min-h-[500px] max-h-[600px] relative">
                <CardHeader className="p-8 pb-6 shrink-0 relative z-20 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[1rem] bg-slate-100 flex items-center justify-center border border-slate-200/50 text-slate-900 shadow-sm">
                                <PackageCheck size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 leading-none mb-2">
                                    Total Dana Titipan
                                </p>
                                <CardTitle className="text-3xl font-black display-number text-slate-950 tracking-tight leading-none">
                                    {formatRupiah(totalSaldo)}
                                </CardTitle>
                            </div>
                        </div>
                        {onAddClick && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={onAddClick}
                                className="bg-slate-900 text-white hover:bg-slate-800 hover:text-white rounded-[1rem] shadow-md w-10 h-10 transition-all duration-300 hover:scale-105 active:scale-95"
                            >
                                <Plus size={20} strokeWidth={2.5} />
                            </Button>
                        )}
                    </div>
                </CardHeader>
                
                <CardContent className="p-4 flex-1 overflow-y-auto overflow-x-hidden relative z-10 scroll-smooth custom-scrollbar">
                    {activeTitipan.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                             <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-dashed border-slate-200">
                                <PackageCheck size={24} className="text-slate-300" />
                             </div>
                             <p className="text-sm font-bold text-slate-400">Belum ada titipan aktif</p>
                        </div>
                    ) : (
                        <div className="space-y-3 pb-2">
                            <AnimatePresence mode='popLayout'>
                                {activeTitipan.map((t) => {
                                    const sisaSaldo = getSisaSaldoTitipan(t.id_titipan);
                                    const isZero = sisaSaldo === 0;
                                    return (
                                        <motion.div 
                                            key={t.id_titipan}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            onClick={() => setDetailId(t.id_titipan)}
                                            className="group cursor-pointer relative p-4 rounded-[1.5rem] bg-slate-50 border border-slate-100/50 hover:bg-slate-100 hover:border-slate-200 transition-all duration-300"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm bg-white border border-slate-100",
                                                        isZero ? "text-slate-300" : "text-slate-600 group-hover:text-slate-900"
                                                    )}>
                                                        {t.nama_konteks.toLowerCase().includes('proyek') ? <Briefcase size={18} strokeWidth={2.5} /> : <User size={18} strokeWidth={2.5} />}
                                                    </div>
                                                    <span className={cn(
                                                        "text-sm font-bold truncate transition-colors",
                                                        isZero ? "text-slate-400" : "text-slate-800"
                                                    )}>
                                                        {t.nama_konteks}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-3 shrink-0">
                                                    <p className={cn(
                                                        "text-base font-black display-number transition-colors",
                                                        isZero ? "text-slate-300" : "text-slate-900"
                                                    )}>
                                                        {formatRupiah(sisaSaldo)}
                                                    </p>
                                                    
                                                    <div onClick={(e) => e.stopPropagation()}>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger
                                                                render={(props) => (
                                                                    <Button 
                                                                        {...props} 
                                                                        variant="ghost" 
                                                                        size="icon" 
                                                                        className="h-8 w-8 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-800 transition-all shadow-sm shadow-transparent hover:shadow-sm"
                                                                    >
                                                                        <MoreHorizontal size={16} />
                                                                    </Button>
                                                                )}
                                                            />
                                                            <DropdownMenuContent align="end" className="rounded-xl border-slate-200 bg-white shadow-xl min-w-[180px] p-2">
                                                                <DropdownMenuItem 
                                                                    onClick={() => setDetailId(t.id_titipan)}
                                                                    className="rounded-lg flex items-center gap-3 text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer p-3 font-bold text-xs"
                                                                >
                                                                    <LayoutList size={16} className="text-slate-500" />
                                                                    Buka Detail
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem 
                                                                    onClick={() => onEditClick(t)}
                                                                    className="rounded-lg flex items-center gap-3 text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer p-3 font-bold text-xs"
                                                                >
                                                                    <Plus size={16} className="text-slate-500 rotate-45" />
                                                                    Edit Nama
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem 
                                                                    disabled={!isZero}
                                                                    onClick={() => archiveTitipan(t.id_titipan)}
                                                                    className={cn(
                                                                        "rounded-lg flex items-center gap-3 p-3 font-bold text-xs mt-1 border-t border-slate-100",
                                                                        isZero ? "text-rose-600 hover:bg-rose-50 hover:text-rose-700 cursor-pointer" : "text-slate-300 cursor-not-allowed"
                                                                    )}
                                                                >
                                                                    <CheckCircle2 size={16} className={isZero ? "text-rose-500" : "text-slate-200"} />
                                                                    Tutup Amplop
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </CardContent>
                
                <div className="p-4 shrink-0 relative z-20 border-t border-slate-100 bg-white">
                    <button 
                        onClick={() => setShowArchive(true)}
                        className="w-full group/archive relative flex items-center justify-between p-4 rounded-[1.5rem] bg-slate-50 hover:bg-slate-100 transition-all duration-300 border border-transparent hover:border-slate-200"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm text-slate-400 group-hover/archive:text-slate-900 transition-colors">
                                <History size={18} strokeWidth={2.5} />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 group-hover/archive:text-slate-500 leading-none mb-1.5">
                                    Penyimpanan
                                </p>
                                <p className="text-xs font-bold text-slate-600 group-hover/archive:text-slate-900">
                                    Lihat Riwayat Arsip
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-black text-slate-700 shadow-sm">
                                {useFinanceStore.getState().getTitipanSelesai().length}
                            </div>
                            <Plus size={14} className="text-slate-300 group-hover/archive:text-slate-600 rotate-45 transition-colors" />
                        </div>
                    </button>
                </div>
            </Card>

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
        </>
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
