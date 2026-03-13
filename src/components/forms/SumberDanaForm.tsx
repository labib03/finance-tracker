'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFinanceStore } from '@/lib/store';
import { sumberDanaSchema, type SumberDanaFormData } from '@/lib/schemas';
import type { SumberDana } from '@/lib/types';
import { X, Save, Wallet } from 'lucide-react';
import { generateId } from '@/lib/utils';
import NumericInput from '@/components/forms/NumericInput';

interface SumberDanaFormProps {
    onClose: () => void;
    sumberDanaToEdit?: SumberDana | null;
}

export default function SumberDanaForm({ onClose, sumberDanaToEdit }: SumberDanaFormProps) {
    const addSumberDana = useFinanceStore((s) => s.addSumberDana);
    const updateSumberDana = useFinanceStore((s) => s.updateSumberDana);

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<SumberDanaFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(sumberDanaSchema) as any,
        defaultValues: {
            id_sumber_dana: '',
            nama_sumber: '',
            saldo_awal: 0,
        },
    });

    useEffect(() => {
        if (sumberDanaToEdit) {
            reset({
                id_sumber_dana: sumberDanaToEdit.id_sumber_dana,
                nama_sumber: sumberDanaToEdit.nama_sumber,
                saldo_awal: sumberDanaToEdit.saldo_awal,
            });
        } else {
            reset({
                id_sumber_dana: `SD-${generateId().substring(0, 6)}`,
                nama_sumber: '',
                saldo_awal: 0,
            });
        }
    }, [sumberDanaToEdit, reset]);

    const onSubmit = async (data: SumberDanaFormData) => {
        if (sumberDanaToEdit) {
            await updateSumberDana(data as SumberDana);
        } else {
            await addSumberDana(data as SumberDana);
        }
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="text-lg font-bold">
                        {sumberDanaToEdit ? 'Edit Sumber Dana' : 'Tambah Sumber Dana'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Tutup"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* ID Sumber Dana (Hidden) */}
                        <input type="hidden" {...register('id_sumber_dana')} />

                        {/* Nama Sumber Dana */}
                        <div>
                            <label className="input-label">Nama Akun/Sumber Dana</label>
                            <input
                                type="text"
                                placeholder="Contoh: BCA, OVO, Cash..."
                                {...register('nama_sumber')}
                                className={`input-field ${errors.nama_sumber ? 'input-error' : ''}`}
                            />
                            {errors.nama_sumber && (
                                <p className="input-error-text">{errors.nama_sumber.message}</p>
                            )}
                        </div>

                        {/* Saldo Awal */}
                        <div>
                            <NumericInput
                                label="Saldo Awal"
                                name="saldo_awal"
                                control={control}
                                error={errors.saldo_awal?.message}
                                disabled={!!sumberDanaToEdit}
                                placeholder="0"
                            />
                            {sumberDanaToEdit && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Saldo awal tidak dapat diubah setelah dibuat.
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary w-full justify-center mt-2"
                        >
                            {isSubmitting ? (
                                'Menyimpan...'
                            ) : (
                                <>
                                    <Save size={16} />
                                    Simpan Sumber Dana
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
