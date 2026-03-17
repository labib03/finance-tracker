'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFinanceStore } from '@/lib/store';
import { transaksiSchema, type TransaksiFormData } from '@/lib/schemas';
import type { Transaksi } from '@/lib/types';
import { getToday, cn, formatRupiah } from '@/lib/utils';
import { Save, CalendarIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
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
    const budgetList = useFinanceStore((s) => s.budgetList);
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const activeMonth = useFinanceStore((s) => s.activeMonth);

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
            label: transaksiToEdit?.label || '',
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
                label: transaksiToEdit.label,
                catatan: transaksiToEdit.catatan,
            });
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveJenis(transaksiToEdit.jenis as 'Pengeluaran' | 'Pemasukan');
        }
    }, [transaksiToEdit, reset]);

    const filteredKategori = kategoriList.filter((k) => k.tipe === activeJenis);

    // Watch values for live highlights
    const watchedNominal = useWatch({ control, name: 'nominal' }) || 0;
    const watchedKategori = useWatch({ control, name: 'id_kategori' });
    const watchedJenis = useWatch({ control, name: 'jenis' });

    // Calculate budget impact
    const budgetImpact = useMemo(() => {
        if (watchedJenis !== 'Pengeluaran' || !watchedKategori) return null;

        const budget = budgetList.find(b =>
            b.id_kategori === watchedKategori &&
            b.bulan === parseInt(activeMonth.split('-')[1]) &&
            b.tahun === parseInt(activeMonth.split('-')[0])
        );

        if (!budget) return null;

        // Calculate existing usage for this category
        const currentUsage = transaksiList
            .filter(t =>
                t.id_kategori === watchedKategori &&
                t.jenis === 'Pengeluaran' &&
                (!transaksiToEdit || t.id !== transaksiToEdit.id)
            )
            .reduce((sum, t) => sum + t.nominal, 0);

        const newUsage = currentUsage + watchedNominal;
        const limit = budget.nominal_limit;
        const currentPercent = (currentUsage / limit) * 100;
        const newPercent = (newUsage / limit) * 100;

        return {
            limit,
            currentUsage,
            newUsage,
            currentPercent,
            newPercent,
            kategoriName: kategoriList.find(k => k.id_kategori === watchedKategori)?.nama_kategori || '',
            isOver: newUsage > limit
        };
    }, [watchedNominal, watchedKategori, watchedJenis, budgetList, transaksiList, activeMonth, transaksiToEdit, kategoriList]);

    const onSubmit = async (data: TransaksiFormData) => {
        if (transaksiToEdit && transaksiToEdit.id) {
            await updateTransaksi({
                ...transaksiToEdit,
                ...data,
            });
        } else {
            await addTransaksi({
                ...data,
            });
        }
        onClose();
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="mb-2">
                    <DialogTitle>{transaksiToEdit ? 'Edit Transaksi' : 'Tambah Transaksi'}</DialogTitle>
                </DialogHeader>

                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6 pt-2">
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
                        <Controller
                            name="tanggal"
                            control={control}
                            render={({ field }) => (
                                <Popover>
                                    <PopoverTrigger
                                        className={cn(
                                            "flex h-11 w-full items-center justify-start rounded-2xl border border-input bg-muted/20 px-4 py-2 text-sm font-normal whitespace-nowrap transition-all outline-none focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50",
                                            !field.value && "text-muted-foreground/50",
                                            errors.tanggal && "border-destructive focus:ring-destructive/10 focus:border-destructive"
                                        )}
                                    >
                                        <CalendarIcon className="mr-3 h-4 w-4 shrink-0 opacity-40" />
                                        <span className="display-number text-base font-bold">
                                            {field.value
                                                ? new Date(field.value).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
                                                : "Pilih tanggal"}
                                        </span>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 rounded-[1rem] shadow-2xl border-none ring-1 ring-black/5" align="start" sideOffset={8}>
                                        <Calendar
                                            mode="single"
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
                                                    // Set to local YYYY-MM-DD
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

                    {/* Sumber Dana */}
                    <div className="space-y-2">
                        <Label htmlFor="sumber-dana">Sumber Dana</Label>
                        <Controller
                            name="id_sumber_dana"
                            control={control}
                            render={({ field }) => (
                                <SearchableSelect
                                    options={sumberDanaList.map(s => ({
                                        value: s.id_sumber_dana,
                                        label: s.nama_sumber
                                    }))}
                                    value={field.value}
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

                    {/* Nominal */}
                    <NumericInput
                        label="Nominal"
                        name="nominal"
                        control={control}
                        error={errors.nominal?.message}
                    />

                    {/* Label/Judul */}
                    <div className="space-y-2">
                        <Label htmlFor="label">Judul Transaksi</Label>
                        <Input
                            id="label"
                            placeholder="Contoh: Makan Siang, Gaji, dll."
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

                    {/* Live Budget Impact highlight */}
                    {budgetImpact && (
                        <div className={cn(
                            "p-4 rounded-2xl border animate-in fade-in slide-in-from-bottom-2 duration-300",
                            budgetImpact.isOver
                                ? "bg-red-50 border-red-100 text-red-900"
                                : "bg-emerald-50 border-emerald-100 text-emerald-900"
                        )}>
                            <div className="flex items-start gap-3">
                                {budgetImpact.isOver
                                    ? <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                    : <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                                }
                                <div className="space-y-1.5 flex-1">
                                    <h4 className="text-sm font-bold leading-none">
                                        Impact Anggaran: {budgetImpact.kategoriName}
                                    </h4>
                                    <p className="text-xs opacity-80">
                                        {budgetImpact.isOver
                                            ? `Waduh! Transaksi ini akan membuat anggaranmu melebih batas sebesar ${formatRupiah(budgetImpact.newUsage - budgetImpact.limit)}.`
                                            : `Aman! Kamu masih punya sisa anggaran sebesar ${formatRupiah(budgetImpact.limit - budgetImpact.newUsage)} setelah transaksi ini.`
                                        }
                                    </p>
                                    <div className="space-y-1 pt-1">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider opacity-60">
                                            <span>Pemakaian</span>
                                            <span>{Math.round(budgetImpact.newPercent)}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden relative">
                                            {/* Original usage */}
                                            <div
                                                className="absolute inset-y-0 left-0 bg-black/10 transition-all duration-500"
                                                style={{ width: `${Math.min(budgetImpact.currentPercent, 100)}%` }}
                                            />
                                            {/* New impact */}
                                            <div
                                                className={cn(
                                                    "absolute inset-y-0 transition-all duration-700",
                                                    budgetImpact.isOver ? "bg-red-500" : "bg-emerald-500"
                                                )}
                                                style={{
                                                    left: `${Math.min(budgetImpact.currentPercent, 100)}%`,
                                                    width: `${Math.min(budgetImpact.newPercent - budgetImpact.currentPercent, 100 - budgetImpact.currentPercent)}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full"
                        >
                            <Save size={18} className="mr-2" />
                            {isSubmitting ? 'Menyimpan...' : (transaksiToEdit ? 'Simpan Perubahan' : 'Tambah Transaksi')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
