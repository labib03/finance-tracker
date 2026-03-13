'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFinanceStore } from '@/lib/store';
import { budgetSchema, type BudgetFormData } from '@/lib/schemas';
import { X, PieChart } from 'lucide-react';
import NumericInput from '@/components/forms/NumericInput';

const NAMA_BULAN = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
];

interface BudgetFormProps {
    onClose: () => void;
}

export default function BudgetForm({ onClose }: BudgetFormProps) {
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const addBudget = useFinanceStore((s) => s.addBudget);

    const pengeluaranKategori = kategoriList.filter((k) => k.tipe === 'Pengeluaran');

    const now = new Date();

    const {
        register,
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<BudgetFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(budgetSchema) as any,
        defaultValues: {
            bulan: now.getMonth() + 1,
            tahun: now.getFullYear(),
        },
    });

    const onSubmit = async (data: BudgetFormData) => {
        await addBudget({
            id_kategori: data.id_kategori,
            bulan: data.bulan,
            tahun: data.tahun,
            nominal_limit: data.nominal_limit,
        });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="text-lg font-bold">Atur Anggaran</h2>
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
                        {/* Kategori */}
                        <div>
                            <label className="input-label">Kategori Pengeluaran</label>
                            <select
                                {...register('id_kategori')}
                                className={`input-field ${errors.id_kategori ? 'input-error' : ''}`}
                            >
                                <option value="">Pilih kategori...</option>
                                {pengeluaranKategori.map((k) => (
                                    <option key={k.id_kategori} value={k.id_kategori}>
                                        {k.nama_kategori}
                                    </option>
                                ))}
                            </select>
                            {errors.id_kategori && (
                                <p className="input-error-text">{errors.id_kategori.message}</p>
                            )}
                        </div>

                        {/* Bulan & Tahun (side-by-side) */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="input-label">Bulan</label>
                                <select
                                    {...register('bulan')}
                                    className={`input-field ${errors.bulan ? 'input-error' : ''}`}
                                >
                                    {NAMA_BULAN.map((b) => (
                                        <option key={b.value} value={b.value}>
                                            {b.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.bulan && (
                                    <p className="input-error-text">{errors.bulan.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="input-label">Tahun</label>
                                <input
                                    type="number"
                                    {...register('tahun')}
                                    className={`input-field ${errors.tahun ? 'input-error' : ''}`}
                                    min={2020}
                                    max={2100}
                                />
                                {errors.tahun && (
                                    <p className="input-error-text">{errors.tahun.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Nominal Limit */}
                        <div>
                            <NumericInput
                                label="Batas Anggaran"
                                name="nominal_limit"
                                control={control}
                                error={errors.nominal_limit?.message}
                                className="text-lg"
                                placeholder="0"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary w-full justify-center mt-2"
                        >
                            <PieChart size={16} />
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Anggaran'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
