'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { useSearchParams, useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFinanceStore } from '@/lib/store';
import { transaksiSchema, type TransaksiFormData } from '@/lib/schemas';
import type { Transaksi, Titipan } from '@/lib/types';
import { getToday, cn, formatRupiah } from '@/lib/utils';
import { Save, CalendarIcon, AlertCircle, CheckCircle2, UserCircle2, Wallet, Layers, FileText, ArrowDownRight, ArrowUpRight, TrendingUp } from 'lucide-react';
import NumericInput from '@/shared/forms/NumericInput';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { ResponsiveModal } from '@/shared/ui/responsive-modal';
import FormPageLayout from '@/shared/layout/FormPageLayout';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/ui/popover';
import { Calendar } from '@/shared/ui/calendar';
import { SearchableSelect } from '@/shared/ui/SearchableSelect';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';

// Helper to extract YYYY-MM-DD
function transferToEditDate(dateStr: string) {
    if (!dateStr) return getToday();
    return dateStr.split('T')[0];
}

interface TransaksiFormProps {
    onClose: () => void;
    transaksiToEdit?: Transaksi | null;
    inline?: boolean;
}

function TransaksiFormInner({ onClose, transaksiToEdit, inline = false }: TransaksiFormProps) {
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
    const addTransaksi = useFinanceStore((s) => s.addTransaksi);
    const updateTransaksi = useFinanceStore((s) => s.updateTransaksi);
    const budgetList = useFinanceStore((s) => s.budgetList);
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const activeMonth = useFinanceStore((s) => s.activeMonth);
    const getTitipanAktif = useFinanceStore((s) => s.getTitipanAktif);
    const router = useRouter();

    const searchParams = useSearchParams();
    
    // Parse default values from URL if not editing an existing transaction
    const dateParam = searchParams.get('date');
    const categoryParam = searchParams.get('category');
    const accountParam = searchParams.get('account');
    const typeParam = searchParams.get('type');

    const defaultDate = (dateParam && dateParam !== 'all') ? dateParam : getToday();
    const defaultCategoryName = (categoryParam && categoryParam !== 'all') ? categoryParam : '';
    const defaultAccountName = (accountParam && accountParam !== 'all') ? accountParam : '';

    // Map names to IDs for default values
    const defaultCategory = defaultCategoryName ? (kategoriList.find(k => k.nama_kategori.toLowerCase() === defaultCategoryName.toLowerCase())?.id_kategori || '') : '';
    const defaultAccount = defaultAccountName ? (sumberDanaList.find(s => s.nama_sumber.toLowerCase() === defaultAccountName.toLowerCase())?.id_sumber_dana || '') : '';
    const defaultType = (typeParam === 'Pemasukan' || typeParam === 'Pengeluaran') ? typeParam : 'Pengeluaran';

    const [activeJenis, setActiveJenis] = useState<'Pengeluaran' | 'Pemasukan'>(
        (transaksiToEdit?.jenis === 'Pemasukan' ? 'Pemasukan' : transaksiToEdit?.jenis === 'Pengeluaran' ? 'Pengeluaran' : defaultType) as 'Pengeluaran' | 'Pemasukan'
    );
    const [showSuccess, setShowSuccess] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<TransaksiFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(transaksiSchema) as any,
        defaultValues: {
            tanggal: transaksiToEdit?.tanggal || defaultDate,
            jenis: (transaksiToEdit?.jenis || defaultType) as 'Pengeluaran' | 'Pemasukan',
            id_sumber_dana: transaksiToEdit?.id_sumber_dana || defaultAccount,
            id_kategori: transaksiToEdit?.id_kategori || defaultCategory,
            nominal: transaksiToEdit?.nominal || 0,
            label: transaksiToEdit?.label || '',
            catatan: transaksiToEdit?.catatan || '',
            is_titipan: transaksiToEdit?.is_titipan || null,
        },
    });

    useEffect(() => {
        if (transaksiToEdit) {
            reset({
                tanggal: transferToEditDate(transaksiToEdit.tanggal),
                jenis: transaksiToEdit.jenis as 'Pengeluaran' | 'Pemasukan',
                id_sumber_dana: transaksiToEdit.id_sumber_dana,
                id_kategori: transaksiToEdit.id_kategori,
                nominal: transaksiToEdit.nominal,
                label: transaksiToEdit.label,
                catatan: transaksiToEdit.catatan,
                is_titipan: transaksiToEdit.is_titipan || null,
            });
            setActiveJenis(transaksiToEdit.jenis as 'Pengeluaran' | 'Pemasukan');
        }
    }, [transaksiToEdit, reset]);

    const filteredKategori = kategoriList.filter((k) => k.tipe === activeJenis);

    // Watch values for live highlights
    const watchedNominal = useWatch({ control, name: 'nominal' }) || 0;
    const watchedKategori = useWatch({ control, name: 'id_kategori' });
    const watchedJenis = useWatch({ control, name: 'jenis' });
    const watchedLabel = useWatch({ control, name: 'label' }) || '';
    const watchedSumberDana = useWatch({ control, name: 'id_sumber_dana' });
    const watchedTanggal = useWatch({ control, name: 'tanggal' });

    // Calculate budget impact
    const budgetImpact = useMemo(() => {
        if (watchedJenis !== 'Pengeluaran' || !watchedKategori) return null;

        const budget = budgetList.find(b =>
            b.id_kategori === watchedKategori &&
            b.bulan === parseInt(activeMonth.split('-')[1]) &&
            b.tahun === parseInt(activeMonth.split('-')[0])
        );

        if (!budget) return null;

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
        if (inline) {
            setShowSuccess(true);
        } else {
            onClose();
        }
    };

    const sourceAccountName = useMemo(() => {
        return sumberDanaList.find(s => s.id_sumber_dana === watchedSumberDana)?.nama_sumber || 'Pilih Rekening';
    }, [watchedSumberDana, sumberDanaList]);

    const categoryName = useMemo(() => {
        return kategoriList.find(k => k.id_kategori === watchedKategori)?.nama_kategori || 'Pilih Kategori';
    }, [watchedKategori, kategoriList]);

    const formContent = (
        <>
            {/* Bento Grid Item 1: Nominal & Switch Jenis (Col Span 2) */}
            <div className={cn(
                "p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden col-span-1 md:col-span-2 shadow-sm flex flex-col gap-6",
                inline ? "bg-white border-slate-200" : "bg-white border-slate-100",
                activeJenis === 'Pemasukan' ? "ring-1 ring-emerald-500/10" : "ring-1 ring-rose-500/10"
            )}>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Label className={cn("text-xs font-black uppercase tracking-[0.25em]", inline ? "text-slate-500" : "text-slate-500")}>
                        Nominal Transaksi
                    </Label>
                    <Tabs
                        value={activeJenis}
                        onValueChange={(val) => {
                            const jenis = val as 'Pengeluaran' | 'Pemasukan';
                            setActiveJenis(jenis);
                            setValue('jenis', jenis);
                            setValue('id_kategori', '');
                        }}
                        className="w-full sm:w-auto"
                    >
                        <TabsList className={cn("grid w-full grid-cols-2", inline ? "bg-slate-100 border border-slate-200" : "bg-slate-100")}>
                            <TabsTrigger value="Pengeluaran" className="text-xs uppercase tracking-widest font-black py-2.5">
                                💸 Keluar
                            </TabsTrigger>
                            <TabsTrigger value="Pemasukan" className="text-xs uppercase tracking-widest font-black py-2.5">
                                💰 Masuk
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="w-full">
                    <NumericInput
                        name="nominal"
                        control={control as any}
                        error={errors.nominal?.message}
                        className={cn(
                            "text-4xl sm:text-6xl font-black h-20 sm:h-28 text-center bg-transparent border-none focus:ring-0 focus:border-none shadow-none display-number tracking-tighter w-full overflow-hidden transition-all duration-300",
                            activeJenis === 'Pemasukan' ? "text-emerald-600" : "text-rose-600"
                        )}
                        placeholder="Rp 0"
                    />
                </div>
            </div>

            {/* Bento Grid Item 2: Tanggal & Waktu (Col Span 1) */}
            <div className={cn(
                "p-6 rounded-[2rem] border transition-all duration-500 flex flex-col justify-between gap-3 shadow-sm",
                inline ? "bg-white border-slate-200 hover:border-slate-300" : "bg-white border-slate-100"
            )}>
                <Label className={cn("text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2", inline ? "text-slate-500" : "text-slate-500")}>
                    <CalendarIcon size={14} className="opacity-60" /> Tanggal
                </Label>
                <Controller
                    name="tanggal"
                    control={control}
                    render={({ field }) => (
                        <Popover>
                            <PopoverTrigger
                                className={cn(
                                    "flex h-12 w-full items-center justify-between rounded-xl border px-4 text-sm font-bold whitespace-nowrap transition-all duration-300 outline-none select-none",
                                    inline ? "bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-350" : "bg-slate-50 border-slate-200 text-slate-800",
                                    !field.value && "text-muted-foreground/50",
                                    errors.tanggal && "border-destructive focus:ring-destructive/10 focus:border-destructive"
                                )}
                            >
                                <span className="text-sm font-black uppercase tracking-wider text-slate-900">
                                    {field.value
                                        ? new Date(field.value).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
                                        : "Pilih tanggal"}
                                </span>
                                <CalendarIcon size={16} className="opacity-40 shrink-0 text-slate-500" />
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-[1.5rem] shadow-2xl border-none ring-1 ring-black/5 z-50 bg-white" align="start" sideOffset={8}>
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
                    <p className="text-xs font-semibold text-destructive">{errors.tanggal.message}</p>
                )}
            </div>

            {/* Bento Grid Item 3: Sumber Dana & Kategori (Col Span 1) */}
            <div className={cn(
                "p-6 rounded-[2rem] border transition-all duration-500 flex flex-col justify-between gap-4 shadow-sm",
                inline ? "bg-white border-slate-200 hover:border-slate-300" : "bg-white border-slate-100"
            )}>
                {/* Sumber Dana */}
                <div className="space-y-2">
                    <Label className={cn("text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2", inline ? "text-slate-500" : "text-slate-500")}>
                        <Wallet size={14} className="opacity-60" /> Sumber Dana
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
                                placeholder="Pilih sumber dana..."
                                searchPlaceholder="Cari..."
                                error={!!errors.id_sumber_dana}
                                className={inline ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : ""}
                            />
                        )}
                    />
                </div>

                {/* Kategori */}
                <div className="space-y-2">
                    <Label className={cn("text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2", inline ? "text-slate-500" : "text-slate-500")}>
                        <Layers size={14} className="opacity-60" /> Kategori
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
                                searchPlaceholder="Cari..."
                                error={!!errors.id_kategori}
                                className={inline ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : ""}
                            />
                        )}
                    />
                </div>
            </div>

            {/* Bento Grid Item 4: Judul Transaksi & Titipan Link (Col Span 1) */}
            <div className={cn(
                "p-6 rounded-[2rem] border transition-all duration-500 flex flex-col justify-between gap-4 shadow-sm",
                inline ? "bg-white border-slate-200 hover:border-slate-300" : "bg-white border-slate-100"
            )}>
                <div className="space-y-2">
                    <Label className={cn("text-xs font-black uppercase tracking-[0.2em]", inline ? "text-slate-500" : "text-slate-500")}>
                        Judul Transaksi
                    </Label>
                    <Input
                        id="label"
                        placeholder="Makan Siang, Gaji, dll."
                        {...register('label')}
                        className={cn(
                            "h-12 rounded-xl whitespace-nowrap font-bold text-sm",
                            inline ? "bg-slate-50 border-slate-200 text-slate-950 focus:bg-white" : "bg-slate-50 border-slate-200",
                            errors.label && "border-destructive"
                        )}
                    />
                    {errors.label && (
                        <p className="text-xs font-semibold text-destructive">{errors.label.message}</p>
                    )}
                </div>

                <div className={cn(
                    "p-4 rounded-xl border space-y-2 transition-colors duration-300",
                    inline ? "bg-amber-500/5 border-amber-500/20 text-amber-900" : "bg-amber-50/30 border-amber-100/50"
                )}>
                    <Label className="text-xs font-black uppercase tracking-widest text-amber-600 flex items-center gap-2 leading-none">
                        <UserCircle2 size={14} /> Tautkan ke Titipan
                    </Label>
                    <Controller
                        name="is_titipan"
                        control={control}
                        render={({ field }) => (
                            <SearchableSelect
                                options={[
                                    { value: '', label: 'Pribadi (Bukan Titipan)' },
                                    ...getTitipanAktif().map((t: Titipan) => ({
                                        value: t.id_titipan,
                                        label: `👤 ${t.nama_konteks}`
                                    }))
                                ]}
                                value={field.value || ''}
                                onValueChange={(val) => field.onChange(val || null)}
                                placeholder="Pilih amplop..."
                                searchPlaceholder="Cari..."
                                className={inline ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : ""}
                            />
                        )}
                    />
                </div>
            </div>

            {/* Bento Grid Item 5: Catatan (Col Span 1) */}
            <div className={cn(
                "p-6 rounded-[2rem] border transition-all duration-500 flex flex-col gap-2.5 shadow-sm",
                inline ? "bg-white border-slate-200 hover:border-slate-300" : "bg-white border-slate-100"
            )}>
                <Label className={cn("text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2", inline ? "text-slate-500" : "text-slate-500")}>
                    <FileText size={14} className="opacity-60" /> Catatan Detail
                </Label>
                <Textarea
                    id="catatan"
                    placeholder="Catat rincian tambahan di sini..."
                    {...register('catatan')}
                    className={cn(
                        "resize-none rounded-xl flex-1 font-bold text-sm",
                        inline ? "bg-slate-50 border-slate-200 text-slate-950 focus:bg-white" : "bg-slate-50 border-slate-200"
                    )}
                    rows={4}
                />
            </div>

            {/* Live Budget Impact highlight (Col Span 2) */}
            {budgetImpact && (
                <div className={cn(
                    "p-5 rounded-[2rem] border animate-in fade-in slide-in-from-bottom-2 duration-500 col-span-1 md:col-span-2 shadow-lg",
                    budgetImpact.isOver
                        ? "bg-red-50 border-red-200 text-red-900"
                        : "bg-emerald-50 border-emerald-200 text-emerald-900"
                )}>
                    <div className="flex items-start gap-4">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0",
                            budgetImpact.isOver 
                                ? "bg-red-100 text-red-600"
                                : "bg-emerald-100 text-emerald-600"
                        )}>
                            {budgetImpact.isOver ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                        </div>
                        <div className="space-y-2 flex-1">
                            <h4 className="text-sm font-black uppercase tracking-wider">
                                Dampak Anggaran: {budgetImpact.kategoriName}
                            </h4>
                            <p className="text-xs leading-relaxed text-slate-600">
                                {budgetImpact.isOver
                                    ? `Transaksi ini akan melampaui sisa anggaran kategori ${budgetImpact.kategoriName} sebesar ${formatRupiah(budgetImpact.newUsage - budgetImpact.limit)}.`
                                    : `Aman! Anda menyisakan ${formatRupiah(budgetImpact.limit - budgetImpact.newUsage)} dari batas anggaran setelah transaksi ini.`
                                }
                            </p>
                            <div className="space-y-1.5 pt-1.5">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
                                    <span>Pemanfaatan Anggaran</span>
                                    <span>{Math.round(budgetImpact.newPercent)}%</span>
                                </div>
                                <div className="h-2.5 w-full rounded-full overflow-hidden relative bg-slate-200">
                                    <div
                                        className="absolute inset-y-0 left-0 transition-all duration-500 bg-slate-350"
                                        style={{ width: `${Math.min(budgetImpact.currentPercent, 100)}%` }}
                                    />
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

            {/* Action buttons panel (Col Span 2) */}
            <div className="col-span-1 md:col-span-2 pt-4 flex gap-4 w-full">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className={cn(
                        "flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest",
                        inline ? "border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 bg-white" : ""
                    )}
                >
                    Batal
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                        "flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest",
                        activeJenis === 'Pemasukan' ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                >
                    <Save size={16} className="mr-2" />
                    {isSubmitting ? 'Menyimpan...' : (transaksiToEdit ? 'Simpan' : 'Tambah')}
                </Button>
            </div>
        </>
    );

    // Dynamic Left Panel: Futuristic Interactive Receipt preview (Premium Light/Glow styled)
    const previewContent = (
        <div className="flex flex-col justify-between h-full gap-8 p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-br from-white to-slate-50 border border-slate-200/80 shadow-2xl relative overflow-hidden group">
            {/* Top design accent */}
            <div className="absolute top-[-20px] right-[-20px] w-48 h-48 rounded-full bg-blue-100/10 blur-3xl pointer-events-none" />

            {/* holographic orb behind value */}
            <div className={cn(
                "absolute top-[25%] left-[25%] w-[50%] h-[40%] rounded-full blur-[100px] pointer-events-none opacity-20 transition-colors duration-1000",
                activeJenis === 'Pemasukan' ? "bg-emerald-500/20" : "bg-rose-500/20"
            )} />

            {/* Top row: mock bank badge */}
            <div className="flex justify-between items-center relative z-10 w-full">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 text-slate-800 flex items-center justify-center shadow-xs">
                        <TrendingUp size={20} className={activeJenis === 'Pemasukan' ? "text-emerald-500" : "text-rose-500"} />
                    </div>
                    <div className="text-left">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">PREVIEW DATA</span>
                        <h4 className="text-xs font-bold text-slate-600 mt-1 uppercase tracking-widest">{activeJenis}</h4>
                    </div>
                </div>
                <div className={cn(
                    "px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-xs flex items-center gap-2",
                    activeJenis === 'Pemasukan' ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-rose-50 border-rose-200 text-rose-600"
                )}>
                    {activeJenis === 'Pemasukan' ? <ArrowUpRight size={10} strokeWidth={3} /> : <ArrowDownRight size={10} strokeWidth={3} />}
                    {activeJenis}
                </div>
            </div>

            {/* Giant Live numeric value */}
            <div className="text-center py-8 relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">Estimasi Nominal</p>
                <h2 className={cn(
                    "text-5xl sm:text-6xl font-black display-number tracking-tighter truncate px-2 select-all",
                    activeJenis === 'Pemasukan' ? "text-emerald-600" : "text-rose-600"
                )}>
                    {formatRupiah(watchedNominal)}
                </h2>
                <div className="w-32 h-0.5 bg-slate-200 mx-auto mt-4 rounded-full" />
            </div>

            {/* Holographic Receipt Details */}
            <div className="space-y-4 relative z-10 bg-white/80 p-6 rounded-2xl border border-slate-200 shadow-xs backdrop-blur-md">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Judul Transaksi</span>
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[200px]">{watchedLabel || 'Belum diisi'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sumber Dana</span>
                    <span className="text-xs font-bold text-slate-800">{sourceAccountName}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kategori</span>
                    <span className="text-xs font-bold text-slate-800">{categoryName}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tanggal</span>
                    <span className="text-xs font-bold text-slate-800 display-number">
                        {watchedTanggal 
                            ? new Date(watchedTanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
                            : new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
                        }
                    </span>
                </div>
            </div>

            {/* Smart Contextual Tip */}
            <div className="relative z-10 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs text-left">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Tips Keuangan Cerdas</p>
                <p className="text-[11px] font-semibold text-slate-650 leading-relaxed">
                    {activeJenis === 'Pengeluaran'
                        ? "Bila transaksi ini dialokasikan untuk kebutuhan tersier, pastikan total alokasi pengeluaran bulanan Anda tidak melampaui batas maksimal 50% dari penghasilan bersih."
                        : "Selamat atas pendapatan barumu! Segera sisihkan minimal 20% ke pos 'Tujuan Tabungan/Sinking Funds' di dompet kontrol sebelum digunakan untuk belanja lainnya."
                    }
                </p>
            </div>
        </div>
    );

    if (inline) {
        return (
            <FormPageLayout
                title={transaksiToEdit ? 'Edit Transaksi' : 'Transaksi Baru'}
                description={transaksiToEdit ? 'Perbarui catatan transaksi keuangan Anda' : 'Catat transaksi pemasukan atau pengeluaran baru'}
                isDirty={isDirty}
                previewPanel={previewContent}
                formPanel={
                    <form onSubmit={handleSubmit(onSubmit as any)} className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pb-16">
                        {formContent}
                    </form>
                }
                onCancel={onClose}
                showSuccessModal={showSuccess}
                onSuccessConfirm={() => router.push('/transaksi')}
                successMessage={`Catatan transaksi sebesar ${formatRupiah(watchedNominal)} berhasil disimpan ke sistem.`}
            />
        );
    }

    return (
        <ResponsiveModal
            open={true}
            onOpenChange={onClose}
            title={transaksiToEdit ? 'Edit Transaksi' : 'Tambah Transaksi'}
            className="sm:max-w-md bg-white text-slate-900 border-slate-100"
        >
            <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6 pt-2">
                {formContent}
            </form>
        </ResponsiveModal>
    );
}

export default function TransaksiForm(props: TransaksiFormProps) {
    return (
        <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Memuat form...</div>}>
            <TransaksiFormInner {...props} />
        </Suspense>
    );
}
