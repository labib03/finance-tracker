'use client';
import { TRANSACTION_TYPES } from '@/lib/constants';

import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFinanceStore } from '@/lib/store';
import { recurringSchema, type RecurringFormData } from '@/lib/schemas';
import { getToday, cn, hitungTanggalBerikutnya, formatRupiah } from '@/lib/utils';
import { getRootTipe, getRootLabel } from '@/lib/tipeUtils';
import { CalendarClock, CalendarIcon, Sparkles, Save, Layers, Clock, Zap, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useEffect, useMemo } from 'react';
import type { RecurringTransaction } from '@/lib/types';
import NumericInput from '@/shared/forms/NumericInput';
import { Button } from '@/shared/ui/button';
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/ui/popover';
import { Calendar } from '@/shared/ui/calendar';
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
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Textarea } from '@/shared/ui/textarea';

interface RecurringFormProps {
    onClose: () => void;
    recurringToEdit?: RecurringTransaction | null;
    inline?: boolean;
}

export default function RecurringForm({ onClose, recurringToEdit, inline = false }: RecurringFormProps) {
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
    const addRecurring = useFinanceStore((s) => s.addRecurring);
    const updateRecurring = useFinanceStore((s) => s.updateRecurring);
    const tipeList = useFinanceStore((s) => s.tipeList);
    const router = useRouter();
    const [showSuccess, setShowSuccess] = useState(false);

    const rootTipes = useMemo(() => tipeList.filter(t => !t.master_tipe), [tipeList]);
    const defaultRootId = rootTipes.length > 0 ? (rootTipes.find(r => r.label.toLowerCase().includes(TRANSACTION_TYPES.EXPENSE))?.id_tipe || rootTipes[0].id_tipe) : '';

    const initialRootId = recurringToEdit?.jenis 
        ? (getRootTipe(tipeList, recurringToEdit.jenis)?.id_tipe || defaultRootId)
        : defaultRootId;

    const [activeRootId, setActiveRootId] = useState<string>(initialRootId);
    const activeRootLabel = getRootLabel(tipeList, activeRootId);

    const [multiplier, setMultiplier] = useState(1);
    const [baseFreq, setBaseFreq] = useState<'Harian' | 'Mingguan' | 'Bulanan' | 'Tahunan' | 'Lainnya'>('Bulanan');

    const {
        register,
        control,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<RecurringFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(recurringSchema) as any,
        defaultValues: {
            id_kategori: recurringToEdit?.id_kategori || '',
            id_sumber_dana: recurringToEdit?.id_sumber_dana || '',
            jenis: recurringToEdit?.jenis || '', // Will be set automatically
            nominal: recurringToEdit?.nominal || 0,
            label: recurringToEdit?.label || '',
            frekuensi: recurringToEdit?.frekuensi || 'Bulanan',
            tanggal_mulai: recurringToEdit?.tanggal_mulai || getToday(),
            catatan: recurringToEdit?.catatan || '',
        },
    });

    useEffect(() => {
        if (recurringToEdit) {
            reset({
                id_kategori: recurringToEdit.id_kategori,
                id_sumber_dana: recurringToEdit.id_sumber_dana,
                jenis: recurringToEdit.jenis,
                nominal: recurringToEdit.nominal,
                label: recurringToEdit.label,
                frekuensi: recurringToEdit.frekuensi as any,
                tanggal_mulai: recurringToEdit.tanggal_mulai,
                catatan: recurringToEdit.catatan,
            });
            const mt = getRootTipe(tipeList, recurringToEdit.jenis);
            if (mt) {
                setActiveRootId(mt.id_tipe);
            }

            // Parse existing frequency
            const freq = recurringToEdit.frekuensi;
            const parts = freq.split(' ');
            if (parts.length === 2) {
                const mult = parseInt(parts[0]);
                const unit = parts[1];
                setMultiplier(mult);
                if (unit.includes('Hari')) setBaseFreq('Harian');
                else if (unit.includes('Minggu')) setBaseFreq('Mingguan');
                else if (unit.includes('Bulan')) setBaseFreq('Bulanan');
                else if (unit.includes('Tahun')) setBaseFreq('Tahunan');
                else setBaseFreq('Lainnya');
            } else {
                // Legacy formats
                if (freq === 'Harian') { setBaseFreq('Harian'); setMultiplier(1); }
                else if (freq === 'Mingguan') { setBaseFreq('Mingguan'); setMultiplier(1); }
                else if (freq === 'Bulanan') { setBaseFreq('Bulanan'); setMultiplier(1); }
                else if (freq === 'Tahunan') { setBaseFreq('Tahunan'); setMultiplier(1); }
                else if (freq === '3 Bulan') { setBaseFreq('Bulanan'); setMultiplier(3); }
                else if (freq === '6 Bulan') { setBaseFreq('Bulanan'); setMultiplier(6); }
                else { setBaseFreq('Lainnya'); setMultiplier(1); }
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recurringToEdit?.id, reset]);

    const watchedKategori = useWatch({ control, name: 'id_kategori' }) || '';
    const watchedSumber = useWatch({ control, name: 'id_sumber_dana' }) || '';
    const watchedNominal = useWatch({ control, name: 'nominal' }) || 0;
    const watchedMulai = useWatch({ control, name: 'tanggal_mulai' }) || getToday();
    const watchedLabel = useWatch({ control, name: 'label' }) || '';
    const watchedFrekuensi = useWatch({ control, name: 'frekuensi' }) || 'Bulanan';

    // Update frekuensi whenever multiplier or baseFreq changes
    useEffect(() => {
        let fullFreq = '';
        const unit = baseFreq === 'Harian' ? 'Hari' :
            baseFreq === 'Mingguan' ? 'Minggu' :
                baseFreq === 'Bulanan' ? 'Bulan' :
                    baseFreq === 'Tahunan' ? 'Tahun' : '';

        if (unit) {
            fullFreq = `${multiplier} ${unit}`;
            setValue('frekuensi', fullFreq);
        }
    }, [multiplier, baseFreq, setValue]);

    const watchedJenis = useWatch({ control, name: 'jenis' });

    // Auto-select first TipeTransaksi if empty or when activeRootId changes
    useEffect(() => {
        const availableTipes = tipeList.filter(t => t.master_tipe === activeRootId || t.id_tipe === activeRootId);
        if (availableTipes.length > 0) {
            const isCurrentJenisValid = availableTipes.some(t => t.id_tipe === watchedJenis);
            if (!isCurrentJenisValid) {
                setValue('jenis', availableTipes[0].id_tipe);
                setValue('id_kategori', '');
            }
        }
    }, [activeRootId, tipeList, watchedJenis, setValue]);

    const filteredKategori = kategoriList.filter((k) => k.tipe.toLowerCase() === (watchedJenis || '').toLowerCase());

    const targetKategoriName = useMemo(() => {
        return kategoriList.find(k => k.id_kategori === watchedKategori)?.nama_kategori || 'Pilih Kategori';
    }, [watchedKategori, kategoriList]);

    const targetSumberName = useMemo(() => {
        return sumberDanaList.find(s => s.id_sumber_dana === watchedSumber)?.nama_sumber || 'Pilih Rekening';
    }, [watchedSumber, sumberDanaList]);

    const estimatedNextDate = useMemo(() => {
        try {
            return hitungTanggalBerikutnya(watchedMulai, watchedFrekuensi);
        } catch (e) {
            return getToday();
        }
    }, [watchedMulai, watchedFrekuensi]);

    const onSubmit = async (data: RecurringFormData) => {
        if (recurringToEdit) {
            // Jika tanggal mulai atau frekuensi berubah, hitung ulang tanggal berikutnya
            const perluUpdateTanggal =
                data.tanggal_mulai !== recurringToEdit.tanggal_mulai ||
                data.frekuensi !== recurringToEdit.frekuensi;

            await updateRecurring({
                ...recurringToEdit,
                ...data,
                tanggal_berikutnya: perluUpdateTanggal
                    ? hitungTanggalBerikutnya(data.tanggal_mulai, data.frekuensi)
                    : recurringToEdit.tanggal_berikutnya
            });
        } else {
            // Saat membuat baru, set tanggal berikutnya ke satu periode setelah tanggal mulai
            await addRecurring({
                ...data,
                tanggal_berikutnya: hitungTanggalBerikutnya(data.tanggal_mulai, data.frekuensi),
                aktif: true,
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
            {/* Bento Card 1: Switch Jenis & Informasi Akun */}
            <div className={cn(
                "p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden shadow-sm flex flex-col gap-5 col-span-1 md:col-span-2",
                inline ? "bg-white border-slate-200 hover:border-slate-300" : "bg-white border-slate-100"
            )}>
                {/* Jenis toggle */}
                <div className="flex justify-center">
                    <Tabs
                        value={activeRootId}
                        onValueChange={setActiveRootId}
                        className="w-full"
                    >
                        <TabsList className={cn("grid w-full p-1 rounded-2xl border border-slate-200", inline ? "bg-slate-150" : "bg-slate-100")} style={{ gridTemplateColumns: `repeat(${Math.max(rootTipes.length, 1)}, minmax(0, 1fr))` }}>
                            {rootTipes.map(root => {
                                const isInc = root.label.toLowerCase().includes(TRANSACTION_TYPES.INCOME);
                                const isSav = root.label.toLowerCase().includes(TRANSACTION_TYPES.SAVINGS);
                                const isExp = root.label.toLowerCase().includes(TRANSACTION_TYPES.EXPENSE);
                                
                                return (
                                    <TabsTrigger 
                                        key={root.id_tipe}
                                        value={root.id_tipe} 
                                        className={cn(
                                            "rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer",
                                            isInc ? "data-active:bg-emerald-50 data-active:text-emerald-600 data-active:border-emerald-100/50 data-active:shadow-xs hover:text-emerald-500" : 
                                            isSav ? "data-active:bg-blue-50 data-active:text-blue-600 data-active:border-blue-100/50 data-active:shadow-xs hover:text-blue-500" : 
                                            isExp ? "data-active:bg-rose-50 data-active:text-rose-600 data-active:border-rose-100/50 data-active:shadow-xs hover:text-rose-500" :
                                            "data-active:bg-slate-50 data-active:text-slate-900 data-active:border-slate-200 data-active:shadow-xs hover:text-slate-600"
                                        )}
                                    >
                                        {isInc ? '💰 ' : isSav ? '🏦 ' : isExp ? '💸 ' : ''}{root.label}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                    </Tabs>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Sumber Dana */}
                    <div className="space-y-1.5">
                        <Label htmlFor="sumber-dana" className={cn("text-[10px] font-black uppercase tracking-[0.25em]", inline ? "text-slate-500" : "text-slate-500")}>
                            Rekening Utama
                        </Label>
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
                                    placeholder="Pilih rekening utama..."
                                    searchPlaceholder="Cari rekening..."
                                    error={!!errors.id_sumber_dana}
                                    className={cn("rounded-xl h-12", inline ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-white border-slate-200")}
                                />
                            )}
                        />
                        {errors.id_sumber_dana && (
                            <p className="text-xs font-semibold text-destructive mt-1">{errors.id_sumber_dana.message}</p>
                        )}
                    </div>

                    {/* Tipe Transaksi */}
                    <div className="space-y-1.5 md:col-span-2">
                        <Label className={cn("text-[10px] font-black uppercase tracking-[0.25em]", inline ? "text-slate-500" : "text-slate-500")}>
                            Tipe Transaksi
                        </Label>
                        <Controller
                            name="jenis"
                            control={control}
                            render={({ field }) => (
                                <SearchableSelect
                                    options={tipeList.filter(t => t.master_tipe === activeRootId || t.id_tipe === activeRootId).map(t => ({
                                        value: t.id_tipe,
                                        label: t.label
                                    }))}
                                    value={field.value}
                                    onValueChange={(val) => {
                                        field.onChange(val);
                                        setValue('id_kategori', '');
                                    }}
                                    placeholder="Pilih tipe..."
                                    searchPlaceholder="Cari tipe..."
                                    error={!!errors.jenis}
                                    className={cn("rounded-xl h-12", inline ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-white border-slate-200")}
                                />
                            )}
                        />
                    </div>

                    {/* Kategori */}
                    <div className="space-y-1.5 md:col-span-2">
                        <Label htmlFor="kategori" className={cn("text-[10px] font-black uppercase tracking-[0.25em]", inline ? "text-slate-500" : "text-slate-500")}>
                            Kategori Arus Kas
                        </Label>
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
                                    className={cn("rounded-xl h-12", inline ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-white border-slate-200")}
                                />
                            )}
                        />
                        {errors.id_kategori && (
                            <p className="text-xs font-semibold text-destructive mt-1">{errors.id_kategori.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Bento Card 2: Nominal Transaksi Rutin (NumericInput) */}
            <div className={cn(
                "p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden shadow-sm flex flex-col gap-4 col-span-1 md:col-span-2",
                inline ? "bg-white border-slate-200" : "bg-white border-slate-100"
            )}>
                <NumericInput
                    label="Nominal Transaksi Rutin (Rupiah)"
                    name="nominal"
                    control={control as any}
                    error={errors.nominal?.message}
                    className={cn(
                        "text-3xl sm:text-4xl font-black h-16 sm:h-20 shadow-sm text-center tracking-tight border-none focus:ring-0 focus:bg-white",
                        inline ? "bg-slate-50 border-slate-200 text-slate-900 focus:border-primary/50" : "bg-slate-50 text-slate-900",
                        activeRootLabel.includes(TRANSACTION_TYPES.INCOME) ? "text-emerald-600" : activeRootLabel.includes(TRANSACTION_TYPES.SAVINGS) ? "text-blue-600" : "text-rose-600"
                    )}
                />
            </div>

            {/* Bento Card 3: Frekuensi & Tanggal Mulai Grid */}
            <div className={cn(
                "p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2 gap-5 col-span-1 md:col-span-2",
                inline ? "bg-white border-slate-200 hover:border-slate-300" : "bg-white border-slate-100"
            )}>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="frekuensi" className={cn("text-[10px] font-black uppercase tracking-[0.25em]", inline ? "text-slate-500" : "text-slate-500")}>
                            Frekuensi Periode
                        </Label>
                        <Select
                            onValueChange={(val: any) => setBaseFreq(val)}
                            value={baseFreq}
                        >
                            <SelectTrigger className={cn("h-12 rounded-xl", inline ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:ring-0" : "bg-white border-slate-200")}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className={inline ? "bg-white border-slate-200 text-slate-950" : "bg-white text-slate-950"}>
                                <SelectItem value="Harian" className="cursor-pointer">Harian</SelectItem>
                                <SelectItem value="Mingguan" className="cursor-pointer">Mingguan</SelectItem>
                                <SelectItem value="Bulanan" className="cursor-pointer">Bulanan</SelectItem>
                                <SelectItem value="Tahunan" className="cursor-pointer">Tahunan</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className={cn("text-[10px] font-black uppercase tracking-[0.2em]", inline ? "text-slate-500" : "text-slate-500")}>
                            Setiap berapa {baseFreq === 'Harian' ? 'hari' :
                                baseFreq === 'Mingguan' ? 'minggu' :
                                    baseFreq === 'Bulanan' ? 'bulan' :
                                        baseFreq === 'Tahunan' ? 'tahun' : ''}?
                        </Label>
                        <div className="flex items-center gap-3">
                            <Input
                                type="number"
                                min={1}
                                value={multiplier}
                                onChange={(e) => setMultiplier(Math.max(1, parseInt(e.target.value) || 1))}
                                className={cn("h-12 rounded-xl text-center font-bold w-24", inline ? "bg-slate-50 border-slate-200 text-slate-950 focus:bg-white focus:ring-0" : "bg-slate-55 border-slate-200 text-slate-950")}
                            />
                            <span className={cn("text-xs font-black uppercase tracking-widest text-slate-500 shrink-0")}>
                                {baseFreq === 'Harian' ? 'Hari' :
                                    baseFreq === 'Mingguan' ? 'Minggu' :
                                        baseFreq === 'Bulanan' ? 'Bulan' :
                                            baseFreq === 'Tahunan' ? 'Tahun' : ''}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tanggal_mulai" className={cn("text-[10px] font-black uppercase tracking-[0.25em]", inline ? "text-slate-500" : "text-slate-500")}>
                        Tanggal Mulai Jadwal
                    </Label>
                    <Controller
                        name="tanggal_mulai"
                        control={control}
                        render={({ field }) => (
                            <Popover>
                                <PopoverTrigger
                                    className={cn(
                                        "flex h-12 w-full items-center justify-start rounded-xl border px-4 py-2 text-sm font-bold whitespace-nowrap transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 hover:scale-[1.01]",
                                        inline ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-primary/50 focus:ring-primary/20" : "bg-white border-slate-200 text-slate-950",
                                        !field.value && "text-muted-foreground/50",
                                        errors.tanggal_mulai && "border-destructive"
                                    )}
                                >
                                    <CalendarIcon className="mr-3 h-4 w-4 shrink-0 opacity-40 text-slate-500" />
                                    <span className="display-number text-sm font-bold text-slate-900">
                                        {field.value
                                            ? new Date(field.value).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
                                            : "Pilih tanggal"}
                                    </span>
                                </PopoverTrigger>
                                <PopoverContent className={cn("w-auto p-0 rounded-[1.5rem] shadow-2xl border-none ring-1 ring-black/5 bg-white text-slate-950")} align="start" sideOffset={8}>
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
                    {errors.tanggal_mulai && (
                        <p className="text-xs font-semibold text-destructive mt-1">{errors.tanggal_mulai.message}</p>
                    )}
                </div>
            </div>

            {/* Bento Card 4: Informasi Deskripsi */}
            <div className={cn(
                "p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden shadow-sm flex flex-col gap-4 col-span-1 md:col-span-2",
                inline ? "bg-white border-slate-200 hover:border-slate-300" : "bg-white border-slate-100"
            )}>
                {/* Label/Judul */}
                <div className="space-y-2">
                    <Label htmlFor="label" className={cn("text-[10px] font-black uppercase tracking-[0.25em]", inline ? "text-slate-500" : "text-slate-500")}>
                        Judul Jadwal
                    </Label>
                    <Input
                        id="label"
                        placeholder="Contoh: Tagihan Internet Indihome, Uang Kos, Gaji Bulanan..."
                        {...register('label')}
                        className={cn(
                            "h-14 rounded-2xl font-medium shadow-sm transition-all focus:scale-[1.01]",
                            inline ? "bg-slate-50 border-slate-200 text-slate-950 focus:bg-white focus:border-primary/50 focus:ring-primary/20" : "bg-slate-50 border-slate-200 text-slate-950",
                            errors.label && "border-destructive"
                        )}
                    />
                    {errors.label && (
                        <p className="text-xs font-semibold text-destructive mt-1">{errors.label.message}</p>
                    )}
                </div>

                {/* Catatan (Detail) */}
                <div className="space-y-2">
                    <Label htmlFor="catatan" className={cn("text-[10px] font-black uppercase tracking-[0.25em]", inline ? "text-slate-500" : "text-slate-500")}>
                        Detail Transaksi (Opsional)
                    </Label>
                    <Textarea
                        id="catatan"
                        placeholder="Tambah detail atau catatan tambahan..."
                        {...register('catatan')}
                        className={cn(
                            "resize-none rounded-2xl font-medium",
                            inline ? "bg-slate-50 border-slate-200 text-slate-950 focus:bg-white focus:border-primary/50" : "bg-slate-50 border-slate-200 text-slate-950"
                        )}
                        rows={3}
                    />
                </div>
            </div>

            {/* Action Row */}
            <div className="col-span-1 md:col-span-2 flex justify-end pt-4 w-full">
                <Button
                    type="submit"
                    disabled={isSubmitting || showSuccess}
                    className={cn(
                        "w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-none flex items-center justify-center gap-2 border-none",
                        inline ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-700" : "bg-primary/10 hover:bg-primary/20 text-primary"
                    )}
                >
              {showSuccess ? (
                  <>
                      <CheckCircle2 size={16} className="animate-in zoom-in mr-2" />
                      Berhasil Disimpan!
                  </>
              ) : isSubmitting ? (
                  <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Menyimpan...
                  </>
              ) : (
                  <>
                      <CalendarClock size={16} className="mr-2" />
                      {isSubmitting ? "Menyimpan..." : (recurringToEdit ? "Simpan Perubahan" : "Buat Jadwal Autodebet")}
                  </>
              )}
          </Button>
            </div>
        </>
    );

    // Left preview content showing reactive calendar schedule details
    const previewContent = (
        <div className="w-full flex flex-col gap-8 text-center items-center">
            {/* Holographic Calendar Mock */}
            <div className="relative w-full aspect-square max-w-[280px] rounded-[2.5rem] p-6 border border-slate-200/80 bg-gradient-to-br from-white to-slate-50 shadow-2xl flex flex-col items-center justify-center group overflow-hidden">
                <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-emerald-500/10 blur-[50px] opacity-35 group-hover:bg-emerald-500/20 transition-all duration-1000" />
                <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-emerald-450/10 blur-[50px] opacity-25" />

                {/* Clock / Calendar Icon */}
                <div className="relative z-10 w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4 animate-pulse shadow-xs">
                    <Clock size={36} strokeWidth={2} />
                </div>

                <div className="relative z-10 space-y-1.5 w-full">
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">JADWAL RITUAL BERULANG</span>
                    <h4 className="text-sm font-black text-slate-800 max-w-[200px] truncate mx-auto uppercase tracking-wide">{watchedLabel || 'AUTODEBET BARU'}</h4>
                    
                    <div className="w-16 h-0.5 bg-slate-200 mx-auto my-2.5 rounded-full" />
                    
                    <p className="text-xl font-black text-emerald-600 tracking-tight display-number">{formatRupiah(watchedNominal)}</p>
                    
                    <div className="flex flex-col gap-1 items-center pt-2">
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
                            <Zap size={10} className="text-emerald-600" />
                            <span>SETIAP {watchedFrekuensi.toUpperCase()}</span>
                        </div>
                        
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-450 pt-2 block">
                            PROSES BERIKUTNYA: {new Date(estimatedNextDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Smart info */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs text-left w-full">
                <div className="flex items-center gap-2 mb-2 text-emerald-600">
                    <Sparkles size={14} />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Anggaran Otomatis</span>
                </div>
                <p className="text-[11px] font-semibold text-slate-650 leading-relaxed">
                    Setiap autodebet atau pengeluaran berulang (seperti biaya abonemen internet, tagihan listrik, atau bonus komisi bulanan) akan dikomputasikan secara tepat waktu oleh sistem untuk menjaga kontinuitas kalkulasi neraca dompet Anda.
                </p>
            </div>
        </div>
    );

    if (inline) {
        return (
            <FormPageLayout
                title={recurringToEdit ? 'Edit Transaksi Rutin' : 'Transaksi Rutin Baru'}
                description={recurringToEdit ? 'Perbarui jadwal autodebet rutin transaksi finansial Anda' : 'Jadwalkan pencatatan pengeluaran atau pemasukan rutin secara otomatis'}
                isDirty={isDirty}
                previewPanel={previewContent}
                formPanel={
                    <form onSubmit={handleSubmit(onSubmit as any)} className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pb-16">
                        {formContent}
                    </form>
                }
                onCancel={onClose}
                showSuccessModal={showSuccess}
                onSuccessConfirm={() => router.push('/recurring')}
                successMessage={`Jadwal autodebet "${watchedLabel}" sebesar ${formatRupiah(watchedNominal)} berhasil disimpan.`}
            />
        );
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white border-slate-100 text-slate-950">
                <DialogHeader className="mb-2">
                    <DialogTitle>{recurringToEdit ? 'Edit Jadwal Berulang' : 'Transaksi Berulang'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
                    {formContent}
                </form>
            </DialogContent>
        </Dialog>
    );
}
