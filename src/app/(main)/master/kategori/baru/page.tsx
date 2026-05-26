'use client';

import { useRouter } from 'next/navigation';
import KategoriForm from '@/shared/forms/KategoriForm';

export default function KategoriBaruPage() {
  const router = useRouter();

  return (
    <KategoriForm
      inline={true}
      onClose={() => router.push('/master')}
    />
  );
}
