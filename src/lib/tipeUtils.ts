import type { TipeTransaksi } from './types';
import { TRANSACTION_TYPES } from './constants';

/**
 * Gets the root (master) TipeTransaksi for a given id_tipe.
 * Since the user requested 1 level of hierarchy, we only check if the current tipe has a master_tipe,
 * and if so, we find that parent. If not, the current tipe IS the root.
 */
export function getRootTipe(tipeList: TipeTransaksi[], id_tipe: string): TipeTransaksi | undefined {
    const tipe = tipeList.find(t => t.id_tipe === id_tipe);
    if (!tipe) return undefined;

    // If it has no master_tipe, it is the root.
    if (!tipe.master_tipe) return tipe;

    // 1-level lookup: find the parent by id_tipe
    const parent = tipeList.find(t => t.id_tipe === tipe.master_tipe);
    return parent || tipe; // fallback to self if parent not found
}

/**
 * Gets the lowercase label of the root TipeTransaksi.
 * This is used for styling and logic checks (e.g., 'pengeluaran', 'pemasukan').
 */
export function getRootLabel(tipeList: TipeTransaksi[], id_tipe: string): string {
    const root = getRootTipe(tipeList, id_tipe);
    return root ? root.label.toLowerCase() : (id_tipe || '').toLowerCase(); // Fallback to id_tipe for legacy types
}

export function isExpense(tipeList: TipeTransaksi[], id_tipe: string): boolean {
    return getRootLabel(tipeList, id_tipe).includes(TRANSACTION_TYPES.EXPENSE);
}

export function isIncome(tipeList: TipeTransaksi[], id_tipe: string): boolean {
    return getRootLabel(tipeList, id_tipe).includes(TRANSACTION_TYPES.INCOME);
}

export function isTransfer(tipeList: TipeTransaksi[], id_tipe: string): boolean {
    return getRootLabel(tipeList, id_tipe).includes(TRANSACTION_TYPES.TRANSFER);
}

export function isSavings(tipeList: TipeTransaksi[], id_tipe: string): boolean {
    return getRootLabel(tipeList, id_tipe).includes(TRANSACTION_TYPES.SAVINGS);
}

