'use client';

import { useFinanceStore } from '@/lib/store';
import { formatRupiah, formatTanggalPendek, cn, getJadwalTerdekat, getToday } from '@/lib/utils';
import { CalendarClock, ArrowRight, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { useMemo } from 'react';
import type { RecurringTransaction } from '@/lib/types';
import { Plus } from 'lucide-react';

interface RecurringReminderProps {
    onViewAll: () => void;
    onProcess: (recurring: RecurringTransaction) => void;
}

export default function RecurringReminder({ onViewAll, onProcess }: RecurringReminderProps) {
    const recurringList = useFinanceStore((s) => s.recurringList);
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const kategoriList = useFinanceStore((s) => s.kategoriList);

    const upcomingReminders = useMemo(() => {
        return recurringList
            .filter(r => {
                if (!r.aktif || r.jenis !== 'Pengeluaran') return false;
                
                const effectiveDateStr = getJadwalTerdekat(r.tanggal_mulai, r.tanggal_berikutnya);
                
                // Cek apakah sudah ada transaksi yang dicatat untuk jadwal ini
                const isAlreadyRecorded = transaksiList.some(t => 
                    t.id_kategori === r.id_kategori && 
                    t.nominal === r.nominal && 
                    t.tanggal === effectiveDateStr &&
                    t.jenis === r.jenis &&
                    t.label === r.label
                );

                return !isAlreadyRecorded;
            })
            .sort((a, b) => {
                const dateA = getJadwalTerdekat(a.tanggal_mulai, a.tanggal_berikutnya);
                const dateB = getJadwalTerdekat(b.tanggal_mulai, b.tanggal_berikutnya);
                return new Date(dateA).getTime() - new Date(dateB).getTime();
            })
            .slice(0, 3);
    }, [recurringList, transaksiList]);

    const getKategoriName = (id: string) =>
        kategoriList.find((k) => k.id_kategori === id)?.nama_kategori || 'Kategori';

    return (
        <Card className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-border/40 shadow-scandi overflow-hidden transition-all duration-500 hover:shadow-float relative group min-h-[400px]">
            {/* Minimalist Background Accent */}
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-indigo-50/80 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-100 transition-all duration-1000" />

            <CardHeader className="pb-4 pt-6 sm:pt-8 px-6 sm:px-8 relative z-10 border-b border-slate-100/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[1rem] bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-sm">
                            <Bell size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-900">
                                Jadwal Tagihan
                            </CardTitle>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Pengingat Otomatis</p>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 pb-6 sm:pb-8 px-6 sm:px-8 relative z-10 bg-slate-50/30">
                {upcomingReminders.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        {upcomingReminders.map((r) => {
                            const effectiveDateStr = getJadwalTerdekat(r.tanggal_mulai, r.tanggal_berikutnya);
                            const todayStr = getToday();
                            
                            let diffDays = 0;
                            if (effectiveDateStr !== todayStr) {
                                const nextDate = new Date(effectiveDateStr + 'T00:00:00');
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                            }

                            let statusText = `${diffDays} HARI LAGI`;
                            let statusClasses = "bg-slate-100 text-slate-500 border border-slate-200/50";

                            if (effectiveDateStr === todayStr) {
                                statusText = 'HARI INI';
                                statusClasses = "bg-rose-50 text-rose-600 border border-rose-100";
                            } else if (diffDays === 1) {
                                statusText = 'BESOK';
                                statusClasses = "bg-amber-50 text-amber-600 border border-amber-100";
                            } else if (diffDays < 0) {
                                statusText = 'TERLEWATI';
                                statusClasses = "bg-slate-200 text-slate-600 border border-slate-300";
                            }

                            return (
                                <div
                                    key={r.id}
                                    className="group/item relative bg-white p-4 rounded-[1.5rem] border border-slate-100 hover:border-slate-200 transition-all duration-300 flex items-center justify-between gap-4 shadow-sm"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100/50 shadow-xs group-hover/item:scale-110 transition-transform duration-300">
                                            <CalendarClock size={18} strokeWidth={2.5} className="text-slate-400" />
                                        </div>
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <p className="text-sm font-black text-slate-800 uppercase tracking-widest truncate group-hover/item:text-indigo-600 transition-colors">
                                                {r.label}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                                                    {formatTanggalPendek(effectiveDateStr)}
                                                </span>
                                                <span className="text-slate-300">•</span>
                                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 truncate">
                                                    {getKategoriName(r.id_kategori)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end gap-2 ml-2 shrink-0">
                                        <p className="text-[13px] font-black display-number text-slate-900 tracking-widest group-hover/item:scale-105 transition-transform origin-right duration-300">
                                            {formatRupiah(r.nominal)}
                                        </p>
                                        
                                        <div className="flex items-center gap-2">
                                            {diffDays <= 3 && diffDays !== 0 && (
                                                <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md", statusClasses)}>
                                                    {statusText}
                                                </span>
                                            )}
                                            
                                            {diffDays === 0 ? (
                                                <Button
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onProcess(r);
                                                    }}
                                                    className="h-7 px-3 rounded-[0.5rem] bg-rose-500 hover:bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest shadow-md shadow-rose-500/20 transition-all hover:scale-105 active:scale-95 border-none"
                                                >
                                                    <Plus size={10} className="mr-1" strokeWidth={4} />
                                                    Bayar
                                                </Button>
                                            ) : (
                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                                    {r.frekuensi}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 opacity-40 text-center space-y-4">
                        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center border border-dashed border-slate-300">
                            <CalendarClock size={32} className="text-slate-400" />
                        </div>
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-600">Terbebas Tagihan</p>
                            <p className="text-[10px] font-bold mt-1 text-slate-500 tracking-widest uppercase">Semua kewajiban telah terpenuhi.</p>
                        </div>
                    </div>
                )}

                <div className="pt-4">
                    <Button
                        variant="ghost"
                        className="w-full text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 h-12 text-[10px] font-black uppercase tracking-[0.2em] rounded-[1rem] border border-dashed border-slate-200 transition-all duration-300"
                        onClick={onViewAll}
                    >
                        Kelola Jadwal Lengkap <ArrowRight size={14} strokeWidth={2.5} className="ml-2" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
