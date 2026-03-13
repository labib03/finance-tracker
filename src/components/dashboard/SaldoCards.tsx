'use client';

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/store';
import { formatRupiah, hitungSaldoAkun } from '@/lib/utils';
import { Banknote, CreditCard, Smartphone, Wallet } from 'lucide-react';

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
        <div>
            <div className="flex items-center gap-2 mb-4">
                <div className="pulse-dot" />
                <h2
                    className="text-sm font-bold uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                >
                    Saldo Real-time
                </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {saldoAkun.map((akun) => {
                    const Icon = iconMap[akun.nama_sumber] || Wallet;

                    return (
                        <div
                            key={akun.id_sumber_dana}
                            className="bg-white border border-gray-200/60 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 cursor-default shadow-sm hover:shadow-md"
                        >
                            <div className="flex items-center justify-between mb-5">
                                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
                                    <Icon size={22} className="text-gray-700" />
                                </div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 px-3 py-1 rounded-full">
                                    {akun.nama_sumber}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 font-medium mb-1">Saldo Tersedia</p>
                            <p className="display-number text-2xl font-bold text-gray-900 tracking-tight">
                                {formatRupiah(akun.saldo)}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
