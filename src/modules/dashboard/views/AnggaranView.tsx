'use client';

import React from 'react';
import BudgetManagement from '@/modules/dashboard/components/BudgetManagement';

import { useFinanceStore } from '@/lib/store';

export default function AnggaranView() {
  const setActiveModal = useFinanceStore((s) => s.setActiveModal);
  const setBudgetToEdit = useFinanceStore((s) => s.setBudgetToEdit);
  return (
    <div className="space-y-6">
      <BudgetManagement 
        onAdd={() => {
            setBudgetToEdit(null);
            setActiveModal('budget');
        }}
        onEdit={(b: any) => {
            setBudgetToEdit(b);
            setActiveModal('budget');
        }}
      />
    </div>
  );
}
