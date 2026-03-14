'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFinanceStore } from '@/lib/store';
import { sumberDanaSchema, type SumberDanaFormData } from '@/lib/schemas';
import type { SumberDana } from '@/lib/types';
import { Save, Wallet } from 'lucide-react';
import { generateId } from '@/lib/utils';
import NumericInput from '@/components/forms/NumericInput';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {sumberDanaToEdit ? 'Edit Akun Keuangan' : 'Tambah Akun Keuangan'}
                    </DialogTitle>
                </DialogHeader>

                <div className="bg-indigo-50/50 p-4 rounded-xl flex items-center gap-3 mb-2 border border-indigo-100/50">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <Wallet size={20} className="text-indigo-600" />
                    </div>
                    <p className="text-xs font-medium text-indigo-700 leading-tight">
                        Masukkan detail akun, dompet digital, atau rekening bank Anda untuk melacak saldo secara terpusat.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-2">
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
                            <p className="text-[10px] text-muted-foreground italic">
                                * Saldo awal tidak dapat diubah setelah akun dibuat.
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-xl"
                        >
                            {isSubmitting ? (
                                'Menyimpan...'
                            ) : (
                                <>
                                    <Save size={16} className="mr-2" />
                                    Simpan Akun
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
