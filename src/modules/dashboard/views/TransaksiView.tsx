'use client';
import { TRANSACTION_TYPES } from '@/lib/constants';

import React, { Suspense } from 'react';
import { Button } from '@/shared/ui/button';
import { Plus, Layers3 } from 'lucide-react';
import TransactionsTable from '@/modules/dashboard/components/TransactionsTable';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFinanceStore } from '@/lib/store';

function TransaksiViewInner() {
  const setTransaksiToEdit = useFinanceStore((s) => s.setTransaksiToEdit);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTambahTransaksi = () => {
    setTransaksiToEdit(null);
    const query = searchParams.toString();
    router.push(`/transaksi/baru${query ? `?${query}` : ''}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-3">
        <Button 
          onClick={() => router.push('/transaksi/batch')} 
          variant="ghost"
          className="rounded-full px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 h-10 border-none shadow-none flex items-center justify-center font-bold"
        >
          <Layers3 size={16} className="mr-2" />
          Input Massal
        </Button>
        <Button 
          onClick={handleTambahTransaksi} 
          variant="ghost"
          className="rounded-full px-6 bg-blue-100 hover:bg-blue-200 text-blue-700 border-none shadow-none font-bold"
        >
          <Plus size={18} className="mr-2" />
          Tambah Transaksi
        </Button>
      </div>
      <TransactionsTable 
        limit={50} 
        showDelete 
        showEdit
        onEdit={(t: any) => {
          setTransaksiToEdit(t);
          if (t.jenis.toLowerCase() === TRANSACTION_TYPES.TRANSFER) {
            router.push(`/transfer/edit/${t.id}`);
          } else {
            router.push(`/transaksi/edit/${t.id}`);
          }
        }}
        title="Semua Transaksi" 
      />
    </div>
  );
}

export default function TransaksiView() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground font-black text-xs uppercase tracking-widest">Memuat daftar...</div>}>
      <TransaksiViewInner />
    </Suspense>
  );
}
