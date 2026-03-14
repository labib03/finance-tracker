'use client';

import { useFinanceStore } from '@/lib/store';
import { formatRupiah, formatTanggalPendek } from '@/lib/utils';
import { CalendarClock, Pause, Play, Trash2, Calendar } from 'lucide-react';

export default function RecurringList() {
    const recurringList = useFinanceStore((s) => s.recurringList);
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
    const updateRecurring = useFinanceStore((s) => s.updateRecurring);
    const removeRecurring = useFinanceStore((s) => s.removeRecurring);

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
            <div className="space-y-4">
                {recurringList.map((r) => (
                    <div
                        key={r.id}
                        className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-blue-100 hover:shadow-sm transition-all"
                    >
                        <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${r.jenis === 'Pemasukan'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-orange-50 text-orange-600'
                                }`}
                        >
                            <CalendarClock size={24} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-bold truncate">
                                    {getKategoriName(r.id_kategori)}
                                </p>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${r.aktif ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {r.aktif ? 'Aktif' : 'Off'}
                                </span>
                            </div>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                {r.frekuensi} · {getSumberDanaName(r.id_sumber_dana)}
                                {r.catatan && ` · ${r.catatan}`}
                            </p>
                            <div className="flex items-center gap-1.5 mt-2">
                                <Calendar size={12} className="text-blue-500" />
                                <p className="text-[11px] font-semibold text-blue-600">
                                    Mendatang: {formatTanggalPendek(r.tanggal_berikutnya)}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                            <p
                                className={`text-sm font-black display-number ${r.jenis === 'Pemasukan' ? 'text-emerald-600' : 'text-orange-600'
                                    }`}
                            >
                                {formatRupiah(r.nominal)}
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => updateRecurring({ ...r, aktif: !r.aktif })}
                                    className={`p-2 rounded-lg transition-colors ${r.aktif
                                        ? 'text-gray-400 hover:bg-orange-50 hover:text-orange-600'
                                        : 'text-gray-400 hover:bg-emerald-50 hover:text-emerald-600'
                                        }`}
                                    title={r.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                                >
                                    {r.aktif ? <Pause size={16} /> : <Play size={16} />}
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('Hapus jadwal ini?')) {
                                            removeRecurring(r.id);
                                        }
                                    }}
                                    className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                    title="Hapus"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
