import React from 'react';
import MasterDataManagement from '@/modules/dashboard/components/MasterDataManagement';

export default function MasterView({
  setActiveModal,
  setKategoriToEdit,
  setSumberDanaToEdit
}: {
  setActiveModal: (modal: string | null) => void;
  setKategoriToEdit: (k: any) => void;
  setSumberDanaToEdit: (s: any) => void;
}) {
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
