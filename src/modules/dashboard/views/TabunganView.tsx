'use client';

import React from 'react';
import SinkingFundsList from '@/modules/dashboard/components/SinkingFundsList';
import { PiggyBank, Plus } from 'lucide-react';

import { useFinanceStore } from '@/lib/store';

export default function TabunganView() {
    const setActiveModal = useFinanceStore((s) => s.setActiveModal);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-scandi shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                        <PiggyBank size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none">
                            Sinking Funds
                        </h2>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                            Virtual Sub-Ledger Tabungan
                        </p>
                    </div>
                </div>
                
                <button
                    className="flex text-xs items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer w-full sm:w-auto justify-center"
                    onClick={() => {
                        setActiveModal("tabungan");
                    }}
                >
                    <Plus size={16} strokeWidth={3} />
                    Buat Tujuan
                </button>
            </div>

            {/* Content Section */}
            <div className="pb-24">
                <SinkingFundsList />
            </div>
        </div>
    );
}
