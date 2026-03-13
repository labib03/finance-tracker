'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFinanceStore } from '@/lib/store';
import { transferSchema, type TransferFormData } from '@/lib/schemas';
import { getToday } from '@/lib/utils';
import { X, ArrowLeftRight } from 'lucide-react';
import NumericInput from '@/components/forms/NumericInput';

interface TransferFormProps {
    onClose: () => void;
}

export default function TransferForm({ onClose }: TransferFormProps) {
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
    const addTransfer = useFinanceStore((s) => s.addTransfer);

    const {
        register,
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<TransferFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(transferSchema) as any,
        defaultValues: {
            tanggal: getToday(),
            catatan: '',
        },
    });

    const onSubmit = async (data: TransferFormData) => {
        await addTransfer(
            data.id_sumber_dana_asal,
            data.id_sumber_dana_tujuan,
            data.nominal,
            data.catatan || '',
            data.tanggal
        );
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="text-lg font-bold">Transfer Antar Akun</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Tutup"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Transfer visual */}
                    <div className="flex items-center justify-center gap-3 mb-5 p-4 rounded-xl" style={{ background: 'var(--color-transfer-bg)' }}>
                        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                            <ArrowLeftRight size={20} className="text-violet-600" />
                        </div>
                        <p className="text-sm font-medium text-violet-700">
                            Pindahkan saldo antar rekening
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Tanggal */}
                        <div>
                            <label className="input-label">Tanggal</label>
                            <input
                                type="date"
                                {...register('tanggal')}
                                className={`input-field ${errors.tanggal ? 'input-error' : ''}`}
                            />
                            {errors.tanggal && (
                                <p className="input-error-text">{errors.tanggal.message}</p>
                            )}
                        </div>

                        {/* Sumber Asal */}
                        <div>
                            <label className="input-label">Dari Akun</label>
                            <select
                                {...register('id_sumber_dana_asal')}
                                className={`input-field ${errors.id_sumber_dana_asal ? 'input-error' : ''}`}
                            >
                                <option value="">Pilih akun asal...</option>
                                {sumberDanaList.map((sd) => (
                                    <option key={sd.id_sumber_dana} value={sd.id_sumber_dana}>
                                        {sd.nama_sumber}
                                    </option>
                                ))}
                            </select>
                            {errors.id_sumber_dana_asal && (
                                <p className="input-error-text">{errors.id_sumber_dana_asal.message}</p>
                            )}
                        </div>

                        {/* Arrow indicator */}
                        <div className="flex justify-center">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <ArrowLeftRight size={16} className="text-gray-400 rotate-90" />
                            </div>
                        </div>

                        {/* Sumber Tujuan */}
                        <div>
                            <label className="input-label">Ke Akun</label>
                            <select
                                {...register('id_sumber_dana_tujuan')}
                                className={`input-field ${errors.id_sumber_dana_tujuan ? 'input-error' : ''}`}
                            >
                                <option value="">Pilih akun tujuan...</option>
                                {sumberDanaList.map((sd) => (
                                    <option key={sd.id_sumber_dana} value={sd.id_sumber_dana}>
                                        {sd.nama_sumber}
                                    </option>
                                ))}
                            </select>
                            {errors.id_sumber_dana_tujuan && (
                                <p className="input-error-text">{errors.id_sumber_dana_tujuan.message}</p>
                            )}
                        </div>

                        {/* Nominal */}
                        <div>
                            <NumericInput
                                label="Nominal Transfer"
                                name="nominal"
                                control={control}
                                error={errors.nominal?.message}
                                className="text-lg"
                                placeholder="0"
                            />
                        </div>

                        {/* Catatan */}
                        <div>
                            <label className="input-label">Catatan (opsional)</label>
                            <input
                                type="text"
                                placeholder="Misal: Tarik tunai ATM"
                                {...register('catatan')}
                                className="input-field"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary w-full justify-center mt-2"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)' }}
                        >
                            <ArrowLeftRight size={16} />
                            {isSubmitting ? 'Memproses...' : 'Transfer Sekarang'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
