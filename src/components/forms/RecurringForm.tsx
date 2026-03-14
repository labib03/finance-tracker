'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFinanceStore } from '@/lib/store';
import { recurringSchema, type RecurringFormData } from '@/lib/schemas';
import { getToday } from '@/lib/utils';
import { CalendarClock, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { RecurringTransaction } from '@/lib/types';
import NumericInput from '@/components/forms/NumericInput';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RecurringFormProps {
    onClose: () => void;
    recurringToEdit?: RecurringTransaction | null;
}

export default function RecurringForm({ onClose, recurringToEdit }: RecurringFormProps) {
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
    const addRecurring = useFinanceStore((s) => s.addRecurring);
    const updateRecurring = useFinanceStore((s) => s.updateRecurring);
    const [activeJenis, setActiveJenis] = useState<'Pengeluaran' | 'Pemasukan'>(
        recurringToEdit?.jenis === 'Pemasukan' ? 'Pemasukan' : 'Pengeluaran'
    );

    const {
        register,
        control,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<RecurringFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(recurringSchema) as any,
        defaultValues: {
            id_kategori: recurringToEdit?.id_kategori || '',
            id_sumber_dana: recurringToEdit?.id_sumber_dana || '',
            jenis: recurringToEdit?.jenis || 'Pengeluaran',
            nominal: recurringToEdit?.nominal || 0,
            frekuensi: recurringToEdit?.frekuensi || 'Bulanan',
            tanggal_mulai: recurringToEdit?.tanggal_mulai || getToday(),
            catatan: recurringToEdit?.catatan || '',
        },
    });

    useEffect(() => {
        if (recurringToEdit) {
            reset({
                id_kategori: recurringToEdit.id_kategori,
                id_sumber_dana: recurringToEdit.id_sumber_dana,
                jenis: recurringToEdit.jenis as 'Pengeluaran' | 'Pemasukan',
                nominal: recurringToEdit.nominal,
                frekuensi: recurringToEdit.frekuensi as any,
                tanggal_mulai: recurringToEdit.tanggal_mulai,
                catatan: recurringToEdit.catatan,
            });
            setActiveJenis(recurringToEdit.jenis as 'Pengeluaran' | 'Pemasukan');
        }
    }, [recurringToEdit, reset]);

    const filteredKategori = kategoriList.filter((k) => k.tipe === activeJenis);

    const onSubmit = async (data: RecurringFormData) => {
        // Map names back to IDs for database
        const sdId = sumberDanaList.find(s => s.nama_sumber === data.id_sumber_dana)?.id_sumber_dana || data.id_sumber_dana;
        const katId = kategoriList.find(k => k.nama_kategori === data.id_kategori)?.id_kategori || data.id_kategori;

        if (recurringToEdit) {
            await updateRecurring({
                ...recurringToEdit,
                ...data,
                id_sumber_dana: sdId,
                id_kategori: katId,
                // If start date changed, we might need to recalculate next date? 
                // For simplicity, we just keep current next date unless start date is in future
                tanggal_berikutnya: data.tanggal_mulai > recurringToEdit.tanggal_berikutnya ? data.tanggal_mulai : recurringToEdit.tanggal_berikutnya
            });
        } else {
            await addRecurring({
                ...data,
                id_sumber_dana: sdId,
                id_kategori: katId,
                tanggal_berikutnya: data.tanggal_mulai,
                aktif: true,
            });
        }
        onClose();
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{recurringToEdit ? 'Edit Jadwal Berulang' : 'Transaksi Berulang'}</DialogTitle>
                </DialogHeader>

                <div className="bg-amber-50/50 p-4 rounded-xl flex items-center gap-3 mb-2 border border-amber-100/50">
                    <CalendarClock size={20} className="text-amber-600 shrink-0" />
                    <p className="text-xs font-medium text-amber-700 leading-tight">
                        Transaksi berulang akan secara otomatis dijadwalkan sesuai frekuensi yang dipilih.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
                    {/* Jenis toggle */}
                    <div className="flex justify-center">
                        <Tabs
                            value={activeJenis}
                            onValueChange={(val) => {
                                const jenis = val as 'Pengeluaran' | 'Pemasukan';
                                setActiveJenis(jenis);
                                setValue('jenis', jenis);
                                // Reset kategori to avoid showing ID when list changes
                                setValue('id_kategori', '');
                            }}
                            className="w-full"
                        >
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="Pengeluaran">💸 Pengeluaran</TabsTrigger>
                                <TabsTrigger value="Pemasukan">💰 Pemasukan</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Sumber Dana */}
                    <div className="space-y-2">
                        <Label htmlFor="sumber-dana">Sumber Dana</Label>
                        <Controller
                            name="id_sumber_dana"
                            control={control}
                            render={({ field }) => (
                                <Select 
                                    onValueChange={field.onChange} 
                                    value={sumberDanaList.find(s => s.id_sumber_dana === field.value)?.nama_sumber || field.value}
                                >
                                    <SelectTrigger className={errors.id_sumber_dana ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Pilih sumber dana..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sumberDanaList.map((sd) => (
                                            <SelectItem key={sd.id_sumber_dana} value={sd.nama_sumber}>
                                                {sd.nama_sumber}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.id_sumber_dana && (
                            <p className="text-xs font-medium text-destructive">{errors.id_sumber_dana.message}</p>
                        )}
                    </div>

                    {/* Kategori */}
                    <div className="space-y-2">
                        <Label htmlFor="kategori">Kategori</Label>
                        <Controller
                            name="id_kategori"
                            control={control}
                            render={({ field }) => (
                                <Select 
                                    onValueChange={field.onChange} 
                                    value={kategoriList.find(k => k.id_kategori === field.value)?.nama_kategori || field.value}
                                >
                                    <SelectTrigger className={errors.id_kategori ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Pilih kategori..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredKategori.map((k) => (
                                            <SelectItem key={k.id_kategori} value={k.nama_kategori}>
                                                {k.nama_kategori}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.id_kategori && (
                            <p className="text-xs font-medium text-destructive">{errors.id_kategori.message}</p>
                        )}
                    </div>

                    {/* Nominal */}
                    <NumericInput
                        label="Nominal"
                        name="nominal"
                        control={control}
                        error={errors.nominal?.message}
                    />

                    {/* Frekuensi & Tanggal Mulai Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="frekuensi">Frekuensi</Label>
                            <Controller
                                name="frekuensi"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Harian">Harian</SelectItem>
                                            <SelectItem value="Mingguan">Mingguan</SelectItem>
                                            <SelectItem value="Bulanan">Bulanan</SelectItem>
                                            <SelectItem value="Tahunan">Tahunan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tanggal_mulai">Mulai</Label>
                            <Input
                                id="tanggal_mulai"
                                type="date"
                                {...register('tanggal_mulai')}
                                className={errors.tanggal_mulai ? 'border-destructive' : ''}
                            />
                        </div>
                    </div>

                    {/* Catatan */}
                    <div className="space-y-2">
                        <Label htmlFor="catatan">Catatan (opsional)</Label>
                        <Input
                            id="catatan"
                            placeholder="Misal: Tagihan listrik"
                            {...register('catatan')}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-xl"
                        >
                            <CalendarClock size={16} className="mr-2" />
                            {isSubmitting ? 'Menyimpan...' : (recurringToEdit ? 'Simpan Perubahan' : 'Buat Jadwal')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
