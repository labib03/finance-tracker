'use client';

import { useMemo, useState } from 'react';
import { useFinanceStore } from '@/lib/store';
import { hitungBudgetStatus, formatRupiah } from '@/lib/utils';
import { ShieldAlert, Sparkles, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { CategoryIcon } from '@/shared/ui/CategoryIcon';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/shared/ui/dialog';
import HistoricalBudgetChart from './HistoricalBudgetChart';

export default function BudgetStatusCard() {
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const budgetList = useFinanceStore((s) => s.budgetList);
    const activeMonth = useFinanceStore((s) => s.activeMonth);
    const cycleStartDay = useFinanceStore((s) => s.cycleStartDay);
    const tipeList = useFinanceStore((s) => s.tipeList);

    const [currentPage, setCurrentPage] = useState(1);
    const [selectedKategori, setSelectedKategori] = useState<{id: string, name: string} | null>(null);

    const budgetStatus = useMemo(
        () => hitungBudgetStatus(transaksiList, kategoriList, budgetList, activeMonth, tipeList, cycleStartDay),
        [transaksiList, kategoriList, budgetList, activeMonth, tipeList, cycleStartDay]
    );

    if (budgetStatus.length === 0) {
        return (
            <Card className="h-full border border-gray-100 shadow-sm bg-gray-50 rounded-3xl">
                <CardHeader className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-5">
                        <ShieldAlert size={28} className="text-gray-400" />
                    </div>
                    <CardTitle className="text-base font-semibold text-gray-800">
                        Status Anggaran
                    </CardTitle>
                    <CardDescription className="text-sm mt-2 text-gray-500">
                        Belum ada anggaran yang diatur untuk bulan ini.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const amanCount = budgetStatus.filter(b => b.status === 'aman').length;
    const peringatanCount = budgetStatus.filter(b => b.status === 'peringatan').length;
    const bahayaCount = budgetStatus.filter(b => b.status === 'bahaya').length;

    // Pagination Logic
    const itemsPerPage = 6;
    const totalPages = Math.ceil(budgetStatus.length / itemsPerPage);
    const paginatedStatus = budgetStatus.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
    const handleNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));

    return (
        <Dialog>
            <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col relative">
                <CardHeader className="pb-4 pt-6 sm:pt-8 px-6 sm:px-8">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <CardTitle className="text-base font-semibold text-gray-800">
                                    Anggaran Bulan Ini
                                </CardTitle>
                                <p className="text-xs text-gray-500 font-medium mt-1">Pemantauan Batas Pengeluaran</p>
                            </div>
                        </div>

                        {/* Summary Stats */}
                        <div className="flex items-center gap-2 sm:gap-3 text-xs font-medium bg-gray-50 py-2 px-3 rounded-xl border border-gray-100 flex-wrap">
                            <div className="flex items-center gap-1.5 px-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-gray-600">{amanCount} Aman</span>
                            </div>
                            <div className="w-px h-4 bg-gray-200 hidden sm:block"></div>
                            <div className="flex items-center gap-1.5 px-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                <span className="text-gray-600">{peringatanCount} Perhatian</span>
                            </div>
                            <div className="w-px h-4 bg-gray-200 hidden sm:block"></div>
                            <div className="flex items-center gap-1.5 px-2">
                                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                <span className={bahayaCount > 0 ? "text-rose-600 font-bold" : "text-gray-600"}>{bahayaCount} Over</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-2 pb-6 sm:pb-8 px-6 sm:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {paginatedStatus.map((bs) => (
                            <DialogTrigger 
                                key={bs.id_kategori} 
                                onClick={() => setSelectedKategori({ id: bs.id_kategori, name: bs.nama_kategori })}
                                className="group flex flex-col p-5 rounded-2xl border border-gray-100 bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-indigo-100 transition-all duration-300 text-left outline-none focus:ring-2 focus:ring-indigo-500/50"
                            >
                                <div className="flex items-center justify-between mb-4 w-full">
                                    <div className="flex items-center gap-3.5">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                            bs.status === 'aman' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100' :
                                                bs.status === 'peringatan' ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-100' : 'bg-rose-50 text-rose-600 group-hover:bg-rose-100'
                                        )}>
                                            <CategoryIcon 
                                                name={kategoriList.find(k => k.id_kategori === bs.id_kategori)?.icon_name || 'Circle'} 
                                                size={20} 
                                                strokeWidth={2.5} 
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-800 line-clamp-1">{bs.nama_kategori}</span>
                                            <span className={cn(
                                                "text-xs font-medium mt-0.5",
                                                bs.status === 'aman' ? 'text-emerald-500' :
                                                    bs.status === 'peringatan' ? 'text-amber-500' : 'text-rose-500'
                                            )}>
                                                {bs.persentase}% Terpakai
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-gray-300 group-hover:text-indigo-400 transition-colors">
                                        <Activity size={16} />
                                    </div>
                                </div>

                                <div className="space-y-3 w-full">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Pengeluaran</p>
                                            <p className="text-sm font-bold text-gray-800">{formatRupiah(bs.terpakai)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Batas</p>
                                            <p className="text-xs font-semibold text-gray-500">{formatRupiah(bs.batas)}</p>
                                        </div>
                                    </div>

                                    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-700 ease-out",
                                                bs.status === 'aman' ? 'bg-emerald-400' :
                                                    bs.status === 'peringatan' ? 'bg-amber-400' : 'bg-rose-400'
                                            )}
                                            style={{ width: `${Math.min(bs.persentase, 100)}%` }}
                                        />
                                    </div>
                                    <p className={cn(
                                        "text-[10px] font-medium leading-relaxed mt-2 line-clamp-1",
                                        bs.status === 'aman' ? "text-emerald-600" :
                                        bs.status === 'peringatan' ? "text-amber-600" : "text-rose-600"
                                    )}>
                                        {bs.status === 'aman' 
                                            ? `Tersisa ${formatRupiah(bs.batas - bs.terpakai)}`
                                            : bs.status === 'peringatan' 
                                            ? `Hati-hati, sisa ${formatRupiah(bs.batas - bs.terpakai)}`
                                            : `Over limit ${formatRupiah(bs.terpakai - bs.batas)}!`}
                                    </p>
                                </div>
                            </DialogTrigger>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-50">
                            <p className="text-xs font-medium text-gray-500">
                                Menampilkan {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, budgetStatus.length)} dari {budgetStatus.length}
                            </p>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button 
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <DialogContent className="sm:max-w-4xl min-h-[60vh] p-6 sm:p-8 rounded-3xl">
                <DialogHeader>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <Activity size={24} />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-semibold text-gray-800">Analisis Historis Anggaran</DialogTitle>
                            <p className="text-sm text-gray-500 font-medium mt-1">
                                Pantau riwayat kepatuhan anggaran Anda
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="mt-4 flex-1 flex flex-col gap-6">
                    <div className="flex-1 min-h-[400px] rounded-3xl border border-gray-100 bg-white shadow-sm flex flex-col overflow-hidden">
                        {selectedKategori && (
                            <HistoricalBudgetChart 
                                idKategori={selectedKategori.id}
                                namaKategori={selectedKategori.name}
                            />
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
