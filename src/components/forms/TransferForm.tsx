'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFinanceStore } from '@/lib/store';
import { transferSchema, type TransferFormData } from '@/lib/schemas';
import { getToday, cn } from '@/lib/utils';
import { ArrowLeftRight, CalendarIcon } from 'lucide-react';
import { useEffect } from 'react';
import type { Transaksi } from '@/lib/types';
import NumericInput from '@/components/forms/NumericInput';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface TransferFormProps {
    onClose: () => void;
    transferToEdit?: Transaksi | null;
}

export default function TransferForm({ onClose, transferToEdit }: TransferFormProps) {
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const addTransfer = useFinanceStore((s) => s.addTransfer);
    const updateTransfer = useFinanceStore((s) => s.updateTransfer);

    const {
        register,
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<TransferFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(transferSchema) as any,
        defaultValues: {
            tanggal: transferToEdit?.tanggal || getToday(),
            id_sumber_dana_asal: transferToEdit?.id_sumber_dana || '',
            id_target_dana: transferToEdit?.id_target_dana || '',
            nominal: transferToEdit?.nominal || 0,
            label: transferToEdit?.label || 'Transfer Saldo',
            catatan: transferToEdit?.catatan || '',
        },
    });

    useEffect(() => {
        if (transferToEdit) {
            const linkedAdminFee = transaksiList.find(t => t.catatan.includes(`[ADMIN_FEE:${transferToEdit.id}]`));
            reset({
                tanggal: transferToEdit.tanggal,
                id_sumber_dana_asal: transferToEdit.id_sumber_dana,
                id_target_dana: transferToEdit.id_target_dana || '',
                nominal: transferToEdit.nominal,
                label: transferToEdit.label,
                catatan: transferToEdit.catatan,
            });
        }
    }, [transferToEdit, reset, transaksiList]);

    const onSubmit = async (data: TransferFormData) => {
        if (transferToEdit) {
            await updateTransfer({
                ...transferToEdit,
                tanggal: data.tanggal,
                id_sumber_dana: data.id_sumber_dana_asal,
                id_target_dana: data.id_target_dana,
                nominal: data.nominal,
                label: data.label,
                catatan: data.catatan || '',
            }, 0);
        } else {
            await addTransfer(
                data.id_sumber_dana_asal,
                data.id_target_dana,
                data.nominal,
                data.label,
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
                        <Controller
                            name="tanggal"
                            control={control}
                            render={({ field }) => (
                                <Popover>
                                    <PopoverTrigger
                                        className={cn(
                                            "flex h-10 w-full items-center justify-start rounded-xl border border-input bg-transparent px-3 py-2 text-sm font-normal whitespace-nowrap transition-colors outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                            !field.value && "text-muted-foreground",
                                            errors.tanggal && "border-destructive"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                        <span className="display-number">
                                            {field.value 
                                                ? new Date(field.value).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) 
                                                : "Pilih tanggal"}
                                        </span>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
                                                    const year = date.getFullYear();
                                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                                    const day = String(date.getDate()).padStart(2, '0');
                                                    field.onChange(`${year}-${month}-${day}`);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            )}
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
                            name="id_target_dana"
                            control={control}
                            render={({ field }) => (
                                <SearchableSelect
                                    options={sumberDanaList
                                        .filter(s => s.id_sumber_dana !== watch('id_sumber_dana_asal'))
                                        .map(s => ({
                                            value: s.id_sumber_dana,
                                            label: s.nama_sumber
                                        }))}
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    placeholder="Pilih akun tujuan..."
                                    searchPlaceholder="Cari akun..."
                                    error={!!errors.id_target_dana}
                                />
                            )}
                        />
                        {errors.id_target_dana && (
                            <p className="text-xs font-medium text-destructive">{errors.id_target_dana.message}</p>
                        )}
                    </div>

                    {/* Nominal */}
                    <div className="grid grid-cols-1 gap-4">
                        <NumericInput
                            label="Nominal Transfer"
                            name="nominal"
                            control={control}
                            error={errors.nominal?.message}
                        />
                    </div>

                    {/* Label/Judul */}
                    <div className="space-y-2">
                        <Label htmlFor="label">Judul Transfer</Label>
                        <Input
                            id="label"
                            placeholder="Misal: Transfer ke Tabungan"
                            {...register('label')}
                            className={cn(
                                "h-11 rounded-xl whitespace-nowrap",
                                errors.label && "border-destructive"
                            )}
                        />
                        {errors.label && (
                            <p className="text-xs font-medium text-destructive">{errors.label.message}</p>
                        )}
                    </div>

                    {/* Catatan (Detail) */}
                    <div className="space-y-2">
                        <Label htmlFor="catatan">Detail (opsional)</Label>
                        <Textarea
                            id="catatan"
                            placeholder="Tambah detail atau catatan tambahan..."
                            {...register('catatan')}
                            className="resize-none rounded-xl"
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
