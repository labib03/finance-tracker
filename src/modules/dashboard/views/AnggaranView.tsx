import React from 'react';
import BudgetManagement from '@/modules/dashboard/components/BudgetManagement';

export default function AnggaranView({
  setActiveModal,
  setBudgetToEdit
}: {
  setActiveModal: (modal: string | null) => void;
  setBudgetToEdit: (b: any) => void;
}) {
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
