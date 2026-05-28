# PLAN-ai-advisor-prompt - Generator Prompt AI Asisten Finansial Pintar

Rencana ini memaparkan implementasi fitur tombol/kartu khusus pada halaman Laporan Keuangan untuk mengompilasi rangkuman laporan keuangan (Pemasukan, Pengeluaran, 4 Kategori Terbesar, Anggaran Belanja, Transaksi Berulang, dan Tabungan Aktif) menjadi satu kalimat prompt AI yang utuh dan komprehensif untuk disalin oleh pengguna guna mendapatkan saran finansial taktis dari AI.

---

## User Review Required

> [!NOTE]
> Fitur ini diimplementasikan di bagian atas halaman Laporan Analitik menggunakan wadah kartu khusus (Opsi B) bermotif gelap premium (`bg-slate-900 text-white`) dengan ilustrasi mikro serta ikon berkilau (`Sparkles`) untuk menarik perhatian pengguna.

> [!IMPORTANT]
> - Data kosong (misal anggaran atau transaksi berulang belum diset oleh pengguna) akan ditangani dengan menambahkan keterangan kontekstual seperti *"Tidak ada data anggaran aktif saat ini"* (Opsi 2) agar AI mendapatkan konteks penuh.
> - Salin teks prompt ke clipboard akan memicu status umpan balik centang hijau selama 2 detik bertuliskan *"Tersalin ke Clipboard!"* untuk kepuasan interaksi visual.

---

## Proposed Changes

### [Frontend - Analitik & Laporan]

#### [MODIFY] [CategoryReport.tsx](file:///c:/Users/Raven/web_development/Next/finance-tracker/src/modules/dashboard/components/CategoryReport.tsx)
- Impor data tambahan dari `useFinanceStore` untuk prompt AI:
  - `tabunganList` (data target tabungan)
  - `budgetList` (data anggaran belanja)
  - `recurringList` (data transaksi berulang)
  - `getSaldoTabungan` (getter saldo tabungan)
  - `getProgresTabungan` (getter progres tabungan)
- Impor ikon dari `lucide-react`: `Sparkles`, `Copy`, `Check`
- Tambahkan status `isCopied` untuk menangani transisi tombol salin.
- Buat fungsi pembantu pengumpul teks prompt AI yang menyusun:
  1. Ringkasan cashflow bulan aktif (Pemasukan, Pengeluaran, Surplus/Defisit).
  2. Data 4 kategori pengeluaran terbesar beserta nominal dan persentasenya.
  3. Status anggaran belanja aktif bulan bersangkutan dibanding pengeluaran realisasinya.
  4. Status alokasi target tabungan aktif beserta progres capaiannya.
  5. Daftar transaksi berulang aktif beserta frekuensi dan jadwal berikutnya.
- Tambahkan komponen kartu khusus AI Prompt Generator di atas halaman laporan dengan gaya gelap premium yang elegan dan visual pratinjau teks kecil yang dapat digulir (*scrollable preview area*).

---

## Verification Plan

### Automated Tests
- Menjalankan pemeriksaan kompilasi TypeScript:
  ```bash
  npx tsc --noEmit
  ```
- Menjalankan analisis linter kode:
  ```bash
  npm run lint
  ```
- Melakukan verifikasi audit performa dan aksesibilitas:
  ```bash
  python .agent/scripts/verify_all.py .
  ```

### Manual Verification
1. Buka halaman Laporan Keuangan (`/laporan`).
2. Periksa tampilan kartu khusus AI Advisor Prompt Generator di bagian atas halaman.
3. Klik tombol "Salin Prompt AI". Verifikasi bahwa:
   - Warna tombol berubah menjadi hijau dengan ikon centang dan teks berubah menjadi *"Tersalin ke Clipboard!"*.
   - Status tersalin bertahan selama 2 detik sebelum kembali ke kondisi semula.
4. Lakukan paste (Ctrl+V) di Notepad atau peramban dan pastikan seluruh data keuangan terisi lengkap dengan benar sesuai dengan angka laporan keuangan yang ditampilkan di web (termasuk 4 kategori pengeluaran terbesar, target tabungan, anggaran belanja, dan transaksi berulang).
