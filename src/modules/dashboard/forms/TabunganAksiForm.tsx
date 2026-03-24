'use client';

import { useState } from 'react';
import { useFinanceStore } from '@/lib/store';
import { formatRupiah, getToday } from '@/lib/utils';
import { Tabungan } from '@/lib/types';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/ui/select';
import { 
    PiggyBank, ShieldAlert, Banknote, Target, Car, Home, Plane, 
    GraduationCap, Laptop, Smartphone, HeartPulse 
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
        description: 'Sisihkan uang dari rekening ke tabungan ini.',
        buttonText: 'Simpan Alokasi',
        buttonClass: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20',
    },
    tarik_tabungan: {
        label: 'Tarik Darurat',
        color: 'amber',
        icon: ShieldAlert,
        description: 'Kembalikan ketersediaan dana tabungan ini ke rekening.',
        buttonText: 'Tarik Dana',
        buttonClass: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20',
    },
    eksekusi_tabungan: {
        label: 'Eksekusi Pembelian',
        color: 'emerald',
        icon: Banknote,
        description: 'Bayar tujuan ini dari rekening sumber. Saldo rekening berkurang nyata.',
        buttonText: 'Eksekusi Sekarang',
        buttonClass: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20',
    },
};

export default function TabunganAksiForm({ onClose, tabungan, defaultAksi = 'alokasi_tabungan' }: TabunganAksiFormProps) {
    const addTransaksi = useFinanceStore((s) => s.addTransaksi);
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
    const getSaldoTabungan = useFinanceStore((s) => s.getSaldoTabungan);
    const getProgresTabungan = useFinanceStore((s) => s.getProgresTabungan);

    const [aksi, setAksi] = useState<AksiType>(defaultAksi);
    const [isLoading, setIsLoading] = useState(false);
    const [nominal, setNominal] = useState('');
    const [catatan, setCatatan] = useState('');
    const [idSumberDana, setIdSumberDana] = useState(sumberDanaList[0]?.id_sumber_dana || '');

    const saldo = getSaldoTabungan(tabungan.id_tabungan);
    const progres = getProgresTabungan(tabungan.id_tabungan);
    const isTercapai = progres >= 100;
    const config = AKSI_CONFIG[aksi];
    const AksiIcon = config.icon;
    const TabIcon = ICON_MAP[tabungan.icon] || Target;

    const rawNominal = nominal.replace(/\D/g, '');

    const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '');
        if (val === '') { setNominal(''); return; }
        setNominal(parseInt(val, 10).toLocaleString('id-ID'));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!idSumberDana || !rawNominal) return;
        setIsLoading(true);

        const nominalNum = parseFloat(rawNominal);
        
        try {
            await addTransaksi({
                tanggal: getToday(),
                jenis: aksi,
                id_sumber_dana: idSumberDana,
                id_kategori: '',
                nominal: nominalNum,
                label: `${config.label}: ${tabungan.nama_tujuan}`,
                catatan,
                id_tabungan: tabungan.id_tabungan,
            });
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md p-6">
                <DialogHeader className="mb-4">
                    {/* Tabungan Identity */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                            <TabIcon size={22} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sinking Fund</p>
                            <DialogTitle className="text-base font-black text-slate-800 leading-none mt-0.5">{tabungan.nama_tujuan}</DialogTitle>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-black tracking-widest uppercase">
                            <span className={cn(isTercapai ? 'text-emerald-600' : 'text-indigo-600')}>
                                {formatRupiah(saldo)} terkumpul
                            </span>
                            <span className="text-slate-400">{formatRupiah(tabungan.target_nominal)}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={cn('h-full rounded-full transition-all duration-700', isTercapai ? 'bg-emerald-500' : 'bg-indigo-500')}
                                style={{ width: `${Math.min(progres, 100)}%` }}
                            />
                        </div>
                        <p className="text-[9px] font-black text-right tracking-widest uppercase text-slate-300">
                            {Math.floor(progres)}% tercapai
                        </p>
                    </div>
                </DialogHeader>

                {/* Aksi Selector */}
                <div className="grid grid-cols-3 gap-2 mb-5">
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
                                onClick={() => setAksi(a)}
                                className={cn(
                                    'flex flex-col items-center gap-2 py-3 px-2 rounded-2xl border text-center transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
                                    isActive && a === 'alokasi_tabungan' && 'bg-indigo-50 border-indigo-200 text-indigo-700',
                                    isActive && a === 'tarik_tabungan' && 'bg-amber-50 border-amber-200 text-amber-700',
                                    isActive && a === 'eksekusi_tabungan' && 'bg-emerald-50 border-emerald-200 text-emerald-700',
                                    !isActive && 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'
                                )}
                            >
                                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[9px] font-black uppercase tracking-widest leading-tight">{c.label}</span>
                            </button>
                        );
                    })}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Info Desc */}
                    <p className="text-[11px] font-bold text-slate-400 leading-snug bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                        {config.description}
                    </p>

                    {/* Sumber Dana */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Rekening Sumber
                        </Label>
                        <Select value={idSumberDana} onValueChange={(v) => setIdSumberDana(v ?? '')} required>
                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 font-medium text-slate-900">
                                <SelectValue placeholder="Pilih rekening" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                                {sumberDanaList.map((s) => (
                                    <SelectItem key={s.id_sumber_dana} value={s.id_sumber_dana} className="py-3 px-4 font-bold rounded-xl cursor-pointer">
                                        {s.nama_sumber}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Nominal */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Nominal (Rp)
                        </Label>
                        <Input
                            inputMode="numeric"
                            placeholder="0"
                            value={nominal}
                            onChange={handleNominalChange}
                            required
                            className="h-12 rounded-xl bg-slate-50 border-slate-200 font-medium text-slate-900 placeholder:text-slate-400"
                        />
                    </div>

                    {/* Catatan */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Catatan (Opsional)
                        </Label>
                        <Input
                            placeholder="Tambahkan catatan..."
                            value={catatan}
                            onChange={(e) => setCatatan(e.target.value)}
                            className="h-12 rounded-xl bg-slate-50 border-slate-200 font-medium text-slate-900 placeholder:text-slate-400"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading || !rawNominal || !idSumberDana}
                        className={cn(
                            'w-full h-14 rounded-2xl text-white font-black uppercase tracking-widest text-xs shadow-xl transition-all active:scale-[0.98]',
                            config.buttonClass
                        )}
                    >
                        {isLoading ? 'Memproses...' : config.buttonText}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
