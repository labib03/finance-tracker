'use client';

import { useState } from 'react';
import { useFinanceStore } from '@/lib/store';
import { Edit2, Trash2, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { Kategori } from '@/lib/types';

interface KategoriManagementProps {
    onAdd: () => void;
    onEdit: (kategori: Kategori) => void;
}

export default function KategoriManagement({ onAdd, onEdit }: KategoriManagementProps) {
    const kategoriList = useFinanceStore((s) => s.kategoriList);
    const removeKategori = useFinanceStore((s) => s.removeKategori);

    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string, nama: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus kategori "${nama}"? Data transaksi yang menggunakan kategori ini mungkin akan terpengaruh.`)) {
            setDeletingId(id);
            await removeKategori(id);
            setDeletingId(null);
        }
    };

    return (
        <div className="card">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                    <h3 className="text-xl font-bold tracking-tight">Manajemen Kategori</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Kelola kategori pemasukan dan pengeluaran Anda
                    </p>
                </div>
                <button onClick={onAdd} className="btn-primary shrink-0">
                    <Plus size={18} />
                    Tambah Kategori
                </button>
            </div>

            {kategoriList.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-500">Belum ada data kategori.</p>
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
                                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider">Nama Kategori</th>
                                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider">Tipe</th>
                                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider w-24 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {kategoriList.map((k, index) => (
                                <tr
                                    key={k.id_kategori}
                                    className="border-b transition-colors hover:bg-gray-50/50"
                                    style={{
                                        borderColor: 'var(--border-light)',
                                        animationDelay: `${index * 50}ms`,
                                    }}
                                >
                                    <td className="py-4 px-4 font-medium">{k.nama_kategori}</td>
                                    <td className="py-4 px-4">
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${k.tipe === 'Pemasukan'
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                                                    : 'bg-red-50 text-red-700 border border-red-200/50'
                                                }`}
                                        >
                                            {k.tipe === 'Pemasukan' ? (
                                                <ArrowUpRight strokeWidth={2.5} size={12} />
                                            ) : (
                                                <ArrowDownRight strokeWidth={2.5} size={12} />
                                            )}
                                            {k.tipe}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => onEdit(k)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit Kategori"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(k.id_kategori, k.nama_kategori)}
                                                disabled={deletingId === k.id_kategori}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Hapus Kategori"
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
