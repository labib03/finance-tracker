'use client';

import { useState } from 'react';
import { useFinanceStore } from '@/lib/store';
import { X, Calendar, Save, Info } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    CardDescription,
    CardFooter
} from '@/shared/ui/card';
import { toast } from 'sonner';

interface CycleSettingsFormProps {
    onClose: () => void;
}

import { ResponsiveModal } from '@/shared/ui/responsive-modal';

export default function CycleSettingsForm({ onClose }: CycleSettingsFormProps) {
    const cycleStartDay = useFinanceStore((s) => s.cycleStartDay);
    const setCycleStartDay = useFinanceStore((s) => s.setCycleStartDay);
    
    const [day, setDay] = useState(cycleStartDay.toString());

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dayNum = parseInt(day);
        
        if (isNaN(dayNum) || dayNum < 1 || dayNum > 28) {
            toast.error("Silakan masukkan tanggal antara 1 sampai 28.");
            return;
        }

        setCycleStartDay(dayNum);
        toast.success(`Siklus tanggal berhasil diubah ke tanggal ${dayNum}.`);
        onClose();
    };

    return (
        <ResponsiveModal
            open={true}
            onOpenChange={onClose}
            title="Pengaturan Siklus"
            description="Custom Fiscal Month"
            className="sm:max-w-md"
        >
                <form onSubmit={handleSubmit} className="space-y-6 pt-2 pb-6">
                    <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50 flex items-start gap-4">
                        <div className="mt-0.5 text-indigo-600">
                            <Info size={18} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-indigo-900 leading-tight mb-1">Cara Kerja Siklus</p>
                            <p className="text-xs text-indigo-700/80 leading-relaxed">
                                Siklus ini menentukan kapan dashboard Anda berpindah ke bulan baru. 
                                Jika diatur ke <span className="font-bold underline">25</span>, maka tanggal 25 s/d 24 bulan depan dianggap sebagai satu periode keuangan.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                            Tanggal Mulai Siklus (1 - 28)
                        </label>
                        <div className="bg-indigo-50/40 p-5 rounded-2xl border border-indigo-100 flex justify-center">
                            <Input
                                type="number"
                                min="1"
                                max="28"
                                value={day}
                                onChange={(e) => setDay(e.target.value)}
                                placeholder="25"
                                className="w-32 h-16 sm:h-20 text-3xl sm:text-4xl rounded-2xl bg-white border-indigo-200 text-center font-black transition-all focus:bg-white focus:ring-4 focus:ring-indigo-100 shadow-sm text-indigo-950 px-4"
                                required
                            />
                        </div>
                        <p className="text-xs text-muted-foreground italic ml-1">
                            Disarankan memilih tanggal gajian rutin Anda.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            className="flex-1 h-12 rounded-2xl font-bold bg-muted/20 hover:bg-muted/40"
                            onClick={onClose}
                        >
                            Batal
                        </Button>
                        <Button 
                            type="submit" 
                            className="flex-1 h-12 rounded-2xl font-bold bg-primary shadow-lg shadow-primary/20"
                        >
                            <Save size={18} className="mr-2" />
                            Simpan
                        </Button>
                    </div>
                </form>
        </ResponsiveModal>
    );
}
