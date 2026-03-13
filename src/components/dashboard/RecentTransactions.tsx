'use client';

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/store';
import { formatRupiah, formatTanggalPendek } from '@/lib/utils';
import {
    ArrowUpRight,
    ArrowDownRight,
    ArrowLeftRight,
    Trash2,
} from 'lucide-react';

interface RecentTransactionsProps {
    limit?: number;
    showDelete?: boolean;
}

export default function RecentTransactions({
    limit = 8,
    showDelete = false,
}: RecentTransactionsProps) {
    const transaksiList = useFinanceStore((s) => s.transaksiList);
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
    const activeMonth = useFinanceStore((s) => s.activeMonth);
    const removeTransaksi = useFinanceStore((s) => s.removeTransaksi);

    const filteredTransaksi = useMemo(() => {
        return transaksiList
            .filter((t) => t.tanggal.startsWith(activeMonth))
            .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
            .slice(0, limit);
    }, [transaksiList, activeMonth, limit]);

    const getKategoriName = (id: string) =>
        kategoriList.find((k) => k.id_kategori === id)?.nama_kategori || 'Transfer';

    const getSumberDanaName = (id: string) =>
        sumberDanaList.find((s) => s.id_sumber_dana === id)?.nama_sumber || '-';

    if (filteredTransaksi.length === 0) {
        return (
            <div className="card">
                <h3
                    className="text-sm font-bold mb-4 uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                >
                    Transaksi Terbaru
                </h3>
                <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>
                    Belum ada transaksi bulan ini
                </p>
            </div>
        );
    }

    return (
        <div className="card">
            <h3
                className="text-sm font-bold mb-2 uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
            >
                Transaksi Terbaru
            </h3>

            <div>
                {filteredTransaksi.map((t) => {
                    const isIncome = t.jenis === 'Pemasukan';
                    const isTransfer = t.jenis === 'Transfer';

                    return (
                        <div key={t.id} className="flex items-center gap-4 py-4 px-2 hover:bg-gray-50/60 rounded-2xl transition-all duration-200 group border-b border-gray-100 last:border-0 last:pb-0">
                            {/* Icon */}
                            <div
                                className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center ${isTransfer
                                    ? 'bg-violet-50 text-violet-600'
                                    : isIncome
                                        ? 'bg-emerald-50 text-emerald-600'
                                        : 'bg-red-50 text-red-600'
                                    }`}
                            >
                                {isTransfer ? (
                                    <ArrowLeftRight size={20} />
                                ) : isIncome ? (
                                    <ArrowUpRight size={20} />
                                ) : (
                                    <ArrowDownRight size={20} />
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">
                                    {getKategoriName(t.id_kategori)}
                                </p>
                                <p
                                    className="text-xs truncate"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    {getSumberDanaName(t.id_sumber_dana)}
                                    {isTransfer &&
                                        t.id_sumber_dana_tujuan &&
                                        ` → ${getSumberDanaName(t.id_sumber_dana_tujuan)}`}
                                    {t.catatan && ` · ${t.catatan}`}
                                </p>
                            </div>

                            {/* Amount & Date */}
                            <div className="text-right shrink-0">
                                <p
                                    className={`text-sm font-bold display-number ${isTransfer
                                        ? 'text-violet-600'
                                        : isIncome
                                            ? 'text-emerald-600'
                                            : 'text-orange-600'
                                        }`}
                                >
                                    {isIncome ? '+' : isTransfer ? '' : '-'}
                                    {formatRupiah(t.nominal)}
                                </p>
                                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                                    {formatTanggalPendek(t.tanggal)}
                                </p>
                            </div>

                            {/* Delete button */}
                            {showDelete && (
                                <button
                                    onClick={() => removeTransaksi(t.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 ml-1"
                                    aria-label="Hapus transaksi"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
