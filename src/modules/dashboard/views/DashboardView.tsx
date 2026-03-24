import React from 'react';
import SummaryCards from '@/modules/dashboard/components/SummaryCards';
import ExpensePieChart from '@/modules/dashboard/components/ExpensePieChart';
import WeeklyTrendChart from '@/modules/dashboard/components/WeeklyTrendChart';
import BudgetStatusCard from '@/modules/dashboard/components/BudgetStatusCard';
import ProyeksiKasCard from '@/modules/dashboard/components/ProyeksiKasCard';
import TitipanSummary from '@/modules/dashboard/components/TitipanSummary';
import SinkingFundsSummary from '@/modules/dashboard/components/SinkingFundsSummary';
import TransactionsTable from '@/modules/dashboard/components/TransactionsTable';
import { getToday } from '@/lib/utils';

export default function DashboardView({
  setActiveView,
  setActiveModal,
  setTransaksiToEdit,
  setTitipanToEdit
}: {
  setActiveView: (view: string) => void;
  setActiveModal: (modal: string) => void;
  setTransaksiToEdit: (t: any) => void;
  setTitipanToEdit: (t: any) => void;
}) {
  return (
    <div className="space-y-8">
      <SummaryCards />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <ExpensePieChart />
        <WeeklyTrendChart />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        <BudgetStatusCard />
        <ProyeksiKasCard 
          onViewAll={() => setActiveView('recurring')} 
          onProcess={(r) => {
            setTransaksiToEdit({
              id: '', 
              tanggal: getToday(),
              jenis: r.jenis,
              id_sumber_dana: r.id_sumber_dana,
              id_kategori: r.id_kategori,
              nominal: r.nominal,
              label: r.label,
              catatan: r.catatan,
              id_target_dana: ''
            } as any);
            setActiveModal('transaksi');
          }}
        />
      </div>

      {/* Sinking Funds Summary */}
      <SinkingFundsSummary onViewAll={() => setActiveView('tabungan')} />

      <TransactionsTable 
        limit={10} 
        title="Riwayat Transaksi Terkini" 
        description="X transaksi terakhir dalam periode ini"
        showEdit
        onEdit={(t: any) => {
          setTransaksiToEdit(t);
          if (t.jenis === 'Transfer') {
            setActiveModal('transfer');
          } else {
            setActiveModal('transaksi');
          }
        }}
      />
    </div>
  );
}
