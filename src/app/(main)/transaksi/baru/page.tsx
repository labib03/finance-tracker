'use client';

import { useRouter } from 'next/navigation';
import TransaksiForm from '@/modules/dashboard/forms/TransaksiForm';

export default function TransaksiBaruPage() {
  const router = useRouter();

  return (
    <TransaksiForm
      inline={true}
      onClose={() => router.push('/transaksi')}
    />
  );
}
