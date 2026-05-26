'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFinanceStore } from '@/lib/store';
import TransaksiForm from '@/modules/dashboard/forms/TransaksiForm';
import { useEffect, useState } from 'react';

export default function TransaksiEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const transaksiList = useFinanceStore((s) => s.transaksiList);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-8 text-center text-slate-400">Menghidrasi...</div>;
  }

  const transaksiToEdit = transaksiList.find((t) => t.id === id);

  if (!transaksiToEdit) {
    return (
      <div className="p-8 text-center text-slate-400 min-h-screen flex flex-col items-center justify-center bg-slate-950">
        <p className="text-xl font-bold text-slate-200">Transaksi tidak ditemukan</p>
        <p className="text-sm text-slate-500 mt-2">ID Transaksi: {id}</p>
        <button
          onClick={() => router.push('/transaksi')}
          className="mt-6 px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-850 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
        >
          Kembali ke Transaksi
        </button>
      </div>
    );
  }

  return (
    <TransaksiForm
      inline={true}
      transaksiToEdit={transaksiToEdit}
      onClose={() => router.push('/transaksi')}
    />
  );
}
