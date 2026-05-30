'use client';

import React from 'react';
import SaldoCards from '@/modules/dashboard/components/SaldoCards';
import TitipanSummary from '@/modules/dashboard/components/TitipanSummary';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/lib/store';

export default function SaldoView() {
  const setTitipanToEdit = useFinanceStore((s) => s.setTitipanToEdit);
  const setSumberDanaToEdit = useFinanceStore((s) => s.setSumberDanaToEdit);
  const router = useRouter();

  return (
    <div className="flex flex-col gap-12 pb-12">
      <div className="w-full">
        <SaldoCards 
          onAddAccount={() => router.push('/saldo/baru')} 
          onEditAccount={(s) => {
            setSumberDanaToEdit(s);
            router.push(`/saldo/edit/${s.id_sumber_dana}`);
          }}
        />
      </div>
      <div className="w-full">
         <TitipanSummary 
            onAddClick={() => router.push('/saldo/titipan/baru')} 
            onEditClick={(t) => {
              setTitipanToEdit(t);
              router.push(`/saldo/titipan/edit/${t.id_titipan}`);
            }}
         />
      </div>
    </div>
  );
}
