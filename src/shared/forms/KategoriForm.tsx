'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFinanceStore } from '@/lib/store';
import { kategoriSchema, type KategoriFormData } from '@/lib/schemas';
import type { Kategori } from '@/lib/types';
import { Save, ArrowUpRight, ArrowDownRight, Sparkles, Layers, CheckCircle2, Loader2 } from 'lucide-react';
import { generateId, cn } from '@/lib/utils';
import { getRootLabel, isIncome, isSavings } from '@/lib/tipeUtils';
import { CategoryIcon } from '@/shared/ui/CategoryIcon';
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
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import IconPickerComponent from './IconPickerComponent';

interface KategoriFormProps {
    onClose: () => void;
    kategoriToEdit?: Kategori | null;
    inline?: boolean;
}

export default function KategoriForm({ onClose, kategoriToEdit, inline = false }: KategoriFormProps) {
    const addKategori = useFinanceStore((s) => s.addKategori);
    const updateKategori = useFinanceStore((s) => s.updateKategori);
    const tipeList = useFinanceStore((s) => s.tipeList);
    const router = useRouter();
    const [showSuccess, setShowSuccess] = useState(false);

    // Fallback to first tipe if available
    const defaultTipe = tipeList.length > 0 ? tipeList[0].id_tipe : 'Pengeluaran';

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<KategoriFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(kategoriSchema) as any,
        defaultValues: {
            id_kategori: '',
            nama_kategori: '',
            tipe: 'Pengeluaran',
            icon_name: 'circle',
        },
    });

    useEffect(() => {
        if (kategoriToEdit) {
            reset({
                id_kategori: kategoriToEdit.id_kategori,
                nama_kategori: kategoriToEdit.nama_kategori,
                tipe: kategoriToEdit.tipe,
                icon_name: kategoriToEdit.icon_name,
            });
        } else {
            reset({
                id_kategori: `KAT-${generateId().substring(0, 6)}`,
                nama_kategori: '',
                tipe: defaultTipe,
                icon_name: 'circle',
            });
        }
    }, [kategoriToEdit, reset, defaultTipe]);

    const watchedNama = useWatch({ control, name: 'nama_kategori' }) || '';
    const watchedTipeId = useWatch({ control, name: 'tipe' }) || defaultTipe;
    const watchedIcon = useWatch({ control, name: 'icon_name' }) || 'circle';
    
    // Get resolved tipe data
    const watchedTipe = tipeList.find(t => t.id_tipe === watchedTipeId);
    const _isPemasukan = isIncome(tipeList, watchedTipeId);
    const _isSavings = isSavings(tipeList, watchedTipeId);

    const onSubmit = async (data: KategoriFormData) => {
        if (kategoriToEdit) {
            await updateKategori(data as Kategori);
        } else {
            await addKategori(data as Kategori);
        }
        if (inline) {
            setShowSuccess(true);
        } else {
            onClose();
        }
    };

    const formContent = (
        <>
            {/* ID Kategori (Hidden) */}
            <input type="hidden" {...register('id_kategori')} />

            {/* Bento Card 1: Nama Kategori */}
            <div className={cn(
                "p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden shadow-sm flex flex-col gap-4 col-span-1 md:col-span-2",
                inline ? "bg-white border-slate-200 hover:border-slate-300" : "bg-white border-slate-100"
            )}>
                <Label htmlFor="nama_kategori" className={cn("text-[10px] font-black uppercase tracking-[0.25em]", inline ? "text-slate-500" : "text-slate-500")}>
                    Nama Kategori Finansial
                </Label>
                <Input
                    id="nama_kategori"
                    placeholder="Contoh: Makanan, Investasi, Bonus Gaji..."
                    {...register('nama_kategori')}
                    className={cn(
                        "h-14 rounded-2xl font-medium shadow-sm transition-all focus:scale-[1.01]",
                        inline ? "bg-slate-50 border-slate-200 text-slate-950 focus:bg-white focus:border-primary/50" : "bg-slate-50 border-slate-200 text-slate-950",
                        errors.nama_kategori ? 'border-destructive' : ''
                    )}
                />
                {errors.nama_kategori && (
                    <p className="text-xs font-semibold text-destructive mt-1">{errors.nama_kategori.message}</p>
                )}
            </div>

            {/* Bento Card 2: Tipe Kategori (Grid) */}
            <div className={cn(
                "p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden shadow-sm flex flex-col gap-4 col-span-1 md:col-span-2",
                inline ? "bg-white border-slate-200 hover:border-slate-300" : "bg-white border-slate-100"
            )}>
                <Label className={cn("text-[10px] font-black uppercase tracking-[0.25em]", inline ? "text-slate-500" : "text-slate-500")}>
                    Tipe Transaksi (Parent)
                </Label>
                <Controller
                    name="tipe"
                    control={control}
                    render={({ field }) => (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {tipeList.map((t) => (
                                <button
                                    key={t.id_tipe}
                                    type="button"
                                    onClick={() => field.onChange(t.id_tipe)}
                                    className={cn(
                                        "px-4 py-3 rounded-xl text-left transition-all border",
                                        field.value === t.id_tipe 
                                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                                            : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                                    )}
                                >
                                    <div className="text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">{t.master_tipe ? (tipeList.find(pt => pt.id_tipe === t.master_tipe)?.label || t.master_tipe) : 'Root (Master)'}</div>
                                    <div className={cn("font-bold text-sm", field.value === t.id_tipe ? "text-white" : "text-slate-700")}>{t.label}</div>
                                </button>
                            ))}
                        </div>
                    )}
                />
            </div>

            {/* Bento Card 3: Icon Picker */}
            <IconPickerComponent control={control} errors={errors} inline={inline} watchedIcon={watchedIcon} />

            {/* Action Row */}
            <div className="col-span-1 md:col-span-2 flex justify-end pt-4 w-full">
                <Button
                    type="submit"
                    disabled={isSubmitting || showSuccess}
                    className={cn(
                        "w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] border-none text-white",
                        inline ? "bg-emerald-600 hover:bg-emerald-700" : "bg-primary hover:bg-primary/90 text-primary-foreground"
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
                            <Save size={16} className="mr-2" />
                            {kategoriToEdit ? 'Simpan Perubahan' : 'Simpan Kategori'}
                        </>
                    )}
                </Button>
            </div>
        </>
    );

    // Left preview content showing dynamic holographic category badge
    const previewContent = (
        <div className="w-full flex flex-col gap-8 text-center items-center">
            {/* Holographic Category Badge Container */}
            <div className="relative w-full aspect-square max-w-[280px] rounded-[2.5rem] p-6 border border-slate-200/80 bg-gradient-to-br from-white to-slate-50 shadow-2xl flex flex-col items-center justify-center group overflow-hidden">
                {/* Reactive Glow orbs based on category type */}
                <div className={cn(
                    "absolute -top-16 -right-16 w-36 h-36 rounded-full blur-[50px] transition-all duration-1000 opacity-35",
                    _isPemasukan ? "bg-emerald-500/10 group-hover:bg-emerald-500/20" : _isSavings ? "bg-blue-500/10 group-hover:bg-blue-500/20" : "bg-rose-500/10 group-hover:bg-rose-500/20"
                )} />
                <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-slate-100 blur-[50px] opacity-25" />

                {/* Badge Icon */}
                <div className={cn(
                    "relative z-10 w-24 h-24 rounded-full bg-slate-50 border border-slate-200 shadow-xs flex items-center justify-center mb-4 transition-all duration-500",
                    _isPemasukan ? "text-emerald-600" : _isSavings ? "text-blue-600" : "text-rose-600"
                )}>
                    <CategoryIcon name={watchedIcon} size={40} />
                </div>

                <div className="relative z-10">
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">KATEGORI MASTER</span>
                    <h4 className="text-base font-black text-slate-800 mt-1 max-w-[220px] truncate uppercase tracking-wider">
                        {watchedNama || 'KATEGORI BARU'}
                    </h4>
                    
                    <div className="w-16 h-0.5 bg-slate-200 mx-auto my-3 rounded-full" />
                    
                    <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-xs",
                        _isPemasukan ? "bg-emerald-50 border-emerald-200 text-emerald-600" : _isSavings ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-rose-50 border-rose-200 text-rose-600"
                    )}>
                        {watchedTipe?.label || 'TIPE KOSONG'}
                    </span>
                </div>
            </div>

            {/* Smart info */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs text-left w-full">
                <div className="flex items-center gap-2 mb-2 text-emerald-600">
                    <Sparkles size={14} />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Struktur Klasifikasi</span>
                </div>
                <p className="text-[11px] font-semibold text-slate-650 leading-relaxed">
                    Pengkategorian arus kas keluar (Pengeluaran) dan arus kas masuk (Pemasukan) secara tertib membantu visualisasi grafik laporan bulanan agar tidak rancu dan memberikan gambaran instan ke mana saja uang Anda pergi.
                </p>
            </div>
        </div>
    );

    if (inline) {
        return (
            <FormPageLayout
                title={kategoriToEdit ? 'Edit Kategori' : 'Kategori Baru'}
                description={kategoriToEdit ? 'Perbarui klasifikasi kategori transaksi Anda' : 'Buat kategori arus kas baru untuk merincikan catatan pembukuan'}
                isDirty={isDirty}
                previewPanel={previewContent}
                formPanel={
                    <form onSubmit={handleSubmit(onSubmit as any)} className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pb-16">
                        {formContent}
                    </form>
                }
                onCancel={onClose}
                showSuccessModal={showSuccess}
                onSuccessConfirm={() => router.push('/master')}
                successMessage={`Kategori "${watchedNama}" berhasil disimpan.`}
            />
        );
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white border-slate-100 text-slate-950">
                <DialogHeader className="mb-2">
                    <DialogTitle>
                        {kategoriToEdit ? 'Edit Kategori' : 'Tambah Kategori'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
                    {formContent}
                </form>
            </DialogContent>
        </Dialog>
    );
}
