'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFinanceStore } from '@/lib/store';
import { budgetSchema, type BudgetFormData } from '@/lib/schemas';
import { PieChart, Send } from 'lucide-react';
import { useEffect } from 'react';
import type { Budget } from '@/lib/types';
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

const NAMA_BULAN = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
];

interface BudgetFormProps {
    onClose: () => void;
    budgetToEdit?: Budget | null;
}

export default function BudgetForm({ onClose, budgetToEdit }: BudgetFormProps) {
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const addBudget = useFinanceStore((s) => s.addBudget);
    const updateBudget = useFinanceStore((s) => s.updateBudget);

    const pengeluaranKategori = kategoriList.filter((k) => k.tipe === 'Pengeluaran');

    const now = new Date();

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<BudgetFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(budgetSchema) as any,
        defaultValues: {
            id_kategori: budgetToEdit?.id_kategori || '',
            bulan: budgetToEdit?.bulan || now.getMonth() + 1,
            tahun: budgetToEdit?.tahun || now.getFullYear(),
            nominal_limit: budgetToEdit?.nominal_limit || 0,
        },
    });

    useEffect(() => {
        if (budgetToEdit) {
            reset({
                id_kategori: budgetToEdit.id_kategori,
                bulan: budgetToEdit.bulan,
                tahun: budgetToEdit.tahun,
                nominal_limit: budgetToEdit.nominal_limit,
            });
        }
    }, [budgetToEdit, reset]);

    const onSubmit = async (data: BudgetFormData) => {
        if (budgetToEdit) {
            await updateBudget({
                ...budgetToEdit,
                id_kategori: data.id_kategori,
                bulan: Number(data.bulan),
                tahun: Number(data.tahun),
                nominal_limit: data.nominal_limit,
            });
        } else {
            await addBudget({
                id_kategori: data.id_kategori,
                bulan: Number(data.bulan),
                tahun: Number(data.tahun),
                nominal_limit: data.nominal_limit,
            });
        }
        onClose();
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {budgetToEdit
                            ? `Edit Anggaran ${NAMA_BULAN.find(b => Number(b.value) === budgetToEdit.bulan)?.label} ${budgetToEdit.tahun}`
                            : 'Atur Anggaran'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
                    {/* Kategori */}
                    <div className="space-y-2">
                        <Label htmlFor="kategori">Kategori Pengeluaran</Label>
                        <Controller
                            name="id_kategori"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className={errors.id_kategori ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Pilih kategori..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pengeluaranKategori.map((k) => (
                                            <SelectItem key={k.id_kategori} value={k.id_kategori}>
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

                    {/* Bulan & Tahun (side-by-side) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="bulan">Bulan</Label>
                            <Controller
                                name="bulan"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(label) => {
                                            const found = NAMA_BULAN.find(b => b.label === label);
                                            if (found) field.onChange(Number(found.value));
                                        }}
                                        value={NAMA_BULAN.find(b => Number(b.value) === field.value)?.label}
                                    >
                                        <SelectTrigger className={errors.bulan ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Bulan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {NAMA_BULAN.map((b) => (
                                                <SelectItem key={b.value} value={b.label}>
                                                    {b.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.bulan && (
                                <p className="text-xs font-medium text-destructive">{errors.bulan.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tahun">Tahun</Label>
                            <Input
                                id="tahun"
                                type="number"
                                {...register('tahun')}
                                className={errors.tahun ? 'border-destructive' : ''}
                                min={2020}
                                max={2100}
                            />
                            {errors.tahun && (
                                <p className="text-xs font-medium text-destructive">{errors.tahun.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Nominal Limit */}
                    <NumericInput
                        label="Batas Anggaran"
                        name="nominal_limit"
                        control={control}
                        error={errors.nominal_limit?.message}
                    />

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700"
                        >
                            {isSubmitting ? (
                                'Menyimpan...'
                            ) : (
                                <>
                                    <PieChart size={16} className="mr-2" />
                                    Simpan Anggaran
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
