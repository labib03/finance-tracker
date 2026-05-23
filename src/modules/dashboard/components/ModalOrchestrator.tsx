import TransaksiForm from '@/modules/dashboard/forms/TransaksiForm';
import TransferForm from '@/modules/dashboard/forms/TransferForm';
import RecurringForm from '@/modules/dashboard/forms/RecurringForm';
import BudgetForm from '@/modules/dashboard/forms/BudgetForm';
import KategoriForm from '@/shared/forms/KategoriForm';
import SumberDanaForm from '@/shared/forms/SumberDanaForm';
import CycleSettingsForm from '@/shared/forms/CycleSettingsForm';
import TitipanForm from '@/modules/dashboard/forms/TitipanForm';
import TabunganForm from '@/modules/dashboard/forms/TabunganForm';
import { useFinanceStore } from '@/lib/store';

export default function ModalOrchestrator() {
  const activeModal = useFinanceStore((s) => s.activeModal);
  const setActiveModal = useFinanceStore((s) => s.setActiveModal);
  
  const transaksiToEdit = useFinanceStore((s) => s.transaksiToEdit);
  const setTransaksiToEdit = useFinanceStore((s) => s.setTransaksiToEdit);
  const recurringToEdit = useFinanceStore((s) => s.recurringToEdit);
  const setRecurringToEdit = useFinanceStore((s) => s.setRecurringToEdit);
  const budgetToEdit = useFinanceStore((s) => s.budgetToEdit);
  const setBudgetToEdit = useFinanceStore((s) => s.setBudgetToEdit);
  const kategoriToEdit = useFinanceStore((s) => s.kategoriToEdit);
  const setKategoriToEdit = useFinanceStore((s) => s.setKategoriToEdit);
  const sumberDanaToEdit = useFinanceStore((s) => s.sumberDanaToEdit);
  const setSumberDanaToEdit = useFinanceStore((s) => s.setSumberDanaToEdit);
  const titipanToEdit = useFinanceStore((s) => s.titipanToEdit);
  const setTitipanToEdit = useFinanceStore((s) => s.setTitipanToEdit);
  const tabunganToEdit = useFinanceStore((s) => s.tabunganToEdit);
  const setTabunganToEdit = useFinanceStore((s) => s.setTabunganToEdit);

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
      {activeModal === 'titipan' && (
        <TitipanForm
          onClose={() => {
            setActiveModal(null);
            setTitipanToEdit(null);
          }}
          titipanToEdit={titipanToEdit}
        />
      )}
      {activeModal === 'tabungan' && (
        <TabunganForm
          onClose={() => {
            setActiveModal(null);
            setTabunganToEdit(null);
          }}
          dataToEdit={tabunganToEdit}
        />
      )}
      {activeModal === 'cycle_settings' && (
        <CycleSettingsForm onClose={() => setActiveModal(null)} />
      )}
    </>
  );
}
