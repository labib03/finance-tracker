'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFinanceStore } from '@/lib/store';
import { budgetSchema, type BudgetFormData } from '@/lib/schemas';
import { PieChart, Send } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import type { Budget } from '@/lib/types';
import NumericInput from '@/shared/forms/NumericInput';
import { Button } from '@/shared/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/shared/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { SearchableSelect } from '@/shared/ui/SearchableSelect';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

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
    const budgetList = useFinanceStore((s) => s.budgetList);
    const addBudget = useFinanceStore((s) => s.addBudget);
    const updateBudget = useFinanceStore((s) => s.updateBudget);

    const pengeluaranKategori = kategoriList.filter((k) => k.tipe === 'Pengeluaran');

    const now = new Date();

    const {
        register,
        control,
        handleSubmit,
        reset,
        watch,
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

    const watchedBulan = watch('bulan');
    const watchedTahun = watch('tahun');

    const availableKategori = useMemo(() => {
        if (budgetToEdit) return pengeluaranKategori;
        const usedIds = budgetList
            .filter(b => b.bulan === Number(watchedBulan) && b.tahun === Number(watchedTahun))
            .map(b => b.id_kategori);
        return pengeluaranKategori.filter(k => !usedIds.includes(k.id_kategori));
    }, [pengeluaranKategori, budgetList, watchedBulan, watchedTahun, budgetToEdit]);

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
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="mb-2">
                    <DialogTitle>
                        {budgetToEdit
                            ? `Edit Anggaran ${NAMA_BULAN.find(b => Number(b.value) === budgetToEdit.bulan)?.label} ${budgetToEdit.tahun}`
                            : 'Atur Anggaran'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
                    {/* Kategori */}
                    <div className="space-y-2">
                        <Label htmlFor="kategori">Kategori Pengeluaran</Label>
                        <Controller
                            name="id_kategori"
                            control={control}
                            render={({ field }) => (
                                <SearchableSelect
                                    options={availableKategori.map(k => ({
                                        value: k.id_kategori,
                                        label: k.nama_kategori
                                    }))}
                                    value={field.value}
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
                    <div className="flex flex-col space-y-2 bg-indigo-50/40 p-5 rounded-2xl border border-indigo-100/60 mt-4">
                        <NumericInput
                            label="Batas Anggaran"
                            name="nominal_limit"
                            control={control}
                            error={errors.nominal_limit?.message}
                            className="text-3xl sm:text-4xl font-black h-16 sm:h-20 bg-white border-indigo-200 focus:bg-white focus:ring-primary/20 shadow-sm text-center text-indigo-950"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full"
                        >
                            <PieChart size={18} className="mr-2" />
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Anggaran'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
