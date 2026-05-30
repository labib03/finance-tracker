'use client';
import { TRANSACTION_TYPES } from '@/lib/constants';

import React from 'react';
import SaldoCards from '@/modules/dashboard/components/SaldoCards';
import TransactionsTable from '@/modules/dashboard/components/TransactionsTable';
import TitipanSummary from '@/modules/dashboard/components/TitipanSummary';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/lib/store';

export default function SaldoView() {
  const setTransaksiToEdit = useFinanceStore((s) => s.setTransaksiToEdit);
  const setTitipanToEdit = useFinanceStore((s) => s.setTitipanToEdit);
  const setSumberDanaToEdit = useFinanceStore((s) => s.setSumberDanaToEdit);
  const router = useRouter();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="h-full">
          <SaldoCards 
            onAddAccount={() => router.push('/saldo/baru')} 
            onEditAccount={(s) => {
              setSumberDanaToEdit(s);
              router.push(`/saldo/edit/${s.id_sumber_dana}`);
            }}
          />
        </div>
        <div className="h-full flex flex-col gap-8">
           <TitipanSummary 
              onAddClick={() => router.push('/saldo/titipan/baru')} 
              onEditClick={(t) => {
                setTitipanToEdit(t);
                router.push(`/saldo/titipan/edit/${t.id_titipan}`);
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
          if (t.jenis.toLowerCase() === TRANSACTION_TYPES.TRANSFER) {
            router.push(`/transfer/edit/${t.id}`);
          } else {
            router.push(`/transaksi/edit/${t.id}`);
          }
        }}
        title="Log Transaksi Akun" 
      />
    </div>
  );
}
