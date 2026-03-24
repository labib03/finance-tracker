import React, { useMemo } from 'react';
import { Sparkles, Plus, Wallet, CreditCard, Banknote, Smartphone, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import TransactionsTable from '@/modules/dashboard/components/TransactionsTable';
import { useFinanceStore } from '@/lib/store';
import { formatRupiah, hitungSaldoAkun, getToday } from '@/lib/utils';

const iconMap: Record<string, typeof Wallet> = {
    Cash: Banknote,
    Mandiri: CreditCard,
    ATM: CreditCard,
    'E-Wallet': Smartphone,
};

export default function TransferView({
  setActiveModal,
  setTransaksiToEdit
}: {
  setActiveModal: (modal: string | null) => void;
  setTransaksiToEdit: (t: any) => void;
}) {
  const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
  const transaksiList = useFinanceStore((s) => s.transaksiList);

  const saldoAkun = useMemo(
      () => hitungSaldoAkun(sumberDanaList, transaksiList),
      [sumberDanaList, transaksiList]
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
                            setTransaksiToEdit({ 
                                id: '', 
                                tanggal: getToday(),
                                jenis: 'Transfer',
                                id_sumber_dana: akun.id_sumber_dana,
                                id_target_dana: '',
                                nominal: 0,
                                label: '',
                                catatan: ''
                            });
                            setActiveModal('transfer');
                        }}
                        className="group cursor-pointer relative p-6 rounded-[2rem] bg-indigo-50/50 border border-indigo-100 hover:bg-indigo-600 hover:border-indigo-600 hover:shadow-2xl hover:shadow-indigo-600/30 transition-all duration-500 overflow-hidden flex flex-col justify-between min-h-[160px]"
                    >
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/40 rounded-full blur-3xl group-hover:bg-white/20 transition-colors duration-700" />
                        
                        <div className="flex justify-between items-start relative z-10 w-full">
                            <div className="w-14 h-14 rounded-2xl bg-white text-indigo-600 flex items-center justify-center shadow-sm group-hover:bg-white/20 group-hover:text-white transition-all duration-300">
                                <Icon size={24} strokeWidth={2.5} />
                            </div>
                            <div className="w-10 h-10 rounded-full bg-indigo-100/50 flex items-center justify-center text-indigo-600 group-hover:bg-white/20 group-hover:text-white transition-all duration-300 backdrop-blur-sm">
                                <ArrowRight size={18} strokeWidth={2.5} className="-rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                            </div>
                        </div>

                        <div className="relative z-10 mt-6">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-900 group-hover:text-indigo-100 transition-colors">
                                {akun.nama_sumber}
                            </p>
                            <p className="text-2xl font-black tracking-tighter text-indigo-950 group-hover:text-white mt-1 display-number transition-colors truncate">
                                {formatRupiah(akun.saldo)}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Transfer Hero Card */}
      <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-scandi border border-border/40 relative overflow-hidden group transition-all duration-500 hover:shadow-float">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/50 shadow-sm">
              <Sparkles size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Transfer Cepat</h3>
              <p className="text-xs font-medium text-muted-foreground/80 uppercase tracking-widest mt-1 max-w-md">
                Pindahkan saldo antar rekening tanpa memengaruhi total pemasukan atau pengeluaran
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              setTransaksiToEdit(null);
              setActiveModal('transfer');
            }}
            className="rounded-2xl px-6 h-11 bg-foreground text-background hover:bg-foreground/90 shadow-lg text-xs font-black uppercase tracking-widest shrink-0"
          >
            <Plus size={16} className="mr-2" />
            Buat Transfer
          </Button>
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
          setActiveModal('transfer');
        }}
        title="Riwayat Transfer" 
        description="Semua mutasi antar akun"
      />
    </div>
  );
}
