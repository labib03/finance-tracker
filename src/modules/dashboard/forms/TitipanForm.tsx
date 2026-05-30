'use client';

import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFinanceStore } from '@/lib/store';
import { titipanSchema, type TitipanFormData } from '@/lib/schemas';
import type { Titipan } from '@/lib/types';
import { Save, UserCircle2, ShieldCheck, Mail } from 'lucide-react';
import { generateId, getToday, cn } from '@/lib/utils';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { useRouter } from 'next/navigation';
import FormPageLayout from '@/shared/layout/FormPageLayout';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/shared/ui/dialog';

interface TitipanFormProps {
    onClose: () => void;
    titipanToEdit?: Titipan | null;
    inline?: boolean;
}

export default function TitipanForm({ onClose, titipanToEdit, inline = false }: TitipanFormProps) {
    const addTitipan = useFinanceStore((s) => s.addTitipan);
    const router = useRouter();
    const [showSuccess, setShowSuccess] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<TitipanFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(titipanSchema) as any,
        defaultValues: {
            id_titipan: '',
            nama_konteks: '',
            tanggal_dibuat: getToday(),
            status: 'aktif',
        },
    });

    useEffect(() => {
        if (titipanToEdit) {
            reset({
                id_titipan: titipanToEdit.id_titipan,
                nama_konteks: titipanToEdit.nama_konteks,
                tanggal_dibuat: titipanToEdit.tanggal_dibuat,
                status: titipanToEdit.status,
            });
        } else {
            reset({
                id_titipan: `TIT-${generateId().substring(0, 6)}`,
                nama_konteks: '',
                tanggal_dibuat: getToday(),
                status: 'aktif',
            });
        }
    }, [titipanToEdit, reset]);

    const watchedNama = useWatch({ control, name: 'nama_konteks' }) || '';

    const onSubmit = async (data: TitipanFormData) => {
        // addTitipan logic in store serves both creation and overwrites/adding.
        await addTitipan(data as Titipan);
        if (inline) {
            setShowSuccess(true);
        } else {
            onClose();
        }
    };

    const formContent = (
        <>
            <input type="hidden" {...register('id_titipan')} />
            <input type="hidden" {...register('status')} />
            <input type="hidden" {...register('tanggal_dibuat')} />

            {/* Bento Card: Detail Amplop Titipan */}
            <div className={cn(
                "p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden shadow-sm flex flex-col gap-4",
                inline ? "bg-white border-slate-200 hover:border-slate-350" : "bg-amber-50/20 border-amber-100"
            )}>
                
                <Label htmlFor="nama_konteks" className={cn("text-[10px] font-black uppercase tracking-[0.25em]", inline ? "text-slate-500" : "text-amber-800")}>
                    Nama Penitip / Konteks Amplop
                </Label>
                <Input
                    id="nama_konteks"
                    placeholder="Contoh: Titipan Maman, Kas Proyek X, Arisan..."
                    {...register('nama_konteks')}
                    className={cn(
                        "h-14 rounded-2xl font-medium shadow-sm transition-all focus:scale-[1.01]",
                        inline ? "bg-slate-50 border-slate-200 text-slate-950 focus:border-amber-400/50 focus:ring-amber-400/20 focus:bg-white" : "bg-white border-amber-200 text-slate-950 focus:border-amber-400/50 focus:ring-amber-400/20",
                        errors.nama_konteks ? 'border-destructive' : ''
                    )}
                />
                {errors.nama_konteks && (
                    <p className="text-xs font-semibold text-destructive mt-1">
                        {errors.nama_konteks.message}
                    </p>
                )}
            </div>

            {/* Action Row */}
            <div className="col-span-1 flex justify-end pt-4">
                <Button
                    type="submit"
                    disabled={isSubmitting || showSuccess}
                    className={cn(
                        "w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] border-none",
                        inline ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-amber-500 hover:bg-amber-600 text-white"
                    )}
                >
                    <Save size={16} />
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Amplop'}
                </Button>
            </div>
        </>
    );

    // Render Preview untuk Panel Kiri Split-Screen
    const previewContent = (
        <div className="w-full flex flex-col gap-8">
            {/* Skeuomorphic Glass Envelope Mock */}
            <div className="relative w-full aspect-[1.586/1] rounded-[2rem] p-8 overflow-hidden border border-slate-200/80 bg-gradient-to-br from-white to-slate-50 shadow-2xl transition-all duration-700 hover:scale-[1.02] flex flex-col justify-between group">
                {/* Glowing glow orbs */}
                <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-amber-500/10 blur-[60px] opacity-35 group-hover:bg-amber-500/20 transition-all duration-1000" />
                <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-amber-400/10 blur-[60px] opacity-30" />

                {/* Top of Card */}
                <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-205 text-amber-600 flex items-center justify-center shadow-xs">
                            <Mail size={20} />
                        </div>
                        <div className="text-left">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">AMPLOP TITIPAN</span>
                            <h4 className="text-sm font-black text-slate-800 mt-0.5 tracking-wide max-w-[180px] truncate">
                                {watchedNama || 'NAMA PENITIP'}
                            </h4>
                        </div>
                    </div>
                    <div className="w-12 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                        <UserCircle2 size={16} className="text-slate-500" />
                    </div>
                </div>

                {/* Middle info */}
                <div className="flex items-center justify-between relative z-10 my-4">
                    <div className="w-12 h-1 bg-slate-200 rounded-full" />
                    <div className="text-right">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 block leading-none">STATUS PROTEKSI</span>
                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1 justify-end mt-0.5">
                            <ShieldCheck size={12} /> ISOLATED
                        </span>
                    </div>
                </div>

                {/* Bottom detail */}
                <div className="flex justify-between items-end relative z-10 pt-2 border-t border-slate-100">
                    <div className="text-left">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none block">TIPE ASET</span>
                        <span className="text-[11px] font-black text-amber-600 tracking-wider uppercase font-bold">DANA TITIPAN PIHAK LAIN</span>
                    </div>
                    <div className="text-right">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none block">SALDO SAAT INI</span>
                        <span className="text-xl font-black text-slate-800 tracking-tight display-number">Rp 0</span>
                    </div>
                </div>
            </div>

            {/* Info Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs text-left">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Mengapa Menggunakan Amplop Titipan?</p>
                <p className="text-[11px] font-semibold text-slate-650 leading-relaxed">
                    Amplop titipan berguna untuk melacak kas titipan, kas proyek bersama, uang arisan, atau utang/piutang yang berada di bawah pengawasan Anda. Dengan mencatatnya di amplop khusus, Anda tidak akan salah menganggapnya sebagai uang pribadi Anda.
                </p>
            </div>
        </div>
    );

    if (inline) {
        return (
            <FormPageLayout
                title={titipanToEdit ? 'Edit Amplop Titipan' : 'Amplop Titipan Baru'}
                description={titipanToEdit ? 'Perbarui identitas amplop titipan Anda' : 'Buat amplop digital baru untuk menyimpan dana non-pribadi Anda'}
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
                successMessage={`Amplop titipan "${watchedNama}" berhasil dibuat. Anda sekarang dapat memilih amplop ini saat mencatat transaksi titipan.`}
            />
        );
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white border-slate-100 text-slate-950">
                <DialogHeader className="mb-2">
                    <DialogTitle>
                        {titipanToEdit ? 'Edit Amplop Titipan' : 'Buat Amplop Titipan Baru'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
                    {formContent}
                </form>
            </DialogContent>
        </Dialog>
    );
}
