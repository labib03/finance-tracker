import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Plus } from 'lucide-react';
import RecurringList from '@/modules/dashboard/components/RecurringList';

export default function RecurringView({
  setActiveModal,
  setRecurringToEdit
}: {
  setActiveModal: (modal: string | null) => void;
  setRecurringToEdit: (r: any) => void;
}) {
  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Jadwal Transaksi</CardTitle>
            <CardDescription>Kelola tagihan bulanan dan pemasukan rutin otomatis.</CardDescription>
          </div>
          <Button 
            onClick={() => {
              setRecurringToEdit(null);
              setActiveModal('recurring');
            }} 
            className="rounded-full px-6"
          >
            <Plus size={18} className="mr-2" />
            Buat Jadwal
          </Button>
        </CardHeader>
      </Card>
      <RecurringList 
        onEdit={(r: any) => {
          setRecurringToEdit(r);
          setActiveModal('recurring');
        }}
      />
    </div>
  );
}
