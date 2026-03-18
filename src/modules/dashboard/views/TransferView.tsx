import React from 'react';
import { Sparkles, Plus } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import SaldoCards from '@/modules/dashboard/components/SaldoCards';
import TransactionsTable from '@/modules/dashboard/components/TransactionsTable';

export default function TransferView({
  setActiveModal,
  setTransaksiToEdit
}: {
  setActiveModal: (modal: string | null) => void;
  setTransaksiToEdit: (t: any) => void;
}) {
  return (
    <div className="space-y-8">
      <SaldoCards />

      {/* Transfer Hero Card */}
      <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-scandi border border-border/40 relative overflow-hidden group transition-all duration-500 hover:shadow-float">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/50 shadow-sm">
              <Sparkles size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Transfer Antar Akun</h3>
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
