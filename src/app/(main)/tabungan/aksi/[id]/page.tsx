'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useFinanceStore } from '@/lib/store';
import TabunganAksiForm from '@/modules/dashboard/forms/TabunganAksiForm';
import { useEffect, useState, Suspense } from 'react';

type AksiType = 'alokasi_tabungan' | 'tarik_tabungan' | 'eksekusi_tabungan';

function TabunganAksiInner() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const tabunganList = useFinanceStore((s) => s.tabunganList);
  
  const rawAksi = searchParams.get('aksi') || 'alokasi_tabungan';
  const defaultAksi = (['alokasi_tabungan', 'tarik_tabungan', 'eksekusi_tabungan'].includes(rawAksi) 
    ? rawAksi 
    : 'alokasi_tabungan') as AksiType;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-8 text-center text-slate-400">Menghidrasi...</div>;
  }

  const tabungan = tabunganList.find((t) => t.id_tabungan === id);

  if (!tabungan) {
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
    <TabunganAksiForm
      inline={true}
      tabungan={tabungan}
      defaultAksi={defaultAksi}
      onClose={() => router.push('/tabungan')}
    />
  );
}

export default function TabunganAksiPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Memuat aksi...</div>}>
      <TabunganAksiInner />
    </Suspense>
  );
}
