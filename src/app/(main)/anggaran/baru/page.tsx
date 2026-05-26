'use client';

import { useRouter } from 'next/navigation';
import BudgetForm from '@/modules/dashboard/forms/BudgetForm';

export default function AnggaranBaruPage() {
  const router = useRouter();

  return (
    <BudgetForm
      inline={true}
      onClose={() => router.push('/anggaran')}
    />
  );
}
