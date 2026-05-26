'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFinanceStore } from '@/lib/store';
import TabunganForm from '@/modules/dashboard/forms/TabunganForm';
import { useEffect, useState } from 'react';

export default function TabunganEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const tabunganList = useFinanceStore((s) => s.tabunganList);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-8 text-center text-slate-400">Menghidrasi...</div>;
  }

  const tabunganToEdit = tabunganList.find((t) => t.id_tabungan === id);

  if (!tabunganToEdit) {
    return (
      <div className="p-8 text-center text-slate-400 min-h-screen flex flex-col items-center justify-center bg-slate-950">
        <p className="text-xl font-bold text-slate-200">Sinking Fund tidak ditemukan</p>
        <p className="text-sm text-slate-500 mt-2">ID Tabungan: {id}</p>
        <button
          onClick={() => router.push('/tabungan')}
          className="mt-6 px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-850 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
        >
          Kembali ke Tabungan
        </button>
      </div>
    );
  }

  return (
    <TabunganForm
      inline={true}
      dataToEdit={tabunganToEdit}
      onClose={() => router.push('/tabungan')}
    />
  );
}
