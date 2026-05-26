'use client';

import React from 'react';
import MasterDataManagement from '@/modules/dashboard/components/MasterDataManagement';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/lib/store';

export default function MasterView() {
  const setKategoriToEdit = useFinanceStore((s) => s.setKategoriToEdit);
  const router = useRouter();
  
  return (
    <MasterDataManagement
      onAddKategori={() => {
        setKategoriToEdit(null);
        router.push('/master/kategori/baru');
      }}
      onEditKategori={(k: any) => {
        setKategoriToEdit(k);
        router.push(`/master/kategori/edit/${k.id_kategori}`);
      }}
    />
  );
}
