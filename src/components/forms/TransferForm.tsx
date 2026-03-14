'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFinanceStore } from '@/lib/store';
import { transferSchema, type TransferFormData } from '@/lib/schemas';
import { getToday } from '@/lib/utils';
import { ArrowLeftRight, Send } from 'lucide-react';
import { useEffect } from 'react';
import type { Transaksi } from '@/lib/types';
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

interface TransferFormProps {
    onClose: () => void;
    transferToEdit?: Transaksi | null;
}

export default function TransferForm({ onClose, transferToEdit }: TransferFormProps) {
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
    const addTransfer = useFinanceStore((s) => s.addTransfer);
    const updateTransaksi = useFinanceStore((s) => s.updateTransaksi);

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<TransferFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(transferSchema) as any,
        defaultValues: {
            tanggal: transferToEdit?.tanggal || getToday(),
            id_sumber_dana_asal: transferToEdit?.id_sumber_dana || '',
            id_sumber_dana_tujuan: transferToEdit?.id_sumber_dana_tujuan || '',
            nominal: transferToEdit?.nominal || 0,
            catatan: transferToEdit?.catatan || '',
        },
    });

    useEffect(() => {
        if (transferToEdit) {
            reset({
                tanggal: transferToEdit.tanggal,
                id_sumber_dana_asal: transferToEdit.id_sumber_dana,
                id_sumber_dana_tujuan: transferToEdit.id_sumber_dana_tujuan || '',
                nominal: transferToEdit.nominal,
                catatan: transferToEdit.catatan,
            });
        }
    }, [transferToEdit, reset]);

    const onSubmit = async (data: TransferFormData) => {
        if (transferToEdit) {
            await updateTransaksi({
                ...transferToEdit,
                tanggal: data.tanggal,
                id_sumber_dana: data.id_sumber_dana_asal,
                id_sumber_dana_tujuan: data.id_sumber_dana_tujuan,
                nominal: data.nominal,
                catatan: data.catatan || '',
            });
        } else {
            await addTransfer(
                data.id_sumber_dana_asal,
                data.id_sumber_dana_tujuan,
                data.nominal,
                data.catatan || '',
                data.tanggal
            );
        }
        onClose();
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{transferToEdit ? 'Edit Transfer' : 'Transfer Antar Akun'}</DialogTitle>
                </DialogHeader>

                <div className="bg-indigo-50/50 p-4 rounded-xl flex items-center gap-3 mb-2 border border-indigo-100/50">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <ArrowLeftRight size={20} className="text-indigo-600" />
                    </div>
                    <p className="text-xs font-medium text-indigo-700 leading-tight">
                        Pindahkan saldo antar rekening tanpa memengaruhi total pemasukan atau pengeluaran.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
                    {/* Tanggal */}
                    <div className="space-y-2">
                        <Label htmlFor="tanggal">Tanggal</Label>
                        <Input
                            id="tanggal"
                            type="date"
                            {...register('tanggal')}
                            className={errors.tanggal ? 'border-destructive' : ''}
                        />
                        {errors.tanggal && (
                            <p className="text-xs font-medium text-destructive">{errors.tanggal.message}</p>
                        )}
                    </div>

                    {/* Sumber Asal */}
                    <div className="space-y-2">
                        <Label htmlFor="sumber-asal">Dari Akun</Label>
                        <Controller
                            name="id_sumber_dana_asal"
                            control={control}
                            render={({ field }) => (
                                <SearchableSelect
                                    options={sumberDanaList.map(s => ({
                                        value: s.id_sumber_dana,
                                        label: s.nama_sumber
                                    }))}
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    placeholder="Pilih akun asal..."
                                    searchPlaceholder="Cari akun..."
                                    error={!!errors.id_sumber_dana_asal}
                                />
                            )}
                        />
                        {errors.id_sumber_dana_asal && (
                            <p className="text-xs font-medium text-destructive">{errors.id_sumber_dana_asal.message}</p>
                        )}
                    </div>

                    {/* Arrow indicator */}
                    <div className="flex justify-center -my-2 relative z-10">
                        <div className="w-8 h-8 rounded-full bg-background border flex items-center justify-center shadow-sm">
                            <ArrowLeftRight size={16} className="text-muted-foreground rotate-90" />
                        </div>
                    </div>

                    {/* Sumber Tujuan */}
                    <div className="space-y-2">
                        <Label htmlFor="sumber-tujuan">Ke Akun</Label>
                        <Controller
                            name="id_sumber_dana_tujuan"
                            control={control}
                            render={({ field }) => (
                                <SearchableSelect
                                    options={sumberDanaList.map(s => ({
                                        value: s.id_sumber_dana,
                                        label: s.nama_sumber
                                    }))}
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    placeholder="Pilih akun tujuan..."
                                    searchPlaceholder="Cari akun..."
                                    error={!!errors.id_sumber_dana_tujuan}
                                />
                            )}
                        />
                        {errors.id_sumber_dana_tujuan && (
                            <p className="text-xs font-medium text-destructive">{errors.id_sumber_dana_tujuan.message}</p>
                        )}
                    </div>

                    {/* Nominal */}
                    <NumericInput
                        label="Nominal Transfer"
                        name="nominal"
                        control={control}
                        error={errors.nominal?.message}
                    />

                    {/* Catatan */}
                    <div className="space-y-2">
                        <Label htmlFor="catatan">Catatan (opsional)</Label>
                        <Textarea
                            id="catatan"
                            placeholder="Misal: Tarik tunai ATM"
                            {...register('catatan')}
                            className="resize-none"
                            rows={3}
                        />
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700"
                        >
                            <ArrowLeftRight size={16} className="mr-2" />
                            {isSubmitting ? 'Memproses...' : 'Transfer Sekarang'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
