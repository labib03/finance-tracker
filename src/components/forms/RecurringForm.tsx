'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFinanceStore } from '@/lib/store';
import { recurringSchema, type RecurringFormData } from '@/lib/schemas';
import { getToday, cn, hitungTanggalBerikutnya } from '@/lib/utils';
import { CalendarClock, CalendarIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { RecurringTransaction } from '@/lib/types';
import NumericInput from '@/components/forms/NumericInput';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RecurringFormProps {
    onClose: () => void;
    recurringToEdit?: RecurringTransaction | null;
}

export default function RecurringForm({ onClose, recurringToEdit }: RecurringFormProps) {
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
    const addRecurring = useFinanceStore((s) => s.addRecurring);
    const updateRecurring = useFinanceStore((s) => s.updateRecurring);
    const [activeJenis, setActiveJenis] = useState<'Pengeluaran' | 'Pemasukan'>(
        recurringToEdit?.jenis === 'Pemasukan' ? 'Pemasukan' : 'Pengeluaran'
    );

    const {
        register,
        control,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<RecurringFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(recurringSchema) as any,
        defaultValues: {
            id_kategori: recurringToEdit?.id_kategori || '',
            id_sumber_dana: recurringToEdit?.id_sumber_dana || '',
            jenis: recurringToEdit?.jenis || 'Pengeluaran',
            nominal: recurringToEdit?.nominal || 0,
            label: recurringToEdit?.label || '',
            frekuensi: recurringToEdit?.frekuensi || 'Bulanan',
            tanggal_mulai: recurringToEdit?.tanggal_mulai || getToday(),
            catatan: recurringToEdit?.catatan || '',
        },
    });

    useEffect(() => {
        if (recurringToEdit) {
            reset({
                id_kategori: recurringToEdit.id_kategori,
                id_sumber_dana: recurringToEdit.id_sumber_dana,
                jenis: recurringToEdit.jenis as 'Pengeluaran' | 'Pemasukan',
                nominal: recurringToEdit.nominal,
                label: recurringToEdit.label,
                frekuensi: recurringToEdit.frekuensi as any,
                tanggal_mulai: recurringToEdit.tanggal_mulai,
                catatan: recurringToEdit.catatan,
            });
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveJenis(recurringToEdit.jenis as 'Pengeluaran' | 'Pemasukan');
        }
    }, [recurringToEdit, reset]);

    const filteredKategori = kategoriList.filter((k) => k.tipe === activeJenis);

    const onSubmit = async (data: RecurringFormData) => {
        if (recurringToEdit) {
            // Jika tanggal mulai atau frekuensi berubah, hitung ulang tanggal berikutnya
            const perluUpdateTanggal = 
                data.tanggal_mulai !== recurringToEdit.tanggal_mulai || 
                data.frekuensi !== recurringToEdit.frekuensi;
                
            await updateRecurring({
                ...recurringToEdit,
                ...data,
                tanggal_berikutnya: perluUpdateTanggal 
                    ? hitungTanggalBerikutnya(data.tanggal_mulai, data.frekuensi)
                    : recurringToEdit.tanggal_berikutnya
            });
        } else {
            // Saat membuat baru, set tanggal berikutnya ke satu periode setelah tanggal mulai
            // sesuai permintaan user agar tidak sama dengan tanggal mulai
            await addRecurring({
                ...data,
                tanggal_berikutnya: hitungTanggalBerikutnya(data.tanggal_mulai, data.frekuensi),
                aktif: true,
            });
        }
        onClose();
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="mb-2">
                    <DialogTitle>{recurringToEdit ? 'Edit Jadwal Berulang' : 'Transaksi Berulang'}</DialogTitle>
                </DialogHeader>

                <div className="bg-amber-50/50 p-4 rounded-xl flex items-center gap-3 mb-2 border border-amber-100/50">
                    <CalendarClock size={20} className="text-amber-600 shrink-0" />
                    <p className="text-xs font-medium text-amber-700 leading-tight">
                        Transaksi berulang akan secara otomatis dijadwalkan sesuai frekuensi yang dipilih.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
                    {/* Jenis toggle */}
                    <div className="flex justify-center">
                        <Tabs
                            value={activeJenis}
                            onValueChange={(val) => {
                                const jenis = val as 'Pengeluaran' | 'Pemasukan';
                                setActiveJenis(jenis);
                                setValue('jenis', jenis);
                                // Reset kategori to avoid showing ID when list changes
                                setValue('id_kategori', '');
                            }}
                            className="w-full"
                        >
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="Pengeluaran">💸 Pengeluaran</TabsTrigger>
                                <TabsTrigger value="Pemasukan">💰 Pemasukan</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Sumber Dana */}
                    <div className="space-y-2">
                        <Label htmlFor="sumber-dana">Sumber Dana</Label>
                        <Controller
                            name="id_sumber_dana"
                            control={control}
                            render={({ field }) => (
                                <SearchableSelect
                                    options={sumberDanaList.map(s => ({
                                        value: s.id_sumber_dana,
                                        label: s.nama_sumber
                                    }))}
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    placeholder="Pilih sumber dana..."
                                    searchPlaceholder="Cari sumber dana..."
                                    error={!!errors.id_sumber_dana}
                                />
                            )}
                        />
                        {errors.id_sumber_dana && (
                            <p className="text-xs font-medium text-destructive">{errors.id_sumber_dana.message}</p>
                        )}
                    </div>

                    {/* Kategori */}
                    <div className="space-y-2">
                        <Label htmlFor="kategori">Kategori</Label>
                        <Controller
                            name="id_kategori"
                            control={control}
                            render={({ field }) => (
                                <SearchableSelect
                                    options={filteredKategori.map(k => ({
                                        value: k.id_kategori,
                                        label: k.nama_kategori
                                    }))}
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    placeholder="Pilih kategori..."
                                    searchPlaceholder="Cari kategori..."
                                    error={!!errors.id_kategori}
                                />
                            )}
                        />
                        {errors.id_kategori && (
                            <p className="text-xs font-medium text-destructive">{errors.id_kategori.message}</p>
                        )}
                    </div>

                    {/* Nominal */}
                    <NumericInput
                        label="Nominal"
                        name="nominal"
                        control={control}
                        error={errors.nominal?.message}
                    />

                    {/* Frekuensi & Tanggal Mulai Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="frekuensi">Frekuensi</Label>
                            <Controller
                                name="frekuensi"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Harian">Harian</SelectItem>
                                            <SelectItem value="Mingguan">Mingguan</SelectItem>
                                            <SelectItem value="Bulanan">Setiap Bulan</SelectItem>
                                            <SelectItem value="3 Bulan">3 Bulan (Kuartal)</SelectItem>
                                            <SelectItem value="6 Bulan">6 Bulan (Semester)</SelectItem>
                                            <SelectItem value="Tahunan">Tahunan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tanggal_mulai">Mulai</Label>
                            <Controller
                                name="tanggal_mulai"
                                control={control}
                                render={({ field }) => (
                                    <Popover>
                                        <PopoverTrigger
                                            className={cn(
                                                "flex h-11 w-full items-center justify-start rounded-2xl border border-input bg-muted/20 px-4 py-2 text-sm font-normal whitespace-nowrap transition-all outline-none focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50",
                                                !field.value && "text-muted-foreground/50",
                                                errors.tanggal_mulai && "border-destructive focus:ring-destructive/10 focus:border-destructive"
                                            )}
                                        >
                                            <CalendarIcon className="mr-3 h-4 w-4 shrink-0 opacity-40" />
                                            <span className="display-number text-base font-bold">
                                                {field.value 
                                                    ? new Date(field.value).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) 
                                                    : "Pilih tanggal"}
                                            </span>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 rounded-[2rem] shadow-2xl border-none ring-1 ring-black/5" align="start" sideOffset={8}>
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
                            {errors.tanggal_mulai && (
                                <p className="text-xs font-medium text-destructive">{errors.tanggal_mulai.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Label/Judul */}
                    <div className="space-y-2">
                        <Label htmlFor="label">Judul Jadwal</Label>
                        <Input
                            id="label"
                            placeholder="Contoh: Tagihan Internet, Sewa Rumah, dll."
                            {...register('label')}
                            className={cn(
                                "whitespace-nowrap",
                                errors.label && "border-destructive focus:ring-destructive/10"
                            )}
                        />
                        {errors.label && (
                            <p className="text-xs font-medium text-destructive">{errors.label.message}</p>
                        )}
                    </div>

                    {/* Catatan (Detail) */}
                    <div className="space-y-2">
                        <Label htmlFor="catatan">Detail (opsional)</Label>
                        <Input
                            id="catatan"
                            placeholder="Tambah detail atau catatan tambahan..."
                            {...register('catatan')}
                            className="whitespace-nowrap"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full"
                        >
                            <CalendarClock size={18} className="mr-2" />
                            {isSubmitting ? 'Menyimpan...' : (recurringToEdit ? 'Simpan Perubahan' : 'Buat Jadwal')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
