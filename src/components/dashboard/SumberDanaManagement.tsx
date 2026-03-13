'use client';

import { useState } from 'react';
import { useFinanceStore } from '@/lib/store';
import { Edit2, Trash2, Plus, Wallet } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import type { SumberDana } from '@/lib/types';

interface SumberDanaManagementProps {
    onAdd: () => void;
    onEdit: (sumberDana: SumberDana) => void;
}

export default function SumberDanaManagement({ onAdd, onEdit }: SumberDanaManagementProps) {
    const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
    const removeSumberDana = useFinanceStore((s) => s.removeSumberDana);

    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string, nama: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus sumber dana "${nama}"? Data transaksi yang menggunakan sumber dana ini mungkin akan terpengaruh.`)) {
            setDeletingId(id);
            await removeSumberDana(id);
            setDeletingId(null);
        }
    };

    return (
        <div className="card">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                    <h3 className="text-xl font-bold tracking-tight">Manajemen Sumber Dana</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Kelola akun, dompet digital, dan rekening Anda
                    </p>
                </div>
                <button onClick={onAdd} className="btn-primary shrink-0 transition-transform active:scale-95">
                    <Plus size={18} />
                    Tambah Sumber Dana
                </button>
            </div>

            {sumberDanaList.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-500">Belum ada data sumber dana.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr
                                className="border-b"
                                style={{
                                    borderColor: 'var(--border-light)',
                                    color: 'var(--text-muted)',
                                }}
                            >
                                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider">Nama Akun/Sumber</th>
                                <th className="py-3 px-4 text-xs font-bold text-right uppercase tracking-wider">Saldo Awal</th>
                                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider w-24 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sumberDanaList.map((s, index) => (
                                <tr
                                    key={s.id_sumber_dana}
                                    className="border-b transition-colors hover:bg-gray-50/50"
                                    style={{
                                        borderColor: 'var(--border-light)',
                                        animationDelay: `${index * 50}ms`,
                                    }}
                                >
                                    <td className="py-4 px-4 font-medium flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                            <Wallet size={16} />
                                        </div>
                                        {s.nama_sumber}
                                    </td>
                                    <td className="py-4 px-4 text-right display-number font-medium">
                                        {formatRupiah(s.saldo_awal)}
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => onEdit(s)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit Sumber Dana"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(s.id_sumber_dana, s.nama_sumber)}
                                                disabled={deletingId === s.id_sumber_dana}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Hapus Sumber Dana"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
