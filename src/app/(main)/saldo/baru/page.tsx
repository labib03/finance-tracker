'use client';

import { useRouter } from 'next/navigation';
import SumberDanaForm from '@/shared/forms/SumberDanaForm';

export default function SaldoBaruPage() {
  const router = useRouter();

  return (
    <SumberDanaForm
      inline={true}
      onClose={() => router.push('/saldo')}
    />
  );
}
