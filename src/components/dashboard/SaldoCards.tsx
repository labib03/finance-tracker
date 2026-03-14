'use client';

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/store';
import { formatRupiah, hitungSaldoAkun } from '@/lib/utils';
import { Banknote, CreditCard, Smartphone, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const iconMap: Record<string, typeof Wallet> = {
    Cash: Banknote,
    ATM: CreditCard,
    'E-Wallet': Smartphone,
};

export default function SaldoCards() {
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
    const transaksiList = useFinanceStore((s) => s.transaksiList);

    const saldoAkun = useMemo(
        () => hitungSaldoAkun(sumberDanaList, transaksiList),
        [sumberDanaList, transaksiList]
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                        Status Saldo Likuid
                    </h2>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {saldoAkun.map((akun) => {
                    const Icon = iconMap[akun.nama_sumber] || Wallet;

                    return (
                        <Card 
                            key={akun.id_sumber_dana}
                            className="group transition-all duration-700 hover:-translate-y-2 hover:shadow-float rounded-[2.5rem] border border-border/40 shadow-scandi overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-muted/20 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/5 transition-colors duration-1000" />
                            
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-8 pb-4 relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-muted/30 flex items-center justify-center border border-transparent group-hover:bg-white group-hover:border-border/40 group-hover:shadow-scandi transition-all duration-500">
                                    <Icon size={22} strokeWidth={2.5} className="text-foreground/40 group-hover:text-primary transition-colors duration-500" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 group-hover:text-primary/60 transition-colors">
                                    {akun.nama_sumber}
                                </span>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 mb-1 italic">Tersedia</p>
                                <p className="text-2xl font-black tracking-tighter text-foreground display-number group-hover:scale-105 transition-transform origin-left duration-500">
                                    {formatRupiah(akun.saldo)}
                                </p>
                            </CardContent>
                            
                            <div className="px-8 pb-6 relative z-10">
                                <div className="w-full h-1 bg-muted/30 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-400 opacity-40 w-full" />
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
