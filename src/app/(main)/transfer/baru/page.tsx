'use client';

import { useRouter } from 'next/navigation';
import TransferForm from '@/modules/dashboard/forms/TransferForm';

export default function TransferBaruPage() {
  const router = useRouter();

  return (
    <TransferForm
      inline={true}
      onClose={() => router.push('/transfer')}
    />
  );
}
