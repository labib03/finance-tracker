import { TRANSACTION_TYPES } from '@/lib/constants';
import { Transaksi, Kategori, TipeTransaksi } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { getRootLabel } from '@/lib/tipeUtils';

export interface DailyTransactionSummary {
  dateStr: string; // YYYY-MM-DD
  totalExpense: number;
  totalIncome: number;
  totalTransfer: number;
  categories: { id_kategori: string; nama_kategori: string; icon_name: string; tipe: string }[];
  transactions: Transaksi[];
}

/**
 * Transforms raw transaction data into daily aggregated transactions.
 * It groups 'Pengeluaran', 'Pemasukan', and 'Transfer' by date, 
 * and computes totals and distinct categories for that day.
 * 
 * @param transactions Array of raw transactions
 * @param categories Array of master categories for icon/name lookup
 * @returns Map of Date string (YYYY-MM-DD) to DailyTransactionSummary
 */
export function aggregateTransactionsByDay(
  transactions: Transaksi[],
  categories: Kategori[],
  tipes: TipeTransaksi[]
): Record<string, DailyTransactionSummary> {
  const aggregated: Record<string, DailyTransactionSummary> = {};

  // valid transactions are those whose jenis maps to a valid master_tipe, plus 'Transfer' 
  // (Wait, 'Transfer' could also be a tipe or master_tipe, but for now we leave it as is if it's hardcoded elsewhere, or we check if master_tipe === TRANSACTION_TYPES.TRANSFER)
  // We can just iterate all and lookup master_tipe.

  transactions.forEach(t => {
    const dateStr = t.tanggal;
    
    if (!aggregated[dateStr]) {
      aggregated[dateStr] = {
        dateStr,
        totalExpense: 0,
        totalIncome: 0,
        totalTransfer: 0,
        categories: [],
        transactions: []
      };
    }

    const rootLabel = getRootLabel(tipes, t.jenis).toLowerCase();

    if (rootLabel.includes(TRANSACTION_TYPES.EXPENSE)) {
      aggregated[dateStr].totalExpense += t.nominal;
    } else if (rootLabel.includes(TRANSACTION_TYPES.INCOME)) {
      aggregated[dateStr].totalIncome += t.nominal;
    } else if (rootLabel.includes(TRANSACTION_TYPES.TRANSFER) || t.jenis.toLowerCase() === TRANSACTION_TYPES.TRANSFER || rootLabel.includes(TRANSACTION_TYPES.SAVINGS)) {
       // Since savings might just be transfer or separate
       // If it's savings or transfer, let's just group them in totalTransfer for now or if we need we can expand.
       // Keep transfer as is
       aggregated[dateStr].totalTransfer += t.nominal;
    }

    aggregated[dateStr].transactions.push(t);

    const isTransferOrSavings = rootLabel.includes(TRANSACTION_TYPES.TRANSFER) || rootLabel.includes(TRANSACTION_TYPES.SAVINGS) || t.jenis.toLowerCase() === TRANSACTION_TYPES.TRANSFER;
    if (!isTransferOrSavings) {
      const hasCategory = aggregated[dateStr].categories.find(c => c.id_kategori === t.id_kategori);
      if (!hasCategory) {
        const catMaster = categories.find(c => c.id_kategori === t.id_kategori);
        if (catMaster) {
          aggregated[dateStr].categories.push({
            id_kategori: catMaster.id_kategori,
            nama_kategori: catMaster.nama_kategori,
            icon_name: catMaster.icon_name,
            tipe: catMaster.tipe
          });
        }
      }
    }
  });

  return aggregated;
}
