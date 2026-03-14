'use client';

import { useFinanceStore } from '@/lib/store';
import { formatRupiah, formatTanggalPendek, cn } from '@/lib/utils';
import { CalendarClock, ArrowRight, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';

interface RecurringReminderProps {
    onViewAll: () => void;
}

export default function RecurringReminder({ onViewAll }: RecurringReminderProps) {
    const recurringList = useFinanceStore((s) => s.recurringList);
    const kategoriList = useFinanceStore((s) => s.kategoriList);

    const upcomingReminders = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return recurringList
            .filter(r => r.aktif && r.jenis === 'Pengeluaran')
            .sort((a, b) => new Date(a.tanggal_berikutnya).getTime() - new Date(b.tanggal_berikutnya).getTime())
            .slice(0, 3);
    }, [recurringList]);

    if (upcomingReminders.length === 0) return null;

    const getKategoriName = (id: string) =>
        kategoriList.find((k) => k.id_kategori === id)?.nama_kategori || 'Kategori';

    return (
        <Card className="border-none shadow-xl bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden relative group">
            {/* Abstract background shapes for premium look */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-violet-500/20 transition-colors duration-700" />
            
            <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-base font-bold flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                            <Bell size={16} className="animate-pulse" />
                        </div>
                        Pengecekan Tagihan
                    </CardTitle>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-white/60 hover:text-white hover:bg-white/10 h-8 text-[10px] font-bold uppercase tracking-widest px-3 rounded-lg border border-white/5"
                        onClick={onViewAll}
                    >
                        Semua <ArrowRight size={12} className="ml-1.5" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 relative z-10">
                {upcomingReminders.map((r, idx) => {
                    const nextDate = new Date(r.tanggal_berikutnya);
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    
                    let statusText = `${diffDays} hari lagi`;
                    let statusColor = "text-indigo-300";
                    
                    if (diffDays === 0) {
                        statusText = 'Hari ini';
                        statusColor = "text-red-400 font-black";
                    } else if (diffDays === 1) {
                        statusText = 'Besok';
                        statusColor = "text-orange-400";
                    } else if (diffDays < 0) {
                        statusText = 'Terlewati';
                        statusColor = "text-slate-400";
                    }

                    return (
                        <div 
                            key={r.id} 
                            className="flex items-center justify-between p-3.5 rounded-2xl bg-white/3 hover:bg-white/8 backdrop-blur-xl border border-white/5 transition-all duration-300 group/item"
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-white/5 to-white/10 flex items-center justify-center text-white/50 border border-white/10 group-hover/item:text-indigo-400 transition-colors">
                                    <CalendarClock size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate group-hover/item:text-indigo-200 transition-colors">{getKategoriName(r.id_kategori)}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] text-white/40 font-medium">
                                            {formatTanggalPendek(r.tanggal_berikutnya)}
                                        </span>
                                        <span className="text-[8px] opacity-30 text-white">•</span>
                                        <span className={cn("text-[10px] font-bold uppercase tracking-tighter", statusColor)}>
                                            {statusText}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right ml-4">
                                <p className="text-sm font-black display-number text-white group-hover/item:scale-105 transition-transform origin-right tracking-tight">
                                    {formatRupiah(r.nominal)}
                                </p>
                                <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-0.5">
                                    {r.frekuensi}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
            
            <div className="px-5 pb-4 pt-2 relative z-10 border-t border-white/3 mt-2">
                <p className="text-[10px] text-white/30 font-medium flex items-center gap-1.5 italic">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    Beralih ke menu Transaksi Berulang untuk membayar
                </p>
            </div>
        </Card>
    );
}
