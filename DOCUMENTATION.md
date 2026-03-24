# Dokumentasi Aplikasi Finance Tracker

Aplikasi Finance Tracker adalah platform manajemen keuangan pribadi berbasis web yang menggunakan **Google Sheets** sebagai database utama. Aplikasi ini dirancang dengan estetika *Scandi-Minimal* dan fokus pada kemudahan penggunaan untuk mencatat transaksi harian, mengelola anggaran, dan memantau dana titipan.

---

## 1. Fungsionalitas Utama

### 📊 Dashboard & Ringkasan
- **Ringkasan Saldo**: Menampilkan total saldo dari seluruh akun/sumber dana.
- **Tambah Akun Cepat**: Tombol "+ Tambah Akun" di halaman Saldo untuk input rekening/dompet baru secara instan.
- **Kartu Proyeksi Kas (Zero-Based Budgeting)**: Kartu terpadu yang menggabungkan peramalan arus kas dan jadwal tagihan.
    - **Indikator Visual**: Progress bar tiga warna (Terpakai, Tagihan Mendatang, Sisa Aman).
    - **Sistem Peringatan**: Alert merah otomatis jika total tagihan melebihi sisa dana pribadi.
    - **Manajemen Tagihan**: Daftar tagihan rutin dalam siklus (25 hingga 24) dengan tombol "Catat Sekarang" untuk eksekusi cepat.
- **Status Anggaran Berbasis Kartu**: Pemantauan real-time pengeluaran per kategori terhadap limit bulanan.
- **Fitur Expand (Detail View)**: Setiap kartu kartu utama memiliki ikon "Expand/Perbesar" di pojok kanan atas untuk membuka **Modal Dialog (Radix UI)**.
    - **Detail Modal**: Menampilkan rincian fungsional lebih mendalam dan area yang disiapkan untuk visualisasi grafik atau tabel transaksi penuh.
- **Pantauan Titipan (Digital Envelope)**: Menampilkan saldo dana titipan (uang orang lain) yang sedang Anda pegang dengan pemisahan konteks (per orang/proyek).
- **Grafik Tren**: Visualisasi pengeluaran dan pemasukan mingguan serta distribusi pengeluaran per kategori (Pie Chart).
- **Aesthetic & UX**: Desain *Scandi-Minimal* premium dengan kartu setinggi 750px dan sistem internal scrolling. 
- **Modern Input Forms**: Form input (khususnya Transfer) menggunakan layout *High-Contrast* dengan input nominal gajah (besar) untuk fokus utama, grouping akun yang intuitif, serta input biaya admin yang bersih tanpa gangguan fitur kalkulator.
- **Smart Adaptive Calculator**: Komponen `NumericInput` dilengkapi dengan kalkulator pintar yang adaptif:
    - **Desktop**: Tampil sebagai floating popover yang elegan.
    - **Mobile**: Berubah secara otomatis menjadi *Full-screen Bottom Sheet* (drawer) untuk pengalaman sentuhan yang maksimal (Native-like).
    - **Fitur**: Riwayat perhitungan real-time, tombol "Batal" untuk pembersihan state, dan tombol "Terapkan" yang menonjol untuk alur kerja cepat.
- **Responsive Mobile List View**: Daftar transaksi dan tabel pada perangkat mobile telah dioptimalkan dengan tata letak *Apple Wallet Style*:
    - Fokus pada keterbacaan label utama dan nominal.
    - Penggunaan ikon kategori yang konsisten dan detail akun yang ringkas.
    - Efek interaksi mikro (`active:scale`) untuk umpan balik sentuhan yang lebih baik.
- **Pro Max Recurring Widget**: Widget pengingat tagihan dengan desain kartu terisolasi (*enclosed cards*) yang bersih, indikator urgensi berwarna (Hari Ini, Besok, Terlewati), dan aksi cepat "Bayar" langsung dari dashboard.

### 💸 Manajemen Transaksi
- **Pencatatan Pemasukan & Pengeluaran**: Mencatat transaksi dengan kategori, sumber dana, tanggal, dan catatan detail.
- **Transfer Antar Akun**: Memungkinkan pemindahan saldo antar akun tanpa memengaruhi statistik pengeluaran pribadi. Kini mendukung pencatatan **Biaya Admin** otomatis yang terhubung (linked) dengan transaksi transfer induknya.
- **Fitur Titipan (Entrusted Money)**: Menandai transaksi tertentu sebagai "Titipan" ke dalam amplop digital tertentu. Dana ini akan dihitung dalam saldo akun tetapi dikecualikan dari statistik pengeluaran/pemasukan pribadi Anda.
- **Mekanisme Arsip (Soft Delete)**: Amplop titipan yang sudah selesai (saldo Rp 0) dapat diarsipkan untuk menjaga daftar utama tetap bersih. Data arsip tetap dapat diakses di "Ruang Arsip".

### 🔄 Transaksi Berulang (Recurring)
- Mengotomatisasi transaksi rutin (seperti tagihan, gaji, atau langganan).
- Mendukung berbagai frekuensi (Harian, Mingguan, Bulanan, Tahunan, atau kustom setiap X bulan).
- **Pro Max List Interface**: Pengelolaan daftar tagihan rutin menggunakan card-based layout yang modern dengan kontrol cepat (Play/Pause, Edit, Hapus) yang terorganisir di sisi kanan untuk aksesibilitas tinggi.
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
| F | Tahun | Angka tahun |

### F. Lembar `Master_Titipan` (Konteks Titipan)
| Kolom | Nama Field | Deskripsi |
|-------|------------|-----------|
| A | ID Titipan | Kunci unik |
| B | Nama Konteks | Nama penitip atau proyek |
| C | Status | `aktif` atau `selesai` (arsipkan) |
| D | Created At | Tanggal pembuatan |

---

## 4. Logika Perhitungan Penting

1.  **Siklus Keuangan**: Aplikasi mendukung pengaturan tanggal mulai siklus (default: tanggal 25). Seluruh ringkasan bulanan akan dihitung sejak tanggal tersebut hingga hari sebelum tanggal tersebut di bulan berikutnya.
2.  **Zero-Based Budgeting (ZBB)**: Logika proyeksi kas menggunakan prinsip ZBB: `Sisa Aman = Pemasukan Aktual - (Pengeluaran Aktual + Semua Tagihan Rutin Siklus)`. Ini memastikan setiap rupiah memiliki "pekerjaan" dan pengguna tahu persis berapa uang yang benar-benar bebas digunakan.
3.  **Saldo Riil**: Saldo setiap akun dihitung dengan rumus:
    `Saldo Awal + (Total Pemasukan & Transfer Masuk) - (Total Pengeluaran & Transfer Keluar)`
4.  **Dana Titipan**: Sisa dana titipan dihitung secara khusus dari akumulasi transaksi bertipe `is_titipan` untuk membantu pengguna mengetahui berapa banyak uang orang lain yang masih tersimpan di dompet elektroniknya.
5.  **Aturan Pengarsipan**: Sebuah amplop titipan baru bisa diubah statusnya menjadi `selesai` (archive) jika sisa saldonya tepat Rp 0. Ini memastikan tidak ada dana yang "terlupakan" di dalam arsip.
6.  **Filter Transaksi**: Transaksi baru hanya dapat ditautkan ke amplop titipan dengan status `aktif`. Amplop yang sudah diarsipkan bersifat *read-only*.
7.  **Biaya Admin Transfer (Linked Transactions)**: Jika sebuah transfer menyertakan biaya admin, sistem akan membuat transaksi pengeluaran otomatis di kategori "Biaya Admin". Transaksi ini ditandai dengan tag `[ADMIN_FEE:ID_TRANSFER]` di catatan. Jika transaksi transfer utama diubah atau dihapus, biaya admin terkait akan tersinkronisasi secara otomatis.
8.  **Layout Dinamis**: Komponen Dashboard menggunakan tinggi tetap (750px) dengan `overflow-y-auto` dan kustom scrollbar. Ini memungkinkan daftar yang panjang tetap dapat diakses tanpa memperpanjang halaman secara keseluruhan.
