'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFinanceStore } from '@/lib/store';
import { kategoriSchema, type KategoriFormData } from '@/lib/schemas';
import type { Kategori } from '@/lib/types';
import { Save, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';
import { generateId, cn } from '@/lib/utils';
import { CategoryIcon, CATEGORY_ICONS } from '@/components/CategoryIcon';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface KategoriFormProps {
    onClose: () => void;
    kategoriToEdit?: Kategori | null;
}

export default function KategoriForm({ onClose, kategoriToEdit }: KategoriFormProps) {
    const addKategori = useFinanceStore((s) => s.addKategori);
    const updateKategori = useFinanceStore((s) => s.updateKategori);

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
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

    const onSubmit = async (data: KategoriFormData) => {
        if (kategoriToEdit) {
            await updateKategori(data as Kategori);
        } else {
            await addKategori(data as Kategori);
        }
        onClose();
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {kategoriToEdit ? 'Edit Kategori' : 'Tambah Kategori'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-2">
                    {/* ID Kategori (Hidden) */}
                    <input type="hidden" {...register('id_kategori')} />

                    {/* Nama Kategori */}
                    <div className="space-y-2">
                        <Label htmlFor="nama_kategori">Nama Kategori</Label>
                        <Input
                            id="nama_kategori"
                            placeholder="Contoh: Makanan, Gaji..."
                            {...register('nama_kategori')}
                            className={errors.nama_kategori ? 'border-destructive' : ''}
                        />
                        {errors.nama_kategori && (
                            <p className="text-xs font-medium text-destructive">{errors.nama_kategori.message}</p>
                        )}
                    </div>

                    {/* Tipe Tabs */}
                    <div className="space-y-3">
                        <Label>Tipe Kategori</Label>
                        <Controller
                            name="tipe"
                            control={control}
                            render={({ field }) => (
                                <Tabs 
                                    value={field.value} 
                                    onValueChange={field.onChange}
                                    className="w-full"
                                >
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="Pengeluaran" className="data-active:bg-red-50 data-active:text-red-700">
                                            <ArrowDownRight size={14} className="mr-1.5" />
                                            Pengeluaran
                                        </TabsTrigger>
                                        <TabsTrigger value="Pemasukan" className="data-active:bg-emerald-50 data-active:text-emerald-700">
                                            <ArrowUpRight size={14} className="mr-1.5" />
                                            Pemasukan
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            )}
                        />
                        {errors.tipe && (
                            <p className="text-xs font-medium text-destructive">{errors.tipe.message}</p>
                        )}
                    </div>

                    {/* Icon Picker (Free Text) */}
                    <div className="space-y-3 pb-2">
                        <Label htmlFor="icon_name">Nama Icon (Lucide)</Label>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <Controller
                                    name="icon_name"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            id="icon_name"
                                            placeholder="Contoh: ShoppingBag, Utensils, Home..."
                                            className={errors.icon_name ? 'border-destructive' : ''}
                                        />
                                    )}
                                />
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                <Controller
                                    name="icon_name"
                                    control={control}
                                    render={({ field }) => (
                                        <CategoryIcon name={field.value} size={20} />
                                    )}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground italic">
                            Masukkan nama komponen dari Lucide React (PascalCase).
                        </p>
                        {errors.icon_name && (
                            <p className="text-xs font-medium text-destructive">{errors.icon_name.message}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-xl"
                        >
                            {isSubmitting ? (
                                'Menyimpan...'
                            ) : (
                                <>
                                    <Save size={16} className="mr-2" />
                                    Simpan Kategori
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
