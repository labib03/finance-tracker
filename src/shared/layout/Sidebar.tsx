'use client';

import { useState, useRef, useEffect } from 'react';
import {
    LayoutDashboard,
    Wallet,
    ReceiptText,
    ArrowLeftRight,
    Target,
    BarChart3,
    CalendarClock,
    Menu,
    X,
    DollarSign,
    Settings2,
    PiggyBank,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFinanceStore } from '@/lib/store';
import { Button } from '@/shared/ui/button';
import { Separator } from '@/shared/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/shared/ui/tooltip';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetHeader,
    SheetTitle,
} from '@/shared/ui/sheet';

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Ringkasan finansial' },
    { id: 'saldo', label: 'Dompet Kontrol', icon: Wallet, description: 'Manajemen akun' },
    { id: 'transaksi', label: 'Riwayat Transaksi', icon: ReceiptText, description: 'Catat transaksi' },
    { id: 'transfer', label: 'Transfer Dana', icon: ArrowLeftRight, description: 'Pindah saldo' },
    { id: 'anggaran', label: 'Target Budget', icon: Target, description: 'Batas hemat' },
    { id: 'tabungan', label: 'Sinking Funds', icon: PiggyBank, description: 'Virtual sub-ledger' },
    { id: 'laporan', label: 'Analitik', icon: BarChart3, description: 'Statistik kategori' },
    { id: 'recurring', label: 'Tagihan Rutin', icon: CalendarClock, description: 'Biaya langganan' },
    { id: 'master', label: 'Master Data', icon: Settings2, description: 'Kategori & sumber' },
];

interface NavLinksProps {
    activeView: string;
    onViewChange: (view: string) => void;
    isSidebarCollapsed: boolean;
    mobile?: boolean;
    setOpen: (open: boolean) => void;
}

const NavLinks = ({ activeView, onViewChange, isSidebarCollapsed, mobile = false, setOpen }: NavLinksProps) => (
    <nav className={cn("flex flex-col min-h-0", isSidebarCollapsed && !mobile ? "gap-2.5" : "gap-2")}>
        {navItems.map((item) => {
            const isActive = activeView === item.id;
            const Icon = item.icon;
            const isCollapsed = !mobile && isSidebarCollapsed;

            return (
                <div key={item.id} className={cn("relative group/nav w-full flex", isCollapsed ? "justify-center" : "px-0")}>
                    <Tooltip key={`${item.id}-${isCollapsed}`} open={isCollapsed ? undefined : false}>
                        <TooltipTrigger render={
                            <button
                                onClick={() => {
                                    onViewChange(item.id);
                                    if (mobile) setOpen(false);
                                }}
                                className={cn(
                                    "group flex items-center transition-[background-color,height,width,border-radius] duration-200 text-left relative",
                                    isCollapsed
                                        ? "justify-center h-10 w-10 rounded-xl mb-1"
                                        : mobile
                                            ? "w-full px-4 py-3 rounded-2xl gap-4 mb-1"
                                            : "w-full px-4 py-2 rounded-[1.5rem] gap-4 mb-1.5",
                                    isActive
                                        ? "bg-indigo-50/80 text-indigo-600 font-bold"
                                        : "hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {/* Minimalist Active Indicator (Collapsed) */}
                                {isCollapsed && isActive && (
                                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full" />
                                )}

                                <div className={cn(
                                    "flex items-center justify-center rounded-xl shrink-0 transition-[transform,background-color] duration-300",
                                    isCollapsed ? "w-8 h-8" : "w-8 h-8",
                                    isActive ? "bg-indigo-100/50" : "bg-muted/30 group-hover:bg-background"
                                )}>
                                    <Icon size={isCollapsed ? 18 : 18} strokeWidth={isActive ? 2.5 : 2} className={cn("transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
                                </div>

                                {!isCollapsed && (
                                    <div className="flex flex-col min-w-0 animate-in fade-in slide-in-from-left-2 duration-300 overflow-hidden">
                                        <span className="text-[11px] font-black uppercase tracking-widest leading-none mb-1 whitespace-nowrap">
                                            {item.label}
                                        </span>
                                    </div>
                                )}

                                {isActive && !isCollapsed && (
                                    <div className="ml-auto animate-in fade-in slide-in-from-right-2 duration-300">
                                        <div className="w-1 h-1 rounded-full bg-indigo-500" />
                                    </div>
                                )}
                            </button>
                        } />
                        <TooltipContent side="right" sideOffset={16} align="center">
                            {item.label}
                        </TooltipContent>
                    </Tooltip>
                </div>
            );
        })}
    </nav>
);

const Brand = ({ collapsed = false, className }: { collapsed?: boolean; className?: string }) => (
    <TooltipProvider>
        <div className={cn(
            "flex flex-col gap-4 group/brand cursor-default transition-[margin,padding] duration-200 relative",
            collapsed ? "items-center mb-6 px-0" : "mb-16 px-2",
            className
        )}>
            <Tooltip key={`brand-${collapsed}`} open={collapsed ? undefined : false}>
                <TooltipTrigger render={
                    <div className="flex items-center gap-5">
                        <div className={cn(
                            "rounded-2xl bg-foreground text-background flex items-center justify-center shadow-2xl relative overflow-hidden transition-[width,height,transform] duration-300 group-hover/brand:scale-105 shrink-0",
                            collapsed ? "w-11 h-11" : "w-14 h-14"
                        )}>
                            <DollarSign size={collapsed ? 20 : 26} strokeWidth={3} className="relative z-10" />
                        </div>
                        {!collapsed && (
                            <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                                <h1 className="text-2xl font-black tracking-widest leading-none">
                                    Financer<span className="text-indigo-600">.</span>
                                </h1>
                                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/80 mt-2">
                                    Premium Pro
                                </span>
                            </div>
                        )}
                    </div>
                } />
                <TooltipContent side="right" sideOffset={16} align="center">
                    Financer Pro
                </TooltipContent>
            </Tooltip>
        </div>
    </TooltipProvider>
);

interface SidebarProps {
    activeView: string;
    onViewChange: (view: string) => void;
}

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
    const [open, setOpen] = useState(false);
    const [canScrollTop, setCanScrollTop] = useState(false);
    const [canScrollBottom, setCanScrollBottom] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const isSidebarCollapsed = useFinanceStore((s) => s.isSidebarCollapsed);
    const setSidebarCollapsed = useFinanceStore((s) => s.setSidebarCollapsed);

    const checkScroll = () => {
        const container = scrollContainerRef.current;
        if (container) {
            setCanScrollTop(container.scrollTop > 10);
            setCanScrollBottom(
                container.scrollHeight - container.scrollTop - container.clientHeight > 10
            );
        }
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            checkScroll();
            container.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
            return () => {
                container.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
            };
        }
    }, [isSidebarCollapsed, activeView]);

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={cn(
                "fixed top-0 left-0 h-screen bg-white border-r border-border/40 hidden lg:flex flex-col transition-[width] duration-300 ease-in-out shadow-scandi z-40 will-change-[width] transform-gpu",
                isSidebarCollapsed ? "w-[76px] px-2 py-6 items-center" : "w-[320px] px-6 py-10 text-foreground"
            )}>
                <Brand collapsed={isSidebarCollapsed} />

                <TooltipProvider delay={100}>
                    <div className="flex-1 relative min-h-0 flex flex-col mb-4">
                        {/* Shadow Indicators */}
                        <div className={cn(
                            "absolute top-0 left-0 right-0 h-12 bg-linear-to-b from-white to-transparent z-20 pointer-events-none transition-opacity duration-300",
                            canScrollTop ? "opacity-100" : "opacity-0"
                        )} />
                        <div className={cn(
                            "absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-white to-transparent z-20 pointer-events-none transition-opacity duration-300",
                            canScrollBottom ? "opacity-100" : "opacity-0"
                        )} />

                        <div
                            ref={scrollContainerRef}
                            className="flex-1 overflow-y-auto px-1 -mx-1 scrollbar-none"
                        >
                            <div className="py-2">
                                {!isSidebarCollapsed && (
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/80 mb-6 px-4 animate-in fade-in duration-700">Menu Utama</p>
                                )}
                                <NavLinks
                                    activeView={activeView}
                                    onViewChange={onViewChange}
                                    isSidebarCollapsed={isSidebarCollapsed}
                                    setOpen={setOpen}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-8 space-y-4">
                        <Separator className="bg-border/10 w-2/3 mx-auto" />

                        <div className={cn("flex flex-col gap-2", isSidebarCollapsed ? "px-0" : "px-2 whitespace-nowrap overflow-hidden")}>
                            <Tooltip key={`cycle-${isSidebarCollapsed}`} open={isSidebarCollapsed ? undefined : false}>
                                <TooltipTrigger render={
                                    <button
                                        onClick={() => {
                                            useFinanceStore.getState().setActiveModal('cycle_settings');
                                        }}
                                        className={cn(
                                            "group w-full flex items-center rounded-[2rem] transition-[padding,height,border-color,background-color] duration-300 border border-transparent hover:border-border/40 relative",
                                            isSidebarCollapsed
                                                ? "justify-center h-10 w-10 bg-muted/20 hover:bg-muted/40"
                                                : "justify-between p-2 bg-muted/30 hover:bg-muted/50"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "rounded-xl bg-white text-muted-foreground group-hover:text-foreground transition-[width,height,color] duration-300 shadow-sm shrink-0 flex items-center justify-center",
                                                isSidebarCollapsed ? "w-8 h-8" : "p-2.5"
                                            )}>
                                                <CalendarClock size={isSidebarCollapsed ? 18 : 16} />
                                            </div>
                                            {!isSidebarCollapsed && (
                                                <div className="flex flex-col text-left animate-in fade-in slide-in-from-left-2 duration-300">
                                                    <span className="text-xs font-black uppercase tracking-widest leading-none mb-1">Siklus</span>
                                                    <span className="text-[10px] font-bold text-muted-foreground/80 tracking-widest">Atur Tanggal</span>
                                                </div>
                                            )}
                                        </div>
                                        {!isSidebarCollapsed && <ChevronRight size={14} className="text-muted-foreground/30 group-hover:translate-x-0.5 transition-transform" />}
                                    </button>
                                } />
                                <TooltipContent side="right" sideOffset={16} align="center">
                                    Pengaturan Siklus
                                </TooltipContent>
                            </Tooltip>

                            {/* Toggle Collapse Button */}
                            <Tooltip key={`toggle-${isSidebarCollapsed}`} open={isSidebarCollapsed ? undefined : false}>
                                <TooltipTrigger render={
                                    <button
                                        onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
                                        className={cn(
                                            "group w-full flex items-center transition-[padding,height,background-color] duration-300 border border-transparent hover:border-border/40 relative",
                                            isSidebarCollapsed
                                                ? "justify-center h-10 w-10 bg-indigo-50/30 hover:bg-indigo-50/50 text-indigo-600 rounded-full"
                                                : "gap-4 p-2 rounded-[2rem] hover:bg-muted/30"
                                        )}
                                    >
                                        <div className={cn(
                                            "rounded-xl transition-[width,height,background-color] duration-300 shrink-0 flex items-center justify-center",
                                            isSidebarCollapsed ? "w-8 h-8 bg-indigo-100/50" : "p-2.5 bg-muted/20 text-muted-foreground group-hover:text-foreground"
                                        )}>
                                            {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={16} />}
                                        </div>
                                        {!isSidebarCollapsed && (
                                            <span className="text-[11px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-left-2 duration-300">
                                                Ke Mode Ringkas
                                            </span>
                                        )}
                                    </button>
                                } />
                                <TooltipContent side="right" sideOffset={16} align="center" className="bg-indigo-600 text-white">
                                    Expand Sidebar
                                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-indigo-600" />
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </TooltipProvider>
            </aside>

        </>
    );
}
