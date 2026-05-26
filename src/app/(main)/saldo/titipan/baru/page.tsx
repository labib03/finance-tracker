'use client';

import { useRouter } from 'next/navigation';
import TitipanForm from '@/modules/dashboard/forms/TitipanForm';

export default function TitipanBaruPage() {
  const router = useRouter();

  return (
    <TitipanForm
      inline={true}
      onClose={() => router.push('/saldo')}
    />
  );
}
