'use client';

import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';

export const CATEGORY_ICONS = [
    { name: 'ShoppingBag', label: 'Belanja' },
    { name: 'Utensils', label: 'Makanan' },
    { name: 'Car', label: 'Transportasi' },
    { name: 'Home', label: 'Rumah' },
    { name: 'Zap', label: 'Tagihan' },
    { name: 'Heart', label: 'Kesehatan' },
    { name: 'GraduationCap', label: 'Pendidikan' },
    { name: 'Smartphone', label: 'Pulsa/Data' },
    { name: 'Gamepad2', label: 'Hiburan' },
    { name: 'Gift', label: 'Hadiah' },
    { name: 'Wallet', label: 'Keuangan' },
    { name: 'TrendingUp', label: 'Investasi' },
    { name: 'Coffee', label: 'Kopi' },
    { name: 'Shirt', label: 'Pakaian' },
    { name: 'Plane', label: 'Travel' },
    { name: 'Music', label: 'Streaming' },
    { name: 'DollarSign', label: 'Umum' },
    { name: 'Briefcase', label: 'Kerja' },
    { name: 'Sparkles', label: 'Hobi' },
    { name: 'HeartPulse', label: 'Olahraga' },
] as const;

export type IconName = keyof typeof Icons;

interface CategoryIconProps extends LucideProps {
    name: string;
}

export function CategoryIcon({ name, className, ...props }: CategoryIconProps) {
    const Icon = (Icons as any)[name] || Icons.Circle;
    return <Icon className={cn(className)} {...props} />;
}
