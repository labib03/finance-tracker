import { create } from "zustand";
import { toast } from "sonner";
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
  updateBudget as updateBudgetAction,
  hapusBudget,
  updateTransaksi as updateTransaksiAction,
  hapusTransaksi,
  tambahKategori,
  updateKategori as updateKategoriAction,
  hapusKategori,
  tambahSumberDana,
  updateSumberDana as updateSumberDanaAction,
  hapusSumberDana,
  updateRecurring as updateRecurringAction,
  hapusRecurring as hapusRecurringAction,
  prosesRecurring,
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
  cycleStartDay: number;

  // Actions - Data Fetching
  initialize: () => Promise<void>;
  refreshData: () => Promise<void>;
  refreshMasterData: () => Promise<void>;
  setActiveMonth: (month: string) => void;

  // Actions - Transactions (with Optimistic Updates)
  addTransaksi: (data: Omit<Transaksi, "id">) => Promise<void>;
  updateTransaksi: (data: Transaksi) => Promise<void>;
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
  updateRecurring: (data: RecurringTransaction) => Promise<void>;
  removeRecurring: (id: string) => Promise<void>;
  processRecurring: () => Promise<void>;

  // Actions - Budget
  addBudget: (data: Omit<Budget, "id_anggaran">) => Promise<void>;
  updateBudget: (data: Budget) => Promise<void>;
  removeBudget: (id: string) => Promise<void>;

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
  setCycleStartDay: (day: number) => void;
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
  cycleStartDay: 25, // Default
  activeMonth: "", 
  activeModal: null,

  // ======================== Data Fetching ========================

  initialize: async () => {
    if (get().isInitialized) return;

    // Load cycle start day from local storage
    let savedDay = 25;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cycle_start_day');
      if (stored) savedDay = parseInt(stored);
    }

    set({ 
      isLoading: true, 
      cycleStartDay: savedDay,
      activeMonth: getCurrentMonth(savedDay)
    });
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

      // Auto-process due recurring transactions
      await get().processRecurring();
    } catch (error) {
      console.error("Failed to initialize:", error);
      set({ isLoading: false, isInitialized: true });
      toast.error("Gagal memuat data. Silakan refresh halaman.");
    }
  },

  refreshData: async () => {
    try {
      const [transaksi, recurring, budgets, kategori, sumberDana] =
        await Promise.all([
          fetchTransaksi(),
          fetchRecurring(),
          fetchBudgets(),
          fetchKategori(),
          fetchSumberDana(),
        ]);

      set({
        transaksiList: transaksi,
        recurringList: recurring,
        budgetList: budgets,
        kategoriList: kategori,
        sumberDanaList: sumberDana,
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

    toast.success("Transaksi berhasil ditambahkan!");

    const success = await tambahTransaksi(newTransaksi);
    if (!success) {
      set((state) => ({
        transaksiList: state.transaksiList.filter((t) => t.id !== id),
      }));
      toast.error("Gagal menyimpan ke server. Transaksi dibatalkan.");
    }
  },

  updateTransaksi: async (data) => {
    const prev = get().transaksiList;
    set((state) => ({
      transaksiList: state.transaksiList.map((t) =>
        t.id === data.id ? data : t,
      ),
    }));

    toast.success("Transaksi diperbarui!");

    const success = await updateTransaksiAction(data);
    if (!success) {
      set({ transaksiList: prev });
      toast.error("Gagal memperbarui transaksi.");
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

    toast.success("Transfer berhasil!");

    const success = await tambahTransfer(transferTx);
    if (!success) {
      set((state) => ({
        transaksiList: state.transaksiList.filter((t) => t.id !== id),
      }));
      toast.error("Gagal menyimpan transfer ke server.");
    }
  },

  removeTransaksi: async (id) => {
    const prev = get().transaksiList;
    set((state) => ({
      transaksiList: state.transaksiList.filter((t) => t.id !== id),
    }));

    toast.info("Transaksi dihapus.");

    const success = await hapusTransaksi(id);
    if (!success) {
      set({ transaksiList: prev });
      toast.error("Gagal menghapus dari server.");
    }
  },

  addRecurring: async (data) => {
    const id = generateId();
    const newRecurring: RecurringTransaction = { ...data, id };

    set((state) => ({
      recurringList: [newRecurring, ...state.recurringList],
    }));

    toast.success("Transaksi berulang ditambahkan!");

    const success = await tambahRecurring(newRecurring);
    if (!success) {
      set((state) => ({
        recurringList: state.recurringList.filter((r) => r.id !== id),
      }));
      toast.error("Gagal menyimpan ke server.");
    }
  },

  updateRecurring: async (data) => {
    const prev = get().recurringList;
    set((state) => ({
      recurringList: state.recurringList.map((r) =>
        r.id === data.id ? data : r,
      ),
    }));

    const success = await updateRecurringAction(data);
    if (!success) {
      set({ recurringList: prev });
      toast.error("Gagal memperbarui transaksi berulang.");
    }
  },

  removeRecurring: async (id) => {
    const prev = get().recurringList;
    set((state) => ({
      recurringList: state.recurringList.filter((r) => r.id !== id),
    }));

    toast.info("Transaksi berulang dihapus.");

    const success = await hapusRecurringAction(id);
    if (!success) {
      set({ recurringList: prev });
      toast.error("Gagal menghapus dari server.");
    }
  },

  processRecurring: async () => {
    try {
      const success = await prosesRecurring();
      if (success) {
        // If something was processed, refresh only needed data
        const [transaksi, recurring] = await Promise.all([
          fetchTransaksi(),
          fetchRecurring(),
        ]);
        set({ transaksiList: transaksi, recurringList: recurring });
      }
    } catch (error) {
      console.error("Failed to process recurring:", error);
    }
  },

  addBudget: async (data) => {
    const id_anggaran = generateId();
    const newBudget: Budget = { ...data, id_anggaran };

    set((state) => ({
      budgetList: [newBudget, ...state.budgetList],
    }));

    toast.success("Anggaran berhasil ditambahkan!");

    const success = await tambahBudget(newBudget);
    if (!success) {
      set((state) => ({
        budgetList: state.budgetList.filter(
          (b) => b.id_anggaran !== id_anggaran,
        ),
      }));
      toast.error("Gagal menyimpan anggaran ke server.");
    }
  },

  updateBudget: async (data) => {
    const prev = get().budgetList;
    set((state) => ({
      budgetList: state.budgetList.map((b) =>
        b.id_anggaran === data.id_anggaran ? data : b,
      ),
    }));

    toast.success("Anggaran diperbarui!");

    const success = await updateBudgetAction(data);
    if (!success) {
      set({ budgetList: prev });
      toast.error("Gagal memperbarui anggaran.");
    }
  },

  removeBudget: async (id) => {
    const prev = get().budgetList;
    set((state) => ({
      budgetList: state.budgetList.filter((b) => b.id_anggaran !== id),
    }));

    toast.info("Anggaran dihapus.");

    const success = await hapusBudget(id);
    if (!success) {
      set({ budgetList: prev });
      toast.error("Gagal menghapus anggaran.");
    }
  },

  // ======================== Kategori CRUD ========================

  addKategori: async (data) => {
    set((state) => ({
      kategoriList: [...state.kategoriList, data],
    }));

    toast.success("Kategori berhasil ditambahkan!");

    const success = await tambahKategori(data);
    if (!success) {
      set((state) => ({
        kategoriList: state.kategoriList.filter(
          (k) => k.id_kategori !== data.id_kategori,
        ),
      }));
      toast.error("Gagal menyimpan kategori.");
    } else {
      // Refresh to ensure sync with server
      await get().refreshMasterData();
    }
  },

  updateKategori: async (data) => {
    const prev = get().kategoriList;
    set((state) => ({
      kategoriList: state.kategoriList.map((k) =>
        k.id_kategori === data.id_kategori ? data : k,
      ),
    }));

    toast.success("Kategori berhasil diperbarui!");

    const success = await updateKategoriAction(data);
    if (!success) {
      set({ kategoriList: prev });
      toast.error("Gagal memperbarui kategori.");
    } else {
      await get().refreshMasterData();
    }
  },

  removeKategori: async (id) => {
    const prev = get().kategoriList;
    set((state) => ({
      kategoriList: state.kategoriList.filter((k) => k.id_kategori !== id),
    }));

    toast.info("Kategori dihapus.");

    const success = await hapusKategori(id);
    if (!success) {
      set({ kategoriList: prev });
      toast.error("Gagal menghapus kategori.");
    } else {
      await get().refreshMasterData();
    }
  },

  // ======================== SumberDana CRUD ========================

  addSumberDana: async (data) => {
    set((state) => ({
      sumberDanaList: [...state.sumberDanaList, data],
    }));

    toast.success("Sumber dana berhasil ditambahkan!");

    const success = await tambahSumberDana(data);
    if (!success) {
      set((state) => ({
        sumberDanaList: state.sumberDanaList.filter(
          (s) => s.id_sumber_dana !== data.id_sumber_dana,
        ),
      }));
      toast.error("Gagal menyimpan sumber dana.");
    } else {
      await get().refreshMasterData();
    }
  },

  updateSumberDana: async (data) => {
    const prev = get().sumberDanaList;
    set((state) => ({
      sumberDanaList: state.sumberDanaList.map((s) =>
        s.id_sumber_dana === data.id_sumber_dana ? data : s,
      ),
    }));

    toast.success("Sumber dana berhasil diperbarui!");

    const success = await updateSumberDanaAction(data);
    if (!success) {
      set({ sumberDanaList: prev });
      toast.error("Gagal memperbarui sumber dana.");
    } else {
      await get().refreshMasterData();
    }
  },

  removeSumberDana: async (id) => {
    const prev = get().sumberDanaList;
    set((state) => ({
      sumberDanaList: state.sumberDanaList.filter(
        (s) => s.id_sumber_dana !== id,
      ),
    }));

    toast.info("Sumber dana dihapus.");

    const success = await hapusSumberDana(id);
    if (!success) {
      set({ sumberDanaList: prev });
      toast.error("Gagal menghapus sumber dana.");
    } else {
      await get().refreshMasterData();
    }
  },

  // ======================== UI State ========================

  setActiveModal: (modal) => set({ activeModal: modal }),

  setCycleStartDay: (day) => {
    set({ 
      cycleStartDay: day,
      activeMonth: getCurrentMonth(day) // Recalculate current month based on new cycle
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('cycle_start_day', day.toString());
    }
  },
}));
