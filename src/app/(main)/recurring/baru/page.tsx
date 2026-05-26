'use client';

import { useRouter } from 'next/navigation';
import RecurringForm from '@/modules/dashboard/forms/RecurringForm';

export default function RecurringBaruPage() {
  const router = useRouter();

  return (
    <RecurringForm
      inline={true}
      onClose={() => router.push('/recurring')}
    />
  );
}
