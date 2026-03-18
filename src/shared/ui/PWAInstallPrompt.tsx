'use client';

import { useEffect, useState } from 'react';
import { Download, X, Smartphone, Monitor, Sparkles } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/lib/utils';

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if already installed or in standalone mode
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
            || (window.navigator as any).standalone 
            || document.referrer.includes('android-app://');
        
        setIsStandalone(isStandaloneMode);

        // Check if iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIOSDevice);

        // Handle the beforeinstallprompt event for Chrome/Edge/Android
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            
            // Only show if not already standalone
            if (!isStandaloneMode) {
                // Delay showing to not annoy user immediately
                setTimeout(() => setIsVisible(true), 3000);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Also suggest for iOS specifically if not standalone
        if (isIOSDevice && !isStandaloneMode) {
             setTimeout(() => setIsVisible(true), 5000);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    if (!isVisible || isStandalone) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-100 w-full max-w-[90%] sm:max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="relative group overflow-hidden rounded-3xl bg-background/80 backdrop-blur-2xl border border-primary/20 shadow-2xl shadow-primary/10 p-5 pr-12">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
                
                <button 
                    onClick={() => setIsVisible(false)}
                    className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                >
                    <X size={16} />
                </button>

                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                        {isIOS ? <Smartphone size={24} /> : <Download size={24} />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-black tracking-tight text-foreground">Install FinanceTracker</h3>
                            <div className="bg-primary/10 text-primary text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest flex items-center gap-1">
                                <Sparkles size={8} /> Pro
                            </div>
                        </div>

                        {isIOS ? (
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Klik <span className="font-bold text-foreground">Share</span> lalu pilih <span className="font-bold text-foreground">"Add to Home Screen"</span> untuk akses instan di iPhone Anda.
                            </p>
                        ) : (
                            <>
                                <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                                    Dapatkan pengalaman aplikasi penuh dengan akses offline dan performa lebih cepat.
                                </p>
                                <Button 
                                    onClick={handleInstallClick}
                                    size="sm" 
                                    className="h-9 px-5 rounded-xl font-bold text-xs bg-primary hover:bg-indigo-700 shadow-md shadow-primary/10"
                                >
                                    Instal Aplikasi
                                    <Monitor size={14} className="ml-2 opacity-50" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
