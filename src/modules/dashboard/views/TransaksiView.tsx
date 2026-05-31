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
        headerActions={
          <>
            <Button 
              onClick={() => router.push('/transaksi/batch')} 
              variant="ghost"
              className="rounded-full px-4 sm:px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 h-9 sm:h-10 border-none shadow-none flex items-center justify-center font-bold text-xs sm:text-sm transition-all"
            >
              <Layers3 size={16} className="sm:mr-2" />
              <span className="hidden sm:inline">Input Massal</span>
            </Button>
            <Button 
              onClick={handleTambahTransaksi} 
              variant="ghost"
              className="rounded-full px-4 sm:px-6 bg-blue-100 hover:bg-blue-200 text-blue-700 h-9 sm:h-10 border-none shadow-none font-bold text-xs sm:text-sm transition-all"
            >
              <Plus size={18} className="sm:mr-2" />
              <span className="hidden sm:inline">Tambah Transaksi</span>
            </Button>
          </>
        }
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
