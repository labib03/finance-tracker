'use client';

import React from 'react';
import { Button } from '@/shared/ui/button';
import { Plus } from 'lucide-react';
import TransactionsTable from '@/modules/dashboard/components/TransactionsTable';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/lib/store';

export default function TransaksiView() {
  const setTransaksiToEdit = useFinanceStore((s) => s.setTransaksiToEdit);
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button 
          onClick={() => {
            setTransaksiToEdit(null);
            router.push('/transaksi/baru');
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
            router.push(`/transfer/edit/${t.id}`);
          } else {
            router.push(`/transaksi/edit/${t.id}`);
          }
        }}
        title="Semua Transaksi" 
      />
    </div>
  );
}
