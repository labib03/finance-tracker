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
  is_titipan: z.string().nullable().optional().default(null),
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
    biaya_admin: z.coerce.number({ message: "Biaya admin harus berupa angka" }).nonnegative("Biaya admin tidak boleh negatif").optional().default(0),
    is_titipan: z.string().nullable().optional().default(null),
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
  frekuensi: z.string().min(1, "Pilih frekuensi"),
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

export const titipanSchema = z.object({
  id_titipan: z.string().min(1, "ID Titipan wajib diisi"),
  nama_konteks: z.string().min(1, "Nama konteks wajib diisi (e.g. Nama orang)"),
  tanggal_dibuat: z.string().min(1, "Tanggal dibuat wajib diisi"),
  status: z.enum(["aktif", "selesai"]).default("aktif"),
});

export type TransaksiFormData = z.infer<typeof transaksiSchema>;
export type TransferFormData = z.infer<typeof transferSchema>;
export type RecurringFormData = z.infer<typeof recurringSchema>;
export type BudgetFormData = z.infer<typeof budgetSchema>;
export type KategoriFormData = z.infer<typeof kategoriSchema>;
export type SumberDanaFormData = z.infer<typeof sumberDanaSchema>;
export type TitipanFormData = z.infer<typeof titipanSchema>;
