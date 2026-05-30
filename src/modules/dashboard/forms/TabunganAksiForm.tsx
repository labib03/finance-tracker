'use client';

import { useForm, useWatch } from 'react-hook-form';
import { useFinanceStore } from '@/lib/store';
import { formatRupiah, getToday, hitungSaldoAkun, cn } from '@/lib/utils';
import { TRANSACTION_TYPES, CATEGORY_LABELS } from '@/lib/constants';
import type { Tabungan } from '@/lib/types';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import NumericInput from '@/shared/forms/NumericInput';
import { SearchableSelect } from '@/shared/ui/SearchableSelect';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import FormPageLayout from '@/shared/layout/FormPageLayout';
import { ResponsiveModal } from "@/shared/ui/responsive-modal";
import { PiggyBank, ShieldAlert, Banknote, Target, Car, Home, Plane, GraduationCap, Laptop, Smartphone, HeartPulse, Sparkles, CheckCircle2, Loader2, Save } from "lucide-react";

type AksiType = 'alokasi_tabungan' | 'tarik_tabungan' | 'eksekusi_tabungan';

interface TabunganAksiFormProps {
    onClose: () => void;
    tabungan: Tabungan;
    defaultAksi?: AksiType;
    inline?: boolean;
}

const ICON_MAP: Record<string, React.ElementType> = {
    Target, PiggyBank, Car, Home, Plane, GraduationCap, Laptop, Smartphone, HeartPulse,
};

const AKSI_CONFIG = {
    alokasi_tabungan: {
        label: 'Alokasi Dana',
        color: 'emerald',
        type: TRANSACTION_TYPES.SAVINGS,
        kategori: CATEGORY_LABELS.ALOKASI_TABUNGAN,
        icon: PiggyBank,
        description: 'Sisihkan uang dari rekening utama Anda untuk dialokasikan ke pos Sinking Fund ini.',
        buttonText: 'Alokasikan Dana',
        buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10',
        activeClass: 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-xs ring-4 ring-emerald-500/10',
    },
    tarik_tabungan: {
        label: 'Tarik Darurat',
        color: 'amber',
        type: TRANSACTION_TYPES.TRANSFER,
        kategori: CATEGORY_LABELS.TARIK_TABUNGAN,
        icon: ShieldAlert,
        description: 'Kembalikan saldo tabungan Sinking Fund ke rekening Anda untuk keperluan mendesak.',
        buttonText: 'Tarik ke Rekening',
        buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/10',
        activeClass: 'bg-amber-50 border-amber-500 text-amber-600 shadow-xs ring-4 ring-amber-500/10',
    },
    eksekusi_tabungan: {
        label: 'Eksekusi Tabungan',
        color: 'blue',
        type: TRANSACTION_TYPES.EXPENSE,
        kategori: CATEGORY_LABELS.EKSEKUSI_TABUNGAN,
        icon: Banknote,
        description: 'Bayar tujuan tabungan Anda secara riil. Transaksi pengeluaran nyata akan dicatat.',
        buttonText: 'Eksekusi Pembelian',
        buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10',
        activeClass: 'bg-blue-50 border-blue-500 text-blue-600 shadow-xs ring-4 ring-blue-500/10',
    },
};

export default function TabunganAksiForm({ onClose, tabungan, defaultAksi = 'alokasi_tabungan', inline = false }: TabunganAksiFormProps) {
    const addTransaksi = useFinanceStore((s) => s.addTransaksi);
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const getSaldoTabungan = useFinanceStore((s) => s.getSaldoTabungan);
    const getProgresTabungan = useFinanceStore((s) => s.getProgresTabungan);
    const tabunganList = useFinanceStore((s) => s.tabunganList);

    const router = useRouter();
    const [showSuccess, setShowSuccess] = useState(false);

    const { control, handleSubmit, watch, setValue, formState: { isSubmitting, isDirty } } = useForm({
        defaultValues: {
            aksi: defaultAksi,
            nominal: 0,
            catatan: '',
            id_sumber_dana: sumberDanaList[0]?.id_sumber_dana || '',
        }
    });

    const aksi = watch('aksi') as AksiType;
    const idSumberDana = watch('id_sumber_dana');
    const nominal = watch('nominal') || 0;

    const saldo = getSaldoTabungan(tabungan.id_tabungan);
    const progres = getProgresTabungan(tabungan.id_tabungan);
    const sisaTarget = Math.max(0, tabungan.target_nominal - saldo);
    const isTercapai = progres >= 100;
    
    // Get current source balance
    const selectedSource = sumberDanaList.find(s => s.id_sumber_dana === idSumberDana);
    const tipeList = useFinanceStore(s => s.tipeList);
    const resultBalances = selectedSource ? hitungSaldoAkun([selectedSource], transaksiList, tipeList, tabunganList) : [];
    const saldoSumber = resultBalances.length > 0 ? resultBalances[0].saldo : 0;

    const config = AKSI_CONFIG[aksi] || AKSI_CONFIG.alokasi_tabungan;
    const TabIcon = ICON_MAP[tabungan.icon] || Target;

    const onSubmit = async (data: any) => {
        if (!data.id_sumber_dana || !data.nominal) return;

        const findType = tipeList.find(f => f.label.toLowerCase() == config.type.toLowerCase());
        const findKategori = kategoriList.find(k => k.nama_kategori.toLowerCase() === config.kategori.toLowerCase());

        try {
            await addTransaksi({
                tanggal: getToday(),
                jenis: findType?.id_tipe || '',
                id_sumber_dana: data.id_sumber_dana,
                id_kategori: findKategori?.id_kategori || '',
                nominal: data.nominal,
                label: `${AKSI_CONFIG[data.aksi as AksiType].label}: ${tabungan.nama_tujuan}`,
                catatan: data.catatan,
                id_tabungan: tabungan.id_tabungan,
            });
            if (inline) {
                setShowSuccess(true);
            } else {
                onClose();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const formContent = (
        <>
            {/* Bento Grid Item 1: Pilihan Aksi Transaksi */}
            <div className={cn(
                "p-6 rounded-[2rem] border transition-all duration-500 relative overflow-hidden shadow-sm flex flex-col gap-4 col-span-1 md:col-span-2",
                inline ? "bg-white border-slate-200 hover:border-slate-300" : "bg-white border-slate-100"
            )}>
                <Label className={cn("text-[10px] font-black uppercase tracking-[0.25em]", inline ? "text-slate-500" : "text-slate-500")}>
                    Pilih Tipe Aksi Sinking Fund
                </Label>
                <div className="grid grid-cols-3 gap-3">
                    {(['alokasi_tabungan', 'tarik_tabungan', 'eksekusi_tabungan'] as AksiType[]).map((a) => {
                        const c = AKSI_CONFIG[a];
                        const Icon = c.icon;
                        const isActive = aksi === a;
                        const isDisabled = a === 'eksekusi_tabungan' && !isTercapai;
                        
                        return (
                            <button
                                key={a}
                                type="button"
                                disabled={isDisabled}
                                onClick={() => setValue('aksi', a)}
                                className={cn(
                                    'flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border transition-all duration-300 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed group hover:scale-[1.02] active:scale-95',
                                    isActive 
                                        ? c.activeClass
                                        : (inline ? 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'bg-slate-50 border-slate-150 text-slate-400 hover:bg-slate-100')
                                )}
                            >
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[9px] font-black uppercase tracking-widest text-center leading-none px-1">{c.label.split(' ')[0]}</span>
                            </button>
                        );
                    })}
                </div>
                {/* Description Box */}
                <div className={cn("p-4 rounded-xl text-[11px] font-semibold leading-relaxed border", inline ? "bg-slate-50 border-slate-250 text-slate-600" : "bg-slate-50 border-slate-100 text-slate-500")}>
                    {config.description}
                </div>
            </div>

            {/* Bento Grid Item 2: Nominal Input Pro Max */}
            <div className={cn(
                "p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden shadow-sm flex flex-col gap-4 col-span-1 md:col-span-2",
                inline ? "bg-white border-slate-200 hover:border-slate-350" : "bg-white border-slate-100"
            )}>
                <div className="flex items-center justify-between">
                    <Label className={cn("text-[10px] font-black uppercase tracking-[0.25em]", inline ? "text-slate-500" : "text-slate-500")}>
                        Nominal Aksi (Rp)
                    </Label>
                    {aksi === 'alokasi_tabungan' && sisaTarget > 0 && (
                        <button
                            type="button"
                            onClick={() => setValue('nominal', sisaTarget)}
                            className={cn(
                                "text-[9px] font-black px-3 py-1.5 rounded-full border shadow-sm hover:scale-[1.03] active:scale-97 transition-all uppercase tracking-wider cursor-pointer",
                                inline ? "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100" : "text-primary bg-primary/5 border-primary/10"
                            )}
                        >
                            Selesaikan Target
                        </button>
                    )}
                </div>
                <NumericInput
                    name="nominal"
                    control={control as any}
                    placeholder="0"
                    className={cn(
                        "text-3xl sm:text-4xl font-black h-16 sm:h-20 shadow-sm text-center tracking-tight border-none focus:ring-0 focus:bg-white focus:border-none",
                        inline ? "bg-slate-50 text-emerald-600" : "bg-slate-50 text-slate-900",
                        nominal > saldoSumber && "text-rose-500"
                    )}
                />
                {nominal > saldoSumber && (
                    <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest text-center animate-pulse pt-1">
                        ⚠ Saldo sumber rekening tidak cukup ({formatRupiah(saldoSumber)})
                    </p>
                )}
            </div>

            {/* Bento Grid Item 3: Rekening & Catatan */}
            <div className={cn(
                "p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden shadow-sm flex flex-col gap-5 col-span-1 md:col-span-2",
                inline ? "bg-white border-slate-200 hover:border-slate-350" : "bg-white border-slate-100"
            )}>
                <div className="space-y-2">
                    <Label className={cn("text-[10px] font-black uppercase tracking-[0.25em]", inline ? "text-slate-500" : "text-slate-500")}>
                        Rekening Utama
                    </Label>
                    <SearchableSelect
                        options={sumberDanaList.map(s => ({
                            value: s.id_sumber_dana,
                            label: s.nama_sumber
                        }))}
                        value={idSumberDana}
                        onValueChange={(val) => setValue('id_sumber_dana', val)}
                        placeholder="Pilih rekening utama..."
                        className={cn("rounded-xl h-12", inline ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-white border-slate-200")}
                    />
                    {selectedSource && (
                        <p className={cn("text-[9px] font-black uppercase tracking-widest px-1", inline ? "text-slate-400" : "text-slate-400")}>
                            Saldo Tersedia: {formatRupiah(saldoSumber)}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label className={cn("text-[10px] font-black uppercase tracking-[0.25em]", inline ? "text-slate-500" : "text-slate-500")}>
                        Catatan (Opsional)
                    </Label>
                    <Input
                        placeholder="Alokasi dana untuk..."
                        {...control.register('catatan')}
                        className={cn(
                            "h-12 rounded-xl font-medium",
                            inline ? "bg-slate-50 border-slate-200 text-slate-950 focus:bg-white focus:border-primary/50" : "bg-white border-slate-200 text-slate-950"
                        )}
                    />
                </div>
            </div>

            {/* Action Row */}
            <div className="col-span-1 md:col-span-2 flex justify-end pt-4 w-full">
                <Button
                    type="submit"
                    disabled={isSubmitting || !nominal || !idSumberDana}
                    className={cn(
                        "w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] border-none text-white",
                        config.buttonClass
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
                      {isSubmitting ? "Memproses..." : "Simpan Transaksi"}
                  </>
              )}
          </Button>
            </div>
        </>
    );

    // Left preview content showing reactive sinking fund circle and target status
    const previewContent = (
        <div className="w-full flex flex-col gap-8 text-center items-center">
            {/* Dynamic Interactive Envelope */}
            <div className="relative w-full aspect-square max-w-[280px] rounded-[2.5rem] p-6 border border-slate-200/80 bg-gradient-to-br from-white to-slate-50 shadow-2xl flex flex-col items-center justify-center group overflow-hidden">
                <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-emerald-500/10 blur-[50px] opacity-35 group-hover:bg-emerald-500/20 transition-all duration-1000" />
                <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-emerald-500/10 blur-[50px] opacity-25" />

                {/* Progress Icon */}
                <div className="relative z-10 w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4 shadow-xs">
                    <TabIcon size={36} strokeWidth={2} />
                </div>

                <div className="relative z-10 space-y-1 w-full px-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">SINKING FUND</span>
                    <h4 className="text-sm font-black text-slate-800 max-w-[200px] truncate mx-auto uppercase tracking-wide">{tabungan.nama_tujuan}</h4>
                    
                    <div className="w-16 h-0.5 bg-slate-200 mx-auto my-2 rounded-full" />
                    
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-slate-400 pt-1">
                        <span>TERKUMPUL</span>
                        <span>TARGET</span>
                    </div>
                    
                    <div className="flex justify-between items-baseline text-slate-800">
                        <span className="text-lg font-black text-emerald-600 display-number">{formatRupiah(saldo)}</span>
                        <span className="text-[10px] font-bold text-slate-450 display-number">{formatRupiah(tabungan.target_nominal)}</span>
                    </div>

                    <div className="h-2 w-full bg-slate-100 border border-slate-200 rounded-full overflow-hidden shadow-inner mt-2">
                        <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
                            style={{ width: `${Math.min(progres, 100)}%` }}
                        />
                    </div>

                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-emerald-600 pt-1">
                        <span>PROGRES</span>
                        <span>{Math.min(progres, 100).toFixed(0)}%</span>
                    </div>
                </div>
            </div>

            {/* Smart Contextual Aksi Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs text-left w-full">
                <div className="flex items-center gap-2 mb-2 text-emerald-600">
                    <Sparkles size={14} />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Estimasi Dampak</span>
                </div>
                <p className="text-[11px] font-semibold text-slate-650 leading-relaxed">
                    {aksi === 'alokasi_tabungan' 
                        ? `Alokasi ${formatRupiah(nominal)} akan meningkatkan progres tabungan menjadi ${Math.min(((saldo + nominal) / tabungan.target_nominal) * 100, 100).toFixed(0)}% dari target.`
                        : aksi === 'tarik_tabungan'
                        ? `Penarikan ${formatRupiah(nominal)} akan menyusutkan dana sinking fund ini menjadi ${formatRupiah(Math.max(0, saldo - nominal))}.`
                        : `Mengeksekusi sinking fund ini berarti Anda secara resmi membelanjakan dana terkumpul sebesar ${formatRupiah(nominal)} untuk tujuan Anda.`
                    }
                </p>
            </div>
        </div>
    );

    if (inline) {
        return (
            <FormPageLayout
                title={tabungan.nama_tujuan}
                description="Kelola alokasi saldo masuk atau tarik darurat untuk tabungan berjangka Anda"
                isDirty={isDirty}
                previewPanel={previewContent}
                formPanel={
                    <form onSubmit={handleSubmit(onSubmit as any)} className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pb-16">
                        {formContent}
                    </form>
                }
                onCancel={onClose}
                showSuccessModal={showSuccess}
                onSuccessConfirm={() => router.push('/tabungan')}
                successMessage={`Aksi ${AKSI_CONFIG[aksi]?.label || 'Aksi'} sebesar ${formatRupiah(nominal)} berhasil diproses dan dicatat.`}
            />
        );
    }

    return (
        <ResponsiveModal
            open={true}
            onOpenChange={onClose}
            title={tabungan.nama_tujuan}
            className="sm:max-w-md bg-white border-slate-100 text-slate-950"
        >
            <div className="space-y-6 pt-2">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {formContent}
                </form>
            </div>
        </ResponsiveModal>
    );
}
