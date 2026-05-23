'use client';

import React from 'react';
import MasterDataManagement from '@/modules/dashboard/components/MasterDataManagement';

import { useFinanceStore } from '@/lib/store';

export default function MasterView() {
  const setActiveModal = useFinanceStore((s) => s.setActiveModal);
  const setKategoriToEdit = useFinanceStore((s) => s.setKategoriToEdit);
  const setSumberDanaToEdit = useFinanceStore((s) => s.setSumberDanaToEdit);
  return (
    <MasterDataManagement
      onAddKategori={() => {
        setKategoriToEdit(null);
        setActiveModal('kategori');
      }}
      onEditKategori={(k: any) => {
        setKategoriToEdit(k);
        setActiveModal('kategori');
      }}
      onAddSumberDana={() => {
        setSumberDanaToEdit(null);
        setActiveModal('sumber_dana');
      }}
      onEditSumberDana={(s: any) => {
        setSumberDanaToEdit(s);
        setActiveModal('sumber_dana');
      }}
    />
  );
}
