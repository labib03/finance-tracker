import TransaksiForm from '@/modules/dashboard/forms/TransaksiForm';
import TransferForm from '@/modules/dashboard/forms/TransferForm';
import RecurringForm from '@/modules/dashboard/forms/RecurringForm';
import BudgetForm from '@/modules/dashboard/forms/BudgetForm';
import KategoriForm from '@/shared/forms/KategoriForm';
import SumberDanaForm from '@/shared/forms/SumberDanaForm';
import CycleSettingsForm from '@/shared/forms/CycleSettingsForm';
import { useFinanceStore } from '@/lib/store';

interface ModalOrchestratorProps {
  transaksiToEdit: any;
  setTransaksiToEdit: (val: any) => void;
  recurringToEdit: any;
  setRecurringToEdit: (val: any) => void;
  budgetToEdit: any;
  setBudgetToEdit: (val: any) => void;
  kategoriToEdit: any;
  setKategoriToEdit: (val: any) => void;
  sumberDanaToEdit: any;
  setSumberDanaToEdit: (val: any) => void;
}

export default function ModalOrchestrator({
  transaksiToEdit,
  setTransaksiToEdit,
  recurringToEdit,
  setRecurringToEdit,
  budgetToEdit,
  setBudgetToEdit,
  kategoriToEdit,
  setKategoriToEdit,
  sumberDanaToEdit,
  setSumberDanaToEdit,
}: ModalOrchestratorProps) {
  const activeModal = useFinanceStore((s) => s.activeModal);
  const setActiveModal = useFinanceStore((s) => s.setActiveModal);

  return (
    <>
      {activeModal === 'transaksi' && (
        <TransaksiForm 
          onClose={() => {
            setActiveModal(null);
            setTransaksiToEdit(null);
          }} 
          transaksiToEdit={transaksiToEdit}
        />
      )}
      {activeModal === 'transfer' && (
        <TransferForm 
          onClose={() => {
            setActiveModal(null);
            setTransaksiToEdit(null);
          }} 
          transferToEdit={transaksiToEdit}
        />
      )}
      {activeModal === 'recurring' && (
        <RecurringForm 
          onClose={() => {
            setActiveModal(null);
            setRecurringToEdit(null);
          }} 
          recurringToEdit={recurringToEdit}
        />
      )}
      {activeModal === 'budget' && (
        <BudgetForm 
          onClose={() => {
            setActiveModal(null);
            setBudgetToEdit(null);
          }} 
          budgetToEdit={budgetToEdit}
        />
      )}
      {activeModal === 'kategori' && (
        <KategoriForm
          onClose={() => {
            setActiveModal(null);
            setKategoriToEdit(null);
          }}
          kategoriToEdit={kategoriToEdit}
        />
      )}
      {activeModal === 'sumber_dana' && (
        <SumberDanaForm
          onClose={() => {
            setActiveModal(null);
            setSumberDanaToEdit(null);
          }}
          sumberDanaToEdit={sumberDanaToEdit}
        />
      )}
      {activeModal === 'cycle_settings' && (
        <CycleSettingsForm onClose={() => setActiveModal(null)} />
      )}
    </>
  );
}
