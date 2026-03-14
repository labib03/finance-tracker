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
    { id: 'transaksi', label: 'Riwayat Input', icon: PlusCircle, description: 'Catat transaksi' },
    { id: 'transfer', label: 'Transfer Dana', icon: ArrowLeftRight, description: 'Pindah saldo' },
    { id: 'anggaran', label: 'Target Budget', icon: PieChart, description: 'Batas hemat' },
    { id: 'laporan', label: 'Analitik Pro', icon: PieChart, description: 'Statistik kategori' },
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
        <nav className="flex flex-col gap-1.5">
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
                            "group flex items-center gap-4 px-4 py-3.5 rounded-[1.5rem] transition-all duration-500 text-left relative overflow-hidden",
                            isActive 
                                ? "bg-foreground text-background shadow-xl shadow-foreground/10 translate-x-1" 
                                : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <div className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-xl shrink-0 transition-all duration-500",
                            isActive ? "bg-white/10" : "bg-muted group-hover:bg-background"
                        )}>
                            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={cn("transition-transform duration-500", isActive ? "scale-110" : "group-hover:scale-110")} />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-black uppercase tracking-[0.15em] leading-none mb-1">
                                {item.label}
                            </span>
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-tighter opacity-40",
                                isActive ? "text-background/60" : "text-muted-foreground"
                            )}>
                                {item.description}
                            </span>
                        </div>
                        {isActive && (
                            <div className="ml-auto animate-in fade-in slide-in-from-left-2 duration-500">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                            </div>
                        )}
                    </button>
                );
            })}
        </nav>
    );

    const Brand = () => (
        <div className="flex items-center gap-4 mb-12 px-2 transition-all duration-500">
            <div className="w-12 h-12 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
                <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <DollarSign size={22} strokeWidth={3} className="text-white relative z-10" />
            </div>
            <div className="flex flex-col text-left">
                <h1 className="text-xl font-black tracking-tighter leading-none bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
                    Financer<span className="text-indigo-600">.</span>
                </h1>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 mt-1.5">
                    Premium Interface
                </p>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="fixed top-0 left-0 h-screen w-[280px] bg-white border-r border-border/40 hidden lg:flex flex-col p-8 z-40 transition-all duration-300">
                <Brand />
                <div className="flex-1 overflow-y-auto px-1 -mx-1 scrollbar-none">
                    <div className="mb-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 mb-6 px-4">Menu Utama</p>
                        <NavLinks />
                    </div>
                </div>
                
                <div className="mt-8 space-y-4">
                    <Separator className="bg-border/40" />
                    <button
                        onClick={() => {
                            useFinanceStore.getState().setActiveModal('cycle_settings');
                        }}
                        className="group w-full flex items-center gap-4 px-4 py-3.5 rounded-[1.5rem] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-500 text-left"
                    >
                        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-muted shrink-0 group-hover:bg-white transition-all duration-500">
                            <CalendarClock size={18} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase tracking-[0.15em]">Siklus</span>
                            <span className="text-[9px] font-black uppercase tracking-tighter opacity-40">Ubah rentang bulan</span>
                        </div>
                    </button>

                    <div className="p-6 rounded-[2rem] bg-indigo-50 border border-indigo-100 flex flex-col items-center text-center group transition-colors hover:bg-indigo-100">
                        <div className="flex items-center gap-2 mb-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                             <p className="text-[10px] font-black text-indigo-900 tracking-widest uppercase opacity-80">
                                Cloud Active
                            </p>
                        </div>
                        <span className="text-[8px] font-black tracking-[0.2em] uppercase text-indigo-400">Google Sheets Sync</span>
                    </div>
                </div>
            </aside>

            {/* Mobile Header/Menu */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-border/40 z-40 px-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <DollarSign size={18} strokeWidth={3} className="text-white" />
                    </div>
                    <span className="text-base font-black tracking-tighter">Financer.</span>
                </div>
                
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger render={<Button variant="ghost" size="icon" className="rounded-xl hover:bg-muted/50" />}>
                        <Menu size={20} strokeWidth={2.5} />
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] border-r-0 p-8 flex flex-col bg-white">
                        <SheetHeader className="text-left mb-12">
                            <Brand />
                        </SheetHeader>
                        <div className="flex-1 overflow-y-auto scrollbar-none">
                             <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 mb-6 px-4">Menu Utama</p>
                            <NavLinks mobile />
                        </div>
                        <div className="mt-auto pt-8 space-y-4">
                             <button
                                onClick={() => {
                                    useFinanceStore.getState().setActiveModal('cycle_settings');
                                    setOpen(false);
                                }}
                                className="w-full flex items-center gap-4 px-4 py-4 rounded-[1.5rem] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-500 text-left"
                            >
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted shrink-0 transition-colors">
                                    <CalendarClock size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black uppercase tracking-[0.15em]">Pengaturan Siklus</span>
                                    <span className="text-[9px] font-black uppercase tracking-tighter opacity-40">Ubah rentang bulan</span>
                                </div>
                            </button>
                             <Separator className="bg-border/40" />
                             <p className="text-[9px] font-black text-center text-muted-foreground/30 tracking-[0.3em] uppercase">
                                v1.2.0 · Pro Interface
                             </p>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}
