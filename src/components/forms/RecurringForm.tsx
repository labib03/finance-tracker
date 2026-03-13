'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFinanceStore } from '@/lib/store';
import { recurringSchema, type RecurringFormData } from '@/lib/schemas';
import { getToday } from '@/lib/utils';
import { X, CalendarClock } from 'lucide-react';
import { useState } from 'react';
import NumericInput from '@/components/forms/NumericInput';

interface RecurringFormProps {
    onClose: () => void;
}

export default function RecurringForm({ onClose }: RecurringFormProps) {
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
    const addRecurring = useFinanceStore((s) => s.addRecurring);
    const [activeJenis, setActiveJenis] = useState<'Pengeluaran' | 'Pemasukan'>('Pengeluaran');

    const {
        register,
        control,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<RecurringFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(recurringSchema) as any,
        defaultValues: {
            jenis: 'Pengeluaran',
            frekuensi: 'Bulanan',
            tanggal_mulai: getToday(),
            catatan: '',
        },
    });

    const filteredKategori = kategoriList.filter((k) => k.tipe === activeJenis);

    const onSubmit = async (data: RecurringFormData) => {
        await addRecurring({
            id_kategori: data.id_kategori,
            id_sumber_dana: data.id_sumber_dana,
            jenis: data.jenis,
            nominal: data.nominal,
            catatan: data.catatan || '',
            frekuensi: data.frekuensi,
            tanggal_mulai: data.tanggal_mulai,
            tanggal_berikutnya: data.tanggal_mulai,
            aktif: true,
        });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="text-lg font-bold">Transaksi Berulang</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Tutup"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Info banner */}
                    <div className="flex items-center gap-3 mb-5 p-4 rounded-xl bg-amber-50">
                        <CalendarClock size={20} className="text-amber-600 shrink-0" />
                        <p className="text-xs font-medium text-amber-700">
                            Transaksi berulang akan secara otomatis dijadwalkan sesuai frekuensi yang dipilih.
                        </p>
                    </div>

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
                                Pengeluaran
                            </button>
                            <button
                                type="button"
                                className={`tab-item ${activeJenis === 'Pemasukan' ? 'tab-item-active' : ''}`}
                                onClick={() => {
                                    setActiveJenis('Pemasukan');
                                    setValue('jenis', 'Pemasukan');
                                }}
                            >
                                Pemasukan
                            </button>
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

                        {/* Frekuensi */}
                        <div>
                            <label className="input-label">Frekuensi</label>
                            <select
                                {...register('frekuensi')}
                                className={`input-field ${errors.frekuensi ? 'input-error' : ''}`}
                            >
                                <option value="Harian">Harian</option>
                                <option value="Mingguan">Mingguan</option>
                                <option value="Bulanan">Bulanan</option>
                                <option value="Tahunan">Tahunan</option>
                            </select>
                        </div>

                        {/* Tanggal Mulai */}
                        <div>
                            <label className="input-label">Tanggal Mulai</label>
                            <input
                                type="date"
                                {...register('tanggal_mulai')}
                                className={`input-field ${errors.tanggal_mulai ? 'input-error' : ''}`}
                            />
                            {errors.tanggal_mulai && (
                                <p className="input-error-text">{errors.tanggal_mulai.message}</p>
                            )}
                        </div>

                        {/* Catatan */}
                        <div>
                            <label className="input-label">Catatan (opsional)</label>
                            <input
                                type="text"
                                placeholder="Misal: Tagihan listrik"
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
                            <CalendarClock size={16} />
                            {isSubmitting ? 'Menyimpan...' : 'Buat Jadwal'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
