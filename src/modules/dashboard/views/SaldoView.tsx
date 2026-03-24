import React from 'react';
import SaldoCards from '@/modules/dashboard/components/SaldoCards';
import TransactionsTable from '@/modules/dashboard/components/TransactionsTable';
import TitipanSummary from '@/modules/dashboard/components/TitipanSummary';

export default function SaldoView({
  setActiveModal,
  setTransaksiToEdit,
  setTitipanToEdit
}: {
  setActiveModal: (modal: string) => void;
  setTransaksiToEdit: (t: any) => void;
  setTitipanToEdit: (t: any) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="h-full">
          <SaldoCards onAddAccount={() => setActiveModal('sumber_dana')} />
        </div>
        <div className="h-full flex flex-col gap-8">
           <TitipanSummary 
              onAddClick={() => setActiveModal('titipan')} 
              onEditClick={(t) => {
                setTitipanToEdit(t);
                setActiveModal('titipan');
              }}
           />
        </div>
      </div>

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
