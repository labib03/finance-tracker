'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFinanceStore } from '@/lib/store';
import { sumberDanaSchema, type SumberDanaFormData } from '@/lib/schemas';
import type { SumberDana } from '@/lib/types';
import { Save, Wallet, ShieldCheck, CreditCard } from 'lucide-react';
import { generateId, cn, formatRupiah } from '@/lib/utils';
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
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

interface SumberDanaFormProps {
    onClose: () => void;
    sumberDanaToEdit?: SumberDana | null;
    inline?: boolean;
}

export default function SumberDanaForm({ onClose, sumberDanaToEdit, inline = false }: SumberDanaFormProps) {
    const addSumberDana = useFinanceStore((s) => s.addSumberDana);
    const updateSumberDana = useFinanceStore((s) => s.updateSumberDana);
    const router = useRouter();
    const [showSuccess, setShowSuccess] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<SumberDanaFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(sumberDanaSchema) as any,
        defaultValues: {
            id_sumber_dana: '',
            nama_sumber: '',
            saldo_awal: 0,
        },
    });

    useEffect(() => {
        if (sumberDanaToEdit) {
            reset({
                id_sumber_dana: sumberDanaToEdit.id_sumber_dana,
                nama_sumber: sumberDanaToEdit.nama_sumber,
                saldo_awal: sumberDanaToEdit.saldo_awal,
            });
        } else {
            reset({
                id_sumber_dana: `SD-${generateId().substring(0, 6)}`,
                nama_sumber: '',
                saldo_awal: 0,
            });
        }
    }, [sumberDanaToEdit, reset]);

    const watchedNama = useWatch({ control, name: 'nama_sumber' }) || '';
    const watchedSaldo = useWatch({ control, name: 'saldo_awal' }) || 0;

    const onSubmit = async (data: SumberDanaFormData) => {
        if (sumberDanaToEdit) {
            await updateSumberDana(data as SumberDana);
        } else {
            await addSumberDana(data as SumberDana);
        }
        if (inline) {
            setShowSuccess(true);
        } else {
            onClose();
        }
    };

    const formContent = (
        <>
            {/* ID Sumber Dana (Hidden) */}
            <input type="hidden" {...register('id_sumber_dana')} />

            {/* Bento Card 1: Nama Akun / Sumber Dana */}
            <div className={cn(
                "p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden shadow-sm flex flex-col gap-4",
                inline ? "bg-white border-slate-200 hover:border-slate-300" : "bg-white border-slate-100"
            )}>
                
                <Label htmlFor="nama_sumber" className={cn("text-[10px] font-black uppercase tracking-[0.25em]", inline ? "text-slate-500" : "text-slate-500")}>
                    Nama Akun / Rekening / E-Wallet
                </Label>
                <Input
                    id="nama_sumber"
                    placeholder="Contoh: Bank Mandiri, OVO, Cash..."
                    {...register('nama_sumber')}
                    className={cn(
                        "h-14 rounded-2xl font-medium shadow-sm transition-all focus:scale-[1.01]",
                        inline ? "bg-slate-50 border-slate-200 text-slate-950 focus:bg-white focus:border-primary/50 focus:ring-primary/20" : "bg-slate-50 border-slate-200 text-slate-950 focus:border-primary/50 focus:ring-primary/20",
                        errors.nama_sumber ? 'border-destructive' : ''
                    )}
                />
                {errors.nama_sumber && (
                    <p className="text-xs font-semibold text-destructive flex items-center gap-1.5 mt-1">
                        <span>{errors.nama_sumber.message}</span>
                    </p>
                )}
            </div>

            {/* Bento Card 2: Saldo Awal */}
            <div className={cn(
                "p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden shadow-sm flex flex-col gap-4",
                inline ? "bg-white border-slate-200 hover:border-slate-300" : "bg-white border-slate-100"
            )}>
                <div className="flex flex-col space-y-2">
                    <NumericInput
                        label="Saldo Awal Rekening"
                        name="saldo_awal"
                        control={control as any}
                        error={errors.saldo_awal?.message}
                        disabled={!!sumberDanaToEdit}
                        className={cn(
                            "text-3xl sm:text-4xl font-black h-16 sm:h-20 shadow-sm text-center tracking-tight border-none focus:ring-0 focus:bg-white",
                            inline ? "bg-slate-50 border-slate-200 text-slate-900 focus:border-primary/50" : "bg-primary/5 border-primary/20 text-primary"
                        )}
                    />
                    {sumberDanaToEdit && (
                        <p className={cn(
                            "text-[10px] text-center pt-2 font-black uppercase tracking-widest",
                            inline ? "text-slate-500" : "text-slate-400"
                        )}>
                            * Saldo awal terkunci dan tidak dapat diubah
                        </p>
                    )}
                </div>
            </div>

            {/* Action Row */}
            <div className="col-span-1 flex justify-end pt-4 w-full">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                        "w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] border-none text-white",
                        inline ? "bg-blue-600 hover:bg-blue-700" : "bg-primary hover:bg-primary/90 text-primary-foreground"
                    )}
                >
                    <Save size={16} />
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Rekening'}
                </Button>
            </div>
        </>
    );

    // Render Preview untuk Panel Kiri Split-Screen
    const previewContent = (
        <div className="w-full flex flex-col gap-8">
            {/* Holographic Credit/Debit Card Mock */}
            <div className="relative w-full aspect-[1.586/1] rounded-[2rem] p-8 overflow-hidden border border-slate-200/80 bg-gradient-to-br from-white to-slate-50 shadow-2xl transition-all duration-700 hover:scale-[1.02] flex flex-col justify-between group">
                {/* Holographic glowing orbs */}
                <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-blue-500/10 blur-[60px] opacity-35 group-hover:bg-blue-500/20 transition-all duration-1000" />
                <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-blue-400/10 blur-[60px] opacity-25" />

                {/* Top of Card */}
                <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-xs">
                            <CreditCard size={20} />
                        </div>
                        <div className="text-left">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">AKUN FINANSIAL</span>
                            <h4 className="text-sm font-black text-slate-800 mt-0.5 tracking-wide max-w-[150px] truncate">
                                {watchedNama || 'NAMA REKENING'}
                            </h4>
                        </div>
                    </div>
                    <div className="w-12 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-xs text-slate-500">
                        <Wallet size={16} />
                    </div>
                </div>

                {/* Middle: Chip and Contactless */}
                <div className="flex items-center justify-between relative z-10 my-4">
                    <div className="w-10 h-8 rounded-md bg-gradient-to-r from-amber-200 to-amber-400/50 border border-amber-300 opacity-90 shadow-xs" />
                    <div className="text-right">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 block leading-none">STATUS PROTEKSI</span>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 justify-end mt-0.5">
                            <ShieldCheck size={12} /> SECURED
                        </span>
                    </div>
                </div>

                {/* Bottom: Card Number & Balance */}
                <div className="flex justify-between items-end relative z-10 pt-2 border-t border-slate-100">
                    <div className="text-left">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none block">NOMOR PROTEKSI</span>
                        <span className="text-[11px] font-black text-slate-500 tracking-widest display-number">**** **** **** 2026</span>
                    </div>
                    <div className="text-right">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none block">SALDO UTAMA</span>
                        <span className="text-xl sm:text-2xl font-black text-blue-600 tracking-tight display-number">
                            {formatRupiah(watchedSaldo)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Info Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs text-left">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Pentingnya Catatan Akun</p>
                <p className="text-[11px] font-semibold text-slate-650 leading-relaxed">
                    Setiap rekening, dompet digital, atau uang tunai (cash) harus terdata dengan saldo yang akurat. Hal ini memastikan persentase kapasitas alokasi anggaran bulanan Anda dihitung dari kekayaan riil yang tersedia.
                </p>
            </div>
        </div>
    );

    if (inline) {
        return (
            <FormPageLayout
                title={sumberDanaToEdit ? 'Edit Rekening' : 'Tambah Rekening'}
                description={sumberDanaToEdit ? 'Perbarui informasi dan sesuaikan parameter akun keuangan Anda' : 'Daftarkan akun keuangan, rekening bank, atau dompet digital baru'}
                isDirty={isDirty}
                previewPanel={previewContent}
                formPanel={
                    <form onSubmit={handleSubmit(onSubmit as any)} className="flex flex-col gap-6 w-full pb-16">
                        {formContent}
                    </form>
                }
                onCancel={onClose}
                showSuccessModal={showSuccess}
                onSuccessConfirm={() => router.push('/saldo')}
                successMessage={`Akun ${watchedNama} dengan saldo awal ${formatRupiah(watchedSaldo)} berhasil ditambahkan ke dompet Anda.`}
            />
        );
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white border-slate-100 text-slate-950">
                <DialogHeader className="mb-2">
                    <DialogTitle>
                        {sumberDanaToEdit ? 'Edit Akun Keuangan' : 'Tambah Akun Keuangan'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
                    {formContent}
                </form>
            </DialogContent>
        </Dialog>
    );
}
