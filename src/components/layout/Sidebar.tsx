'use client';

import { useState } from 'react';
import {
    LayoutDashboard,
    Wallet,
    PlusCircle,
    ArrowLeftRight,
    PieChart,
    CalendarClock,
    Menu,
    X,
    DollarSign,
    Database,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFinanceStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Ringkasan finansial' },
    { id: 'saldo', label: 'Dompet Kontrol', icon: Wallet, description: 'Manajemen akun' },
    { id: 'transaksi', label: 'Input Cepat', icon: PlusCircle, description: 'Catat transaksi' },
    { id: 'transfer', label: 'Transfer Dana', icon: ArrowLeftRight, description: 'Pindah saldo' },
    { id: 'anggaran', label: 'Target Budget', icon: PieChart, description: 'Batas hemat' },
    { id: 'laporan', label: 'Laporan Analitik', icon: LayoutDashboard, description: 'Statistik kategori' },
    { id: 'recurring', label: 'Jadwal Rutin', icon: CalendarClock, description: 'Biaya langganan' },
    { id: 'master', label: 'Master Data', icon: Database, description: 'Kategori & sumber' },
];

interface SidebarProps {
    activeView: string;
    onViewChange: (view: string) => void;
}

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
    const [open, setOpen] = useState(false);

    const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
        <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
                const isActive = activeView === item.id;
                const Icon = item.icon;
                return (
                    <button
                        key={item.id}
                        onClick={() => {
                            onViewChange(item.id);
                            if (mobile) setOpen(false);
                        }}
                        className={cn(
                            "group flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 text-left relative overflow-hidden",
                            isActive 
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                                : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <div className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-colors",
                            isActive ? "bg-white/20" : "bg-muted group-hover:bg-background"
                        )}>
                            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[14px] font-bold tracking-tight leading-none mb-0.5">
                                {item.label}
                            </span>
                            <span className={cn(
                                "text-[10px] font-medium opacity-70 truncate",
                                isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                            )}>
                                {item.description}
                            </span>
                        </div>
                        {isActive && (
                            <div className="ml-auto animate-in fade-in slide-in-from-left-1 duration-300">
                                <ChevronRight size={14} className="opacity-50" />
                            </div>
                        )}
                    </button>
                );
            })}
        </nav>
    );

    const Brand = () => (
        <div className="flex items-center gap-3 mb-8 px-2 transition-all duration-300">
            <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <DollarSign size={24} className="text-primary-foreground relative z-10" />
            </div>
            <div className="flex flex-col text-left">
                <h1 className="text-lg font-black tracking-tighter leading-none bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
                    FinanceTracker.
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mt-1">
                    Elite Edition
                </p>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="fixed top-0 left-0 h-screen w-[280px] bg-background/50 backdrop-blur-xl border-r border-border/50 hidden lg:flex flex-col p-6 z-40 transition-all duration-300">
                <Brand />
                <div className="flex-1 overflow-y-auto px-1 -mx-1 scrollbar-none">
                    <NavLinks />
                </div>
                
                <div className="mt-8 space-y-4">
                    <Separator className="opacity-50" />
                    <button
                        onClick={() => {
                            useFinanceStore.getState().setActiveModal('cycle_settings');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-300 text-left"
                    >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted shrink-0 group-hover:bg-background transition-colors">
                            <CalendarClock size={18} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[13px] font-bold tracking-tight">Pengaturan Siklus</span>
                            <span className="text-[9px] font-medium opacity-60">Ubah rentang bulan</span>
                        </div>
                    </button>

                    <div className="px-4 py-4 rounded-3xl bg-muted/50 border border-border/50 flex flex-col items-center text-center">
                        <p className="text-[11px] font-bold text-muted-foreground/80 mb-2 uppercase tracking-widest">
                             Google Sheets Cloud
                        </p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black tracking-widest uppercase">System Online</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Header/Menu */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-border/50 z-40 px-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <DollarSign size={18} className="text-primary-foreground" />
                    </div>
                    <span className="text-sm font-black tracking-tighter">FinanceTracker.</span>
                </div>
                
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger render={<Button variant="ghost" size="icon" className="rounded-xl" />}>
                        <Menu size={22} />
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] border-r-0 p-6 flex flex-col bg-background/95 backdrop-blur-md">
                        <SheetHeader className="text-left mb-8">
                            <Brand />
                        </SheetHeader>
                        <div className="flex-1">
                            <NavLinks mobile />
                        </div>
                        <div className="mt-auto pt-6 space-y-4">
                             <button
                                onClick={() => {
                                    useFinanceStore.getState().setActiveModal('cycle_settings');
                                    setOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-300 text-left"
                            >
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted shrink-0 transition-colors">
                                    <CalendarClock size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[13px] font-bold tracking-tight">Pengaturan Siklus</span>
                                    <span className="text-[9px] font-medium opacity-60">Ubah rentang bulan</span>
                                </div>
                            </button>
                             <Separator className="opacity-50" />
                             <p className="text-[10px] font-black text-center text-muted-foreground tracking-widest uppercase">
                                v1.2.0 · Premium Dashboard
                             </p>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}
