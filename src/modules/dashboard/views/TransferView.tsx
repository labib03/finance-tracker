'use client';

import React, { useMemo } from 'react';
import { Sparkles, Plus, Wallet, CreditCard, Banknote, Smartphone, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import TransactionsTable from '@/modules/dashboard/components/TransactionsTable';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/lib/store';
import { formatRupiah, hitungSaldoAkun, getToday } from '@/lib/utils';

const iconMap: Record<string, typeof Wallet> = {
    Cash: Banknote,
    Mandiri: CreditCard,
    ATM: CreditCard,
    'E-Wallet': Smartphone,
};

export default function TransferView() {
  const setTransaksiToEdit = useFinanceStore((s) => s.setTransaksiToEdit);
  const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
  const transaksiList = useFinanceStore((s) => s.transaksiList);
  const router = useRouter();

  const tipeList = useFinanceStore((s) => s.tipeList);
  const tabunganList = useFinanceStore((s) => s.tabunganList);
  const saldoAkun = useMemo(
      () => hitungSaldoAkun(sumberDanaList, transaksiList, tipeList, tabunganList),
      [sumberDanaList, transaksiList, tipeList, tabunganList]
  );

  return (
    <div className="space-y-8">
      {/* Wallet / Accounts Modern Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Pilih Sumber Dana Transfer
            </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {saldoAkun.map((akun) => {
                const Icon = iconMap[akun.nama_sumber] || Wallet;
                return (
                    <div 
                        key={akun.id_sumber_dana}
                        onClick={() => {
                            const tipeTransfer = tipeList.find(t => t.label.toLowerCase() === "transfer" && !t.master_tipe)?.id_tipe 
                                || tipeList.find(t => t.label.toLowerCase() === "transfer")?.id_tipe 
                                || "Transfer";
                            setTransaksiToEdit({ 
                                id: '', 
                                tanggal: getToday(),
                                jenis: tipeTransfer,
                                id_sumber_dana: akun.id_sumber_dana,
                                id_target_dana: '',
                                nominal: 0,
                                label: '',
                                catatan: ''
                            });
                            router.push('/transfer/baru');
                        }}
                        className="group cursor-pointer relative p-6 rounded-[2rem] bg-blue-50/50 border border-blue-100 hover:bg-blue-600 hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-600/30 transition-all duration-500 overflow-hidden flex flex-col justify-between min-h-[160px]"
                    >
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/40 rounded-full blur-3xl group-hover:bg-white/20 transition-colors duration-700" />
                        
                        <div className="flex justify-between items-start relative z-10 w-full">
                            <div className="w-14 h-14 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-sm group-hover:bg-white/20 group-hover:text-white transition-all duration-300">
                                <Icon size={24} strokeWidth={2.5} />
                            </div>
                            <div className="w-10 h-10 rounded-full bg-blue-100/50 flex items-center justify-center text-blue-600 group-hover:bg-white/20 group-hover:text-white transition-all duration-300 backdrop-blur-sm">
                                <ArrowRight size={18} strokeWidth={2.5} className="-rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                            </div>
                        </div>

                        <div className="relative z-10 mt-6">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-900 group-hover:text-blue-100 transition-colors">
                                {akun.nama_sumber}
                            </p>
                            <p className="text-2xl font-black tracking-tighter text-blue-950 group-hover:text-white mt-1 display-number transition-colors truncate">
                                {formatRupiah(akun.saldo)}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Transfer History */}
      <TransactionsTable 
        limit={30} 
        showDelete 
        showEdit
        filterType="Transfer"
        onEdit={(t: any) => {
          setTransaksiToEdit(t);
          router.push(`/transfer/edit/${t.id}`);
        }}
        title="Riwayat Transfer" 
        description="Semua mutasi antar akun"
        headerActions={
          <Button
            onClick={() => {
              setTransaksiToEdit(null);
              router.push('/transfer/baru');
            }}
            variant="ghost"
            className="rounded-full px-4 sm:px-6 h-9 sm:h-10 bg-blue-100 hover:bg-blue-200 text-blue-700 shadow-none border-none font-bold text-xs sm:text-sm transition-all"
          >
            <Plus size={16} className="sm:mr-2" />
            <span className="hidden sm:inline">Buat Transfer</span>
          </Button>
        }
      />
    </div>
  );
}
