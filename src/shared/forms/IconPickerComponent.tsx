import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { cn } from "@/lib/utils"
import { Label } from '@/shared/ui/label';
import { SearchableSelect } from '@/shared/ui/SearchableSelect';

// 1. Ekstrak nama icon dan ubah menjadi format Option { value, label } untuk SearchableSelect
const iconOptions = (Object.keys(LucideIcons).filter(
    (key) => key !== 'createLucideIcon' && key !== 'default'
) as Array<keyof typeof LucideIcons>).map((iconName) => ({
    value: String(iconName),
    label: String(iconName)
}));

// 2. Definisikan Interface untuk Props Komponen
interface IconPickerProps {
    control: Control<any>; // Gunakan <any> atau sesuaikan dengan interface Form Values Anda, misal: Control<FormValues>
    errors: FieldErrors;
    inline?: boolean;
    watchedIcon?: string;
}

export default function IconPickerComponent({ 
    control, 
    errors, 
    inline = false, 
    watchedIcon 
}: IconPickerProps) {
    
    // 2. Validasi untuk Preview Icon
    const isValidIcon = watchedIcon && watchedIcon in LucideIcons;
    const SelectedIcon = isValidIcon 
        ? LucideIcons[watchedIcon as keyof typeof LucideIcons] as React.ElementType 
        : null;

    return (
        <div className={cn(
            "p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden shadow-sm flex flex-col gap-4 col-span-1 md:col-span-2",
            inline ? "bg-white border-slate-200 hover:border-slate-300" : "bg-white border-slate-100"
        )}>
            {/* Bento Card 3: Icon Picker */}
            
            <Label 
                htmlFor="icon_name" 
                className={cn("text-[10px] font-black uppercase tracking-[0.25em]", inline ? "text-slate-500" : "text-slate-500")}
            >
                Nama Icon Lucide (PascalCase)
            </Label>
            
            <div className="flex gap-4 items-center">
                <div className="flex-1">
                    <Controller
                        name="icon_name"
                        control={control}
                        render={({ field }) => (
                            <SearchableSelect
                                options={iconOptions}
                                value={field.value || ""} // Fallback ke string kosong jika undefined
                                onValueChange={field.onChange}
                                placeholder="Pilih icon..."
                                searchPlaceholder="Cari nama icon..."
                                error={!!errors.icon_name}
                                // Menambahkan class h-14 dan rounded-2xl agar seragam dengan tinggi preview box 
                                // dan input form Anda sebelumnya
                                className={cn(
                                    "h-14 rounded-2xl shadow-sm transition-all focus:scale-[1.01]",
                                    inline ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-slate-50 border-slate-200 text-slate-950"
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
                * Pilih icon yang merepresentasikan kategori keuangan Anda
            </p>
            
            {errors.icon_name?.message && (
                <p className="text-xs font-semibold text-destructive mt-1">
                    {String(errors.icon_name.message)}
                </p>
            )}
        </div>
    );
}