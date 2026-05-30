'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFinanceStore } from '@/lib/store';
import { transferSchema, type TransferFormData } from '@/lib/schemas';
import { getToday, cn, formatRupiah } from '@/lib/utils';
import { useEffect, useState, useMemo } from 'react';
import type { Transaksi, Titipan } from '@/lib/types';
import { UserCircle2, ArrowLeftRight, CalendarIcon, Wallet, FileText, Save, ArrowRight, Sparkles, TrendingUp, Loader2, CheckCircle2 } from "lucide-react";
import NumericInput from '@/shared/forms/NumericInput';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { ResponsiveModal } from '@/shared/ui/responsive-modal';
import FormPageLayout from '@/shared/layout/FormPageLayout';
import { useRouter } from 'next/navigation';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/ui/popover';
import { Calendar } from '@/shared/ui/calendar';
import { SearchableSelect } from '@/shared/ui/SearchableSelect';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
import { motion } from 'framer-motion';

interface TransferFormProps {
    onClose: () => void;
    transferToEdit?: Transaksi | null;
    inline?: boolean;
}

export default function TransferForm({ onClose, transferToEdit, inline = false }: TransferFormProps) {
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const addTransfer = useFinanceStore((s) => s.addTransfer);
    const updateTransfer = useFinanceStore((s) => s.updateTransfer);
    const titipanList = useFinanceStore((s) => s.titipanList);
    const router = useRouter();

    const [showSuccess, setShowSuccess] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<TransferFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(transferSchema) as any,
        defaultValues: {
            tanggal: transferToEdit?.tanggal || getToday(),
            id_sumber_dana_asal: transferToEdit?.id_sumber_dana || '',
            id_target_dana: transferToEdit?.id_target_dana || '',
            nominal: transferToEdit?.nominal || 0,
            label: transferToEdit?.label || 'Transfer Saldo',
            catatan: transferToEdit?.catatan || '',
            biaya_admin: 0,
            is_titipan: transferToEdit?.is_titipan || null,
        },
    });

    useEffect(() => {
        if (transferToEdit) {
            const linkedAdminFee = transaksiList.find(t => t.catatan.includes(`[ADMIN_FEE:${transferToEdit.id}]`));
            reset({
                tanggal: transferToEdit.tanggal,
                id_sumber_dana_asal: transferToEdit.id_sumber_dana,
                id_target_dana: transferToEdit.id_target_dana || '',
                nominal: transferToEdit.nominal,
                label: transferToEdit.label,
                catatan: transferToEdit.catatan,
                biaya_admin: linkedAdminFee ? linkedAdminFee.nominal : 0,
                is_titipan: transferToEdit.is_titipan || null,
            });
        }
    }, [transferToEdit, reset, transaksiList]);

    const onSubmit = async (data: TransferFormData) => {
        if (transferToEdit) {
            await updateTransfer({
                ...transferToEdit,
                tanggal: data.tanggal,
                id_sumber_dana: data.id_sumber_dana_asal,
                id_target_dana: data.id_target_dana,
                nominal: data.nominal,
                label: data.label,
                catatan: data.catatan || '',
                is_titipan: data.is_titipan,
            }, data.biaya_admin || 0);
        } else {
            await addTransfer(
                data.id_sumber_dana_asal,
                data.id_target_dana,
                data.nominal,
                data.label,
                data.catatan || '',
                data.tanggal,
                data.biaya_admin || 0,
                data.is_titipan
            );
        }
        if (inline) {
            setShowSuccess(true);
        } else {
            onClose();
        }
    };

    const watchedNominal = watch('nominal') || 0;
    const watchedAsal = watch('id_sumber_dana_asal');
    const watchedTujuan = watch('id_target_dana');
    const watchedLabel = watch('label') || '';
    const watchedTanggal = watch('tanggal');
    const watchedBiayaAdmin = watch('biaya_admin') || 0;

    const sourceAccountName = useMemo(() => {
        return sumberDanaList.find(s => s.id_sumber_dana === watchedAsal)?.nama_sumber || 'Pilih Rekening Asal';
    }, [watchedAsal, sumberDanaList]);

    const targetAccountName = useMemo(() => {
        return sumberDanaList.find(s => s.id_sumber_dana === watchedTujuan)?.nama_sumber || 'Pilih Rekening Tujuan';
    }, [watchedTujuan, sumberDanaList]);

    const formContent = (
        <>
            {/* Bento Grid Item 1: Nominal & Biaya Admin (Col Span 2) */}
            <div className={cn(
                "p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden col-span-1 md:col-span-2 shadow-sm flex flex-col gap-6",
                inline ? "bg-white border-slate-200 ring-1 ring-blue-550/5" : "bg-white border-slate-100 shadow-blue-500/5"
            )}>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Label className={cn("text-xs font-black uppercase tracking-[0.25em]", inline ? "text-slate-500" : "text-slate-500")}>
                        Nominal Transfer
                    </Label>
                    
                    {/* Compact Admin Fee inline */}
                    <div className={cn(
                        "flex items-center justify-center gap-3 px-3 py-1 rounded-xl border shrink-0",
                        inline ? "bg-slate-50 border-slate-200" : "bg-slate-50 border-slate-200"
                    )}>
                        <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Fee:</Label>
                        <NumericInput
                            name="biaya_admin"
                            control={control as any}
                            hideCalculator={true}
                            error={errors.biaya_admin?.message}
                            containerClassName="w-auto flex items-center justify-center"
                            className="text-xs text-center font-bold h-8 bg-transparent border-none focus:ring-0 w-24 p-0 text-slate-800"
                            placeholder="Rp 0"
                        />
                    </div>
                </div>

                <div className="w-full">
                    <NumericInput
                        name="nominal"
                        control={control as any}
                        error={errors.nominal?.message}
                        className="text-4xl sm:text-6xl font-black h-20 sm:h-28 text-center bg-transparent border-none focus:ring-0 focus:border-none shadow-none display-number tracking-tighter w-full overflow-hidden transition-all duration-300 text-blue-600"
                        placeholder="Rp 0"
                    />
                </div>
            </div>

            {/* Bento Grid Item 2: Accounts Section (Col Span 1) */}
            <div className={cn(
                "p-6 rounded-[2rem] border transition-all duration-500 flex flex-col justify-between gap-4 shadow-sm",
                inline ? "bg-white border-slate-200 hover:border-slate-300" : "bg-white border-slate-100"
            )}>
                {/* Sumber Asal */}
                <div className="space-y-2">
                    <Label className={cn("text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2", inline ? "text-slate-500" : "text-slate-500")}>
                        Dari Akun Asal
                    </Label>
                    <Controller
                        name="id_sumber_dana_asal"
                        control={control}
                        render={({ field }) => (
                            <SearchableSelect
                                options={sumberDanaList.map(s => ({
                                    value: s.id_sumber_dana,
                                    label: s.nama_sumber
                                }))}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Pilih akun asal..."
                                searchPlaceholder="Cari..."
                                error={!!errors.id_sumber_dana_asal}
                                className={inline ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : ""}
                            />
                        )}
                    />
                </div>

                {/* Arrow indicator separator */}
                <div className="flex items-center gap-4 py-1">
                     <div className={cn("flex-1 h-px", inline ? "bg-slate-200" : "bg-slate-200")}></div>
                     <div className={cn(
                         "w-8 h-8 rounded-full border flex items-center justify-center shadow-xs text-slate-500 z-10 shrink-0",
                         inline ? "bg-white border-slate-200" : "bg-white border-slate-200"
                     )}>
                         <ArrowLeftRight size={14} className="rotate-90" />
                     </div>
                     <div className={cn("flex-1 h-px", inline ? "bg-slate-200" : "bg-slate-200")}></div>
                </div>

                {/* Sumber Tujuan */}
                <div className="space-y-2">
                    <Label className={cn("text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2", inline ? "text-slate-500" : "text-slate-500")}>
                        Ke Akun Tujuan
                    </Label>
                    <Controller
                        name="id_target_dana"
                        control={control}
                        render={({ field }) => (
                            <SearchableSelect
                                options={sumberDanaList
                                    .filter(s => s.id_sumber_dana !== watch('id_sumber_dana_asal'))
                                    .map(s => ({
                                        value: s.id_sumber_dana,
                                        label: s.nama_sumber
                                    }))}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Pilih akun tujuan..."
                                searchPlaceholder="Cari..."
                                error={!!errors.id_target_dana}
                                className={inline ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : ""}
                            />
                        )}
                    />
                </div>
            </div>

            {/* Bento Grid Item 3: Tanggal & Waktu (Col Span 1) */}
            <div className={cn(
                "p-6 rounded-[2rem] border transition-all duration-500 flex flex-col justify-between gap-3 shadow-sm",
                inline ? "bg-white border-slate-200 hover:border-slate-300" : "bg-white border-slate-100"
            )}>
                <Label className={cn("text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2", inline ? "text-slate-500" : "text-slate-500")}>
                    <CalendarIcon size={14} className="opacity-60" /> Tanggal Transfer
                </Label>
                <Controller
                    name="tanggal"
                    control={control}
                    render={({ field }) => (
                        <Popover>
                            <PopoverTrigger
                                className={cn(
                                    "flex h-12 w-full items-center justify-between rounded-xl border px-4 text-sm font-bold whitespace-nowrap transition-all duration-300 outline-none select-none",
                                    inline ? "bg-slate-50 border-slate-200 text-slate-900 hover:border-slate-350" : "bg-slate-50 border-slate-200 text-slate-800",
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

            {/* Bento Grid Item 4: Judul Transfer & Titipan Link (Col Span 1) */}
            <div className={cn(
                "p-6 rounded-[2rem] border transition-all duration-500 flex flex-col justify-between gap-4 shadow-sm",
                inline ? "bg-white border-slate-200 hover:border-slate-300" : "bg-white border-slate-100"
            )}>
                <div className="space-y-2">
                    <Label className={cn("text-xs font-black uppercase tracking-[0.2em]", inline ? "text-slate-500" : "text-slate-500")}>
                        Judul Transfer
                    </Label>
                    <Input
                        id="label"
                        placeholder="Misal: Mutasi Tabungan"
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
                                    ...titipanList
                                        .filter((t: Titipan) => t.status === 'aktif')
                                        .map((t: Titipan) => ({
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
                    disabled={isSubmitting || showSuccess}
                    className={cn(
                        "flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest",
                        "bg-blue-600 text-white hover:bg-blue-700"
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
                      <ArrowRightLeft size={16} className="mr-2" />
                      {isSubmitting ? "Memproses..." : "Transfer Sekarang"}
                  </>
              )}
          </Button>
            </div>
        </>
    );
    // Dynamic Left Panel: Futuristic Interactive Transfer flow preview
    const previewContent = (
        <div className="flex flex-col gap-6 h-fit w-full">
            {/* Main Interactive Transfer Card */}
            <div className="flex flex-col justify-between gap-6 p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-br from-white to-slate-50 border border-slate-200/80 relative overflow-hidden group">
                {/* Top design accent */}
                <div className="absolute top-[-20px] left-[-20px] w-48 h-48 rounded-full bg-blue-100/10 blur-3xl pointer-events-none" />

                {/* Holographic blue blur */}
                <div className="absolute top-[25%] left-[25%] w-[50%] h-[40%] rounded-full blur-[100px] pointer-events-none opacity-20 bg-blue-500/20" />

                {/* Top row: header */}
                <div className="flex justify-between items-center relative z-10 w-full">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center shadow-xs">
                            <TrendingUp size={20} className="text-blue-500" />
                        </div>
                        <div className="text-left">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">PREVIEW DATA</span>
                            <h4 className="text-xs font-bold text-slate-650 mt-1 uppercase tracking-widest">Transfer Dana</h4>
                        </div>
                    </div>
                    <div className="px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-200 text-blue-600 bg-blue-50 shadow-xs flex items-center gap-2">
                        <ArrowLeftRight size={10} strokeWidth={3} />
                        MUTASI
                    </div>
                </div>

                {/* Giant Live numeric value */}
                <div className="text-center py-4 relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">Estimasi Nominal</p>
                    <h2 className="text-5xl sm:text-6xl font-black display-number tracking-tighter truncate px-2 select-all text-blue-600">
                        {formatRupiah(watchedNominal)}
                    </h2>
                    <div className="w-32 h-0.5 bg-slate-200 mx-auto mt-4 rounded-full" />
                </div>

                {/* Interactive flow map: Source Account -> Target Account */}
                <div className="relative z-10 flex items-center justify-between gap-4 py-4 px-6 bg-white/80 rounded-2xl border border-slate-200 shadow-xs backdrop-blur-md">
                    {/* Source wallet card bubble */}
                    <div className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                            <Wallet size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center truncate max-w-[100px]">
                            {sourceAccountName}
                        </span>
                    </div>

                    {/* Animated Spring arrow flow */}
                    <div className="flex flex-col items-center gap-1 min-w-[60px]">
                        <motion.div
                            animate={{ x: [0, 8, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                            className="text-blue-500 shrink-0"
                        >
                            <ArrowRight size={24} strokeWidth={3} />
                        </motion.div>
                    </div>

                    {/* Target wallet card bubble */}
                    <div className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-xs">
                            <Wallet size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 text-center truncate max-w-[100px]">
                            {targetAccountName}
                        </span>
                    </div>
                </div>

                {/* Receipt Summary Details */}
                <div className="space-y-4 relative z-10 bg-white/80 p-6 rounded-2xl border border-slate-200 shadow-xs backdrop-blur-md">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Judul Transfer</span>
                        <span className="text-xs font-bold text-slate-800 truncate max-w-[200px]">{watchedLabel || 'Belum diisi'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Biaya Administrasi</span>
                        <span className="text-xs font-bold text-slate-800">{formatRupiah(watchedBiayaAdmin)}</span>
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
            </div>

            {/* Smart Contextual Tip (Sits outside, in its own container) */}
            <div className="relative z-10 p-5 rounded-[1.5rem] bg-white border border-slate-200/80 text-left transition-all duration-300">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Tips Keuangan Cerdas</p>
                <p className="text-[11px] font-semibold text-slate-650 leading-relaxed">
                    Mutasi saldo antar rekening pribadi Anda tidak akan merubah total kekayaan bersih (Net Worth) di dashboard. Tindakan ini hanya mendistribusikan aset likuid Anda untuk kemudahan alokasi tunai atau transaksi terpisah.
                </p>
            </div>
        </div>
    );

    if (inline) {
        return (
            <FormPageLayout
                title={transferToEdit ? 'Edit Transfer' : 'Transfer Baru'}
                description={transferToEdit ? 'Perbarui detail perpindahan saldo Anda' : 'Pindahkan saldo antar akun atau dompet kontrol Anda'}
                isDirty={isDirty}
                previewPanel={previewContent}
                formPanel={
                    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pb-16">
                        {formContent}
                    </form>
                }
                onCancel={onClose}
                showSuccessModal={showSuccess}
                onSuccessConfirm={() => router.push('/transfer')}
                successMessage={`Mutasi saldo sebesar ${formatRupiah(watchedNominal)} berhasil dijalankan ke rekening tujuan.`}
            />
        );
    }

    return (
        <ResponsiveModal
            open={true}
            onOpenChange={onClose}
            title={transferToEdit ? 'Edit Transfer' : 'Transfer Antar Akun'}
            className="sm:max-w-[425px] bg-white text-slate-900 border-slate-100"
        >
            <div className="bg-blue-50/50 p-4 rounded-xl flex items-center gap-3 mb-2 border border-blue-100/50">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <ArrowLeftRight size={20} className="text-blue-600" />
                </div>
                <p className="text-xs font-medium text-blue-700 leading-tight">
                    Pindahkan saldo antar rekening tanpa memengaruhi total pemasukan atau pengeluaran.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
                {formContent}
            </form>
        </ResponsiveModal>
    );
}
