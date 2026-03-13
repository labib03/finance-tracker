'use client';

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/store';
import { hitungBudgetStatus, formatRupiah } from '@/lib/utils';
import { AlertTriangle, CheckCircle, XCircle, ShieldAlert } from 'lucide-react';

export default function BudgetStatus() {
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const budgetList = useFinanceStore((s) => s.budgetList);
    const activeMonth = useFinanceStore((s) => s.activeMonth);

    const budgetStatus = useMemo(
        () => hitungBudgetStatus(transaksiList, kategoriList, budgetList, activeMonth),
        [transaksiList, kategoriList, budgetList, activeMonth]
    );

    if (budgetStatus.length === 0) {
        return (
            <div className="card">
                <div className="flex items-center gap-2 mb-4">
                    <ShieldAlert size={18} style={{ color: 'var(--text-muted)' }} />
                    <h3
                        className="text-sm font-bold uppercase tracking-wider"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Status Anggaran
                    </h3>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Belum ada anggaran yang diatur untuk bulan ini.
                </p>
            </div>
        );
    }

    const statusIcon = {
        aman: <CheckCircle size={16} className="text-emerald-500" />,
        peringatan: <AlertTriangle size={16} className="text-amber-500" />,
        bahaya: <XCircle size={16} className="text-red-500" />,
    };

    return (
        <div className="card">
            <div className="flex items-center gap-2 mb-5">
                <ShieldAlert size={18} style={{ color: 'var(--text-muted)' }} />
                <h3
                    className="text-sm font-bold uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                >
                    Status Anggaran
                </h3>
            </div>

            <div className="space-y-5">
                {budgetStatus.map((bs) => (
                    <div key={bs.id_kategori}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                {statusIcon[bs.status]}
                                <span className="text-sm font-semibold">{bs.nama_kategori}</span>
                            </div>
                            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                                {formatRupiah(bs.terpakai)} / {formatRupiah(bs.batas)}
                            </span>
                        </div>

                        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mt-2">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ease-out ${bs.status === 'aman' ? 'bg-emerald-500' :
                                        bs.status === 'peringatan' ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                style={{ width: `${Math.min(bs.persentase, 100)}%` }}
                            />
                        </div>

                        {bs.status === 'peringatan' && (
                            <p className="text-xs mt-1.5 text-amber-600 font-medium">
                                ⚠️ Sudah {bs.persentase}% dari anggaran!
                            </p>
                        )}
                        {bs.status === 'bahaya' && (
                            <p className="text-xs mt-1.5 text-red-600 font-medium">
                                🚨 Anggaran telah terlampaui! ({bs.persentase}%)
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
