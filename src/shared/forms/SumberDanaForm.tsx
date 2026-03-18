'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFinanceStore } from '@/lib/store';
import { sumberDanaSchema, type SumberDanaFormData } from '@/lib/schemas';
import type { SumberDana } from '@/lib/types';
import { Save, Wallet } from 'lucide-react';
import { generateId } from '@/lib/utils';
import NumericInput from '@/shared/forms/NumericInput';
import { Button } from '@/shared/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

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
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="mb-2">
                    <DialogTitle>
                        {sumberDanaToEdit ? 'Edit Akun Keuangan' : 'Tambah Akun Keuangan'}
                    </DialogTitle>
                </DialogHeader>

                <div className="bg-primary/5 p-5 rounded-[1.5rem] flex items-center gap-4 mb-4 border border-primary/10 transition-all hover:bg-primary/8">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 shadow-sm shadow-primary/5">
                        <Wallet size={24} className="text-primary" />
                    </div>
                    <p className="text-sm font-bold text-primary/80 leading-snug">
                        Masukkan detail akun, dompet digital, atau rekening bank untuk melacak saldo secara terpusat.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
                    {/* ID Sumber Dana (Hidden) */}
                    <input type="hidden" {...register('id_sumber_dana')} />

                    {/* Nama Sumber Dana */}
                    <div className="space-y-2">
                        <Label htmlFor="nama_sumber">Nama Akun/Sumber Dana</Label>
                        <Input
                            id="nama_sumber"
                            placeholder="Contoh: BCA, OVO, Cash..."
                            {...register('nama_sumber')}
                            className={errors.nama_sumber ? 'border-destructive' : ''}
                        />
                        {errors.nama_sumber && (
                            <p className="text-xs font-medium text-destructive">{errors.nama_sumber.message}</p>
                        )}
                    </div>

                    {/* Saldo Awal */}
                    <div className="space-y-2">
                        <NumericInput
                            label="Saldo Awal"
                            name="saldo_awal"
                            control={control}
                            error={errors.saldo_awal?.message}
                            disabled={!!sumberDanaToEdit}
                        />
                        {sumberDanaToEdit && (
                            <p className="text-xs text-muted-foreground italic">
                                * Saldo awal tidak dapat diubah setelah akun dibuat.
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full"
                        >
                            <Save size={18} className="mr-2" />
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Akun'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
