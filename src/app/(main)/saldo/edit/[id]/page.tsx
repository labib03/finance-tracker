'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFinanceStore } from '@/lib/store';
import SumberDanaForm from '@/shared/forms/SumberDanaForm';
import { useEffect, useState } from 'react';

export default function SaldoEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-8 text-center text-slate-400">Menghidrasi...</div>;
  }

  const sumberDanaToEdit = sumberDanaList.find((s) => s.id_sumber_dana === id);

  if (!sumberDanaToEdit) {
    return (
      <div className="p-8 text-center text-slate-400 min-h-screen flex flex-col items-center justify-center bg-slate-950">
        <p className="text-xl font-bold text-slate-200">Rekening tidak ditemukan</p>
        <p className="text-sm text-slate-500 mt-2">ID Rekening: {id}</p>
        <button
          onClick={() => router.push('/saldo')}
          className="mt-6 px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-850 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
        >
          Kembali ke Saldo
        </button>
      </div>
    );
  }

  return (
    <SumberDanaForm
      inline={true}
      sumberDanaToEdit={sumberDanaToEdit}
      onClose={() => router.push('/saldo')}
    />
  );
}
