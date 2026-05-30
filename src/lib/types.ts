// ============================================================
// Finance Tracker - Core Type Definitions
// Maps to Google Sheets "database" structure
// ============================================================

// ---------- Master_Tipe Sheet ----------
export interface TipeTransaksi {
  id_tipe: string;
  label: string;
  master_tipe: string | null; // e.g., 'Pengeluaran', 'Pemasukan', 'Savings', 'Transfer' or another id_tipe
  tanggal_dibuat: string;
}

// ---------- Master_Kategori Sheet ----------
export interface Kategori {
  id_kategori: string;
  nama_kategori: string;
  tipe: string; // Maps to TipeTransaksi.id_tipe
  icon_name: string;
}

// ---------- Master_Titipan Sheet ----------
export interface Titipan {
  id_titipan: string;
  nama_konteks: string;
  tanggal_dibuat: string; // YYYY-MM-DD
  status: "aktif" | "selesai";
}

// ---------- Master_Tabungan Sheet ----------
export interface Tabungan {
  id_tabungan: string;
  nama_tujuan: string;
  target_nominal: number;
  tanggal_target: string;
  icon: string;
  status: "aktif" | "tercapai";
  tanggal_dibuat: string;
}

// ---------- Master_Sumber_Dana Sheet ----------
export interface SumberDana {
  id_sumber_dana: string;
  nama_sumber: string;
  saldo_awal: number;
}

// ---------- Transaksi Sheet ----------
export interface Transaksi {
  id: string;
  tanggal: string; // ISO date string YYYY-MM-DD
  jenis: string; // Maps to TipeTransaksi.id_tipe
  id_sumber_dana: string;
  id_kategori: string;
  nominal: number;
  label: string;
  catatan: string;
  // Transfer fields (optional)
  id_target_dana?: string;
  is_titipan?: string | null;
  id_tabungan?: string | null;
}

// ---------- Recurring Transaction ----------
export interface RecurringTransaction {
  id: string;
  id_kategori: string;
  id_sumber_dana: string;
  jenis: string; // Maps to TipeTransaksi.id_tipe
  nominal: number;
  label: string;
  catatan: string;
  frekuensi: string;
  tanggal_mulai: string;
  tanggal_berikutnya: string;
  aktif: boolean;
}

// ---------- Anggaran Sheet ----------
export interface Budget {
  id_anggaran: string;
  id_kategori: string;
  bulan: number; // 1-12
  tahun: number; // e.g. 2026
  nominal_limit: number;
}

// ---------- Computed/Derived Types ----------
export interface SaldoAkun {
  id_sumber_dana: string;
  nama_sumber: string;
  saldo: number;
}

export interface RingkasanBulanan {
  total_pemasukan: number;
  total_pengeluaran: number;
  saldo_total: number;
}

export interface PengeluaranPerKategori {
  id_kategori: string;
  nama_kategori: string;
  icon_name: string;
  total: number;
  persentase: number;
}

export interface TrenMingguan {
  minggu: string;
  pemasukan: number;
  pengeluaran: number;
}

export interface BudgetStatus {
  id_kategori: string;
  nama_kategori: string;
  batas: number;
  terpakai: number;
  persentase: number;
  status: "aman" | "peringatan" | "bahaya";
}

// ---------- Form Input Types ----------
export interface TransaksiFormInput {
  tanggal: string;
  jenis: string; // Maps to TipeTransaksi.id_tipe
  id_sumber_dana: string;
  id_kategori: string;
  nominal: number;
  label: string;
  catatan: string;
  is_titipan?: string | null;
}

export interface TransferFormInput {
  tanggal: string;
  id_sumber_dana_asal: string;
  id_target_dana: string;
  nominal: number;
  label: string;
  catatan: string;
  is_titipan?: string | null; // Changed from boolean to string | null based on Zod schema
}

export interface RecurringFormInput {
  id_kategori: string;
  id_sumber_dana: string;
  jenis: string; // Maps to TipeTransaksi.id_tipe
  nominal: number;
  label: string;
  catatan: string;
  frekuensi: string;
  tanggal_mulai: string;
}

export interface BudgetFormInput {
  id_kategori: string;
  bulan: number;
  tahun: number;
  nominal_limit: number;
}
