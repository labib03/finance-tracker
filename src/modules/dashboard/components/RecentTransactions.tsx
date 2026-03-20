'use client';

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/store';
import { formatRupiah, formatTanggalPendek } from '@/lib/utils';
import {
    ArrowUpRight,
    ArrowDownRight,
    ArrowLeftRight,
    Trash2,
    UserCircle2,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

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
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        Transaksi Terbaru
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm py-8 text-center text-muted-foreground">
                        Belum ada transaksi bulan ini
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-sm h-full">
            <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Transaksi Terbaru
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    {filteredTransaksi.map((t) => {
                        const isIncome = t.jenis === 'Pemasukan';
                        const isTransfer = t.jenis === 'Transfer';

                        return (
                            <div key={t.id} className="flex items-center gap-4 py-4 px-2 hover:bg-muted/50 rounded-2xl transition-all duration-200 group">
                                {/* Icon */}
                                <div
                                    className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center ${isTransfer
                                        ? 'bg-indigo-50 text-indigo-600'
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
                                    <p className="text-sm font-semibold truncate text-foreground">
                                        {t.label || (isTransfer ? 'Transfer Saldo' : getKategoriName(t.id_kategori))}
                                    </p>
                                    <p className="text-xs truncate text-muted-foreground">
                                        {getSumberDanaName(t.id_sumber_dana)}
                                        {isTransfer &&
                                            t.id_target_dana &&
                                            ` → ${getSumberDanaName(t.id_target_dana)}`}
                                        {t.catatan && ` · ${t.catatan}`}
                                        {t.is_titipan && (
                                            <span className="inline-flex items-center gap-1 ml-2 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black uppercase tracking-tighter">
                                                <UserCircle2 size={10} strokeWidth={3} /> Titipan
                                            </span>
                                        )}
                                    </p>
                                </div>

                                {/* Amount & Date */}
                                <div className="text-right shrink-0">
                                    <p
                                        className={`text-sm font-bold display-number ${isTransfer
                                            ? 'text-indigo-600'
                                            : isIncome
                                                ? 'text-emerald-600'
                                                : 'text-orange-600'
                                            }`}
                                    >
                                        {isIncome ? '+' : isTransfer ? '' : '-'}
                                        {formatRupiah(t.nominal)}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        {formatTanggalPendek(t.tanggal)}
                                    </p>
                                </div>

                                {/* Delete button */}
                                {showDelete && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeTransaksi(t.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 ml-1"
                                        aria-label="Hapus transaksi"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
