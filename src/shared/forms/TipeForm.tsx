'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFinanceStore } from '@/lib/store';
import { tipeSchema, type TipeFormData } from '@/lib/schemas';
import type { TipeTransaksi } from '@/lib/types';
import { Save, CheckCircle2, Loader2, Sparkles, Activity, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { generateId, cn } from '@/lib/utils';
import { getRootLabel } from '@/lib/tipeUtils';
import { Button } from '@/shared/ui/button';
import { useRouter } from 'next/navigation';
import FormPageLayout from '@/shared/layout/FormPageLayout';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { TRANSACTION_TYPES } from '@/lib/constants';

interface TipeFormProps {
    onClose: () => void;
    tipeToEdit?: TipeTransaksi | null;
}

export default function TipeForm({ onClose, tipeToEdit }: TipeFormProps) {
    const addTipeTransaksi = useFinanceStore((s) => s.addTipeTransaksi);
    const updateTipeTransaksi = useFinanceStore((s) => s.updateTipeTransaksi);
    const tipeList = useFinanceStore((s) => s.tipeList);
    const router = useRouter();
    const [showSuccess, setShowSuccess] = useState(false);

    const rootTipes = useMemo(() => tipeList.filter(t => !t.master_tipe), [tipeList]);

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<TipeFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(tipeSchema) as any,
        defaultValues: {
            id_tipe: '',
            label: '',
            master_tipe: null,
        },
    });

    useEffect(() => {
        if (tipeToEdit) {
            reset({
                id_tipe: tipeToEdit.id_tipe,
                label: tipeToEdit.label,
                master_tipe: tipeToEdit.master_tipe,
            });
        } else {
            reset({
                id_tipe: `TIPE_${generateId().substring(0, 6)}`,
                label: '',
                master_tipe: null,
            });
        }
    }, [tipeToEdit, reset]);

    const watchedLabel = useWatch({ control, name: 'label' }) || '';
    const watchedMasterTipeId = useWatch({ control, name: 'master_tipe' });
    
    // Get resolved master tipe data
    const rootLabel = watchedMasterTipeId ? getRootLabel(tipeList, watchedMasterTipeId) : '';
    const _isPemasukan = rootLabel.includes(TRANSACTION_TYPES.INCOME) || (!watchedMasterTipeId && watchedLabel.toLowerCase().includes('masuk'));
    const _isSavings = rootLabel.includes(TRANSACTION_TYPES.SAVINGS) || (!watchedMasterTipeId && watchedLabel.toLowerCase().includes('tabung'));
    
    const onSubmit = async (data: TipeFormData) => {
        if (tipeToEdit) {
            await updateTipeTransaksi({
                ...tipeToEdit,
                label: data.label,
                master_tipe: data.master_tipe || null
            });
        } else {
            await addTipeTransaksi({
                id_tipe: data.id_tipe || `TIPE_${generateId()}`,
                label: data.label,
                master_tipe: data.master_tipe || null,
                tanggal_dibuat: new Date().toISOString()
            });
        }
        setShowSuccess(true);
    };

    const formContent = (
        <>
            {/* ID Tipe (Hidden) */}
            <input type="hidden" {...register('id_tipe')} />

            {/* Bento Card 1: Nama Tipe */}
            <div className="bg-white border-slate-200 hover:border-slate-300 p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden shadow-sm flex flex-col gap-4 col-span-1 md:col-span-2">
                <Label htmlFor="label" className="text-slate-500 text-[10px] font-black uppercase tracking-[0.25em]">
                    Nama / Label Tipe
                </Label>
                <Input
                    id="label"
                    placeholder="Contoh: Belanja Bulanan, Gaji Utama..."
                    {...register('label')}
                    className={cn(
                        "h-14 rounded-2xl font-medium shadow-sm transition-all focus:scale-[1.01] bg-slate-50 border-slate-200 text-slate-950 focus:bg-white focus:border-primary/50",
                        errors.label ? 'border-destructive' : ''
                    )}
                />
                {errors.label && (
                    <p className="text-xs font-semibold text-destructive mt-1">{errors.label.message}</p>
                )}
            </div>

            {/* Bento Card 2: Master Tipe */}
            <div className="bg-white border-slate-200 hover:border-slate-300 p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden shadow-sm flex flex-col gap-4 col-span-1 md:col-span-2">
                <Label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.25em]">
                    Master Tipe (Parent)
                </Label>
                <Controller
                    name="master_tipe"
                    control={control}
                    render={({ field }) => (
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => field.onChange(null)}
                                className={cn(
                                    "px-4 py-3 rounded-xl text-left transition-all border",
                                    !field.value
                                        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                                        : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                                )}
                            >
                                <div className="text-[9px] uppercase tracking-wider mb-0.5 opacity-70">Hirarki Tertinggi</div>
                                <div className={cn("font-bold text-sm", !field.value ? "text-white" : "text-slate-700")}>Root (Master)</div>
                            </button>
                            {rootTipes.filter(t => t.id_tipe !== tipeToEdit?.id_tipe).map((t) => (
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
                                    <div className="text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">Sub-Tipe Dari</div>
                                    <div className={cn("font-bold text-sm", field.value === t.id_tipe ? "text-white" : "text-slate-700")}>{t.label}</div>
                                </button>
                            ))}
                        </div>
                    )}
                />
            </div>

            {/* Action Row */}
            <div className="col-span-1 md:col-span-2 flex justify-end pt-4 w-full">
                <Button
                    type="submit"
                    disabled={isSubmitting || showSuccess || !watchedLabel}
                    className="bg-emerald-600 hover:bg-emerald-700 w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] border-none text-white"
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
                            {tipeToEdit ? 'Simpan Perubahan' : 'Simpan Tipe'}
                        </>
                    )}
                </Button>
            </div>
        </>
    );

    // Left preview content
    const previewContent = (
        <div className="w-full flex flex-col gap-8 text-center items-center">
            {/* Holographic Badge Container */}
            <div className="relative w-full aspect-square max-w-[280px] rounded-[2.5rem] p-6 border border-slate-200/80 bg-gradient-to-br from-white to-slate-50 shadow-2xl flex flex-col items-center justify-center group overflow-hidden">
                {/* Reactive Glow orbs based on category type */}
                <div className={cn(
                    "absolute -top-16 -right-16 w-36 h-36 rounded-full blur-[50px] transition-all duration-1000 opacity-35",
                    _isPemasukan ? "bg-emerald-500/10 group-hover:bg-emerald-500/20" : _isSavings ? "bg-blue-500/10 group-hover:bg-blue-500/20" : "bg-rose-500/10 group-hover:bg-rose-500/20"
                )} />
                <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-slate-100 blur-[50px] opacity-25" />

                {/* Badge Icon */}
                <div className={cn(
                    "relative z-10 w-24 h-24 rounded-[1.5rem] bg-slate-50 border border-slate-200 shadow-xs flex items-center justify-center mb-4 transition-all duration-500",
                    _isPemasukan ? "text-emerald-600" : _isSavings ? "text-blue-600" : "text-rose-600"
                )}>
                    {_isPemasukan ? <ArrowUpRight size={40} strokeWidth={2.5} /> : _isSavings ? <Wallet size={40} strokeWidth={2.5} /> : watchedMasterTipeId ? <ArrowDownRight size={40} strokeWidth={2.5} /> : <Activity size={40} strokeWidth={2.5} />}
                </div>

                <div className="relative z-10">
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">{watchedMasterTipeId ? 'SUB-TIPE' : 'MASTER TIPE'}</span>
                    <h4 className="text-base font-black text-slate-800 mt-1 max-w-[220px] truncate uppercase tracking-wider">
                        {watchedLabel || 'TIPE BARU'}
                    </h4>
                    
                    <div className="w-16 h-0.5 bg-slate-200 mx-auto my-3 rounded-full" />
                    
                    <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-xs",
                        _isPemasukan ? "bg-emerald-50 border-emerald-200 text-emerald-600" : _isSavings ? "bg-blue-50 border-blue-200 text-blue-600" : watchedMasterTipeId ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-slate-50 border-slate-200 text-slate-600"
                    )}>
                        {watchedMasterTipeId ? (tipeList.find(t => t.id_tipe === watchedMasterTipeId)?.label || 'PARENT KOSONG') : 'ROOT'}
                    </span>
                </div>
            </div>

            {/* Smart info */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs text-left w-full">
                <div className="flex items-center gap-2 mb-2 text-blue-600">
                    <Sparkles size={14} />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Hirarki Data</span>
                </div>
                <p className="text-[11px] font-semibold text-slate-650 leading-relaxed">
                    Tipe berfungsi sebagai fondasi utama aplikasi. Master Tipe menjadi akar laporan finansial utama seperti Pengeluaran, Pemasukan, Tabungan, atau Transfer.
                </p>
            </div>
        </div>
    );

    return (
        <FormPageLayout
            title={tipeToEdit ? 'Edit Tipe' : 'Tipe Baru'}
            description={tipeToEdit ? 'Perbarui informasi hirarki tipe transaksi' : 'Buat struktur dasar arus kas baru untuk laporan'}
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
            successMessage={`Tipe "${watchedLabel}" berhasil disimpan.`}
        />
    );
}
