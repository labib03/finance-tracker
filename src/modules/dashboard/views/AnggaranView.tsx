'use client';

import React from 'react';
import BudgetManagement from '@/modules/dashboard/components/BudgetManagement';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/lib/store';

export default function AnggaranView() {
  const setBudgetToEdit = useFinanceStore((s) => s.setBudgetToEdit);
  const router = useRouter();

  return (
    <div className="space-y-6">
      <BudgetManagement 
        onAdd={() => {
            setBudgetToEdit(null);
            router.push('/anggaran/baru');
        }}
        onEdit={(b: any) => {
            setBudgetToEdit(b);
            router.push(`/anggaran/edit/${b.id_anggaran}`);
        }}
      />
    </div>
  );
}
