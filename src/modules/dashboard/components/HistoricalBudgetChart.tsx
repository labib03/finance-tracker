'use client';

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/store';
import { formatRupiah, isInCustomMonth, getNamaBulan } from '@/lib/utils';
import { ComposedChart, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface HistoricalBudgetChartProps {
    idKategori: string;
    namaKategori: string;
}

export default function HistoricalBudgetChart({ idKategori, namaKategori }: HistoricalBudgetChartProps) {
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const budgetList = useFinanceStore((s) => s.budgetList);
    const activeMonth = useFinanceStore((s) => s.activeMonth); // YYYY-MM
    const cycleStartDay = useFinanceStore((s) => s.cycleStartDay);
    const tipeList = useFinanceStore((s) => s.tipeList);

    const chartData = useMemo(() => {
        const [year, month] = activeMonth.split("-").map(Number);
        const result = [];

        // Calculate for the last 6 months
        for (let i = 5; i >= 0; i--) {
            // JS Date trick to handle month subtraction correctly
            const d = new Date(year, month - 1 - i, 1);
            const targetYear = d.getFullYear();
            const targetMonth = d.getMonth() + 1;
            const bulanKey = `${targetYear}-${String(targetMonth).padStart(2, "0")}`;
            const label = getNamaBulan(bulanKey).split(' ')[0]; // Just the short month name

            // Get total limits for this category
            const limitsForMonth = budgetList.filter(b => b.bulan === targetMonth && b.tahun === targetYear && b.id_kategori === idKategori);
            const totalLimit = limitsForMonth.reduce((sum, b) => sum + b.nominal_limit, 0);

            // Get total spent
            const spentForMonth = transaksiList.filter(t => {
                const masterTipe = tipeList.find(tp => tp.id_tipe === t.jenis)?.master_tipe || 'pengeluaran';
                return masterTipe === 'pengeluaran' && isInCustomMonth(t.tanggal, bulanKey, cycleStartDay) && t.id_kategori === idKategori;
            });
            const totalSpent = spentForMonth.reduce((sum, t) => sum + t.nominal, 0);

            const hasBudget = totalLimit > 0;
            const isOverBudget = hasBudget && totalSpent > totalLimit;

            result.push({
                bulanKey,
                label,
                limit: hasBudget ? totalLimit : null, // null so area chart doesn't drop to 0 and look weird, or 0 if preferred. Using 0 for tooltip fallback but hidden in chart if possible.
                actualLimit: totalLimit,
                spent: totalSpent,
                hasBudget,
                isOverBudget,
                // Neutral gray if no budget, Red if over, Blue if safe
                barColor: !hasBudget ? '#94A3B8' : isOverBudget ? '#F43F5E' : '#3B82F6', 
            });
        }

        return result;
    }, [transaksiList, budgetList, activeMonth, cycleStartDay, tipeList, idKategori]);

    // Custom Tooltip to handle No Budget state gracefully
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-4 rounded-2xl border-none shadow-[0_10px_15px_-3px_rgb(0,0,0,0.1),0_4px_6px_-4px_rgb(0,0,0,0.1)]">
                    <p className="font-semibold text-gray-800 mb-2 pb-2 border-b border-gray-100">{label}</p>
                    <div className="space-y-1.5">
                        <p className="text-sm">
                            <span className="text-gray-500 font-medium inline-block w-24">Pengeluaran:</span>
                            <span className="font-bold text-gray-800">{formatRupiah(data.spent)}</span>
                        </p>
                        {data.hasBudget ? (
                            <p className="text-sm">
                                <span className="text-gray-500 font-medium inline-block w-24">Batas:</span>
                                <span className="font-semibold text-indigo-600">{formatRupiah(data.actualLimit)}</span>
                            </p>
                        ) : (
                            <p className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-lg mt-2 inline-block">
                                Belum ada anggaran diatur
                            </p>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-full flex flex-col p-6 sm:p-8 bg-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h4 className="text-base font-semibold text-gray-800">Performa Historis: <span className="text-indigo-600">{namaKategori}</span></h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-[250px]">Perbandingan pengeluaran aktual vs batas anggaran selama 6 bulan terakhir</p>
                </div>
            </div>

            <div className="flex-1 min-h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                        <XAxis 
                            dataKey="label" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 500 }}
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#9CA3AF' }}
                            tickFormatter={(value) => `${value / 1000}k`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F9FAFB' }} />
                        
                        <Area 
                            type="monotone" 
                            dataKey="limit" 
                            fill="#E0E7FF" 
                            stroke="#818CF8" 
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            name="Batas Anggaran"
                            fillOpacity={0.4}
                            connectNulls
                        />
                        <Bar 
                            dataKey="spent" 
                            name="Pengeluaran" 
                            radius={[6, 6, 0, 0]}
                            maxBarSize={40}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.barColor} />
                            ))}
                        </Bar>
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <div className="flex items-center gap-6 text-xs font-medium text-gray-500 justify-center mt-6 pt-4 border-t border-gray-50 flex-wrap">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-md" />
                    <span>Aman</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-rose-500 rounded-md" />
                    <span>Over Budget</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-400 rounded-md" />
                    <span>Tanpa Anggaran</span>
                </div>
                <div className="flex items-center gap-2 ml-2">
                    <div className="w-4 border-t-2 border-dashed border-indigo-400" />
                    <span>Batas</span>
                </div>
            </div>
        </div>
    );
}
