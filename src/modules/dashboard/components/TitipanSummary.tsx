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
import { Button, buttonVariants } from '@/shared/ui/button';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/shared/ui/dropdown-menu';

interface TitipanSummaryProps {
    onAddClick?: () => void;
    onEditClick: (titipan: any) => void;
}

export default function TitipanSummary({ onAddClick, onEditClick }: TitipanSummaryProps) {
    const titipanList = useFinanceStore((s) => s.titipanList);
    const getSisaSaldoTitipan = useFinanceStore((s) => s.getSisaSaldoTitipan);
    const updateTitipanStatus = useFinanceStore((s) => s.updateTitipanStatus);
    const getTotalSaldoTitipanAktif = useFinanceStore((s) => s.getTotalSaldoTitipanAktif);
    const setActiveModal = useFinanceStore((s) => s.setActiveModal);

    const [detailId, setDetailId] = useState<string | null>(null);

    const activeTitipan = useMemo(() => 
        titipanList.filter(t => t.status === 'aktif'),
    [titipanList]);

    const totalSaldo = useMemo(() => getTotalSaldoTitipanAktif(), [getTotalSaldoTitipanAktif]);

    const handleAddTransactionFromDetail = (id: string) => {
        setActiveModal('transaksi');
        // Pre-filled logic would usually go in the store or as a specific action
    };

    if (activeTitipan.length === 0) {
        return (
            <Card className="border border-white/40 bg-white/60 backdrop-blur-xl shadow-scandi rounded-[2.5rem] overflow-hidden group">
                <CardHeader className="p-8 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B7280]">
                                Total Dana Titipan
                            </CardTitle>
                        </div>
                        {onAddClick && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={onAddClick}
                                className="bg-[#D9AA69]/10 text-[#D9AA69] hover:bg-[#D9AA69]/20 rounded-2xl"
                            >
                                <Plus size={20} />
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                    <div className="flex flex-col items-center justify-center py-8 text-center bg-[#F9FAFB] rounded-[2rem] border border-dashed border-[#E5E7EB]">
                         <div className="w-16 h-16 rounded-full bg-[#D9AA69]/5 flex items-center justify-center mb-4">
                            <PackageCheck size={32} className="text-[#D9AA69]/40" />
                         </div>
                         <p className="text-sm font-bold text-[#374151]">Belum ada titipan aktif</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className="border border-[#E5E7EB] bg-white shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] overflow-hidden flex flex-col h-full min-h-[400px] max-h-[600px] group/main">
                <CardHeader className="p-10 pb-6 relative shrink-0 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.02)] z-20">
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-[1.25rem] bg-[#F9FAFB] flex items-center justify-center border border-[#F3F4F6]">
                                <PackageCheck size={28} className="text-[#D9AA69]" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#6B7280] leading-none mb-2">
                                    Total Dana Titipan
                                </p>
                                <CardTitle className="text-3xl font-black display-number text-[#D9AA69] tracking-tight leading-none">
                                    {formatRupiah(totalSaldo)}
                                </CardTitle>
                            </div>
                        </div>
                        {onAddClick && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={onAddClick}
                                className="bg-[#F9FAFB] text-[#D9AA69] hover:bg-[#F3F4F6] rounded-2xl border border-[#F3F4F6] w-12 h-12 transition-all duration-300"
                            >
                                <Plus size={22} />
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-8 pt-6 flex-1 overflow-y-auto overflow-x-hidden relative z-10 scroll-smooth scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#D9AA69]/10 hover:scrollbar-thumb-[#D9AA69]/20">
                    <div className="space-y-4 pb-4">
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
                                        whileHover={{ y: -2 }}
                                        onClick={() => setDetailId(t.id_titipan)}
                                        className="group/item cursor-pointer relative p-5 rounded-2xl bg-[#FFFFFF] border border-[#F3F4F6] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.04)] hover:border-[#D9AA69]/20 transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4 min-w-0 flex-1">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                                    isZero ? "bg-[#F9FAFB] text-[#9CA3AF]" : "bg-[#FDF8F3] text-[#D9AA69]"
                                                )}>
                                                    {t.nama_konteks.toLowerCase().includes('proyek') ? <Briefcase size={18} /> : <User size={18} />}
                                                </div>
                                                <span className={cn(
                                                    "text-sm font-bold truncate transition-colors",
                                                    isZero ? "text-[#9CA3AF]" : "text-[#374151]"
                                                )}>
                                                    {t.nama_konteks}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4 shrink-0">
                                                <p className={cn(
                                                    "text-sm font-black display-number transition-colors",
                                                    isZero ? "text-[#E5E7EB]" : "text-[#D9AA69]"
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
                                                                    className="h-8 w-8 rounded-lg hover:bg-[#F9FAFB] text-[#D1D5DB] hover:text-[#374151]"
                                                                >
                                                                    <MoreHorizontal size={16} />
                                                                </Button>
                                                            )}
                                                        />
                                                        <DropdownMenuContent align="end" className="rounded-xl border-[#F3F4F6] bg-white shadow-xl min-w-[180px] p-1.5 overflow-hidden">
                                                            <DropdownMenuItem 
                                                                onClick={() => setDetailId(t.id_titipan)}
                                                                className="rounded-lg flex items-center gap-3 text-[#374151] hover:bg-[#F9FAFB] cursor-pointer p-2.5 font-bold text-xs"
                                                            >
                                                                <LayoutList size={16} className="text-[#D9AA69]" />
                                                                Buka Detail
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => onEditClick(t)}
                                                                className="rounded-lg flex items-center gap-3 text-[#374151] hover:bg-[#F9FAFB] cursor-pointer p-2.5 font-bold text-xs"
                                                            >
                                                                <Plus size={16} className="text-[#D9AA69] rotate-45" />
                                                                Edit Nama
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                disabled={!isZero}
                                                                onClick={() => updateTitipanStatus(t.id_titipan, 'selesai')}
                                                                className={cn(
                                                                    "rounded-lg flex items-center gap-3 p-2.5 font-bold text-xs",
                                                                    isZero ? "text-[#374151] hover:bg-[#F9FAFB] cursor-pointer" : "text-[#D1D5DB] cursor-not-allowed"
                                                                )}
                                                            >
                                                                <CheckCircle2 size={16} className={isZero ? "text-[#D9AA69]" : "text-[#E5E7EB]"} />
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
                </CardContent>
            </Card>

            <TitipanDetailPanel 
                titipanId={detailId}
                open={!!detailId}
                onOpenChange={(open) => !open && setDetailId(null)}
                onAddTransaction={handleAddTransactionFromDetail}
            />
        </>
    );
}
