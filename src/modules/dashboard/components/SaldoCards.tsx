'use client';

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/store';
import { formatRupiah, hitungSaldoAkun } from '@/lib/utils';
import { Banknote, CreditCard, Smartphone, Wallet, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { cn } from '@/lib/utils';

const iconMap: Record<string, typeof Wallet> = {
    Cash: Banknote,
    Mandiri: CreditCard,
    ATM: CreditCard,
    'E-Wallet': Smartphone,
};

interface SaldoCardsProps {
    onAddAccount?: () => void;
}

export default function SaldoCards({ onAddAccount }: SaldoCardsProps) {
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
    const transaksiList = useFinanceStore((s) => s.transaksiList);

    const saldoAkun = useMemo(
        () => hitungSaldoAkun(sumberDanaList, transaksiList),
        [sumberDanaList, transaksiList]
    );

    const totalSaldo = useMemo(() => {
        return saldoAkun.reduce((total, akun) => total + akun.saldo, 0);
    }, [saldoAkun]);

    return (
        <Card className="border border-slate-200 bg-white shadow-sm rounded-[2.5rem] overflow-hidden flex flex-col h-full min-h-[500px] max-h-[600px] relative">
            <CardHeader className="p-8 pb-6 shrink-0 relative z-20 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[1rem] bg-slate-100 flex items-center justify-center border border-slate-200/50 text-slate-900 shadow-sm relative">
                            <Wallet size={24} strokeWidth={2.5} />
                            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 leading-none mb-2">
                                Status Saldo Likuid
                            </p>
                            <CardTitle className="text-3xl font-black display-number text-slate-950 tracking-tight leading-none">
                                {formatRupiah(totalSaldo)}
                            </CardTitle>
                        </div>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="p-4 flex-1 overflow-y-auto overflow-x-hidden relative z-10 scroll-smooth custom-scrollbar">
                {saldoAkun.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-dashed border-slate-200">
                            <Wallet size={24} className="text-slate-300" />
                            </div>
                            <p className="text-sm font-bold text-slate-400">Belum ada akun dompet</p>
                    </div>
                ) : (
                    <div className="space-y-3 pb-2">
                        {saldoAkun.map((akun) => {
                            const Icon = iconMap[akun.nama_sumber] || Wallet;
                            return (
                                <div 
                                    key={akun.id_sumber_dana}
                                    className="group relative p-4 rounded-[1.5rem] bg-slate-50 border border-slate-100/50 hover:bg-slate-100 hover:border-slate-200 transition-all duration-300 flex items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-4 min-w-0 flex-1">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm bg-white border border-slate-100 text-slate-600 group-hover:text-slate-900">
                                            <Icon size={18} strokeWidth={2.5} />
                                        </div>
                                        <span className="text-sm font-bold truncate text-slate-800 transition-colors">
                                            {akun.nama_sumber}
                                        </span>
                                    </div>

                                    <div className="flex items-center shrink-0 pr-2">
                                        <p className="text-base font-black display-number text-slate-900 transition-colors">
                                            {formatRupiah(akun.saldo)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>

            <div className="p-4 shrink-0 relative z-20 border-t border-slate-100 bg-white">
                <button 
                    onClick={onAddAccount}
                    className="w-full group/add relative flex items-center justify-between p-4 rounded-[1.5rem] bg-slate-900 hover:bg-slate-800 transition-all duration-300 border border-transparent hover:shadow-lg shadow-slate-900/20 active:scale-[0.98]"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shadow-sm text-white group-hover/add:bg-white/20 transition-colors border border-white/5">
                            <Plus size={18} strokeWidth={2.5} />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 group-hover/add:text-slate-300 leading-none mb-1.5">
                                Aksi Baru
                            </p>
                            <p className="text-xs font-bold text-white group-hover/add:text-white">
                                Tambah Akun / Dompet
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                            <Plus size={14} className="text-white group-hover/add:rotate-90 transition-transform duration-300" />
                        </div>
                    </div>
                </button>
            </div>
        </Card>
    );
}
