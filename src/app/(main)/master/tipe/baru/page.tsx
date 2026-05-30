'use client';

import { useRouter } from 'next/navigation';
import TipeForm from '@/shared/forms/TipeForm';

export default function TipeBaruPage() {
  const router = useRouter();

  return (
    <TipeForm
      onClose={() => router.push('/master')}
    />
  );
}
