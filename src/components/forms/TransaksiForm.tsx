'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFinanceStore } from '@/lib/store';
import { transaksiSchema, type TransaksiFormData } from '@/lib/schemas';
import type { Transaksi } from '@/lib/types';
import { getToday } from '@/lib/utils';
import { X, Send, CalendarIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
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
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TransaksiFormProps {
    onClose: () => void;
    transaksiToEdit?: Transaksi | null;
}

export default function TransaksiForm({ onClose, transaksiToEdit }: TransaksiFormProps) {
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
    const addTransaksi = useFinanceStore((s) => s.addTransaksi);
    const updateTransaksi = useFinanceStore((s) => s.updateTransaksi);
    const [activeJenis, setActiveJenis] = useState<'Pengeluaran' | 'Pemasukan'>(
        (transaksiToEdit?.jenis === 'Pemasukan' ? 'Pemasukan' : 'Pengeluaran') as 'Pengeluaran' | 'Pemasukan'
    );

    const {
        register,
        control,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<TransaksiFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(transaksiSchema) as any,
        defaultValues: {
            tanggal: transaksiToEdit?.tanggal || getToday(),
            jenis: (transaksiToEdit?.jenis || 'Pengeluaran') as 'Pengeluaran' | 'Pemasukan',
            id_sumber_dana: transaksiToEdit?.id_sumber_dana || '',
            id_kategori: transaksiToEdit?.id_kategori || '',
            nominal: transaksiToEdit?.nominal || 0,
            catatan: transaksiToEdit?.catatan || '',
        },
    });

    useEffect(() => {
        if (transaksiToEdit) {
            reset({
                tanggal: transaksiToEdit.tanggal,
                jenis: transaksiToEdit.jenis as 'Pengeluaran' | 'Pemasukan',
                id_sumber_dana: transaksiToEdit.id_sumber_dana,
                id_kategori: transaksiToEdit.id_kategori,
                nominal: transaksiToEdit.nominal,
                catatan: transaksiToEdit.catatan,
            });
            setActiveJenis(transaksiToEdit.jenis as 'Pengeluaran' | 'Pemasukan');
        }
    }, [transaksiToEdit, reset]);

    const filteredKategori = kategoriList.filter((k) => k.tipe === activeJenis);

    const onSubmit = async (data: TransaksiFormData) => {
        // Map names back to IDs for database
        const sdId = sumberDanaList.find(s => s.nama_sumber === data.id_sumber_dana)?.id_sumber_dana || data.id_sumber_dana;
        const katId = kategoriList.find(k => k.nama_kategori === data.id_kategori)?.id_kategori || data.id_kategori;

        if (transaksiToEdit) {
            await updateTransaksi({
                ...transaksiToEdit,
                ...data,
                id_sumber_dana: sdId,
                id_kategori: katId,
            });
        } else {
            await addTransaksi({
                ...data,
                id_sumber_dana: sdId,
                id_kategori: katId,
            });
        }
        onClose();
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{transaksiToEdit ? 'Edit Transaksi' : 'Tambah Transaksi'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-5 py-2">
                    {/* Jenis toggle */}
                    <div className="flex justify-center">
                        <Tabs
                            value={activeJenis}
                            onValueChange={(val) => {
                                const jenis = val as 'Pengeluaran' | 'Pemasukan';
                                setActiveJenis(jenis);
                                setValue('jenis', jenis);
                                // Reset kategori if it doesn't match new type to avoid showing ID in UI
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

                    {/* Tanggal */}
                    <div className="space-y-2">
                        <Label htmlFor="tanggal">Tanggal</Label>
                        <div className="relative">
                            <Input
                                id="tanggal"
                                type="date"
                                {...register('tanggal')}
                                className={errors.tanggal ? 'border-destructive' : ''}
                            />
                        </div>
                        {errors.tanggal && (
                            <p className="text-xs font-medium text-destructive">{errors.tanggal.message}</p>
                        )}
                    </div>

                    {/* Sumber Dana */}
                    <div className="space-y-2">
                        <Label htmlFor="sumber-dana">Sumber Dana</Label>
                        <Controller
                            name="id_sumber_dana"
                            control={control}
                            render={({ field }) => (
                                <SearchableSelect
                                    options={sumberDanaList.map(s => ({
                                        value: s.nama_sumber,
                                        label: s.nama_sumber
                                    }))}
                                    value={sumberDanaList.find(s => s.id_sumber_dana === field.value)?.nama_sumber || field.value}
                                    onValueChange={field.onChange}
                                    placeholder="Pilih sumber dana..."
                                    searchPlaceholder="Cari sumber dana..."
                                    error={!!errors.id_sumber_dana}
                                />
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
                                <SearchableSelect
                                    options={filteredKategori.map(k => ({
                                        value: k.nama_kategori,
                                        label: k.nama_kategori
                                    }))}
                                    value={kategoriList.find(k => k.id_kategori === field.value)?.nama_kategori || field.value}
                                    onValueChange={field.onChange}
                                    placeholder="Pilih kategori..."
                                    searchPlaceholder="Cari kategori..."
                                    error={!!errors.id_kategori}
                                />
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

                    {/* Catatan */}
                    <div className="space-y-2">
                        <Label htmlFor="catatan">Catatan (opsional)</Label>
                        <Textarea
                            id="catatan"
                            placeholder="Tambah catatan..."
                            {...register('catatan')}
                            className="resize-none"
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-xl"
                        >
                            <Send size={16} className="mr-2" />
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
