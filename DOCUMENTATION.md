# Dokumentasi Aplikasi Finance Tracker

Aplikasi Finance Tracker adalah platform manajemen keuangan pribadi berbasis web yang menggunakan **Google Sheets** sebagai database utama. Aplikasi ini dirancang dengan estetika *Scandi-Minimal* dan fokus pada kemudahan penggunaan untuk mencatat transaksi harian, mengelola anggaran, dan memantau dana titipan.

---

## 1. Fungsionalitas Utama

### 📊 Dashboard & Ringkasan
- **Ringkasan Saldo**: Menampilkan total saldo dari seluruh akun/sumber dana.
- **Kartu Arus Kas**: Menampilkan total pemasukan dan pengeluaran dalam siklus bulan berjalan.
- **Pantauan Titipan**: Menampilkan saldo dana titipan (uang orang lain) yang sedang Anda pegang.
- **Grafik Tren**: Visualisasi pengeluaran dan pemasukan mingguan serta distribusi pengeluaran per kategori (Pie Chart).

### 💸 Manajemen Transaksi
- **Pencatatan Pemasukan & Pengeluaran**: Mencatat transaksi dengan kategori, sumber dana, tanggal, dan catatan detail.
- **Transfer Antar Akun**: Memungkinkan pemindahan saldo dari satu akun ke akun lain (misal: dari ATM ke Cash) tanpa dianggap sebagai pengeluaran/pemasukan pribadi.
- **Fitur Titipan (Entrusted Money)**: Menandai transaksi tertentu sebagai "Titipan". Dana ini akan dihitung dalam saldo akun tetapi dikecualikan dari statistik pengeluaran/pemasukan pribadi Anda.

### 🔄 Transaksi Berulang (Recurring)
- Mengotomatisasi transaksi rutin (seperti tagihan, gaji, atau langganan).
- Mendukung berbagai frekuensi (Harian, Mingguan, Bulanan, Tahunan, atau kustom setiap X bulan).
- Sistem secara otomatis akan men-generate transaksi riil saat tanggal jatuh tempo tiba.

### 📅 Anggaran (Budgeting)
- Menetapkan batas pengeluaran bulanan per kategori.
- Memberikan indikator visual (Progress Bar) jika pengeluaran mendekati atau melebihi limit anggaran.

### ⚙️ Manajemen Data Master
- **Kelola Kategori**: Menambahkan kategori kustom dengan ikon dan tipe yang berbeda.
- **Kelola Sumber Dana**: Menambahkan akun keuangan (Bank, E-Wallet, Cash) beserta saldo awal.

---

## 2. Arsitektur Sistem

Aplikasi ini dibangun dengan teknologi modern untuk performa dan keamanan tinggi:

- **Frontend Framework**: [Next.js](https://nextjs.org/) (App Router, React 18+).
- **Bahasa**: TypeScript untuk keamanan tipe data.
- **Styling**: Tailwind CSS dengan kustomisasi tema premium dan animasi halus.
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) untuk pengelolaan *global state* yang ringan dan cepat.
- **Database Backend**: [Google Sheets API](https://developers.google.com/sheets/api) sebagai *serverless database*.
- **Otentikasi Server**: Menggunakan *Google Service Account* untuk komunikasi aman antara server Next.js dan Google Sheets.
- **Form Handling**: React Hook Form dengan validasi skema menggunakan [Zod](https://zod.dev/).

---

## 3. Struktur Data (Google Sheets)

Database aplikasi disimpan dalam satu Spreadsheet dengan lembar (sheets) sebagai berikut:

### A. Lembar `Transaksi` (Riwayat Semua Transaksi)
| Kolom | Nama Field | Deskripsi |
|-------|------------|-----------|
| A | ID | Unique ID transaksi (UUID/Generated) |
| B | Tanggal | Format YYYY-MM-DD |
| C | Jenis | Pemasukan, Pengeluaran, atau Transfer |
| D | ID Sumber Dana | Referensi ke akun asal |
| E | ID Kategori | Referensi ke kategori |
| F | Nominal | Nilai angka transaksi |
| G | Catatan | Detail atau keterangan tambahan |
| H | ID Target | (Khusus Transfer) ID Akun tujuan |
| I | Label | Judul singkat transaksi |
| J | Is Titipan | Status Boolean (TRUE/FALSE) |

### B. Lembar `Recurring` (Master Transaksi Rutin)
| Kolom | Nama Field | Deskripsi |
|-------|------------|-----------|
| A | ID | ID unik |
| B | ID Kategori | Kategori transaksi |
| C | ID Sumber Dana | Akun asal |
| D | Jenis | Tipe transaksi |
| E | Nominal | Nilai angka |
| F | Catatan | Keterangan |
| G | Label | Judul rutin |
| H | Frekuensi | Daily, Weekly, Monthly, Yearly, Custom |
| I | Tanggal Mulai | Awal siklus |
| J | Tanggal Berikutnya | Waktu eksekusi otomatis selanjutnya |
| K | Aktif | Status status aktif (TRUE/FALSE) |

### C. Lembar `Master_Kategori`
| Kolom | Nama Field | Deskripsi |
|-------|------------|-----------|
| A | ID Kategori | Kunci unik |
| B | Nama Kategori | Nama tampilan |
| C | Tipe | Pemasukan atau Pengeluaran |
| D | Icon Name | Nama ikon dari Lucide React |

### D. Lembar `Master_Sumber_Dana`
| Kolom | Nama Field | Deskripsi |
|-------|------------|-----------|
| A | ID Sumber Dana | Kunci unik |
| B | Nama Sumber | Nama akun (misal: "BCA", "Cash") |
| C | Saldo Awal | Saldo saat pertama kali aplikasi disetup |

### E. Lembar `Anggaran`
| Kolom | Nama Field | Deskripsi |
|-------|------------|-----------|
| A | ID Anggaran | Kunci unik |
| B | ID Kategori | Kategori yang dibatasi |
| C | Bulan | Angka bulan (1-12) |
| D | Tahun | Angka tahun |
| E | Nominal Limit | Batas maksimal pengeluaran |

---

## 4. Logika Perhitungan Penting

1.  **Siklus Keuangan**: Aplikasi mendukung pengaturan tanggal mulai siklus (default: tanggal 25). Seluruh ringkasan bulanan akan dihitung sejak tanggal tersebut hingga hari sebelum tanggal tersebut di bulan berikutnya.
2.  **Saldo Riil**: Saldo setiap akun dihitung dengan rumus:
    `Saldo Awal + (Total Pemasukan & Transfer Masuk) - (Total Pengeluaran & Transfer Keluar)`
3.  **Dana Titipan**: Sisa dana titipan dihitung secara khusus dari akumulasi transaksi bertipe `is_titipan` untuk membantu pengguna mengetahui berapa banyak uang orang lain yang masih tersimpan di dompet elektroniknya.
