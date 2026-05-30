'use client';
import { TRANSACTION_TYPES } from '@/lib/constants';

import { Search, X, CalendarIcon, Filter } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { SearchableSelect } from '@/shared/ui/SearchableSelect';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Calendar } from '@/shared/ui/calendar';
import { cn, formatTanggalPendek } from '@/lib/utils';
import { getRootLabel } from '@/lib/tipeUtils';
import type { Kategori, SumberDana, TipeTransaksi } from '@/lib/types';

export interface TransactionFiltersProps {
    filterMode?: 'all' | 'transfer';
    search: string;
    setSearch: (val: string) => void;
    typeFilter: string;
    setTypeFilter: (val: string) => void;
    categoryFilter: string;
    setCategoryFilter: (val: string) => void;
    accountFilter: string;
    setAccountFilter: (val: string) => void;
    dateFilter: string;
    setDateFilter: (val: string) => void;
    kategoriList: Kategori[];
    sumberDanaList: SumberDana[];
    tipeList: TipeTransaksi[];
    onReset: () => void;
}

export default function TransactionFilters({
    filterMode = 'all',
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    categoryFilter,
    setCategoryFilter,
    accountFilter,
    setAccountFilter,
    dateFilter,
    setDateFilter,
    kategoriList,
    sumberDanaList,
    tipeList,
    onReset
}: TransactionFiltersProps) {
    const isTransferMode = filterMode === TRANSACTION_TYPES.TRANSFER;

    const filteredKategori = typeFilter === 'all' 
        ? kategoriList 
        : kategoriList.filter(k => k.tipe.toLowerCase() === (typeFilter || '').toLowerCase());

    const [isExpanded, setIsExpanded] = useState(false);

    const hasActiveFilters = search !== '' || typeFilter !== 'all' || categoryFilter !== 'all' || accountFilter !== 'all' || dateFilter !== 'all';

    return (
        <div className="px-6 sm:px-8 py-5 bg-muted/5 border-b border-border/10">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-primary" size={14} />
                        <Input
                            placeholder={isTransferMode ? "Cari akun atau catatan..." : "Cari apapun..."}
                            className="pl-10 w-full h-11 text-[11px] font-black uppercase tracking-widest rounded-2xl bg-white border border-border/40 transition-all focus-visible:ring-primary/20 shadow-scandi"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSearch('');
                                }}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                    
                    {!isTransferMode && (
                        <>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className={cn(
                                    "h-11 w-11 rounded-2xl border-border/40 shadow-scandi xl:hidden transition-all",
                                    isExpanded ? "bg-foreground text-background" : "bg-white text-foreground"
                                )}
                            >
                                <Filter size={18} strokeWidth={2.5} />
                            </Button>
                        </>
                    )}
                </div>

                <div className={cn(
                    "grid gap-3 lg:gap-4 transition-all duration-300 overflow-hidden",
                    isTransferMode 
                        ? "grid-cols-1 md:grid-cols-2" 
                        : cn(
                            "grid-cols-1 sm:grid-cols-2 xl:grid-cols-5",
                            !isExpanded && "max-xl:hidden"
                        )
                )}>
                    {!isTransferMode && (
                        <>
                            <div className="col-span-1">
                                <SearchableSelect
                                    options={[
                                        { value: 'all', label: 'SEMUA TIPE' },
                                        ...tipeList.map(t => ({
                                            value: t.id_tipe,
                                            label: t.label.toUpperCase()
                                        }))
                                    ]}
                                    value={typeFilter}
                                    onValueChange={(val) => setTypeFilter(val || 'all')}
                                    placeholder="TIPE"
                                    className="h-11 w-full text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-2xl bg-white border border-border/40 shadow-scandi hover:bg-muted/5 transition-all"
                                />
                            </div>

                            <div className="col-span-1">
                                <SearchableSelect
                                    options={[
                                        { value: 'all', label: 'SEMUA KATEGORI' },
                                        ...filteredKategori.map(k => ({
                                            value: k.id_kategori,
                                            label: k.nama_kategori.toUpperCase()
                                        }))
                                    ]}
                                    value={categoryFilter}
                                    onValueChange={(val) => setCategoryFilter(val || 'all')}
                                    placeholder="KATEGORI"
                                    className="h-11 w-full text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-2xl bg-white border border-border/40 shadow-scandi hover:bg-muted/5 transition-all"
                                />
                            </div>

                            <div className="col-span-1">
                                <SearchableSelect
                                    options={[
                                        { value: 'all', label: 'SEMUA AKUN' },
                                        ...sumberDanaList.map(s => ({
                                            value: s.id_sumber_dana,
                                            label: s.nama_sumber.toUpperCase()
                                        }))
                                    ]}
                                    value={accountFilter}
                                    onValueChange={(val) => setAccountFilter(val || 'all')}
                                    placeholder="AKUN"
                                    className="h-11 w-full text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-2xl bg-white border border-border/40 shadow-scandi hover:bg-muted/5 transition-all"
                                />
                            </div>
                        </>
                    )}

                    <div className={cn("col-span-1", isTransferMode && "md:col-start-2")}>
                        <Popover>
                            <PopoverTrigger
                                className={cn(
                                    "h-11 w-full text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-2xl bg-white border border-border/40 shadow-scandi hover:bg-muted/5 transition-all flex items-center justify-between px-4",
                                    dateFilter !== 'all' && "bg-foreground text-background border-foreground hover:bg-foreground/90 hover:text-background shadow-none"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <CalendarIcon size={14} className="opacity-60" />
                                    <span>{dateFilter === 'all' ? 'TANGGAL' : formatTanggalPendek(dateFilter).toUpperCase()}</span>
                                </div>
                                {dateFilter !== 'all' && (
                                    <X 
                                        size={14} 
                                        className="ml-2 hover:scale-110 transition-transform" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDateFilter('all');
                                        }}
                                    />
                                )}
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-2xl shadow-float border-border/40 bg-white overflow-hidden" align={isTransferMode ? "end" : "center"}>
                                <div className="p-2 border-b border-border/10 flex justify-between items-center bg-muted/5">
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            const today = new Date();
                                            const year = today.getFullYear();
                                            const month = String(today.getMonth() + 1).padStart(2, '0');
                                            const day = String(today.getDate()).padStart(2, '0');
                                            setDateFilter(`${year}-${month}-${day}`);
                                        }}
                                        className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                                    >
                                        Hari Ini
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setDateFilter('all')}
                                        className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted/10 transition-colors cursor-pointer"
                                    >
                                        Semua
                                    </button>
                                </div>
                                <Calendar
                                    mode="single"
                                    selected={dateFilter !== 'all' ? new Date(dateFilter) : undefined}
                                    onSelect={(date) => {
                                        if (date) {
                                            const year = date.getFullYear();
                                            const month = String(date.getMonth() + 1).padStart(2, '0');
                                            const day = String(date.getDate()).padStart(2, '0');
                                            setDateFilter(`${year}-${month}-${day}`);
                                        } else {
                                            setDateFilter('all');
                                        }
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {!isTransferMode && (
                        <div className="col-span-1">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onReset}
                                disabled={!hasActiveFilters}
                                className={cn(
                                    "h-11 w-full text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-2xl border transition-all duration-300 flex items-center justify-center gap-2",
                                    hasActiveFilters 
                                        ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-600 hover:text-white hover:border-rose-600 shadow-scandi active:scale-95 cursor-pointer" 
                                        : "bg-muted/10 border-border/20 text-muted-foreground/40 cursor-not-allowed"
                                )}
                            >
                                <X size={14} strokeWidth={2.5} />
                                <span>Reset Filter</span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
