'use client';

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/store';
import { formatRupiah, hitungSaldoAkun } from '@/lib/utils';
import { Banknote, CreditCard, Smartphone, Wallet, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';

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

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <h2 className="text-[11px] font-black uppercase tracking-widest text-[#6B7280]">
                        Status Saldo Likuid
                    </h2>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {saldoAkun.map((akun) => {
                    const Icon = iconMap[akun.nama_sumber] || Wallet;

                    return (
                        <Card 
                            key={akun.id_sumber_dana}
                            className="group relative transition-all duration-500 hover:-translate-y-2 rounded-[2.5rem] border border-[#E5E7EB] bg-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-[#10b981]/5 rounded-full blur-3xl group-hover:bg-[#10b981]/10 transition-colors duration-700" />
                            
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-8 pb-4 relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-[#F9FAFB] flex items-center justify-center border border-[#F3F4F6] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                                    <Icon size={24} strokeWidth={2.5} className="text-[#10b981]" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9CA3AF]">
                                    {akun.nama_sumber}
                                </span>
                            </CardHeader>
                            
                            <CardContent className="px-8 pb-8 pt-2 relative z-10">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-[#6B7280]/60 mb-2">Tersedia</p>
                                <p className="text-3xl font-black tracking-tighter text-[#1F2937] display-number truncate leading-none">
                                    {formatRupiah(akun.saldo)}
                                </p>
                            </CardContent>
                            
                            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-[#F9FAFB]">
                                <div className="h-full bg-[#10b981]/40 w-full" />
                            </div>
                        </Card>
                    );
                })}

                <button 
                    onClick={onAddAccount}
                    className="group relative flex flex-col items-center justify-center gap-4 p-8 rounded-[2.5rem] border-2 border-dashed border-[#E5E7EB] hover:border-[#10b981]/40 hover:bg-[#FDF8F3]/30 transition-all duration-500 cursor-pointer h-full min-h-[160px]"
                >
                    <div className="w-12 h-12 rounded-full bg-[#F3F4F6] group-hover:bg-[#10b981]/10 flex items-center justify-center text-[#9CA3AF] group-hover:text-[#10b981] transition-all">
                        <Plus size={24} strokeWidth={3} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-[#9CA3AF] group-hover:text-[#10b981]">
                        Tambah Akun
                    </span>
                </button>
            </div>
        </div>
    );
}
