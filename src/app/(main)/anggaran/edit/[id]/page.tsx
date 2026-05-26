'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFinanceStore } from '@/lib/store';
import BudgetForm from '@/modules/dashboard/forms/BudgetForm';
import { useEffect, useState } from 'react';

export default function AnggaranEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const budgetList = useFinanceStore((s) => s.budgetList);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-8 text-center text-slate-400">Menghidrasi...</div>;
  }

  const budgetToEdit = budgetList.find((b) => b.id_anggaran === id);

  if (!budgetToEdit) {
    return (
      <div className="p-8 text-center text-slate-400 min-h-screen flex flex-col items-center justify-center bg-slate-950">
        <p className="text-xl font-bold text-slate-200">Anggaran tidak ditemukan</p>
        <p className="text-sm text-slate-500 mt-2">ID Anggaran: {id}</p>
        <button
          onClick={() => router.push('/anggaran')}
          className="mt-6 px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-850 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
        >
          Kembali ke Anggaran
        </button>
      </div>
    );
  }

  return (
    <BudgetForm
      inline={true}
      budgetToEdit={budgetToEdit}
      onClose={() => router.push('/anggaran')}
    />
  );
}
