'use client';

import { useState, useMemo } from 'react';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/lib/store';
import type { Transaksi } from '@/lib/types';
import { getToday, cn, formatRupiah } from '@/lib/utils';
import { 
    Save, 
    Plus, 
    Trash2, 
    CalendarIcon, 
    AlertCircle, 
    CheckCircle2, 
    Wallet, 
    Layers, 
    ArrowDownRight, 
    ArrowUpRight, 
    ArrowLeft,
    Layers3
} from 'lucide-react';
import NumericInput from '@/shared/forms/NumericInput';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Calendar } from '@/shared/ui/calendar';
import { SearchableSelect } from '@/shared/ui/SearchableSelect';
import { Card, CardContent } from '@/shared/ui/card';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';

interface BatchRow {
    tanggal: string;
    jenis: 'Pengeluaran' | 'Pemasukan';
    id_kategori: string;
    id_sumber_dana: string;
    nominal: number;
    label: string;
    catatan: string;
}

interface BatchFormValues {
    items: BatchRow[];
}

export default function BatchInsertForm() {
    const router = useRouter();
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
    const addTransaksi = useFinanceStore((s) => s.addTransaksi);

    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Setup Form
    const {
        control,
        handleSubmit,
        register,
        setValue,
        formState: { errors }
    } = useForm<BatchFormValues>({
        defaultValues: {
            items: [
                {
                    tanggal: getToday(),
                    jenis: 'Pengeluaran',
                    id_kategori: '',
                    id_sumber_dana: '',
                    nominal: 0,
                    label: '',
                    catatan: ''
                }
            ]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items'
    });

    // Watch items for live totals and calculations
    const watchedItems = useWatch({
        control,
        name: 'items'
    }) as BatchRow[];

    // Calculate live totals
    const summary = useMemo(() => {
        let totalKeluar = 0;
        let totalMasuk = 0;
        let validRows = 0;

        watchedItems.forEach((item) => {
            if (item) {
                const nominal = item.nominal || 0;
                if (item.jenis === 'Pemasukan') {
                    totalMasuk += nominal;
                } else {
                    totalKeluar += nominal;
                }
                
                // A row is conceptually valid if category, source fund are filled and nominal > 0
                if (item.id_kategori && item.id_sumber_dana && nominal > 0) {
                    validRows++;
                }
            }
        });

        return {
            totalKeluar,
            totalMasuk,
            validRows,
            totalRows: watchedItems.length
        };
    }, [watchedItems]);

    // Live validation error check list (Opsi X)
    const validationErrors = useMemo(() => {
        const errorList: string[] = [];

        watchedItems.forEach((item, idx) => {
            if (!item) return;

            const rowNum = idx + 1;
            const errorsInRow: string[] = [];

            if (!item.tanggal) {
                errorsInRow.push("Tanggal wajib diisi");
            }
            if (!item.id_sumber_dana) {
                errorsInRow.push("Sumber Dana/Metode wajib dipilih");
            }
            if (!item.id_kategori) {
                errorsInRow.push("Kategori wajib dipilih");
            }
            if ((item.nominal || 0) <= 0) {
                errorsInRow.push("Nominal harus lebih dari Rp 0");
            }

            if (errorsInRow.length > 0) {
                errorList.push(`Baris ${rowNum}: ${errorsInRow.join(', ')}`);
            }
        });

        return errorList;
    }, [watchedItems]);

    const isValid = validationErrors.length === 0 && watchedItems.length > 0;

    // Handle Form Submit
    const onSubmit = async (data: BatchFormValues) => {
        if (!isValid) return;

        setIsSaving(true);
        try {
            // Save all items in a sequential loop
            for (const item of data.items) {
                await addTransaksi({
                    tanggal: item.tanggal,
                    jenis: item.jenis,
                    id_kategori: item.id_kategori,
                    id_sumber_dana: item.id_sumber_dana,
                    nominal: item.nominal,
                    label: item.label || (item.jenis === 'Pemasukan' ? 'Pemasukan Massal' : 'Pengeluaran Massal'),
                    catatan: item.catatan || '',
                    is_titipan: null
                });
            }
            setSaveSuccess(true);
            setTimeout(() => {
                router.push('/transaksi');
            }, 1500);
        } catch (err) {
            console.error("Gagal melakukan batch insert", err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => router.push('/transaksi')}
                        className="rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 h-10 w-10 flex items-center justify-center shrink-0"
                    >
                        <ArrowLeft size={16} strokeWidth={2.5} />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                <Layers3 size={16} strokeWidth={2.5} />
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Transaksi Keuangan</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-slate-900 mt-1">Input Massal</h2>
                    </div>
                </div>

                {/* Batch Stats Panel */}
                <div className="flex flex-wrap items-center gap-4">
                    <Card className="border-none shadow-scandi bg-white rounded-3xl overflow-hidden shrink-0">
                        <CardContent className="p-5 flex items-center gap-6">
                            <div className="flex flex-col text-left">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Item Terisi</span>
                                <span className="display-number text-xl font-black text-slate-800 leading-none">
                                    {summary.validRows} / {summary.totalRows}
                                </span>
                            </div>
                            <div className="w-px h-10 bg-slate-200" />
                            <div className="flex flex-col text-left">
                                <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest leading-none mb-2">Total Keluar</span>
                                <span className="display-number text-xl font-black text-rose-600 leading-none">
                                    {formatRupiah(summary.totalKeluar)}
                                </span>
                            </div>
                            <div className="w-px h-10 bg-slate-200" />
                            <div className="flex flex-col text-left">
                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-2">Total Masuk</span>
                                <span className="display-number text-xl font-black text-emerald-600 leading-none">
                                    {formatRupiah(summary.totalMasuk)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Main Interactive spreadsheet grid Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-6">
                    {fields.map((field, index) => {
                        const rowJenis = watchedItems[index]?.jenis || 'Pengeluaran';
                        const isPemasukan = rowJenis === 'Pemasukan';
                        const availableKategori = kategoriList.filter(k => k.tipe === rowJenis);
                        
                        const rowHasError = validationErrors.some(err => err.startsWith(`Baris ${index + 1}:`));

                        return (
                            <div 
                                key={field.id} 
                                className={cn(
                                    "group relative bg-white rounded-[2rem] border border-slate-200/80 shadow-scandi p-6 sm:p-8 transition-all duration-300 hover:shadow-scandi-lg",
                                    rowHasError && "border-rose-250 bg-rose-50/10 hover:border-rose-350"
                                )}
                            >
                                {/* Card Header: Transaction Title & Delete Button */}
                                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shadow-xs border select-none",
                                            isPemasukan 
                                                ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                                : "bg-rose-50 text-rose-600 border-rose-100"
                                        )}>
                                            {index + 1}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Transaksi #{index + 1}</span>
                                    </div>
                                    
                                    {fields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-xs"
                                            onClick={() => remove(index)}
                                            className="text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 rounded-xl w-8 h-8 flex items-center justify-center transition-all cursor-pointer shrink-0"
                                            title="Hapus transaksi ini"
                                        >
                                            <Trash2 size={14} strokeWidth={2.5} />
                                        </Button>
                                    )}
                                </div>

                                {/* Grid Inputs Layout */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Column 1: Tipe Selector Toggle & Tanggal Picker */}
                                    <div className="flex flex-col gap-4">
                                        {/* Tipe Selector Label */}
                                        <div className="flex flex-col gap-2">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Tipe Transaksi</Label>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setValue(`items.${index}.jenis`, 'Pengeluaran');
                                                        setValue(`items.${index}.id_kategori`, ''); // reset category on type switch
                                                    }}
                                                    className={cn(
                                                        "flex-1 py-3 px-3 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all duration-300 border cursor-pointer active:scale-95 select-none",
                                                        rowJenis === 'Pengeluaran'
                                                            ? "bg-rose-50 border-rose-200 text-rose-600 font-extrabold shadow-xs"
                                                            : "bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-650"
                                                    )}
                                                >
                                                    💸 Pengeluaran
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setValue(`items.${index}.jenis`, 'Pemasukan');
                                                        setValue(`items.${index}.id_kategori`, ''); // reset category on type switch
                                                    }}
                                                    className={cn(
                                                        "flex-1 py-3 px-3 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all duration-300 border cursor-pointer active:scale-95 select-none",
                                                        rowJenis === 'Pemasukan'
                                                            ? "bg-emerald-50 border-emerald-200 text-emerald-600 font-extrabold shadow-xs"
                                                            : "bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-650"
                                                    )}
                                                >
                                                    💰 Pemasukan
                                                </button>
                                            </div>
                                        </div>

                                        {/* Tanggal Picker */}
                                        <div className="flex flex-col gap-2">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Tanggal</Label>
                                            <Controller
                                                name={`items.${index}.tanggal`}
                                                control={control}
                                                render={({ field: dateField }) => (
                                                    <Popover>
                                                        <PopoverTrigger
                                                            className={cn(
                                                                "flex h-12 w-full items-center justify-between rounded-xl border px-3 text-xs font-bold transition-all duration-300 outline-none select-none bg-slate-50 border-slate-200/60 hover:border-slate-350 text-slate-800 focus:bg-white focus:border-blue-300",
                                                                !dateField.value && "text-muted-foreground/40",
                                                                !dateField.value && rowHasError && "border-rose-300 bg-rose-50/50"
                                                            )}
                                                        >
                                                            <span className="truncate">
                                                                {dateField.value
                                                                    ? new Date(dateField.value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                                                                    : "Pilih tanggal"}
                                                            </span>
                                                            <CalendarIcon size={12} className="opacity-45 shrink-0 text-slate-500" />
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0 rounded-[1.5rem] shadow-2xl border-none ring-1 ring-black/5 z-50 bg-white" align="start" sideOffset={8}>
                                                            <Calendar
                                                                mode="single"
                                                                selected={dateField.value ? new Date(dateField.value) : undefined}
                                                                onSelect={(date) => {
                                                                    if (date) {
                                                                        const year = date.getFullYear();
                                                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                                                        const day = String(date.getDate()).padStart(2, '0');
                                                                        dateField.onChange(`${year}-${month}-${day}`);
                                                                    }
                                                                }}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Column 2: Sumber Dana & Kategori Selects */}
                                    <div className="flex flex-col gap-4">
                                        {/* Sumber Dana / Metode */}
                                        <div className="flex flex-col gap-2">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Metode / Akun</Label>
                                            <Controller
                                                name={`items.${index}.id_sumber_dana`}
                                                control={control}
                                                render={({ field: sField }) => (
                                                    <SearchableSelect
                                                        options={sumberDanaList.map(s => ({
                                                            value: s.id_sumber_dana,
                                                            label: s.nama_sumber
                                                        }))}
                                                        value={sField.value}
                                                        onValueChange={sField.onChange}
                                                        placeholder="Pilih Metode..."
                                                        searchPlaceholder="Cari..."
                                                        error={rowHasError && !sField.value}
                                                        className="bg-slate-50 border-slate-200/60 text-slate-900 focus:bg-white text-xs h-12"
                                                    />
                                                )}
                                            />
                                        </div>

                                        {/* Kategori */}
                                        <div className="flex flex-col gap-2">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Kategori</Label>
                                            <Controller
                                                name={`items.${index}.id_kategori`}
                                                control={control}
                                                render={({ field: kField }) => (
                                                    <SearchableSelect
                                                        options={availableKategori.map(k => ({
                                                            value: k.id_kategori,
                                                            label: k.nama_kategori
                                                        }))}
                                                        value={kField.value}
                                                        onValueChange={kField.onChange}
                                                        placeholder="Pilih Kategori..."
                                                        searchPlaceholder="Cari..."
                                                        error={rowHasError && !kField.value}
                                                        className="bg-slate-50 border-slate-200/60 text-slate-900 focus:bg-white text-xs h-12"
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Column 3: Deskripsi & Nominal Input */}
                                    <div className="flex flex-col gap-4">
                                        {/* Deskripsi */}
                                        <div className="flex flex-col gap-2">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Deskripsi Transaksi</Label>
                                            <Input
                                                placeholder="Contoh: Belanja Baju, Makan Siang..."
                                                {...register(`items.${index}.label`)}
                                                className="bg-slate-50 border-slate-200/60 focus:bg-white h-12 rounded-xl text-xs font-bold text-slate-900"
                                            />
                                        </div>

                                        {/* Nominal */}
                                        <div className="flex flex-col gap-2">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Nominal</Label>
                                            <Controller
                                                name={`items.${index}.nominal`}
                                                control={control}
                                                render={({ field: nField }) => (
                                                    <NumericInput
                                                        name={nField.name}
                                                        control={control}
                                                        error={rowHasError && (nField.value || 0) <= 0 ? "Nominal harus valid" : undefined}
                                                        className={cn(
                                                            "bg-slate-50 border-slate-200/60 focus:bg-white rounded-xl h-12 text-sm text-right px-4",
                                                            isPemasukan ? "text-emerald-600 focus:text-emerald-700 font-extrabold" : "text-rose-600 focus:text-rose-700 font-extrabold"
                                                        )}
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Column 1-3 Full Width Row: Catatan Detail */}
                                    <div className="flex flex-col gap-2 md:col-span-3">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Catatan Detail</Label>
                                        <Textarea
                                            placeholder="Tambahkan catatan tambahan terperinci untuk transaksi ini (misalnya: rincian barang, catatan toko, dll.)..."
                                            {...register(`items.${index}.catatan`)}
                                            className="bg-slate-50 border-slate-200/60 focus-visible:bg-white rounded-xl text-xs font-bold text-slate-900 min-h-16 py-2.5 px-3 focus-visible:ring-blue-100 focus-visible:border-blue-300"
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Add Transaction dashed trigger button */}
                    <div 
                        onClick={() => append({
                            tanggal: watchedItems[watchedItems.length - 1]?.tanggal || getToday(),
                            jenis: watchedItems[watchedItems.length - 1]?.jenis || 'Pengeluaran',
                            id_kategori: '',
                            id_sumber_dana: watchedItems[watchedItems.length - 1]?.id_sumber_dana || '',
                            nominal: 0,
                            label: '',
                            catatan: ''
                        })}
                        className="cursor-pointer hover:bg-slate-50/50 transition-all active:scale-[0.99] duration-300"
                    >
                        <div className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-250 rounded-[2rem] py-5 bg-white text-slate-400 font-black uppercase text-[10px] tracking-widest hover:border-slate-350 hover:text-slate-650 hover:shadow-scandi transition-all duration-300">
                            <Plus size={14} strokeWidth={3} />
                            Tambah Transaksi Baru
                        </div>
                    </div>
                </div>

                {/* Validation Warnings Panel (Opsi X) */}
                {validationErrors.length > 0 && (
                    <Card className="border border-rose-200 bg-rose-50/50 rounded-[2rem] shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <CardContent className="p-6 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs shrink-0">
                                <AlertCircle size={20} strokeWidth={2.5} />
                            </div>
                            <div className="space-y-2 text-left">
                                <h4 className="text-xs font-black uppercase tracking-wider text-rose-800">
                                    Input Tidak Valid ({validationErrors.length} Peringatan)
                                </h4>
                                <p className="text-xs text-rose-700/80 font-medium">
                                    Mohon selesaikan kesalahan berikut sebelum melanjutkan penyimpanan:
                                </p>
                                <ul className="list-disc pl-5 text-xs text-rose-700/90 font-bold space-y-1 pt-1 leading-relaxed">
                                    {validationErrors.map((err, idx) => (
                                        <li key={idx}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Submit Success Message */}
                {saveSuccess && (
                    <Card className="border border-emerald-200 bg-emerald-50 rounded-[2rem] shadow-sm animate-in zoom-in-95 duration-500">
                        <CardContent className="p-6 flex items-center gap-4 justify-center">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                                <CheckCircle2 size={20} strokeWidth={2.5} />
                            </div>
                            <div className="text-left">
                                <h4 className="text-sm font-black uppercase tracking-wider text-emerald-800">
                                    Transaksi Berhasil Disimpan!
                                </h4>
                                <p className="text-xs text-emerald-700/80 font-bold mt-0.5">
                                    Mengarahkan Anda kembali ke riwayat transaksi...
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Main Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/transaksi')}
                        disabled={isSaving || saveSuccess}
                        className="w-full sm:flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest border-slate-200 hover:bg-slate-100 text-slate-650 bg-white"
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        disabled={!isValid || isSaving || saveSuccess}
                        className={cn(
                            "w-full sm:flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-98",
                            isValid 
                                ? "bg-primary text-primary-foreground hover:bg-primary/95 shadow-md hover:shadow-lg" 
                                : "bg-slate-200 text-slate-400 cursor-not-allowed border-none shadow-none"
                        )}
                    >
                        <Save size={16} strokeWidth={2.5} className="mr-2" />
                        {isSaving ? "Menyimpan Transaksi..." : `Simpan Semua (${summary.validRows} Transaksi)`}
                    </Button>
                </div>
            </form>
        </div>
    );
}
