'use client';

import { useRouter } from 'next/navigation';
import TipeForm from '@/shared/forms/TipeForm';
import { useFinanceStore } from '@/lib/store';
import { useEffect, useState, use } from 'react';
import type { TipeTransaksi } from '@/lib/types';

export default function EditTipePage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const tipeList = useFinanceStore((s) => s.tipeList);
    const [tipeToEdit, setTipeToEdit] = useState<TipeTransaksi | null>(null);

    useEffect(() => {
        if (resolvedParams.id) {
            const found = tipeList.find(t => t.id_tipe === resolvedParams.id);
            if (found) {
                setTipeToEdit(found);
            } else {
                router.push('/master');
            }
        }
    }, [resolvedParams.id, tipeList, router]);

    if (!tipeToEdit) return null;

    return (
        <TipeForm 
            tipeToEdit={tipeToEdit}
            onClose={() => router.push('/master')}
        />
    );
}
