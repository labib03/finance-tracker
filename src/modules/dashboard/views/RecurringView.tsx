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
      <Card className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-border/40 shadow-scandi overflow-hidden transition-all duration-500 hover:shadow-float relative group">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-100/50 transition-all duration-1000" />
        
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 pt-6 sm:pt-10 px-6 sm:px-10 relative z-10">
          <div className="text-center sm:text-left">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-foreground">Jadwal Transaksi</CardTitle>
            <CardDescription className="text-xs font-medium text-muted-foreground/80 uppercase tracking-widest mt-1">Kelola tagihan bulanan dan pemasukan rutin otomatis.</CardDescription>
          </div>
          <Button 
            onClick={() => {
              setRecurringToEdit(null);
              setActiveModal('recurring');
            }} 
            className="rounded-2xl px-6 h-11 bg-foreground text-background hover:bg-foreground/90 shadow-lg text-xs font-black uppercase tracking-widest shrink-0 w-full sm:w-auto"
          >
            <Plus size={16} className="mr-2" />
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
