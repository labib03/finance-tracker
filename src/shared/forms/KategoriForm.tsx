'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFinanceStore } from '@/lib/store';
import { kategoriSchema, type KategoriFormData } from '@/lib/schemas';
import type { Kategori } from '@/lib/types';
import { Save, ArrowUpRight, ArrowDownRight, Sparkles, Layers } from 'lucide-react';
import { generateId, cn } from '@/lib/utils';
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
    const router = useRouter();
    const [showSuccess, setShowSuccess] = useState(false);

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
                tipe: 'Pengeluaran',
                icon_name: 'circle',
            });
        }
    }, [kategoriToEdit, reset]);

    const watchedNama = useWatch({ control, name: 'nama_kategori' }) || '';
    const watchedTipe = useWatch({ control, name: 'tipe' }) || 'Pengeluaran';
    const watchedIcon = useWatch({ control, name: 'icon_name' }) || 'circle';

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

            {/* Bento Card 2: Tipe Kategori (Tabs) */}
            <div className={cn(
                "p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden shadow-sm flex flex-col gap-4 col-span-1 md:col-span-2",
                inline ? "bg-white border-slate-200 hover:border-slate-300" : "bg-white border-slate-100"
            )}>
                <Label className={cn("text-[10px] font-black uppercase tracking-[0.25em]", inline ? "text-slate-500" : "text-slate-500")}>
                    Tipe/Kategori Arus Kas
                </Label>
                <Controller
                    name="tipe"
                    control={control}
                    render={({ field }) => (
                        <Tabs 
                            value={field.value} 
                            onValueChange={field.onChange}
                            className="w-full"
                        >
                            <TabsList className={cn("grid w-full grid-cols-2 p-1 rounded-2xl border border-slate-200", inline ? "bg-slate-150" : "bg-slate-100")}>
                                <TabsTrigger 
                                    value="Pengeluaran" 
                                    className="rounded-xl font-black text-xs uppercase tracking-widest data-active:bg-rose-50 data-active:text-rose-600 data-active:border-rose-100/50 data-active:shadow-xs hover:text-rose-500 dark:data-active:bg-rose-950/20 dark:data-active:text-rose-450 dark:data-active:border-rose-900/30 transition-all cursor-pointer"
                                >
                                    <ArrowDownRight size={14} className="mr-1.5" />
                                    Pengeluaran
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="Pemasukan" 
                                    className="rounded-xl font-black text-xs uppercase tracking-widest data-active:bg-emerald-50 data-active:text-emerald-600 data-active:border-emerald-100/50 data-active:shadow-xs hover:text-emerald-500 dark:data-active:bg-emerald-950/20 dark:data-active:text-emerald-450 dark:data-active:border-emerald-900/30 transition-all cursor-pointer"
                                >
                                    <ArrowUpRight size={14} className="mr-1.5" />
                                    Pemasukan
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    )}
                />
            </div>

            {/* Bento Card 3: Icon Picker */}
            <IconPickerComponent control={control} errors={errors} inline={inline} watchedIcon={watchedIcon} />

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
                    <Save size={16} />
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Kategori'}
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
                    watchedTipe === 'Pemasukan' ? "bg-emerald-500/10 group-hover:bg-emerald-500/20" : "bg-rose-500/10 group-hover:bg-rose-500/20"
                )} />
                <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-slate-100 blur-[50px] opacity-25" />

                {/* Badge Icon */}
                <div className={cn(
                    "relative z-10 w-24 h-24 rounded-full bg-slate-50 border border-slate-200 shadow-xs flex items-center justify-center mb-4 transition-all duration-500",
                    watchedTipe === 'Pemasukan' ? "text-emerald-600" : "text-rose-600"
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
                        watchedTipe === 'Pemasukan' ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-rose-50 border-rose-200 text-rose-600"
                    )}>
                        {watchedTipe}
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
