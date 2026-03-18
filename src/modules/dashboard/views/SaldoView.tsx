import React from 'react';
import SaldoCards from '@/modules/dashboard/components/SaldoCards';
import TransactionsTable from '@/modules/dashboard/components/TransactionsTable';

export default function SaldoView({
  setActiveModal,
  setTransaksiToEdit
}: {
  setActiveModal: (modal: string) => void;
  setTransaksiToEdit: (t: any) => void;
}) {
  return (
    <div className="space-y-6">
      <SaldoCards />
      <TransactionsTable 
        limit={20} 
        showDelete 
        showEdit
        onEdit={(t: any) => {
          setTransaksiToEdit(t);
          if (t.jenis === 'Transfer') {
            setActiveModal('transfer');
          } else {
            setActiveModal('transaksi');
          }
        }}
        title="Log Transaksi Akun" 
      />
    </div>
  );
}
