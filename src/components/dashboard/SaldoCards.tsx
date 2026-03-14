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
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="pulse-dot bg-primary" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Saldo Real-time
                </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {saldoAkun.map((akun) => {
                    const Icon = iconMap[akun.nama_sumber] || Wallet;

                    return (
                        <Card 
                            key={akun.id_sumber_dana}
                            className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border-2 hover:border-primary/20"
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                                    <Icon size={20} className="text-primary/70" />
                                </div>
                                <Badge variant="secondary" className="px-2 py-0 h-5 font-bold tracking-tight uppercase text-[9px]">
                                    {akun.nama_sumber}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground font-medium mb-1">Saldo Tersedia</p>
                                <p className="text-xl font-bold tracking-tight">
                                    {formatRupiah(akun.saldo)}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
