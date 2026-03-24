'use client';

import { useForm } from 'react-hook-form';
import { useFinanceStore } from '@/lib/store';
import { formatRupiah, getToday, hitungSaldoAkun, cn } from '@/lib/utils';
import { Tabungan } from '@/lib/types';
import { ResponsiveModal } from "@/shared/ui/responsive-modal";
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import NumericInput from '@/shared/forms/NumericInput';
import { SearchableSelect } from '@/shared/ui/SearchableSelect';
import { 
    PiggyBank, ShieldAlert, Banknote, Target, Car, Home, Plane, 
    GraduationCap, Laptop, Smartphone, HeartPulse, SendHorizontal
} from 'lucide-react';

type AksiType = 'alokasi_tabungan' | 'tarik_tabungan' | 'eksekusi_tabungan';

interface TabunganAksiFormProps {
    onClose: () => void;
    tabungan: Tabungan;
    defaultAksi?: AksiType;
}

const ICON_MAP: Record<string, React.ElementType> = {
    Target, PiggyBank, Car, Home, Plane, GraduationCap, Laptop, Smartphone, HeartPulse,
};

const AKSI_CONFIG = {
    alokasi_tabungan: {
        label: 'Alokasi Dana',
        color: 'indigo',
        icon: PiggyBank,
        description: 'Sisihkan uang agar tidak terpakai untuk pengeluaran harian.',
        buttonText: 'Alokasikan Dana',
        buttonClass: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30',
        activeClass: 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-4 ring-indigo-50',
    },
    tarik_tabungan: {
        label: 'Tarik Darurat',
        color: 'amber',
        icon: ShieldAlert,
        description: 'Kembalikan saldo tabungan ke rekening untuk keperluan mendesak.',
        buttonText: 'Tarik ke Rekening',
        buttonClass: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30',
        activeClass: 'bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-600/30 ring-4 ring-amber-50',
    },
    eksekusi_tabungan: {
        label: 'Eksekusi Tabungan',
        color: 'emerald',
        icon: Banknote,
        description: 'Bayar tujuan tabungan Anda. Saldo rekening bank akan terpotong nyata.',
        buttonText: 'Eksekusi Pembelian',
        buttonClass: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30',
        activeClass: 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-4 ring-emerald-50',
    },
};

export default function TabunganAksiForm({ onClose, tabungan, defaultAksi = 'alokasi_tabungan' }: TabunganAksiFormProps) {
    const addTransaksi = useFinanceStore((s) => s.addTransaksi);
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const getSaldoTabungan = useFinanceStore((s) => s.getSaldoTabungan);
    const getProgresTabungan = useFinanceStore((s) => s.getProgresTabungan);

    const { control, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm({
        defaultValues: {
            aksi: defaultAksi,
            nominal: 0,
            catatan: '',
            id_sumber_dana: sumberDanaList[0]?.id_sumber_dana || '',
        }
    });

    const aksi = watch('aksi') as AksiType;
    const idSumberDana = watch('id_sumber_dana');

    const saldo = getSaldoTabungan(tabungan.id_tabungan);
    const progres = getProgresTabungan(tabungan.id_tabungan);
    const sisaTarget = Math.max(0, tabungan.target_nominal - saldo);
    const isTercapai = progres >= 100;
    
    // Get current source balance
    const selectedSource = sumberDanaList.find(s => s.id_sumber_dana === idSumberDana);
    const resultBalances = selectedSource ? hitungSaldoAkun([selectedSource], transaksiList) : [];
    const saldoSumber = resultBalances.length > 0 ? resultBalances[0].saldo : 0;

    const config = AKSI_CONFIG[aksi];
    const TabIcon = ICON_MAP[tabungan.icon] || Target;

    const onSubmit = async (data: any) => {
        if (!data.id_sumber_dana || !data.nominal) return;

        try {
            await addTransaksi({
                tanggal: getToday(),
                jenis: data.aksi,
                id_sumber_dana: data.id_sumber_dana,
                id_kategori: '',
                nominal: data.nominal,
                label: `${AKSI_CONFIG[data.aksi as AksiType].label}: ${tabungan.nama_tujuan}`,
                catatan: data.catatan,
                id_tabungan: tabungan.id_tabungan,
            });
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <ResponsiveModal
            open={true}
            onOpenChange={onClose}
            title={tabungan.nama_tujuan}
            className="sm:max-w-md"
        >
                <div className="space-y-6 pt-2 pb-2">
                    {/* Progress Header Group */}
                    <div className="p-5 rounded-[1.75rem] bg-indigo-50/40 border border-indigo-100/50 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                                <TabIcon size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 leading-none mb-1">Status Sinking Fund</p>
                                <p className="text-base font-black text-slate-800 leading-tight">{tabungan.nama_tujuan}</p>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] font-black tracking-widest uppercase">
                                <span className={cn(isTercapai ? 'text-emerald-600' : 'text-indigo-600')}>
                                    {formatRupiah(saldo)} terkumpul
                                </span>
                                <span className="text-slate-400">{formatRupiah(tabungan.target_nominal)}</span>
                            </div>
                            <div className="h-2.5 w-full bg-white rounded-full overflow-hidden shadow-inner ring-1 ring-black/3">
                                <div
                                    className={cn('h-full rounded-full transition-all duration-700 shadow-sm', isTercapai ? 'bg-emerald-500' : 'bg-indigo-500')}
                                    style={{ width: `${Math.min(progres, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Aksi Selection - Circular Buttons */}
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
                                        'flex flex-col items-center gap-2 py-4 px-2 rounded-3xl border transition-all duration-300 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed group',
                                        isActive 
                                            ? c.activeClass
                                            : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50 hover:border-slate-200'
                                    )}
                                >
                                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={cn(!isActive && "group-hover:text-slate-600")} />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-center leading-none px-1">{c.label.split(' ')[0]}</span>
                                </button>
                            );
                        })}
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Description Box */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex gap-3">
                            <div className="mt-0.5 text-indigo-500 shrink-0">
                                <ShieldAlert size={16} />
                            </div>
                            <p className="text-[11px] font-bold text-slate-500 leading-normal">
                                {config.description}
                            </p>
                        </div>

                        {/* Nominal Input Pro Max */}
                        <div className={cn(
                            "flex flex-col space-y-2 p-5 rounded-[2rem] border transition-all duration-500",
                            aksi === 'alokasi_tabungan' ? "bg-indigo-50/50 border-indigo-100" : 
                            aksi === 'tarik_tabungan' ? "bg-amber-50/50 border-amber-100" :
                            "bg-emerald-50/50 border-emerald-100"
                        )}>
                            <div className="flex items-center justify-between mb-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
                                    Nominal Aksi (Rp)
                                </Label>
                                {aksi === 'alokasi_tabungan' && sisaTarget > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setValue('nominal', sisaTarget)}
                                        className="text-[9px] font-black text-indigo-600 bg-white px-2 py-1 rounded-full border border-indigo-100 shadow-sm hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Selesaikan Target
                                    </button>
                                )}
                            </div>
                            <NumericInput
                                name="nominal"
                                control={control}
                                placeholder="0"
                                className={cn(
                                    "text-3xl font-black h-16 bg-white shadow-sm text-center border-none focus:ring-0",
                                    watch('nominal') > saldoSumber && "text-rose-600"
                                )}
                            />
                            {watch('nominal') > saldoSumber && (
                                <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest text-center animate-pulse pt-2">
                                    ⚠ Saldo Tidak Cukup ({formatRupiah(saldoSumber)})
                                </p>
                            )}
                        </div>

                        {/* Account and Notes Group */}
                        <div className="p-4 rounded-3xl border border-slate-100 bg-slate-50/30 space-y-5">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
                                    Rekening Sumber
                                </Label>
                                <SearchableSelect
                                    options={sumberDanaList.map(s => ({
                                        value: s.id_sumber_dana,
                                        label: s.nama_sumber
                                    }))}
                                    value={idSumberDana}
                                    onValueChange={(val) => setValue('id_sumber_dana', val)}
                                    placeholder="Pilih rekening..."
                                    className="bg-white rounded-xl h-12"
                                />
                                {selectedSource && (
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">
                                        Saldo Saat Ini: {formatRupiah(saldoSumber)}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
                                    Catatan (Opsional)
                                </Label>
                                <Input
                                    placeholder="Alokasi dana untuk..."
                                    {...control.register('catatan')}
                                    className="h-12 rounded-xl bg-white border-slate-100 focus:ring-4 focus:ring-indigo-50 font-medium"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting || !watch('nominal') || !idSumberDana}
                            className={cn(
                                'w-full h-16 rounded-[2rem] text-white font-black uppercase tracking-widest text-xs transition-all active:scale-[0.98]',
                                config.buttonClass
                            )}
                        >
                            {isSubmitting ? 'Memproses Transaksi...' : config.buttonText}
                        </Button>
                    </form>
                </div>
        </ResponsiveModal>
    );
}
