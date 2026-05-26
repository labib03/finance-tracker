'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { icons, Search, Check, SearchX, ArrowUp } from 'lucide-react';

const allIconNames = Object.keys(icons) as Array<keyof typeof icons>;

export default function IconGalleryPage() {
    const [search, setSearch] = useState('');
    const [copiedIcon, setCopiedIcon] = useState<string | null>(null);
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowBackToTop(true);
            } else {
                setShowBackToTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const filteredIcons = useMemo(() => {
        if (!search) return allIconNames;
        return allIconNames.filter(name => 
            name.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    const handleCopy = (iconName: string) => {
        navigator.clipboard.writeText(iconName);
        setCopiedIcon(iconName);
        setTimeout(() => setCopiedIcon(null), 2000);
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        // Membungkus seluruh halaman dalam Fragment agar FAB tidak terkunci di div pembungkus utama
        <>
            <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6 min-h-screen bg-slate-50/50">
                <div className="sticky top-0 bg-slate-50/90 backdrop-blur-xl z-20 pb-6 pt-4 border-b border-slate-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900">Galeri Icon</h1>
                            <p className="text-sm text-slate-500 mt-1">Klik pada icon untuk menyalin namanya (PascalCase) secara otomatis.</p>
                        </div>
                    </div>
                    
                    <div className="relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text"
                            placeholder="Cari icon (cth: wallet, money, user)..."
                            className="w-full pl-12 pr-4 h-14 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-slate-900 shadow-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 pb-20">
                    {(filteredIcons || []).map((iconName) => {
                        const IconComponent = icons[iconName] as React.ElementType;
                        const isCopied = copiedIcon === iconName;
                        
                        return (
                            <button
                                key={iconName}
                                onClick={() => handleCopy(String(iconName))}
                                className="group relative flex flex-col items-center justify-center gap-3 p-4 h-32 rounded-2xl border border-slate-200 bg-white hover:border-primary/50 hover:shadow-md transition-all active:scale-95 outline-none"
                            >
                                <div className={isCopied ? "text-green-500" : "text-slate-600 group-hover:text-primary transition-colors"}>
                                    {isCopied ? <Check size={32} strokeWidth={2.5} /> : <IconComponent size={32} strokeWidth={1.5} />}
                                </div>
                                
                                <span className="text-[11px] font-semibold text-slate-500 text-center truncate w-full group-hover:text-slate-900 transition-colors">
                                    {String(iconName)}
                                </span>

                                {isCopied && (
                                    <div className="absolute inset-0 bg-green-50/95 rounded-2xl flex flex-col items-center justify-center animate-in fade-in zoom-in duration-200">
                                        <Check size={24} className="text-green-600 mb-1" />
                                        <span className="text-xs font-bold text-green-700">Tersalin!</span>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
                
                {filteredIcons && filteredIcons.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
                        <SearchX size={48} className="opacity-20" />
                        <p className="font-medium">
                            Waduh, icon dengan kata kunci <span className="font-bold text-slate-800">"{search}"</span> tidak ditemukan.
                        </p>
                    </div>
                )}
            </div>

            {/* PERBAIKAN: Tombol dipindahkan ke LUAR div kontainer utama (menggunakan Fragment <>).
                Saya juga menambahkan !fixed (important) untuk memastikan Tailwind mem-force posisinya,
                serta z-[999] agar dipastikan berada di atas semua elemen.
            */}
            {showBackToTop && (
                <button
                    onClick={scrollToTop}
                    aria-label="Kembali ke atas"
                    className="!fixed bottom-8 right-8 p-4 rounded-full bg-slate-900 text-white shadow-xl hover:bg-primary transition-all hover:scale-110 active:scale-95 z-[999] flex items-center justify-center"
                >
                    <ArrowUp size={24} strokeWidth={2.5} />
                </button>
            )}
        </>
    );
}