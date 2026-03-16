// ============================================================
// Zod Validation Schemas for all forms
// ============================================================

import { z } from "zod";

export const transaksiSchema = z.object({
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  jenis: z.enum(["Pengeluaran", "Pemasukan"], {
    message: "Pilih jenis transaksi",
  }),
  id_sumber_dana: z.string().min(1, "Pilih sumber dana"),
  id_kategori: z.string().min(1, "Pilih kategori"),
  nominal: z.coerce
    .number({ message: "Nominal harus berupa angka" })
    .positive("Nominal harus lebih dari 0"),
  label: z.string().min(1, "Judul/Label wajib diisi"),
  catatan: z.string().optional().default(""),
});

export const transferSchema = z
  .object({
    tanggal: z.string().min(1, "Tanggal wajib diisi"),
    id_sumber_dana_asal: z.string().min(1, "Pilih sumber dana asal"),
    id_target_dana: z.string().min(1, "Pilih sumber dana tujuan"),
    nominal: z.coerce
      .number({ message: "Nominal harus berupa angka" })
      .positive("Nominal harus lebih dari 0"),
    label: z.string().min(1, "Judul/Label wajib diisi"),
    catatan: z.string().optional().default(""),
  })
  .refine((data) => data.id_sumber_dana_asal !== data.id_target_dana, {
    message: "Sumber dana asal dan tujuan tidak boleh sama",
    path: ["id_target_dana"],
  });

export const recurringSchema = z.object({
  id_kategori: z.string().min(1, "Pilih kategori"),
  id_sumber_dana: z.string().min(1, "Pilih sumber dana"),
  jenis: z.enum(["Pengeluaran", "Pemasukan"], {
    message: "Pilih jenis transaksi",
  }),
  nominal: z.coerce
    .number({ message: "Nominal harus berupa angka" })
    .positive("Nominal harus lebih dari 0"),
  label: z.string().min(1, "Judul/Label wajib diisi"),
  catatan: z.string().optional().default(""),
  frekuensi: z.enum(["Harian", "Mingguan", "Bulanan", "3 Bulan", "6 Bulan", "Tahunan"], {
    message: "Pilih frekuensi",
  }),
  tanggal_mulai: z.string().min(1, "Tanggal mulai wajib diisi"),
});

export const budgetSchema = z.object({
  id_kategori: z.string().min(1, "Pilih kategori"),
  bulan: z.coerce
    .number({ message: "Bulan harus berupa angka" })
    .min(1, "Bulan minimal 1")
    .max(12, "Bulan maksimal 12"),
  tahun: z.coerce
    .number({ message: "Tahun harus berupa angka" })
    .min(2020, "Tahun minimal 2020")
    .max(2100, "Tahun tidak valid"),
  nominal_limit: z.coerce
    .number({ message: "Nominal harus berupa angka" })
    .positive("Batas anggaran harus lebih dari 0"),
});

// ---------- Master Data Schemas ----------

export const kategoriSchema = z.object({
  id_kategori: z.string().min(1, "ID Kategori wajib diisi"),
  nama_kategori: z.string().min(1, "Nama kategori wajib diisi"),
  tipe: z.enum(["Pengeluaran", "Pemasukan"], {
    message: "Pilih tipe kategori",
  }),
  icon_name: z.string().optional().default("circle"),
});

export const sumberDanaSchema = z.object({
  id_sumber_dana: z.string().min(1, "ID Sumber Dana wajib diisi"),
  nama_sumber: z.string().min(1, "Nama sumber dana wajib diisi"),
  saldo_awal: z.coerce
    .number({ message: "Saldo awal harus berupa angka" })
    .min(0, "Saldo awal tidak boleh negatif"),
});

export type TransaksiFormData = z.infer<typeof transaksiSchema>;
export type TransferFormData = z.infer<typeof transferSchema>;
export type RecurringFormData = z.infer<typeof recurringSchema>;
export type BudgetFormData = z.infer<typeof budgetSchema>;
export type KategoriFormData = z.infer<typeof kategoriSchema>;
export type SumberDanaFormData = z.infer<typeof sumberDanaSchema>;
