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

    const getKategoriName = (id: string) =>
        kategoriList.find((k) => k.id_kategori === id)?.nama_kategori || 'Kategori';

    return (
        <Card className="bg-white rounded-[2.5rem] border border-border/40 shadow-scandi overflow-hidden transition-all duration-500 hover:shadow-float relative group min-h-[400px]">
            {/* Minimalist Background Accent */}
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-100/50 transition-all duration-1000" />

            <CardHeader className="pb-4 pt-8 px-8 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center border border-indigo-100 shadow-xs">
                            <Bell size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-foreground">
                                Jadwal Tagihan
                            </CardTitle>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter mt-0.5">Pengingat Otomatis</p>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-2 pb-8 px-8 relative z-10">
                {upcomingReminders.length > 0 ? (
                    upcomingReminders.map((r) => {
                        const nextDate = new Date(r.tanggal_berikutnya);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                        let statusText = `${diffDays} HARI LAGI`;
                        let statusColor = "text-muted-foreground/40";

                        if (diffDays === 0) {
                            statusText = 'HARI INI';
                            statusColor = "text-rose-500 font-black";
                        } else if (diffDays === 1) {
                            statusText = 'BESOK';
                            statusColor = "text-amber-500";
                        } else if (diffDays < 0) {
                            statusText = 'TERLEWATI';
                            statusColor = "text-slate-400";
                        }

                        return (
                            <div
                                key={r.id}
                                className="flex items-center justify-between py-4 border-b border-border/30 last:border-0 group/item transition-all duration-300"
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black text-foreground uppercase tracking-widest truncate group-hover/item:text-indigo-600 transition-colors">
                                            {r.catatan}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-muted-foreground font-black display-number opacity-60">
                                                {formatTanggalPendek(r.tanggal_berikutnya)}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground font-black display-number opacity-60">
                                                {getKategoriName(r.id_kategori)}
                                            </span>
                                            {diffDays <= 3 && (
                                                <>
                                                    <div className="w-1 h-1 rounded-full bg-border" />
                                                    <span className={cn("text-[9px] font-black uppercase tracking-widest", statusColor)}>
                                                        {statusText}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right ml-4">
                                    <p className="text-sm font-black display-number text-foreground tracking-tighter group-hover/item:scale-105 transition-transform origin-right duration-300">
                                        {formatRupiah(r.nominal)}
                                    </p>
                                    <p className="text-[9px] text-muted-foreground/30 font-black uppercase tracking-[0.2em] mt-0.5">
                                        {r.frekuensi}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 opacity-30 text-center space-y-4">
                        <div className="w-16 h-16 rounded-[2rem] bg-muted flex items-center justify-center">
                            <CalendarClock size={28} className="text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest">Tidak Ada Tagihan</p>
                            <p className="text-[10px] font-bold mt-1">Semua kewajiban telah terpenuhi.</p>
                        </div>
                    </div>
                )}

                <div className="pt-4">
                    <Button
                        variant="ghost"
                        className="w-full text-muted-foreground/40 hover:text-foreground hover:bg-muted/50 h-11 text-[9px] font-black uppercase tracking-[0.3em] rounded-2xl border border-dashed border-border/60 transition-all duration-500"
                        onClick={onViewAll}
                    >
                        Kelola Jadwal <ArrowRight size={12} className="ml-2" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
