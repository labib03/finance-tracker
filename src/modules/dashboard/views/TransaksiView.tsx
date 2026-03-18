import React from 'react';
import { Button } from '@/shared/ui/button';
import { Plus } from 'lucide-react';
import TransactionsTable from '@/modules/dashboard/components/TransactionsTable';

export default function TransaksiView({
  setActiveModal,
  setTransaksiToEdit
}: {
  setActiveModal: (modal: string | null) => void;
  setTransaksiToEdit: (t: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button 
          onClick={() => {
            setTransaksiToEdit(null);
            setActiveModal('transaksi');
          }} 
          className="rounded-full px-6"
        >
          <Plus size={18} className="mr-2" />
          Tambah Transaksi
        </Button>
      </div>
      <TransactionsTable 
        limit={50} 
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
        title="Semua Transaksi" 
      />
    </div>
  );
}
