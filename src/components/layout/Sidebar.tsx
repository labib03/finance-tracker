'use client';

import { useState } from 'react';
import { useFinanceStore } from '@/lib/store';
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
} from 'lucide-react';

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'saldo', label: 'Manajemen Saldo', icon: Wallet },
    { id: 'transaksi', label: 'Input Transaksi', icon: PlusCircle },
    { id: 'transfer', label: 'Transfer', icon: ArrowLeftRight },
    { id: 'anggaran', label: 'Anggaran', icon: PieChart },
    { id: 'recurring', label: 'Berulang', icon: CalendarClock },
    { id: 'master', label: 'Master Data', icon: Database },
];

interface SidebarProps {
    activeView: string;
    onViewChange: (view: string) => void;
}

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <>
            {/* Mobile Toggle */}
            <button
                className="fixed top-4 left-4 z-50 p-2 rounded-xl bg-white border border-gray-200 shadow-sm lg:hidden"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                aria-label="Toggle menu"
            >
                {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
                {/* Logo / Brand */}
                <div className="flex items-center gap-3 px-3 mb-8">
                    <div className="w-10 h-10 rounded-2xl bg-gray-900 flex items-center justify-center shadow-sm">
                        <DollarSign size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                            FinanceTracker
                        </h1>
                        <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                            Pemantau Keuangan
                        </p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-1 flex-1">
                    {navItems.map((item) => {
                        const isActive = activeView === item.id;
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onViewChange(item.id);
                                    setIsMobileOpen(false);
                                }}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[14px] font-semibold transition-all duration-200 border-none cursor-pointer ${isActive
                                    ? 'bg-gray-100/80 text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-50/50 hover:text-gray-700'
                                    }`}
                            >
                                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
                    <p className="text-[11px] text-center" style={{ color: 'var(--text-muted)' }}>
                        v1.0.0 · Powered by Google Sheets
                    </p>
                </div>
            </aside>
        </>
    );
}
