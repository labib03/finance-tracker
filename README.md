# 📊 Finance Tracker - Scandi-Minimalist

Aplikasi Manajemen Keuangan Pribadi (Personal Finance Management) modern berbasis web yang menggabungkan performa **Next.js (App Router)** dengan kepraktisan **Google Sheets** sebagai *serverless database*. Didesain dengan estetika *Scandi-Minimal* premium dan dioptimalkan untuk perangkat mobile maupun desktop demi memberikan pengalaman pencatatan keuangan yang jujur, taktis, dan menyenangkan.

---

## 🚀 Persiapan & Instalasi Cepat

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi secara lokal dalam waktu kurang dari 5 menit.

### 1. Prasyarat System
Pastikan perangkat Anda telah terinstal:
* **Node.js** (v18.x atau lebih baru)
* **Yarn** atau **npm**

### 2. Kloning Repositori & Instalasi Dependensi
```bash
# Kloning proyek ini
git clone https://github.com/labib03/finance-tracker.git
cd finance-tracker

# Instal dependensi menggunakan Yarn (atau npm install)
yarn install
```

### 3. Konfigurasi Google Sheets API (Database)
Aplikasi ini menggunakan Google Sheets sebagai database utama melalui integrasi Google Service Account secara aman.

1. Buka **[Google Cloud Console](https://console.cloud.google.com/)** dan buat proyek baru.
2. Aktifkan **Google Sheets API** untuk proyek tersebut.
3. Masuk ke menu **IAM & Admin > Service Accounts**, kemudian buat akun layanan baru (*Service Account*).
4. Buat kunci baru (*Key*) bertipe **JSON** untuk akun tersebut, lalu unduh kodenya.
5. Buat sebuah Spreadsheet kosong di Google Sheets, lalu salin **Spreadsheet ID** dari URL-nya:
   `https://docs.google.com/spreadsheets/d/ID_SPREADSHEET_ANDA/edit`
6. **Sangat Penting:** Bagikan (*Share*) akses edit Spreadsheet Anda kepada alamat email Service Account yang baru saja dibuat (berakhiran `@...gserviceaccount.com`) sebagai **Editor**.

### 4. Konfigurasi Environment Variables (`.env.local`)
Buat file bernama `.env.local` pada direktori root proyek Anda dan konfigurasikan variabel berikut:

```env
# Google Sheets Configuration (Tempel isi file JSON Service Account Anda dalam satu baris)
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"...","universe_domain":"..."}

# ID Google Spreadsheet Anda
GOOGLE_SPREADSHEET_ID=ID_SPREADSHEET_ANDA_DI_SINI
```

### 5. Jalankan Aplikasi
```bash
# Menjalankan server pengembangan lokal
yarn dev
```
Buka **[http://localhost:3000](http://localhost:3000)** di browser Anda untuk melihat hasilnya.

---

## 🏛️ Arsitektur Sistem

Aplikasi ini dirancang dengan arsitektur serverless yang efisien dan aman, meminimalkan latensi dengan memindahkan pemrosesan data berat ke sisi klien menggunakan state management yang responsif.

```mermaid
graph TD
    Client[Next.js Client Components] <--> Store[Zustand Store / Global State]
    Store <--> Actions[Next.js Server Actions]
    Actions <--> GoogleSheetsAPI[Google Sheets API]
    GoogleSheetsAPI <--> Spreadsheet[(Google Sheets Database)]
```

* **Frontend Framework**: **Next.js 15+ (App Router)** menggunakan arsitektur modular yang membagi kode ke dalam kelompok modul (seperti Dashboard, Master Data, Inquiry) dan komponen global yang bersih.
* **Database Backend**: **Google Sheets API (v4)**. Komunikasi data berlangsung di sisi server melalui **Next.js Server Actions** (`src/lib/actions.ts`). Kunci rahasia API *Service Account* tidak pernah terekspos ke browser pengguna.
* **State Management**: **Zustand** (`src/lib/store.ts`) digunakan sebagai *Single Source of Truth* di sisi klien. Semua data dari Google Sheets dimuat secara efisien ke lokal state saat inisialisasi, mempermudah kalkulasi data yang kompleks secara instan tanpa membebani kuota API Google.
* **Form Handling & Validation**: **React Hook Form** yang terintegrasi dengan skema validasi tipe data menggunakan **Zod** (`src/lib/schemas.ts`).
* **Design & Styling**: Menggunakan **Tailwind CSS v4** dengan pendekatan estetika *Scandi-Minimal* premium. Navigasi dan dialog dioptimalkan menggunakan pustaka **Radix UI / Base UI** demi aksesibilitas dan animasi mikro transisi yang mulus.

---

## 💼 Alur Bisnis & Logika Keuangan Utama

Aplikasi Finance Tracker dirancang untuk mencerminkan kebiasaan pencatatan uang yang disiplin melalui beberapa metode ilmiah:

### 1. Zero-Based Budgeting (ZBB)
Setiap rupiah memiliki peran dan masa depan yang direncanakan.
* **Siklus Keuangan**: Dihitung dari tanggal **25** hingga tanggal **24** di bulan berikutnya (menyesuaikan siklus gajian pada umumnya).
* **Rumus Sisa Uang Aman**:
  $$\text{Sisa Aman} = \text{Pemasukan Aktual} - (\text{Pengeluaran Aktual} + \text{Tagihan Siklus} + \text{Net Alokasi Tabungan})$$
  Di mana $\text{Net Alokasi Tabungan} = \text{Alokasi Dana Virtual} - \text{Tarik Darurat Virtual}$.
* Hal ini memastikan dana untuk tagihan rutin dan tabungan tidak tersentuh secara tidak sengaja.

### 2. Daily Pacing (Actual Harian & Self-Healing)
Mencegah pemborosan secara real-time dengan melacak batas pengeluaran harian.
* **Target Jatah (Baseline)**: 
  $$\text{Target Jatah} = \frac{\text{Sisa Bersih Sekarang} + \text{Pengeluaran Hari Ini}}{\text{Sisa Hari dalam Siklus}}$$
* **Sisa Aktual**: $\text{Target Jatah} - \text{Pengeluaran Hari Ini (Riil)}$.
* **Mekanisme Self-Healing**: Jika pengeluaran hari ini melebihi jatah harian (nilai minus), sistem tidak memaksa nilainya menjadi nol, melainkan menguranginya secara merata dari jatah hari-hari berikutnya sehingga target anggaran bulanan tetap aman.

### 3. Sinking Funds (Virtual Sub-Ledger)
Menabung untuk tujuan spesifik (liburan, dana darurat, gadget) secara teratur tanpa memecah rekening bank fisik Anda.
* Akun fisik Anda (misal: Bank BCA) menyimpan saldo riil penuh.
* Secara virtual, saldo tersebut dialokasikan ke dalam amplop-amplop tabungan tujuan khusus.
* **Jenis Aksi**:
  * **Alokasi Dana** (Virtual): Mengunci uang di dalam rekening fisik ke amplop tabungan tertentu.
  * **Tarik Darurat** (Virtual): Mengembalikan dana dari amplop tabungan kembali ke saldo bebas rekening fisik.
  * **Eksekusi Pembelian** (Riil): Transaksi nyata saat barang dibeli, yang akan memotong saldo fisik rekening Anda secara permanen.

### 4. Dana Titipan (Digital Envelope)
Menangani kasus di mana Anda memegang uang orang lain (titipan belanja, uang kantor, atau utang/piutang sementara).
* Transaksi titipan dicatat dalam dompet fisik Anda tetapi **dikecualikan** dari perhitungan grafik pengeluaran dan pemasukan pribadi Anda.
* Membantu memisahkan bias psikologis atas kepemilikan uang yang ada di dompet Anda.

### 5. Linked Transactions (Biaya Admin Otomatis)
Setiap transaksi transfer antar-akun yang memiliki biaya administrasi akan secara otomatis membuat transaksi pengeluaran terpisah untuk kategori "Biaya Admin" yang ditautkan langsung dengan ID transfer induknya.

---

## 📊 Skema Tabel Database (Google Sheets)

Database Spreadsheet Anda harus memiliki lembar-lembar (sheets) dengan nama dan kolom yang tepat seperti di bawah ini agar aplikasi berjalan lancar:

### A. Lembar `Transaksi` (Riwayat Transaksi)
Mencatat seluruh mutasi keuangan baik riil maupun virtual.
| Kolom | Nama Field | Deskripsi / Tipe |
|-------|------------|------------------|
| **A** | ID | UUID (String) |
| **B** | Tanggal | Format YYYY-MM-DD |
| **C** | Jenis | `Pemasukan`, `Pengeluaran`, `Transfer`, `alokasi_tabungan`, `tarik_tabungan`, `eksekusi_tabungan` |
| **D** | ID Sumber Dana | Referensi ke ID Akun asal |
| **E** | ID Kategori | Referensi ke ID Kategori |
| **F** | Nominal | Angka (Float/Decimal) |
| **G** | Catatan | Teks deskripsi |
| **H** | ID Target | (Khusus Transfer) ID Akun tujuan |
| **I** | Label | Judul transaksi |
| **J** | Is Titipan | ID Titipan (kosongkan jika transaksi pribadi) |
| **K** | ID Tabungan | ID Tabungan Sinking Fund (jika berlaku) |

### B. Lembar `Recurring` (Master Transaksi Rutin)
Mengatur penjadwalan transaksi yang berulang otomatis.
| Kolom | Nama Field | Deskripsi |
|-------|------------|-----------|
| **A** | ID | ID unik (String) |
| **B** | ID Kategori | Referensi ke ID Kategori |
| **C** | ID Sumber Dana | Referensi ke ID Akun asal |
| **D** | Jenis | `Pengeluaran` atau `Pemasukan` |
| **E** | Nominal | Nilai transaksi |
| **F** | Catatan | Keterangan |
| **G** | Label | Nama tagihan rutin |
| **H** | Frekuensi | `Daily`, `Weekly`, `Monthly`, `Yearly`, atau kustom |
| **I** | Tanggal Mulai | Tanggal awal siklus |
| **J** | Tanggal Berikutnya| Tanggal eksekusi mendatang otomatis |
| **K** | Aktif | `TRUE` / `FALSE` |

### C. Lembar `Master_Kategori`
| Kolom | Nama Field | Deskripsi |
|-------|------------|-----------|
| **A** | ID Kategori | ID unik (String) |
| **B** | Nama Kategori | Nama tampilan kategori |
| **C** | Tipe | `Pengeluaran` atau `Pemasukan` |
| **D** | Icon Name | Nama ikon Lucide React (misal: `shopping-bag`, `coffee`) |

### D. Lembar `Master_Sumber_Dana`
| Kolom | Nama Field | Deskripsi |
|-------|------------|-----------|
| **A** | ID Sumber Dana | ID unik (String) |
| **B** | Nama Sumber | Nama akun keuangan (misal: "Cash", "BCA", "GoPay") |
| **C** | Saldo Awal | Saldo awal sebelum aplikasi digunakan |

### E. Lembar `Anggaran` (Batas Pengeluaran Bulanan)
| Kolom | Nama Field | Deskripsi |
|-------|------------|-----------|
| **A** | ID Anggaran | ID unik (String) |
| **B** | ID Kategori | ID Kategori yang dibatasi |
| **C** | Bulan | Angka bulan (1-12) |
| **D** | Tahun | Angka tahun (YYYY) |
| **E** | Nominal Limit | Batas pengeluaran maksimal |

### F. Lembar `Master_Titipan` (Konteks Titipan/Dana Amplop)
| Kolom | Nama Field | Deskripsi |
|-------|------------|-----------|
| **A** | ID Titipan | ID unik (String) |
| **B** | Nama Konteks | Nama penitip atau proyek |
| **C** | Status | `aktif` atau `selesai` (diarsipkan) |
| **D** | Created At | Tanggal pembuatan |

### G. Lembar `Master_Tabungan` (Sinking Funds)
| Kolom | Nama Field | Deskripsi |
|-------|------------|-----------|
| **A** | ID Tabungan | ID unik (String) |
| **B** | Nama Tujuan | Nama target tabungan |
| **C** | Nominal Target | Jumlah target yang ingin dikumpulkan |
| **D** | Tanggal Target | Estimasi waktu target tercapai |
| **E** | Icon | Nama ikon Lucide React |
| **F** | Status | `aktif` atau `tercapai` |
| **G** | Created At | Tanggal pembuatan |

---

## 🎨 Fitur Khusus & Keunggulan UX

Aplikasi ini dibangun dengan kecerdasan antarmuka tingkat tinggi (High-End UX) untuk mendukung pencatatan keuangan harian tanpa hambatan:

* **Smart Adaptive Calculator**: Kolom input nominal dilengkapi dengan kalkulator pintar built-in. Di desktop, kalkulator tampil sebagai *floating popover*, sementara di layar handphone secara otomatis berubah menjadi *Full-screen Bottom Sheet Drawer* demi kenyamanan sentuhan jempol. Memiliki keamanan logika di mana pengguna harus menekan tombol `=` untuk menyelesaikan hitungan sebelum nominal dapat dimasukkan ke dalam form input.
* **Auto-Select on Focus**: Saat kolom nominal diklik atau disentuh, nilai "0" bawaan akan langsung terblokir sepenuhnya. Hal ini menghindari kesalahan ketik nominal ganda (misal: mengetik `50000` menjadi `050000`).
* **Dynamic Viewport Experience**: Struktur tampilan dirancang menggunakan satuan tinggi dinamis `dvh` dan kalkulasi jarak aman iOS (`env(safe-area-inset-bottom)`) untuk menjamin semua elemen interaktif bawah tidak tertutup oleh sistem navigasi bawaan browser Safari atau Google Chrome Mobile.
* **Pro Max Search Center**: Halaman audit riwayat transaksi yang minimalis dan super cepat. Filter tanggal dan teks bekerja secara instan, sedangkan filter mendalam (Kategori, Akun, Nominal) menggunakan sistem *Deferred Filter Sheet* (hanya akan memproses pencarian setelah tombol "Terapkan" diklik) guna mengoptimalkan render performa aplikasi.
* **Urutan Dropdown Konsisten**: Seluruh daftar drop-down pada form tambah/edit kategori, sumber dana, dan tabungan diurutkan secara alfabetis (A-Z) secara konsisten dari tingkat state management demi kemudahan pencarian elemen secara visual.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **[MIT License](LICENSE)**. Anda bebas menggunakan, memodifikasi, dan mendistribusikan aplikasi ini secara gratis.
