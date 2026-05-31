'use client';

import { useState, useEffect, useRef } from 'react';
import { DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
    isReady?: boolean;
    onComplete?: () => void;
}

export default function LoadingScreen({ isReady = false, onComplete }: LoadingScreenProps) {
    const [progress, setProgress] = useState(0);
    const [isFadingOut, setIsFadingOut] = useState(false);
    
    // We use a ref to track the exact progress value across frames smoothly
    const progressRef = useRef(0);
    const onCompleteRef = useRef(onComplete);
    
    // Always keep the latest callback without triggering effect re-runs
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        let animationFrameId: number;
        // Natural target: wait at 50% smoothly, then 100% when data is ready
        const target = isReady ? 100 : 50;
        let isDone = false;

        const updateProgress = () => {
            if (isDone) return;
            
            let current = progressRef.current;
            
            if (current < target) {
                const distance = target - current;
                let step = 0;
                
                if (isReady) {
                    // Smooth, fast acceleration to 100%
                    step = Math.max(distance * 0.15, 0.5); 
                } else {
                    // Ease-out deceleration as it approaches 50%
                    step = Math.max(distance * 0.05, 0.05);
                }

                current = Math.min(current + step, target);
                progressRef.current = current;
                setProgress(current);
            }

            if (current >= 100 && !isDone) {
                isDone = true;
                setTimeout(() => {
                    setIsFadingOut(true);
                    setTimeout(() => {
                        if (onCompleteRef.current) onCompleteRef.current();
                    }, 500); // 500ms fade out duration matches Tailwind transition
                }, 300); // Wait slightly at 100% before fading out
                return;
            }

            animationFrameId = requestAnimationFrame(updateProgress);
        };

        animationFrameId = requestAnimationFrame(updateProgress);

        return () => cancelAnimationFrame(animationFrameId);
    }, [isReady]);

    return (
        <div className={cn(
            "fixed inset-0 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md z-[100] transition-opacity duration-500",
            isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
            <div className="flex flex-col items-center justify-center gap-6 animate-in fade-in zoom-in duration-700">
                {/* Logo wrapper */}
                <div className="relative flex items-center justify-center">
                    {/* Pulsing ring */}
                    <div className="absolute inset-0 rounded-3xl bg-blue-500/10 animate-ping duration-3000" />
                    
                    {/* Core icon */}
                    <div className="w-16 h-16 rounded-3xl bg-foreground text-background flex items-center justify-center shadow-2xl relative overflow-hidden">
                        <DollarSign size={32} strokeWidth={3} className="relative z-10 animate-pulse duration-1000" />
                    </div>
                </div>

                {/* Typography */}
                <div className="flex flex-col items-center text-center space-y-3 mt-4">
                    <h2 className="text-sm font-black uppercase tracking-widest text-foreground">
                        Memuat Financer<span className="text-blue-600">.</span>
                    </h2>
                    
                    {/* Progress Bar & Percentage */}
                    <div className="flex items-center gap-3">
                        <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                            {/* Width updated per-frame by requestAnimationFrame, so we omit CSS transition */}
                            <div 
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground w-8 text-right font-mono tabular-nums">
                            {Math.floor(progress)}%
                        </span>
                    </div>

                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 animate-pulse mt-2">
                        Sinkronisasi Data...
                    </p>
                </div>
            </div>
        </div>
    );
}
