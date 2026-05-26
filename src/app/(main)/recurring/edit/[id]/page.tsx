'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFinanceStore } from '@/lib/store';
import RecurringForm from '@/modules/dashboard/forms/RecurringForm';
import { useEffect, useState } from 'react';

export default function RecurringEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const recurringList = useFinanceStore((s) => s.recurringList);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-8 text-center text-slate-400">Menghidrasi...</div>;
  }

  const recurringToEdit = recurringList.find((r) => r.id === id);

  if (!recurringToEdit) {
    return (
      <div className="p-8 text-center text-slate-400 min-h-screen flex flex-col items-center justify-center bg-slate-950">
        <p className="text-xl font-bold text-slate-200">Jadwal Berulang tidak ditemukan</p>
        <p className="text-sm text-slate-500 mt-2">ID Recurring: {id}</p>
        <button
          onClick={() => router.push('/recurring')}
          className="mt-6 px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-850 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
        >
          Kembali ke Recurring
        </button>
      </div>
    );
  }

  return (
    <RecurringForm
      inline={true}
      recurringToEdit={recurringToEdit}
      onClose={() => router.push('/recurring')}
    />
  );
}
