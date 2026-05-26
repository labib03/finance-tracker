import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { cn } from "@/lib/utils"
import { Label } from '@/shared/ui/label';
import { Input } from '@/shared/ui/input';
import Link from 'next/link';

// 1. Ekstrak nama icon dan ubah menjadi format Option { value, label } untuk SearchableSelect
const iconOptions = (Object.keys(LucideIcons).filter(
    (key) => key !== 'createLucideIcon' && key !== 'default'
) as Array<keyof typeof LucideIcons>).map((iconName) => ({
    value: String(iconName),
    label: String(iconName)
}));

// 2. Definisikan Interface untuk Props Komponen
interface IconPickerProps {
    control: any; 
    errors: any;
    inline?: boolean;
    watchedIcon?: string;
}

export default function IconPickerComponent({ 
    control, 
    errors, 
    inline = false, 
    watchedIcon 
}: IconPickerProps) {
    
    // Validasi untuk memastikan string yang diketik/di-paste benar-benar ada di Lucide
    const isValidIcon = watchedIcon && watchedIcon in LucideIcons;
    const SelectedIcon = isValidIcon 
        ? LucideIcons[watchedIcon as keyof typeof LucideIcons] as React.ElementType 
        : null;

    return (
        <div className={cn(
            "p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden shadow-sm flex flex-col gap-4 col-span-1 md:col-span-2",
            inline ? "bg-white border-slate-200 hover:border-slate-300" : "bg-white border-slate-100"
        )}>
            <div className="flex justify-between items-center">
                <Label 
                    htmlFor="icon_name" 
                    className={cn("text-[10px] font-black uppercase tracking-[0.25em]", inline ? "text-slate-500" : "text-slate-500")}
                >
                    Nama Icon Lucide (PascalCase)
                </Label>
                
                {/* Tautan untuk membuka halaman referensi icon di tab baru */}
                <Link 
                    href="/referensi-icon" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold text-primary hover:underline"
                >
                    Lihat Galeri Icon &rarr;
                </Link>
            </div>
            
            <div className="flex gap-4 items-center">
                <div className="flex-1">
                    <Controller
                        name="icon_name"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                id="icon_name"
                                placeholder="Cth: ShoppingBag, Utensils, Wallet..."
                                className={cn(
                                    "h-14 rounded-2xl font-medium shadow-sm transition-all focus:scale-[1.01]",
                                    inline ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-primary/50" : "bg-slate-50 border-slate-200 text-slate-950",
                                    errors.icon_name ? 'border-destructive' : ''
                                )}
                            />
                        )}
                    />
                </div>
                
                <div className={cn(
                    "w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 shadow-inner",
                    inline ? "bg-slate-50 border-slate-200 text-slate-950" : "bg-slate-100 border-slate-200 text-primary"
                )}>
                    {SelectedIcon ? (
                        <SelectedIcon size={24} />
                    ) : (
                        <LucideIcons.Box size={24} className="text-slate-300 opacity-50" />
                    )}
                </div>
            </div>
            
            <p className={cn("text-[10px] font-bold uppercase tracking-wider", inline ? "text-slate-400" : "text-slate-400")}>
                * Paste nama icon yang Anda salin dari galeri ke dalam kolom ini
            </p>
            
            {errors.icon_name?.message && (
                <p className="text-xs font-semibold text-destructive mt-1">
                    {String(errors.icon_name.message)}
                </p>
            )}
        </div>
    );
}