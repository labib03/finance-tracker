'use client';

import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFinanceStore } from '@/lib/store';
import { budgetSchema, type BudgetFormData } from '@/lib/schemas';
import { PieChart, Send, Sparkles, CalendarDays, ReceiptText } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Budget } from '@/lib/types';
import NumericInput from '@/shared/forms/NumericInput';
import { Button } from '@/shared/ui/button';
import { cn, formatRupiah } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import FormPageLayout from '@/shared/layout/FormPageLayout';
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
    inline?: boolean;
}

export default function BudgetForm({ onClose, budgetToEdit, inline = false }: BudgetFormProps) {
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const budgetList = useFinanceStore((s) => s.budgetList);
    const addBudget = useFinanceStore((s) => s.addBudget);
    const updateBudget = useFinanceStore((s) => s.updateBudget);
    const router = useRouter();
    const [showSuccess, setShowSuccess] = useState(false);

    const pengeluaranKategori = kategoriList.filter((k) => k.tipe === 'Pengeluaran');

    const now = new Date();

    const {
        register,
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting, isDirty },
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

    const watchedKategori = useWatch({ control, name: 'id_kategori' }) || '';
    const watchedBulan = useWatch({ control, name: 'bulan' }) || now.getMonth() + 1;
    const watchedTahun = useWatch({ control, name: 'tahun' }) || now.getFullYear();
    const watchedLimit = useWatch({ control, name: 'nominal_limit' }) || 0;

    const availableKategori = useMemo(() => {
        if (budgetToEdit) return pengeluaranKategori;
        const usedIds = budgetList
            .filter(b => b.bulan === Number(watchedBulan) && b.tahun === Number(watchedTahun))
            .map(b => b.id_kategori);
        return pengeluaranKategori.filter(k => !usedIds.includes(k.id_kategori));
    }, [pengeluaranKategori, budgetList, watchedBulan, watchedTahun, budgetToEdit]);

    const targetKategoriName = useMemo(() => {
        return kategoriList.find(k => k.id_kategori === watchedKategori)?.nama_kategori || 'Pilih Kategori';
    }, [watchedKategori, kategoriList]);

    const targetBulanName = useMemo(() => {
        return NAMA_BULAN.find(b => Number(b.value) === Number(watchedBulan))?.label || 'Bulan';
    }, [watchedBulan]);

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
        if (inline) {
            setShowSuccess(true);
        } else {
            onClose();
        }
    };

    const formContent = (
        <>
            {/* Bento Card 1: Kategori & Waktu */}
            <div className={cn(
                "p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden shadow-sm flex flex-col gap-5 col-span-1 md:col-span-2",
                inline ? "bg-white border-slate-200 hover:border-slate-300" : "bg-white border-slate-100"
            )}>
                <div className="space-y-2">
                    <Label htmlFor="kategori" className={cn("text-[10px] font-black uppercase tracking-[0.25em]", inline ? "text-slate-500" : "text-slate-500")}>
                        Kategori Pengeluaran
                    </Label>
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
                                placeholder="Pilih kategori pengeluaran..."
                                searchPlaceholder="Cari kategori..."
                                error={!!errors.id_kategori}
                                className={cn("rounded-xl h-12", inline ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-white border-slate-200")}
                            />
                        )}
                    />
                    {errors.id_kategori && (
                        <p className="text-xs font-semibold text-destructive mt-1">{errors.id_kategori.message}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="bulan" className={cn("text-[10px] font-black uppercase tracking-[0.25em]", inline ? "text-slate-500" : "text-slate-500")}>
                            Bulan Anggaran
                        </Label>
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
                                    <SelectTrigger className={cn("h-12 rounded-xl", inline ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:ring-0" : "bg-white border-slate-200", errors.bulan ? 'border-destructive' : '')}>
                                        <SelectValue placeholder="Bulan" />
                                    </SelectTrigger>
                                    <SelectContent className={inline ? "bg-white border-slate-200 text-slate-950" : "bg-white text-slate-950"}>
                                        {NAMA_BULAN.map((b) => (
                                            <SelectItem key={b.value} value={b.label} className="cursor-pointer">
                                                {b.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.bulan && (
                            <p className="text-xs font-semibold text-destructive mt-1">{errors.bulan.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tahun" className={cn("text-[10px] font-black uppercase tracking-[0.25em]", inline ? "text-slate-500" : "text-slate-500")}>
                            Tahun Anggaran
                        </Label>
                        <Input
                            id="tahun"
                            type="number"
                            {...register('tahun')}
                            className={cn("h-12 rounded-xl font-medium", inline ? "bg-slate-50 border-slate-200 text-slate-950 focus:bg-white focus:ring-0" : "bg-white border-slate-200", errors.tahun ? 'border-destructive' : '')}
                            min={2020}
                            max={2100}
                        />
                        {errors.tahun && (
                            <p className="text-xs font-semibold text-destructive mt-1">{errors.tahun.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Bento Card 2: Batas Anggaran (NumericInput) */}
            <div className={cn(
                "p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden shadow-sm flex flex-col gap-4 col-span-1 md:col-span-2",
                inline ? "bg-white border-slate-200" : "bg-white border-slate-100"
            )}>
                <NumericInput
                    label="Batas Alokasi Anggaran Bulanan"
                    name="nominal_limit"
                    control={control as any}
                    error={errors.nominal_limit?.message}
                    className={cn(
                        "text-3xl sm:text-4xl font-black h-16 sm:h-20 shadow-sm text-center tracking-tight border-none focus:ring-0 focus:bg-white",
                        inline ? "bg-slate-50 border-slate-200 text-slate-900 focus:border-primary/50" : "bg-primary/5 border-primary/20 text-primary"
                    )}
                />
            </div>

            {/* Action Row */}
            <div className="col-span-1 md:col-span-2 flex justify-end pt-4 w-full">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                        "w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] border-none text-white",
                        inline ? "bg-emerald-600 hover:bg-emerald-700" : "bg-primary hover:bg-primary/90 text-primary-foreground"
                    )}
                >
                    <PieChart size={16} />
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Batas Anggaran'}
                </Button>
            </div>
        </>
    );

    // Left preview content showing reactive interactive budget usage card
    const previewContent = (
        <div className="w-full flex flex-col gap-8 text-center items-center">
            {/* Holographic Budget Ring Mock */}
            <div className="relative w-full aspect-square max-w-[280px] rounded-[2.5rem] p-6 border border-slate-200/80 bg-gradient-to-br from-white to-slate-50 shadow-2xl flex flex-col items-center justify-center group overflow-hidden">
                <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-emerald-500/10 blur-[50px] opacity-35 group-hover:bg-emerald-500/20 transition-all duration-1000" />
                <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-emerald-400/10 blur-[50px] opacity-25" />

                {/* Pie Chart Icon */}
                <div className="relative z-10 w-20 h-20 rounded-full bg-emerald-50 border border-emerald-250 flex items-center justify-center text-emerald-600 mb-4 animate-pulse shadow-xs">
                    <PieChart size={36} strokeWidth={2} />
                </div>

                <div className="relative z-10 space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">BATAS MAKSIMAL</span>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide max-w-[220px] truncate">{targetKategoriName}</h4>
                    
                    <div className="w-16 h-0.5 bg-slate-200 mx-auto my-2 rounded-full" />
                    
                    <p className="text-xl font-black text-emerald-600 tracking-tight display-number">{formatRupiah(watchedLimit)}</p>
                    
                    <div className="flex justify-center items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 mt-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-200 shadow-xs">
                        <CalendarDays size={10} />
                        <span>{targetBulanName} {watchedTahun}</span>
                    </div>
                </div>
            </div>

            {/* Smart info */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs text-left w-full">
                <div className="flex items-center gap-2 mb-2 text-emerald-600">
                    <Sparkles size={14} />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Anggaran Disiplin</span>
                </div>
                <p className="text-[11px] font-semibold text-slate-650 leading-relaxed">
                    Penetapan batas alokasi anggaran bulanan per kategori (seperti Hiburan, Kuliner) secara dinamis membatasi pencatatan pengeluaran baru agar sistem memberikan peringatan instan (Overbudget Alert) sesaat sebelum transaksi dicatat.
                </p>
            </div>
        </div>
    );

    if (inline) {
        return (
            <FormPageLayout
                title={budgetToEdit ? 'Edit Anggaran' : 'Atur Anggaran Baru'}
                description={budgetToEdit ? 'Perbarui besaran alokasi batas maksimal pengeluaran bulanan' : 'Tetapkan batas maksimal pengeluaran per kategori untuk menjaga disiplin keuangan'}
                isDirty={isDirty}
                previewPanel={previewContent}
                formPanel={
                    <form onSubmit={handleSubmit(onSubmit as any)} className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pb-16">
                        {formContent}
                    </form>
                }
                onCancel={onClose}
                showSuccessModal={showSuccess}
                onSuccessConfirm={() => router.push('/anggaran')}
                successMessage={`Anggaran limit sebesar ${formatRupiah(watchedLimit)} untuk kategori ${targetKategoriName} berhasil disimpan.`}
            />
        );
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white border-slate-100 text-slate-950">
                <DialogHeader className="mb-2">
                    <DialogTitle>
                        {budgetToEdit ? 'Edit Batas Anggaran' : 'Atur Anggaran Baru'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
                    {formContent}
                </form>
            </DialogContent>
        </Dialog>
    );
}
