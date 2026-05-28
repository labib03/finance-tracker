# PLAN-batch-insert - Rencana Implementasi Batch Insert Transaksi

Dokumen ini berisi rencana kerja untuk mengimplementasikan fitur pengisian transaksi secara massal (Batch Insert) dengan antarmuka spreadsheet interaktif yang luas, intuitif, dan memiliki sistem validasi *real-time* yang ketat.

---

## Deskripsi Fitur
Fitur ini memungkinkan pengguna untuk memasukkan banyak transaksi keuangan sekaligus (baik Pengeluaran maupun Pemasukan) dalam satu halaman berbentuk kisi/tabel grid spreadsheet mini. 

Pengguna dapat:
1. Menambah atau menghapus baris input transaksi secara dinamis.
2. Memilih Tanggal, Jenis (Pemasukan/Pengeluaran), Kategori, Sumber Dana (Metode), memasukkan Label, Catatan opsional, serta Nominal untuk setiap baris secara independen.
3. Melihat visualisasi ringkasan batch (Total baris terisi, total pengeluaran, total pemasukan).
4. Menikmati tata letak dengan jarak (*spacing*) yang luas dan lega demi keterbacaan yang maksimal.
5. Mendapatkan validasi instan (*real-time*): kolom yang tidak valid akan langsung ditandai dengan border merah dan tombol simpan akan terkunci sampai seluruh baris terverifikasi aman.

---

## Review Pengguna (User Review Required)

> [!IMPORTANT]
> **Poin Utama Desain:**
> 1. **Spacious Spacing (Jarak Luas):** Baris tabel menggunakan tinggi vertikal yang lega (minimal `py-4` atau `h-16` per kolom) dan margin antarelemen yang renggang agar pengguna tidak merasa sesak saat menginput puluhan baris data secara berurutan.
> 2. **Sistem Validasi Keras (Opsi X):** Tombol "Simpan Semua" akan berada dalam kondisi `disabled` jika ada salah satu kolom wajib (Tanggal, Nominal, Kategori, Sumber Dana) yang tidak valid di baris mana pun. Pesan kesalahan detail akan ditampilkan pada kaki halaman atau tooltip baris terkait.
> 3. **Independensi Kolom:** Setiap baris memiliki dropdown kategori dan sumber dana yang terisolasi secara mandiri. Dropdown kategori akan berubah secara dinamis menyesuaikan Jenis Transaksi (Pemasukan vs Pengeluaran) yang dipilih pada baris yang sama.

---

## Pertanyaan Terbuka (Open Questions)

> [!NOTE]
> Seluruh pertanyaan klarifikasi arsitektur telah disepakati bersama melalui diskusi **Socratic Gate**:
> - **Antarmuka:** Menggunakan Tabel Grid Spreadsheet Dinamis (Opsi A) dengan *spacing* luas.
> - **Nilai Default Massal:** Tidak diperlukan aksi set massal global (tidak perlu).
> - **Penanganan Error:** Validasi *real-time* memblokir penyimpanan (Opsi X).

---

## Rencana Perubahan (Proposed Changes)

Berikut adalah daftar komponen dan berkas baru yang akan dibuat serta dimodifikasi:

### 1. Dashboard Forms Layer

#### [NEW] [BatchInsertForm.tsx](file:///c:/Users/Raven/web_development/Next/finance-tracker/src/modules/dashboard/forms/BatchInsertForm.tsx)
- Membuat formulir input massal berbasis tabel interaktif.
- Menggunakan `react-hook-form` dengan array field (`useFieldArray`) untuk manajemen state baris dinamis yang efisien dan andal.
- Setiap baris memiliki:
  - Input Tanggal dengan popover kalender.
  - Dropdown Jenis (Pengeluaran / Pemasukan).
  - Dropdown Kategori (mengikuti jenis aktif pada baris).
  - Dropdown Sumber Dana (Metode Pembayaran).
  - Kolom teks Label (Deskripsi singkat).
  - Kolom teks Catatan (Opsional).
  - Kolom input Nominal dengan pemisah ribuan otomatis (menggunakan wrapper `NumericInput` global).
  - Tombol aksi hapus baris (ikon `Trash2`).
- Bagian atas formulir menampilkan ringkasan akumulasi nominal dan jumlah baris transaksi dalam antarmuka bertema premium minimalis.
- Integrasi validasi skema baris per baris.

---

### 2. Pages & Routing Layer

#### [NEW] [page.tsx](file:///c:/Users/Raven/web_development/Next/finance-tracker/src/app/(main)/transaksi/batch/page.tsx)
- Halaman Next.js baru yang memanggil komponen `<BatchInsertForm />`.
- Menyediakan tata letak halaman yang bersih dengan tombol kembali ke riwayat transaksi biasa.

#### [MODIFY] [TransaksiView.tsx](file:///c:/Users/Raven/web_development/Next/finance-tracker/src/modules/dashboard/views/TransaksiView.tsx)
- Menambahkan tombol aksi sekunder di header halaman transaksi, bertuliskan **"Batch Input"** atau **"Input Massal"**, yang mengarahkan pengguna ke rute `/transaksi/batch` dengan mulus.

---

## Rencana Verifikasi (Verification Plan)

### Pengujian Otomatis
- **TypeScript Typecheck (`npx tsc --noEmit`)**: Memastikan tidak ada kesalahan penulisan tipe data pada properti tabel dinamis dan hooks `useFieldArray`.
- **ESLint Linting (`npm run lint`)**: Memastikan kualitas penulisan kode bersih sesuai dengan regulasi standar aplikasi Next.js.

### Pengujian Manual
1. **Verifikasi Penambahan Dinamis:** Mengklik tombol "+ Tambah Transaksi" dan memastikan baris baru langsung muncul dengan *spacing* tinggi yang luas dan lega.
2. **Verifikasi Dinamika Kategori:** Mengubah jenis transaksi di baris 1 menjadi "Pemasukan" dan memastikan dropdown kategorinya hanya menampilkan kategori bertipe pemasukan, sementara baris 2 yang bertipe "Pengeluaran" tidak ikut berubah.
3. **Verifikasi Validasi Keras:**
   - Memasukkan nilai 0 pada nominal salah satu baris, memastikan border baris tersebut berubah menjadi merah (atau ada indikasi teks error merah) dan tombol utama "Simpan Semua" terkunci.
   - Mengisi nilai nominal dengan benar, dan memastikan border merah hilang serta tombol penyimpanan aktif kembali secara instan.
4. **Verifikasi Sinkronisasi Store:** Menyimpan batch, dan memastikan semua baris transaksi langsung muncul secara berurutan dan akurat di halaman riwayat `/transaksi` serta analitik `/laporan`.
