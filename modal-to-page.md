# Task Plan: Modal-to-Page Migration

> **Rencana Kerja Detail untuk Migrasi 9 Modal Form ke Halaman Mandiri di Next.js dengan Desain Premium (Split Screen + Bento Grid).**

---

## Overview
Aplikasi `finance-tracker` saat ini mengandalkan modal dialog mengambang (pop-up) untuk sebagian besar form masukan data. Meskipun praktis untuk interaksi kecil, modals mengurangi fokus pengguna pada layar desktop dan sering kali tidak nyaman di perangkat seluler. Migrasi ini akan memindahkan 9 modal utama ke dalam halaman Next.js statis/dinamis yang mandiri dengan desain split-screen yang sangat premium dan layout Bento Grid modern.

## Project Type
- **Type:** WEB (Next.js 16 / React 19 / Tailwind CSS v4)
- **Primary Agent:** `frontend-specialist` (UI/UX)
- **Support Agent:** `project-planner` (Planning)

## Success Criteria
1. **Navigasi Mulus:** Seluruh aksi tambah/edit membuka halaman mandiri dengan rute statis/dinamis tanpa adanya kesalahan 404.
2. **Desain Premium Wow-Factor:** Menggabungkan tata letak Split Screen 50:50 dengan Bento Grid form di panel kanan, visualisasi data interaktif di panel kiri, dan transisi animasi `framer-motion` di bawah 300ms.
3. **Manajemen State Aman:** Form edit berhasil memuat data dari `useFinanceStore` berdasarkan parameter URL `[id]`.
4. **Modal Konfirmasi & Informasi Sukses:** Pengguna mendapatkan proteksi data hilang melalui modal batal dan penegasan aksi sukses melalui modal sukses yang atraktif.
5. **Bebas Galat Kompilasi:** Lulus verifikasi TypeScript, ESLint, dan build Next.js.

## Tech Stack
- **Framework:** Next.js (App Router, Client Components)
- **Styling:** Tailwind CSS v4 (CSS-first, premium gradients, glassmorphism, responsive grids)
- **Animations:** framer-motion (spring-physics, stagger entrance, smooth state layers)
- **Forms & Validation:** react-hook-form + zod
- **Icons:** lucide-react

---

## File Structure Layout
```plaintext
src/
├── app/
│   └── (main)/
│       ├── anggaran/
│       │   ├── baru/page.tsx               # [NEW] Add Budget page
│       │   └── edit/[id]/page.tsx          # [NEW] Edit Budget page
│       ├── cycle-settings/
│       │   └── page.tsx                    # [NEW] Cycle settings page
│       ├── master/
│       │   └── kategori/
│       │       ├── baru/page.tsx           # [NEW] Add Category page
│       │       └── edit/[id]/page.tsx      # [NEW] Edit Category page
│       ├── recurring/
│       │   ├── baru/page.tsx               # [NEW] Add Recurring page
│       │   └── edit/[id]/page.tsx          # [NEW] Edit Recurring page
│       ├── saldo/
│       │   ├── baru/page.tsx               # [NEW] Add Account page
│       │   ├── edit/[id]/page.tsx          # [NEW] Edit Account page
│       │   └── titipan/
│       │       ├── baru/page.tsx           # [NEW] Add Titipan page
│       │       └── edit/[id]/page.tsx      # [NEW] Edit Titipan page
│       ├── tabungan/
│       │   ├── baru/page.tsx               # [NEW] Add Sinking Fund page
│       │   ├── edit/[id]/page.tsx          # [NEW] Edit Sinking Fund page
│       │   └── aksi/[id]/page.tsx          # [NEW] Save/Withdraw Sinking Fund page
│       ├── transaksi/
│       │   ├── baru/page.tsx               # [NEW] Add Transaction page
│       │   └── edit/[id]/page.tsx          # [NEW] Edit Transaction page
│       └── transfer/
│           ├── baru/page.tsx               # [NEW] Add Transfer page
│           └── edit/[id]/page.tsx          # [NEW] Edit Transfer page
```

---

## Task Breakdown

### Phase 1: Core Navigation & Clean Up
| Task ID | Task Name | Agent | Key Skills | Dependencies | Target & Details |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TSK-01** | Nonaktifkan ModalOrchestrator | `frontend-specialist` | clean-code | None | **INPUT:** `ModalOrchestrator.tsx` lama<br>**OUTPUT:** Kosongkan atau bersihkan `ModalOrchestrator.tsx` agar tidak merender modal form lama.<br>**VERIFY:** `ModalOrchestrator` tidak memicu error kompilasi dan tidak merender component apa pun. |
| **TSK-02** | Perbarui Navigasi Sidebar & BottomNav | `frontend-specialist` | frontend-design | None | **INPUT:** `Sidebar.tsx` & `BottomNav.tsx`<br>**OUTPUT:** Ganti `setActiveModal` dengan `router.push('/cycle-settings')` dan `router.push('/transaksi/baru')`.<br>**VERIFY:** Pemicu mengarahkan URL browser dengan benar. |
| **TSK-03** | Perbarui Aksi Klik di Halaman Utama | `frontend-specialist` | frontend-design | None | **INPUT:** File `View.tsx` (Transaksi, Transfer, Tabungan, Saldo, Recurring, Master, Anggaran)<br>**OUTPUT:** Ubah pemicu klik tambah/edit menjadi navigasi URL (misal `/transaksi/edit/[id]`).<br>**VERIFY:** Mengklik tombol memicu navigasi URL yang benar. |

### Phase 2: Page Form Implementation (Premium Split Screen + Bento Grid)
| Task ID | Task Name | Agent | Key Skills | Dependencies | Target & Details |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TSK-04** | Form Transaksi & Transfer Page | `frontend-specialist` | frontend-design, ui-ux-pro-max | TSK-01, TSK-03 | **INPUT:** Rute baru `/transaksi` dan `/transfer`<br>**OUTPUT:** Tampilan premium split-screen 50:50 dengan bento form + numeric input kalkulator + glass cards selektor.<br>**VERIFY:** Form berfungsi normal, data masuk ke store, dan visualisasi interaktif berjalan. |
| **TSK-05** | Form Rekening & Amplop Titipan Page | `frontend-specialist` | frontend-design, ui-ux-pro-max | TSK-01, TSK-03 | **INPUT:** Rute baru `/saldo` dan `/saldo/titipan`<br>**OUTPUT:** Form premium split-screen untuk menambah/edit Rekening & Amplop Titipan.<br>**VERIFY:** CRUD rekening & titipan berfungsi penuh dan memperbarui state utama. |
| **TSK-06** | Form Target Tabungan (Sinking Fund) & Aksi Page | `frontend-specialist` | frontend-design, ui-ux-pro-max | TSK-01, TSK-03 | **INPUT:** Rute baru `/tabungan` dan `/tabungan/aksi/[id]`<br>**OUTPUT:** Form tabungan dengan animasi progress ring interaktif di panel kiri, dan form alokasi/tarik bento di panel kanan.<br>**VERIFY:** Penambahan, pengeditan, dan alokasi dana tabungan berfungsi 100%. |
| **TSK-07** | Form Kategori, Anggaran & Recurring Page | `frontend-specialist` | frontend-design, ui-ux-pro-max | TSK-01, TSK-03 | **INPUT:** Rute `/master/kategori`, `/anggaran`, `/recurring`<br>**OUTPUT:** Halaman form baru untuk kategori master, budget limit, dan transaksi berulang.<br>**VERIFY:** Data CRUD tersinkronisasi sempurna dengan server/local store. |
| **TSK-08** | Halaman Cycle Settings | `frontend-specialist` | frontend-design | TSK-02 | **INPUT:** `/cycle-settings`<br>**OUTPUT:** Halaman form visual dinamis untuk merubah tanggal awal siklus keuangan.<br>**VERIFY:** Perubahan tersimpan di `localStorage` dan merubah state siklus bulan aktif di store. |

### Phase 3: Core UX Polishing
| Task ID | Task Name | Agent | Key Skills | Dependencies | Target & Details |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TSK-09** | Modal Proteksi Batal & Sukses | `frontend-specialist` | frontend-design, ui-ux-pro-max | TSK-04, TSK-07 | **INPUT:** State form `isDirty` & `isSubmitSuccessful`<br>**OUTPUT:** Tampilkan modal konfirmasi batal saat form kotor ditinggalkan, serta modal sukses beranimasi menakjubkan setelah sukses submit.<br>**VERIFY:** Pemicu modal batal berfungsi saat navigasi balik, dan modal sukses tampil estetik. |

---

## Phase X: Final Verification

> 🔴 **PROYEK BELUM SELESAI HINGGA SELURUH SCRIPT VALIDASI DI BAWAH INI LULUS.**

```powershell
# 1. Menjalankan verifikasi tipe TypeScript
npx tsc --noEmit

# 2. Menjalankan audit UX terintegrasi
python .agent/scripts/checklist.py .

# 3. Menjalankan proses build produksi Next.js
npm run build
```

### Rule Compliance Checklist
- [ ] Tidak ada penggunaan kode warna ungu/violet secara dekoratif di luar kecocokan identitas (*Purple Ban*).
- [ ] Layout halaman input 100% kustom split-screen bento grid (*Template Ban*).
- [ ] Modal konfirmasi batal terintegrasi dengan validasi Next.js/Browser.
- [ ] Lulus uji kompilasi build produksi Next.js tanpa warning kritis.
