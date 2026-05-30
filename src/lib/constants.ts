export const TRANSACTION_TYPES = {
    INCOME: 'pemasukan',
    EXPENSE: 'pengeluaran',
    TRANSFER: 'transfer',
    SAVINGS: 'savings',
    UANG_TITIPAN_KELUAR: 'pengeluaran uang titipan',
    UANG_TITIPAN_MASUK: 'pemasukan uang titipan'
} as const;

export const CATEGORY_LABELS = {
    ALOKASI_TABUNGAN: 'alokasi tabungan',
    TARIK_TABUNGAN: 'tarik tabungan',
    EKSEKUSI_TABUNGAN: 'eksekusi tabungan',
    TRANSFER_SALDO: 'transfer saldo',
    BIAYA_ADMIN: 'biaya admin'
} as const;
