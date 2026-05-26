'use client';

import React, { useState, useMemo } from 'react';
// PERBAIKAN 1: Import objek 'icons' langsung beserta icon lain yang dibutuhkan
import { icons, Search, Check, SearchX } from 'lucide-react';

// PERBAIKAN 2: Mengambil key langsung dari objek 'icons'
const allIconNames = Object.keys(icons) as Array<keyof typeof icons>;

export default function IconGalleryPage() {
    const [search, setSearch] = useState('');
    const [copiedIcon, setCopiedIcon] = useState<string | null>(null);

    // Filter pencarian
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

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6 min-h-screen">
            {/* Header & Search Bar (Sticky) */}
            <div className="sticky top-0 z-10 pb-6 pt-4">
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

            {/* Grid Daftar Icon */}
            {/* PERBAIKAN 3: Menambahkan default fallback "|| []" untuk mengamankan fungsi map */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 pb-20">
                {(filteredIcons || []).map((iconName) => {
                    // Mengambil komponen dari objek 'icons'
                    const IconComponent = icons[iconName] as React.ElementType;
                    const isCopied = copiedIcon === iconName;
                    
                    return (
                        <button
                            key={iconName}
                            onClick={() => handleCopy(String(iconName))}
                            className="group relative flex flex-col items-center justify-center gap-3 p-4 h-32 rounded-2xl border border-slate-200 bg-white hover:border-primary/50 hover:shadow-md transition-all active:scale-95 outline-none"
                        >
                            {/* Tempat Icon */}
                            <div className={isCopied ? "text-green-500" : "text-slate-600 group-hover:text-primary transition-colors"}>
                                {isCopied ? <Check size={32} strokeWidth={2.5} /> : <IconComponent size={32} strokeWidth={1.5} />}
                            </div>
                            
                            {/* Tempat Teks */}
                            <span className="text-[11px] font-semibold text-slate-500 text-center truncate w-full group-hover:text-slate-900 transition-colors">
                                {String(iconName)}
                            </span>

                            {/* Overlay Indikator Copy Sukses */}
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
            
            {/* Tampilan jika data tidak ditemukan */}
            {filteredIcons && filteredIcons.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
                    <SearchX size={48} className="opacity-20" />
                    <p className="font-medium">
                        Waduh, icon dengan kata kunci <span className="font-bold text-slate-800">"{search}"</span> tidak ditemukan.
                    </p>
                </div>
            )}
        </div>
    );
}