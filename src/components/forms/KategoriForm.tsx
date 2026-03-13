'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFinanceStore } from '@/lib/store';
import { kategoriSchema, type KategoriFormData } from '@/lib/schemas';
import type { Kategori } from '@/lib/types';
import { X, Save, Target } from 'lucide-react';
import { generateId } from '@/lib/utils';

interface KategoriFormProps {
    onClose: () => void;
    kategoriToEdit?: Kategori | null;
}

export default function KategoriForm({ onClose, kategoriToEdit }: KategoriFormProps) {
    const addKategori = useFinanceStore((s) => s.addKategori);
    const updateKategori = useFinanceStore((s) => s.updateKategori);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<KategoriFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(kategoriSchema) as any,
        defaultValues: {
            id_kategori: '',
            nama_kategori: '',
            tipe: 'Pengeluaran',
            icon_name: 'circle',
        },
    });

    useEffect(() => {
        if (kategoriToEdit) {
            reset({
                id_kategori: kategoriToEdit.id_kategori,
                nama_kategori: kategoriToEdit.nama_kategori,
                tipe: kategoriToEdit.tipe,
                icon_name: kategoriToEdit.icon_name,
            });
        } else {
            reset({
                id_kategori: `KAT-${generateId().substring(0, 6)}`,
                nama_kategori: '',
                tipe: 'Pengeluaran',
                icon_name: 'circle',
            });
        }
    }, [kategoriToEdit, reset]);

    const onSubmit = async (data: KategoriFormData) => {
        if (kategoriToEdit) {
            await updateKategori(data as Kategori);
        } else {
            await addKategori(data as Kategori);
        }
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="text-lg font-bold">
                        {kategoriToEdit ? 'Edit Kategori' : 'Tambah Kategori'}
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
                        {/* ID Kategori (Hidden or Read-only) */}
                        <input type="hidden" {...register('id_kategori')} />

                        {/* Nama Kategori */}
                        <div>
                            <label className="input-label">Nama Kategori</label>
                            <input
                                type="text"
                                placeholder="Contoh: Makanan, Gaji..."
                                {...register('nama_kategori')}
                                className={`input-field ${errors.nama_kategori ? 'input-error' : ''}`}
                            />
                            {errors.nama_kategori && (
                                <p className="input-error-text">{errors.nama_kategori.message}</p>
                            )}
                        </div>

                        {/* Tipe */}
                        <div>
                            <label className="input-label">Tipe</label>
                            <div className="grid grid-cols-2 gap-3">
                                <label
                                    className={`border rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-all ${!errors.tipe ? 'hover:bg-gray-50' : ''
                                        } [&:has(input:checked)]:bg-red-50 [&:has(input:checked)]:border-red-200 [&:has(input:checked)]:text-red-700`}
                                >
                                    <input
                                        type="radio"
                                        value="Pengeluaran"
                                        {...register('tipe')}
                                        className="hidden"
                                    />
                                    <span className="text-sm font-semibold">Pengeluaran</span>
                                </label>
                                <label
                                    className={`border rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-all ${!errors.tipe ? 'hover:bg-gray-50' : ''
                                        } [&:has(input:checked)]:bg-emerald-50 [&:has(input:checked)]:border-emerald-200 [&:has(input:checked)]:text-emerald-700`}
                                >
                                    <input
                                        type="radio"
                                        value="Pemasukan"
                                        {...register('tipe')}
                                        className="hidden"
                                    />
                                    <span className="text-sm font-semibold">Pemasukan</span>
                                </label>
                            </div>
                            {errors.tipe && (
                                <p className="input-error-text mt-1">{errors.tipe.message}</p>
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
                                    Simpan Kategori
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
