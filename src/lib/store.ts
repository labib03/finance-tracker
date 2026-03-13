// ============================================================
// Zustand Store - Global State Management
// Handles caching, optimistic updates, and UI state
// ============================================================

import { create } from "zustand";
import type {
  Transaksi,
  Kategori,
  SumberDana,
  RecurringTransaction,
  Budget,
} from "@/lib/types";
import {
  fetchKategori,
  fetchSumberDana,
  fetchTransaksi,
  fetchRecurring,
  fetchBudgets,
  tambahTransaksi,
  tambahTransfer,
  tambahRecurring,
  tambahBudget,
  hapusTransaksi,
  tambahKategori,
  updateKategori as updateKategoriAction,
  hapusKategori,
  tambahSumberDana,
  updateSumberDana as updateSumberDanaAction,
  hapusSumberDana,
} from "@/lib/actions";
import { getCurrentMonth, generateId } from "@/lib/utils";

// ---------- Store Types ----------
interface FinanceState {
  // Data
  kategoriList: Kategori[];
  sumberDanaList: SumberDana[];
  transaksiList: Transaksi[];
  recurringList: RecurringTransaction[];
  budgetList: Budget[];

  // UI State
  isLoading: boolean;
  isInitialized: boolean;
  activeMonth: string;
  activeModal: string | null;
  toasts: Toast[];

  // Actions - Data Fetching
  initialize: () => Promise<void>;
  refreshData: () => Promise<void>;
  refreshMasterData: () => Promise<void>;
  setActiveMonth: (month: string) => void;

  // Actions - Transactions (with Optimistic Updates)
  addTransaksi: (data: Omit<Transaksi, "id">) => Promise<void>;
  addTransfer: (
    id_sumber_dana_asal: string,
    id_sumber_dana_tujuan: string,
    nominal: number,
    catatan: string,
    tanggal: string,
  ) => Promise<void>;
  removeTransaksi: (id: string) => Promise<void>;

  // Actions - Recurring
  addRecurring: (data: Omit<RecurringTransaction, "id">) => Promise<void>;

  // Actions - Budget
  addBudget: (data: Omit<Budget, "id_anggaran">) => Promise<void>;

  // Actions - Kategori CRUD
  addKategori: (data: Kategori) => Promise<void>;
  updateKategori: (data: Kategori) => Promise<void>;
  removeKategori: (id: string) => Promise<void>;

  // Actions - SumberDana CRUD
  addSumberDana: (data: SumberDana) => Promise<void>;
  updateSumberDana: (data: SumberDana) => Promise<void>;
  removeSumberDana: (id: string) => Promise<void>;

  // Actions - UI
  setActiveModal: (modal: string | null) => void;
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

// ---------- Create Store ----------
export const useFinanceStore = create<FinanceState>((set, get) => ({
  // Initial State
  kategoriList: [],
  sumberDanaList: [],
  transaksiList: [],
  recurringList: [],
  budgetList: [],
  isLoading: true,
  isInitialized: false,
  activeMonth: getCurrentMonth(),
  activeModal: null,
  toasts: [],

  // ======================== Data Fetching ========================

  initialize: async () => {
    if (get().isInitialized) return;

    set({ isLoading: true });
    try {
      const [kategori, sumberDana, transaksi, recurring, budgets] =
        await Promise.all([
          fetchKategori(),
          fetchSumberDana(),
          fetchTransaksi(),
          fetchRecurring(),
          fetchBudgets(),
        ]);

      set({
        kategoriList: kategori,
        sumberDanaList: sumberDana,
        transaksiList: transaksi,
        recurringList: recurring,
        budgetList: budgets,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      console.error("Failed to initialize:", error);
      set({ isLoading: false, isInitialized: true });
      get().addToast({
        type: "error",
        message: "Gagal memuat data. Silakan refresh halaman.",
      });
    }
  },

  refreshData: async () => {
    try {
      const [transaksi, recurring, budgets] = await Promise.all([
        fetchTransaksi(),
        fetchRecurring(),
        fetchBudgets(),
      ]);

      set({
        transaksiList: transaksi,
        recurringList: recurring,
        budgetList: budgets,
      });
    } catch (error) {
      console.error("Failed to refresh:", error);
    }
  },

  refreshMasterData: async () => {
    try {
      const [kategori, sumberDana] = await Promise.all([
        fetchKategori(),
        fetchSumberDana(),
      ]);
      set({ kategoriList: kategori, sumberDanaList: sumberDana });
    } catch (error) {
      console.error("Failed to refresh master data:", error);
    }
  },

  setActiveMonth: (month) => set({ activeMonth: month }),

  // ======================== Optimistic Updates ========================

  addTransaksi: async (data) => {
    const id = generateId();
    const newTransaksi: Transaksi = { ...data, id };

    set((state) => ({
      transaksiList: [newTransaksi, ...state.transaksiList],
    }));

    get().addToast({
      type: "success",
      message: "Transaksi berhasil ditambahkan!",
    });

    const success = await tambahTransaksi(newTransaksi);
    if (!success) {
      set((state) => ({
        transaksiList: state.transaksiList.filter((t) => t.id !== id),
      }));
      get().addToast({
        type: "error",
        message: "Gagal menyimpan ke server. Transaksi dibatalkan.",
      });
    }
  },

  addTransfer: async (
    id_sumber_dana_asal,
    id_sumber_dana_tujuan,
    nominal,
    catatan,
    tanggal,
  ) => {
    const id = generateId();
    const transferTx: Transaksi = {
      id,
      tanggal,
      jenis: "Transfer",
      id_sumber_dana: id_sumber_dana_asal,
      id_sumber_dana_tujuan,
      id_kategori: "TRANSFER",
      nominal,
      catatan,
    };

    set((state) => ({
      transaksiList: [transferTx, ...state.transaksiList],
    }));

    get().addToast({ type: "success", message: "Transfer berhasil!" });

    const success = await tambahTransfer(transferTx);
    if (!success) {
      set((state) => ({
        transaksiList: state.transaksiList.filter((t) => t.id !== id),
      }));
      get().addToast({
        type: "error",
        message: "Gagal menyimpan transfer ke server.",
      });
    }
  },

  removeTransaksi: async (id) => {
    const prev = get().transaksiList;
    set((state) => ({
      transaksiList: state.transaksiList.filter((t) => t.id !== id),
    }));

    get().addToast({ type: "info", message: "Transaksi dihapus." });

    const success = await hapusTransaksi(id);
    if (!success) {
      set({ transaksiList: prev });
      get().addToast({
        type: "error",
        message: "Gagal menghapus dari server.",
      });
    }
  },

  addRecurring: async (data) => {
    const id = generateId();
    const newRecurring: RecurringTransaction = { ...data, id };

    set((state) => ({
      recurringList: [newRecurring, ...state.recurringList],
    }));

    get().addToast({
      type: "success",
      message: "Transaksi berulang ditambahkan!",
    });

    const success = await tambahRecurring(newRecurring);
    if (!success) {
      set((state) => ({
        recurringList: state.recurringList.filter((r) => r.id !== id),
      }));
      get().addToast({
        type: "error",
        message: "Gagal menyimpan ke server.",
      });
    }
  },

  addBudget: async (data) => {
    const id_anggaran = generateId();
    const newBudget: Budget = { ...data, id_anggaran };

    set((state) => ({
      budgetList: [newBudget, ...state.budgetList],
    }));

    get().addToast({
      type: "success",
      message: "Anggaran berhasil ditambahkan!",
    });

    const success = await tambahBudget(newBudget);
    if (!success) {
      set((state) => ({
        budgetList: state.budgetList.filter(
          (b) => b.id_anggaran !== id_anggaran,
        ),
      }));
      get().addToast({
        type: "error",
        message: "Gagal menyimpan anggaran ke server.",
      });
    }
  },

  // ======================== Kategori CRUD ========================

  addKategori: async (data) => {
    set((state) => ({
      kategoriList: [...state.kategoriList, data],
    }));

    get().addToast({
      type: "success",
      message: "Kategori berhasil ditambahkan!",
    });

    const success = await tambahKategori(data);
    if (!success) {
      set((state) => ({
        kategoriList: state.kategoriList.filter(
          (k) => k.id_kategori !== data.id_kategori,
        ),
      }));
      get().addToast({ type: "error", message: "Gagal menyimpan kategori." });
    }
  },

  updateKategori: async (data) => {
    const prev = get().kategoriList;
    set((state) => ({
      kategoriList: state.kategoriList.map((k) =>
        k.id_kategori === data.id_kategori ? data : k,
      ),
    }));

    get().addToast({
      type: "success",
      message: "Kategori berhasil diperbarui!",
    });

    const success = await updateKategoriAction(data);
    if (!success) {
      set({ kategoriList: prev });
      get().addToast({ type: "error", message: "Gagal memperbarui kategori." });
    }
  },

  removeKategori: async (id) => {
    const prev = get().kategoriList;
    set((state) => ({
      kategoriList: state.kategoriList.filter((k) => k.id_kategori !== id),
    }));

    get().addToast({ type: "info", message: "Kategori dihapus." });

    const success = await hapusKategori(id);
    if (!success) {
      set({ kategoriList: prev });
      get().addToast({ type: "error", message: "Gagal menghapus kategori." });
    }
  },

  // ======================== SumberDana CRUD ========================

  addSumberDana: async (data) => {
    set((state) => ({
      sumberDanaList: [...state.sumberDanaList, data],
    }));

    get().addToast({
      type: "success",
      message: "Sumber dana berhasil ditambahkan!",
    });

    const success = await tambahSumberDana(data);
    if (!success) {
      set((state) => ({
        sumberDanaList: state.sumberDanaList.filter(
          (s) => s.id_sumber_dana !== data.id_sumber_dana,
        ),
      }));
      get().addToast({
        type: "error",
        message: "Gagal menyimpan sumber dana.",
      });
    }
  },

  updateSumberDana: async (data) => {
    const prev = get().sumberDanaList;
    set((state) => ({
      sumberDanaList: state.sumberDanaList.map((s) =>
        s.id_sumber_dana === data.id_sumber_dana ? data : s,
      ),
    }));

    get().addToast({
      type: "success",
      message: "Sumber dana berhasil diperbarui!",
    });

    const success = await updateSumberDanaAction(data);
    if (!success) {
      set({ sumberDanaList: prev });
      get().addToast({
        type: "error",
        message: "Gagal memperbarui sumber dana.",
      });
    }
  },

  removeSumberDana: async (id) => {
    const prev = get().sumberDanaList;
    set((state) => ({
      sumberDanaList: state.sumberDanaList.filter(
        (s) => s.id_sumber_dana !== id,
      ),
    }));

    get().addToast({ type: "info", message: "Sumber dana dihapus." });

    const success = await hapusSumberDana(id);
    if (!success) {
      set({ sumberDanaList: prev });
      get().addToast({
        type: "error",
        message: "Gagal menghapus sumber dana.",
      });
    }
  },

  // ======================== UI State ========================

  setActiveModal: (modal) => set({ activeModal: modal }),

  addToast: (toast) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
