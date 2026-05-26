'use client';

import { useRouter } from 'next/navigation';
import TabunganForm from '@/modules/dashboard/forms/TabunganForm';

export default function TabunganBaruPage() {
  const router = useRouter();

  return (
    <TabunganForm
      inline={true}
      onClose={() => router.push('/tabungan')}
    />
  );
}
