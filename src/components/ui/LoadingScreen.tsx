import { DollarSign } from 'lucide-react';

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md z-50">
            <div className="flex flex-col items-center justify-center gap-6 animate-in fade-in zoom-in duration-700">
                {/* Logo wrapper */}
                <div className="relative flex items-center justify-center">
                    {/* Pulsing ring */}
                    <div className="absolute inset-0 rounded-3xl bg-indigo-500/10 animate-ping duration-3000" />
                    
                    {/* Core icon */}
                    <div className="w-16 h-16 rounded-3xl bg-foreground text-background flex items-center justify-center shadow-2xl relative overflow-hidden">
                        <DollarSign size={32} strokeWidth={3} className="relative z-10 animate-pulse duration-1000" />
                    </div>
                </div>

                {/* Typography */}
                <div className="flex flex-col items-center text-center space-y-2 mt-4">
                    <h2 className="text-sm font-black uppercase tracking-widest text-foreground">
                        Memuat Financer<span className="text-indigo-600">.</span>
                    </h2>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 animate-pulse">
                        Sinkronisasi Data...
                    </p>
                </div>
            </div>
        </div>
    );
}
