'use client';

import { useState, useMemo } from 'react';
import { useFinanceStore } from '@/lib/store';
import { Save, Info, Sparkles, CalendarDays, ReceiptText } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import FormPageLayout from '@/shared/layout/FormPageLayout';
import { ResponsiveModal } from '@/shared/ui/responsive-modal';

interface CycleSettingsFormProps {
    onClose: () => void;
    inline?: boolean;
}

export default function CycleSettingsForm({ onClose, inline = false }: CycleSettingsFormProps) {
    const cycleStartDay = useFinanceStore((s) => s.cycleStartDay);
    const setCycleStartDay = useFinanceStore((s) => s.setCycleStartDay);
    const router = useRouter();
    const [showSuccess, setShowSuccess] = useState(false);
    
    const [day, setDay] = useState(cycleStartDay.toString());

    const isDirty = useMemo(() => {
        return day !== cycleStartDay.toString();
    }, [day, cycleStartDay]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dayNum = parseInt(day);
        
        if (isNaN(dayNum) || dayNum < 1 || dayNum > 28) {
            toast.error("Silakan masukkan tanggal antara 1 sampai 28.");
            return;
        }

        setCycleStartDay(dayNum);
        if (inline) {
            setShowSuccess(true);
        } else {
            toast.success(`Siklus tanggal berhasil diubah ke tanggal ${dayNum}.`);
            onClose();
        }
    };

    const formContent = (
        <>
            {/* Bento Card 1: Informasi Siklus */}
            <div className={cn(
                "p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden shadow-xs flex flex-col gap-4 col-span-1 md:col-span-2",
                inline ? "bg-blue-50/50 border-blue-100" : "bg-blue-50/50 border-blue-100"
            )}>
                <div className="flex items-start gap-4">
                    <div className="mt-0.5 text-blue-600 shrink-0">
                        <Info size={20} />
                    </div>
                    <div className="flex-1">
                        <p className={cn("text-sm font-black uppercase tracking-wider mb-1", inline ? "text-blue-900" : "text-blue-900")}>Cara Kerja Custom Fiscal Month</p>
                        <p className={cn("text-xs leading-relaxed", inline ? "text-blue-750" : "text-blue-750/80")}>
                            Siklus ini menentukan batas gajian berjalan Anda. Jika diatur ke <span className="font-bold underline text-blue-600">25</span>, tanggal 25 bulan ini s/d tanggal 24 bulan berikutnya dianggap satu periode anggaran utuh di dashboard.
                        </p>
                    </div>
                </div>
            </div>

            {/* Bento Card 2: Input Tanggal Mulai Siklus */}
            <div className={cn(
                "p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden shadow-sm flex flex-col gap-4 col-span-1 md:col-span-2",
                inline ? "bg-white border-slate-200 hover:border-slate-350" : "bg-white border-slate-100"
            )}>
                <Label className={cn("text-[10px] font-black uppercase tracking-[0.25em]", inline ? "text-slate-500" : "text-slate-500")}>
                    Tanggal Awal Siklus (1 - 28)
                </Label>
                <div className={cn("p-5 rounded-2xl flex justify-center border", inline ? "bg-slate-50 border-slate-200" : "bg-slate-50 border-slate-100")}>
                    <Input
                        type="number"
                        min="1"
                        max="28"
                        value={day}
                        onChange={(e) => setDay(e.target.value)}
                        placeholder="25"
                        className={cn(
                            "w-32 h-16 sm:h-20 text-3xl sm:text-4xl rounded-2xl font-black text-center transition-all focus:scale-105 shadow-sm px-4 border border-slate-200 bg-white text-slate-950 focus:border-primary/50 focus:ring-primary/20",
                            inline ? "bg-white text-slate-950" : "bg-white text-slate-950"
                        )}
                        required
                    />
                </div>
                <p className={cn("text-[10px] font-bold uppercase tracking-wider text-center", inline ? "text-slate-400" : "text-slate-400")}>
                    * Disarankan memilih tanggal penerimaan gaji utama Anda
                </p>
            </div>

            {/* Action Row */}
            <div className="col-span-1 md:col-span-2 flex justify-end pt-4 w-full">
                <Button
                    type="submit"
                    className={cn(
                        "w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] border-none text-white",
                        inline ? "bg-blue-600 hover:bg-blue-700" : "bg-primary text-primary-foreground"
                    )}
                >
                    <Save size={16} />
                    Simpan Tanggal Siklus
                </Button>
            </div>
        </>
    );

    // Left preview content showing reactive calendar schedule details
    const previewContent = (
        <div className="w-full flex flex-col gap-8 text-center items-center">
            {/* Holographic Sinking Fund Circle Preview */}
            <div className="relative w-full aspect-square max-w-[280px] rounded-[2.5rem] p-6 border border-slate-200/80 bg-gradient-to-br from-white to-slate-50 shadow-2xl flex flex-col items-center justify-center group overflow-hidden">
                <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-blue-500/10 blur-[50px] opacity-35 group-hover:bg-blue-500/20 transition-all duration-1000" />
                <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-blue-400/10 blur-[50px] opacity-25" />

                {/* Calendar Days Icon */}
                <div className="relative z-10 w-20 h-20 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-4 animate-pulse shadow-xs">
                    <CalendarDays size={36} strokeWidth={2} />
                </div>

                <div className="relative z-10 space-y-1.5 w-full">
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">FISCAL START DAY</span>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">TANGGAL SIKLUS AKTIF</h4>
                    
                    <div className="w-16 h-0.5 bg-slate-200 mx-auto my-2 rounded-full" />
                    
                    <p className="text-5xl font-black text-blue-600 tracking-tight display-number">{day || '25'}</p>
                    
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-450 block pt-2">
                        Periode: Tanggal {day || '25'} s/d Tanggal {day ? (parseInt(day) - 1 || 28) : 24}
                    </span>
                </div>
            </div>

            {/* Smart info */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs text-left w-full">
                <div className="flex items-center gap-2 mb-2 text-blue-600">
                    <Sparkles size={14} />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Dampak Pembukuan</span>
                </div>
                <p className="text-[11px] font-semibold text-slate-650 leading-relaxed">
                    Pengubahan tanggal siklus keuangan akan langsung menyesuaikan filter rentang pencatatan transaksi pada visualisasi ringkasan bulanan di dashboard utama secara real-time.
                </p>
            </div>
        </div>
    );

    if (inline) {
        return (
            <FormPageLayout
                title="Pengaturan Siklus Keuangan"
                description="Custom Fiscal Month Settings"
                isDirty={isDirty}
                previewPanel={previewContent}
                formPanel={
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pb-16">
                        {formContent}
                    </form>
                }
                onCancel={onClose}
                showSuccessModal={showSuccess}
                onSuccessConfirm={() => router.push('/')}
                successMessage={`Siklus tanggal awal pembukuan berhasil diubah ke tanggal ${day}.`}
            />
        );
    }

    return (
        <ResponsiveModal
            open={true}
            onOpenChange={onClose}
            title="Pengaturan Siklus"
            description="Custom Fiscal Month"
            className="sm:max-w-md bg-white border-slate-100 text-slate-950"
        >
            <form onSubmit={handleSubmit} className="space-y-6 pt-2 pb-6">
                {formContent}
            </form>
        </ResponsiveModal>
    );
}
