'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Plus } from 'lucide-react';
import RecurringList from '@/modules/dashboard/components/RecurringList';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/lib/store';

export default function RecurringView() {
  const setRecurringToEdit = useFinanceStore((s) => s.setRecurringToEdit);
  const router = useRouter();

  return (
    <div className="space-y-6">
      <Card className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-border/40 shadow-scandi overflow-hidden transition-all duration-500 hover:shadow-float relative group">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-blue-50/50 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-100/50 transition-all duration-1000" />
        
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 pt-6 sm:pt-10 px-6 sm:px-10 relative z-10">
          <div className="text-center sm:text-left">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-foreground">Jadwal Transaksi</CardTitle>
            <CardDescription className="text-xs font-medium text-muted-foreground/80 uppercase tracking-widest mt-1">Kelola tagihan bulanan dan pemasukan rutin otomatis.</CardDescription>
          </div>
          <Button 
            onClick={() => {
              setRecurringToEdit(null);
              router.push('/recurring/baru');
            }} 
            variant="ghost"
            className="rounded-2xl px-6 h-11 bg-blue-100 hover:bg-blue-200 text-blue-700 shadow-none border-none text-xs font-black uppercase tracking-widest shrink-0 w-full sm:w-auto"
          >
            <Plus size={16} className="mr-2" />
            Buat Jadwal
          </Button>
        </CardHeader>
      </Card>
      <RecurringList 
        onEdit={(r: any) => {
          setRecurringToEdit(r);
          router.push(`/recurring/edit/${r.id}`);
        }}
      />
    </div>
  );
}
