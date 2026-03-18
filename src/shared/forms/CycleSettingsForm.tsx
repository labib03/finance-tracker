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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <Card className="w-full max-w-md border-none shadow-2xl overflow-hidden bg-background">
                <CardHeader className="bg-muted/30 pb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold tracking-tight">Pengaturan Siklus</CardTitle>
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-0.5">Custom Fiscal Month</p>
                            </div>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full hover:bg-muted"
                            onClick={onClose}
                        >
                            <X size={20} />
                        </Button>
                    </div>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="pt-6 space-y-6">
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
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                                <Input
                                    type="number"
                                    min="1"
                                    max="28"
                                    value={day}
                                    onChange={(e) => setDay(e.target.value)}
                                    placeholder="Contoh: 25"
                                    className="pl-12 h-14 rounded-2xl bg-muted/30 border-none text-base font-bold transition-all focus:bg-background focus:ring-2 focus:ring-primary/20"
                                    required
                                />
                            </div>
                            <p className="text-xs text-muted-foreground italic ml-1">
                                Disarankan memilih tanggal gajian rutin Anda.
                            </p>
                        </div>
                    </CardContent>

                    <CardFooter className="bg-muted/30 p-6 flex gap-3">
                        <Button 
                            type="button" 
                            variant="outline" 
                            className="flex-1 h-12 rounded-2xl font-bold"
                            onClick={onClose}
                        >
                            Batal
                        </Button>
                        <Button 
                            type="submit" 
                            className="flex-1 h-12 rounded-2xl font-bold bg-primary shadow-lg shadow-primary/20"
                        >
                            <Save size={18} className="mr-2" />
                            Simpan Perubahan
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
