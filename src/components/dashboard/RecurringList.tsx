'use client';

import { useFinanceStore } from '@/lib/store';
import { formatRupiah } from '@/lib/utils';
import { CalendarClock, Pause, Play, Trash2 } from 'lucide-react';

export default function RecurringList() {
    const recurringList = useFinanceStore((s) => s.recurringList);
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);

    const getKategoriName = (id: string) =>
        kategoriList.find((k) => k.id_kategori === id)?.nama_kategori || '-';

    const getSumberDanaName = (id: string) =>
        sumberDanaList.find((s) => s.id_sumber_dana === id)?.nama_sumber || '-';

    if (recurringList.length === 0) {
        return (
            <div className="card">
                <div className="flex flex-col items-center justify-center py-12">
                    <CalendarClock size={48} className="text-gray-200 mb-4" />
                    <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                        Belum ada transaksi berulang
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Buat jadwal untuk tagihan & pemasukan rutin
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="space-y-1">
                {recurringList.map((r) => (
                    <div
                        key={r.id}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.jenis === 'Pemasukan'
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : 'bg-orange-50 text-orange-600'
                                }`}
                        >
                            <CalendarClock size={20} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">
                                {getKategoriName(r.id_kategori)}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {r.frekuensi} · {getSumberDanaName(r.id_sumber_dana)}
                                {r.catatan && ` · ${r.catatan}`}
                            </p>
                        </div>

                        <div className="text-right">
                            <p
                                className={`text-sm font-bold display-number ${r.jenis === 'Pemasukan' ? 'text-emerald-600' : 'text-orange-600'
                                    }`}
                            >
                                {formatRupiah(r.nominal)}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                                <span
                                    className={`inline-block w-2 h-2 rounded-full ${r.aktif ? 'bg-emerald-500' : 'bg-gray-300'
                                        }`}
                                />
                                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                                    {r.aktif ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
