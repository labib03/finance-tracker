'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFinanceStore } from '@/lib/store';
import { transaksiSchema, type TransaksiFormData } from '@/lib/schemas';
import { getToday } from '@/lib/utils';
import { X, Send } from 'lucide-react';
import { useState } from 'react';
import NumericInput from '@/components/forms/NumericInput';

interface TransaksiFormProps {
    onClose: () => void;
}

export default function TransaksiForm({ onClose }: TransaksiFormProps) {
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
    const addTransaksi = useFinanceStore((s) => s.addTransaksi);
    const [activeJenis, setActiveJenis] = useState<'Pengeluaran' | 'Pemasukan'>('Pengeluaran');

    const {
        register,
        control,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<TransaksiFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(transaksiSchema) as any,
        defaultValues: {
            tanggal: getToday(),
            jenis: 'Pengeluaran',
            catatan: '',
        },
    });

    const filteredKategori = kategoriList.filter((k) => k.tipe === activeJenis);

    const onSubmit = async (data: TransaksiFormData) => {
        await addTransaksi({
            tanggal: data.tanggal,
            jenis: data.jenis,
            id_sumber_dana: data.id_sumber_dana,
            id_kategori: data.id_kategori,
            nominal: data.nominal,
            catatan: data.catatan || '',
        });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="text-lg font-bold">Tambah Transaksi</h2>
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
                        {/* Jenis toggle */}
                        <div className="tab-group">
                            <button
                                type="button"
                                className={`tab-item ${activeJenis === 'Pengeluaran' ? 'tab-item-active' : ''}`}
                                onClick={() => {
                                    setActiveJenis('Pengeluaran');
                                    setValue('jenis', 'Pengeluaran');
                                }}
                            >
                                💸 Pengeluaran
                            </button>
                            <button
                                type="button"
                                className={`tab-item ${activeJenis === 'Pemasukan' ? 'tab-item-active' : ''}`}
                                onClick={() => {
                                    setActiveJenis('Pemasukan');
                                    setValue('jenis', 'Pemasukan');
                                }}
                            >
                                💰 Pemasukan
                            </button>
                        </div>

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

                        {/* Sumber Dana */}
                        <div>
                            <label className="input-label">Sumber Dana</label>
                            <select
                                {...register('id_sumber_dana')}
                                className={`input-field ${errors.id_sumber_dana ? 'input-error' : ''}`}
                            >
                                <option value="">Pilih sumber dana...</option>
                                {sumberDanaList.map((sd) => (
                                    <option key={sd.id_sumber_dana} value={sd.id_sumber_dana}>
                                        {sd.nama_sumber}
                                    </option>
                                ))}
                            </select>
                            {errors.id_sumber_dana && (
                                <p className="input-error-text">{errors.id_sumber_dana.message}</p>
                            )}
                        </div>

                        {/* Kategori */}
                        <div>
                            <label className="input-label">Kategori</label>
                            <select
                                {...register('id_kategori')}
                                className={`input-field ${errors.id_kategori ? 'input-error' : ''}`}
                            >
                                <option value="">Pilih kategori...</option>
                                {filteredKategori.map((k) => (
                                    <option key={k.id_kategori} value={k.id_kategori}>
                                        {k.nama_kategori}
                                    </option>
                                ))}
                            </select>
                            {errors.id_kategori && (
                                <p className="input-error-text">{errors.id_kategori.message}</p>
                            )}
                        </div>

                        {/* Nominal */}
                        <div>
                            <NumericInput
                                label="Nominal"
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
                                placeholder="Tambah catatan..."
                                {...register('catatan')}
                                className="input-field"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary w-full justify-center mt-2"
                        >
                            <Send size={16} />
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
