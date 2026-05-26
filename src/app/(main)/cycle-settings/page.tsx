'use client';

import { useRouter } from 'next/navigation';
import CycleSettingsForm from '@/shared/forms/CycleSettingsForm';

export default function CycleSettingsPage() {
  const router = useRouter();

  return (
    <CycleSettingsForm
      inline={true}
      onClose={() => router.push('/')}
    />
  );
}
