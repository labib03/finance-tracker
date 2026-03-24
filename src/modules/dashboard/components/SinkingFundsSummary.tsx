'use client';

import { useFinanceStore } from '@/lib/store';
import { formatRupiah, cn } from '@/lib/utils';
import { PiggyBank, ChevronRight, Target, Car, Home, Plane, GraduationCap, Laptop, Smartphone, HeartPulse, CheckCircle2 } from 'lucide-react';
import { useMemo } from 'react';

const ICON_MAP: Record<string, React.ElementType> = {
    Target, PiggyBank, Car, Home, Plane, GraduationCap, Laptop, Smartphone, HeartPulse,
};

interface SinkingFundsSummaryProps {
    onViewAll: () => void;
}

export default function SinkingFundsSummary({ onViewAll }: SinkingFundsSummaryProps) {
    const tabunganList = useFinanceStore((s) => s.tabunganList);
    const getSaldoTabungan = useFinanceStore((s) => s.getSaldoTabungan);
    const getProgresTabungan = useFinanceStore((s) => s.getProgresTabungan);

    const activeTabungan = useMemo(
        () => tabunganList.filter((t) => t.status === 'aktif').slice(0, 3),
        [tabunganList]
    );

    const totalTerkumpul = useMemo(
        () => tabunganList.reduce((sum, t) => sum + getSaldoTabungan(t.id_tabungan), 0),
        [tabunganList, getSaldoTabungan]
    );

    const totalTarget = useMemo(
        () => tabunganList.reduce((sum, t) => sum + t.target_nominal, 0),
        [tabunganList]
    );

    if (tabunganList.length === 0) return null;

    return (
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white shadow-scandi p-5 sm:p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <PiggyBank size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800">
                            Sinking Funds
                        </h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {tabunganList.length} Tujuan Aktif
                        </p>
                    </div>
                </div>
                <button
                    onClick={onViewAll}
                    className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                    Lihat Semua <ChevronRight size={13} strokeWidth={3} />
                </button>
            </div>

            {/* Aggregate Progress */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-600">Total Terkumpul</span>
                    <span className="text-indigo-600">{formatRupiah(totalTerkumpul)}</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                        style={{ width: `${totalTarget > 0 ? Math.min((totalTerkumpul / totalTarget) * 100, 100) : 0}%` }}
                    />
                </div>
                <p className="text-[9px] font-bold text-slate-400 text-right uppercase tracking-widest">
                    dari {formatRupiah(totalTarget)}
                </p>
            </div>

            {/* Individual Fund List */}
            <div className="space-y-3">
                {activeTabungan.map((t) => {
                    const saldo = getSaldoTabungan(t.id_tabungan);
                    const progres = getProgresTabungan(t.id_tabungan);
                    const isTercapai = progres >= 100;
                    const IconComp = ICON_MAP[t.icon] || Target;
                    return (
                        <div key={t.id_tabungan} className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                {isTercapai ? <CheckCircle2 size={18} className="text-emerald-500" /> : <IconComp size={16} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 truncate">
                                        {t.nama_tujuan}
                                    </span>
                                    <span className={cn(
                                        "text-[9px] font-black tracking-widest ml-2 shrink-0",
                                        isTercapai ? "text-emerald-600" : "text-slate-400"
                                    )}>
                                        {Math.floor(progres)}%
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={cn('h-full rounded-full transition-all duration-700', isTercapai ? 'bg-emerald-500' : 'bg-indigo-400')}
                                        style={{ width: `${Math.min(progres, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}

                {tabunganList.length > 3 && (
                    <p className="text-center text-[9px] font-black uppercase tracking-widest text-slate-400 pt-1">
                        +{tabunganList.length - 3} tabungan lainnya
                    </p>
                )}
            </div>
        </div>
    );
}
