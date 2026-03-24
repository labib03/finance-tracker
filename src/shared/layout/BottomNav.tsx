'use client';

import {
    LayoutDashboard,
    Wallet,
    ReceiptText,
    Target,
    BarChart3,
    Settings2,
    Plus,
    CalendarDays,
    Menu as HamburgerIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFinanceStore } from '@/lib/store';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from '@/shared/ui/sheet';
import { useState } from 'react';

interface BottomNavProps {
    activeView: string;
    onViewChange: (view: string) => void;
}

export default function BottomNav({ activeView, onViewChange }: BottomNavProps) {
    const [open, setOpen] = useState(false);
    const setActiveModal = useFinanceStore((s) => s.setActiveModal);

    const mainNavItems = [
        { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
        { id: 'transaksi', label: 'History', icon: ReceiptText }
    ];

    const rightNavItems = [

        { id: 'saldo', label: 'Wallet', icon: Wallet }
    ];

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-white/80 backdrop-blur-xl border-t border-border/40 z-50 px-6 flex items-center justify-between pb-safe shadow-scandi transition-all duration-500 animate-in slide-in-from-bottom-5">
            {mainNavItems.map((item) => {
                const isActive = activeView === item.id;
                const Icon = item.icon;
                return (
                    <button
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        className={cn(
                            "flex flex-col items-center gap-1.5 transition-all duration-300 flex-1",
                            isActive ? "text-indigo-600" : "text-muted-foreground/60 hover:text-foreground"
                        )}
                    >
                        <div className={cn(
                            "p-2 rounded-xl transition-all duration-300",
                            isActive ? "bg-indigo-50/80 scale-110" : ""
                        )}>
                            <Icon size={20} strokeWidth={isActive ? 3 : 2} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] leading-none mb-1">{item.label}</span>
                    </button>
                );
            })}

            {/* Central FAB Placeholder for Layout */}
            <div className="flex-1 flex justify-center -mt-16 relative z-50">
                <button
                    onClick={() => setActiveModal('transaksi')}
                    className="w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center active:scale-90 transition-all duration-300 hover:rotate-90 hover:rounded-[2rem]"
                >
                    <Plus size={28} strokeWidth={3} />
                </button>
            </div>

            {rightNavItems.map((item) => {
                const isActive = activeView === item.id;
                const Icon = item.icon;
                return (
                    <button
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        className={cn(
                            "flex flex-col items-center gap-1.5 transition-all duration-300 flex-1",
                            isActive ? "text-indigo-600" : "text-muted-foreground/60 hover:text-foreground"
                        )}
                    >
                        <div className={cn(
                            "p-2 rounded-xl transition-all duration-300",
                            isActive ? "bg-indigo-50/80 scale-110" : ""
                        )}>
                            <Icon size={20} strokeWidth={isActive ? 3 : 2} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] leading-none mb-1">{item.label}</span>
                    </button>
                );
            })}

            {/* More / Menu Trigger */}
            <div className="flex-1 flex justify-center">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger render={
                        <button
                            className="flex flex-col items-center gap-1.5 transition-all duration-300 text-muted-foreground/60 hover:text-foreground"
                        >
                            <div className="p-2 rounded-xl">
                                <HamburgerIcon size={20} strokeWidth={2} />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.15em] leading-none mb-1">More</span>
                        </button>
                    } />
                    {/* The content will be rendered here but Sidebar will likely handle its own internal mobile sheet ? */}
                    {/* Actually, BottomNav might need its own SheetContent or use Sidebar's. Let's make it independent. */}
                    <SheetContent side="bottom" className="h-[75vh] rounded-t-[2.5rem] border-t-0 p-0 flex flex-col bg-white overflow-hidden">
                        <div className="w-12 h-1.5 bg-muted/20 rounded-full mx-auto mt-4 mb-8" />
                        <div className="flex-1 overflow-y-auto scrollbar-none px-6 pb-12">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Extra items from Sidebar's navItems */}
                                {[
                                    { id: 'anggaran', label: 'Budget', icon: Target, type: 'view' },
                                    { id: 'transfer', label: 'Transfer', icon: ArrowLeftRight, type: 'view' },
                                    { id: 'laporan', label: 'Analitik', icon: BarChart3, type: 'view' },
                                    { id: 'recurring', label: 'Tagihan', icon: CalendarClock, type: 'view' },
                                    { id: 'master', label: 'Setup', icon: Settings2, type: 'view' },
                                    { id: 'cycle', label: 'Siklus', icon: CalendarDays, type: 'modal' },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            if (item.type === 'modal') {
                                                setActiveModal('cycle_settings');
                                            } else {
                                                onViewChange(item.id);
                                            }
                                            setOpen(false);
                                        }}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-4 p-6 rounded-3xl transition-all duration-300 border",
                                            activeView === item.id
                                                ? "bg-indigo-50/50 border-indigo-100 text-indigo-600"
                                                : "bg-muted/5 border-transparent text-muted-foreground hover:bg-muted/10"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                            activeView === item.id ? "bg-white shadow-scandi" : "bg-muted/20"
                                        )}>
                                            <item.icon size={24} strokeWidth={activeView === item.id ? 2.5 : 2} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    );
}

// Extra icons needed for the sheet
import { ArrowLeftRight, CalendarClock } from 'lucide-react';
