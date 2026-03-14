// ============================================================
// Utility & Helper Functions
// ============================================================

import type {
  Transaksi,
  SumberDana,
  SaldoAkun,
  RingkasanBulanan,
  PengeluaranPerKategori,
  TrenMingguan,
  Kategori,
  BudgetStatus,
  Budget,
} from "./types";

/**
 * Format a number as Indonesian Rupiah currency
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a date string to localized Indonesian date
 */
export function formatTanggal(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Format a date to short form
 */
export function formatTanggalPendek(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
  }).format(date);
}

/**
 * Get current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/**
 * Calculate saldo for each sumber dana based on saldo_awal + transactions
 */
export function hitungSaldoAkun(
  sumberDanaList: SumberDana[],
  transaksiList: Transaksi[],
): SaldoAkun[] {
  return sumberDanaList.map((sd) => {
    let saldo = sd.saldo_awal;

    transaksiList.forEach((t) => {
      if (t.id_sumber_dana === sd.id_sumber_dana) {
        if (t.jenis === "Pemasukan") {
          saldo += t.nominal;
        } else if (t.jenis === "Pengeluaran") {
          saldo -= t.nominal;
        } else if (t.jenis === "Transfer") {
          // Source account loses money in transfer
          saldo -= t.nominal;
        }
      }
      // If this sumber dana is the TARGET of a transfer
      if (
        t.jenis === "Transfer" &&
        t.id_sumber_dana_tujuan === sd.id_sumber_dana
      ) {
        saldo += t.nominal;
      }
    });

    return {
      id_sumber_dana: sd.id_sumber_dana,
      nama_sumber: sd.nama_sumber,
      saldo,
    };
  });
}

/**
 * Calculate monthly summary (pemasukan & pengeluaran for current month)
 */
export function hitungRingkasanBulanan(
  transaksiList: Transaksi[],
  bulan: string, // YYYY-MM
): RingkasanBulanan {
  const filtered = transaksiList.filter((t) => t.tanggal.startsWith(bulan));

  let total_pemasukan = 0;
  let total_pengeluaran = 0;

  filtered.forEach((t) => {
    if (t.jenis === "Pemasukan") total_pemasukan += t.nominal;
    if (t.jenis === "Pengeluaran") total_pengeluaran += t.nominal;
  });

  return {
    total_pemasukan,
    total_pengeluaran,
    saldo_total: total_pemasukan - total_pengeluaran,
  };
}

/**
 * Calculate spending per category for pie chart
 */
export function hitungPengeluaranPerKategori(
  transaksiList: Transaksi[],
  kategoriList: Kategori[],
  bulan: string,
): PengeluaranPerKategori[] {
  const filtered = transaksiList.filter(
    (t) => t.jenis === "Pengeluaran" && t.tanggal.startsWith(bulan),
  );

  const map = new Map<string, number>();
  filtered.forEach((t) => {
    const current = map.get(t.id_kategori) || 0;
    map.set(t.id_kategori, current + t.nominal);
  });

  const total = Array.from(map.values()).reduce((a, b) => a + b, 0);

  return Array.from(map.entries())
    .map(([id_kategori, totalKat]) => {
      const kat = kategoriList.find((k) => k.id_kategori === id_kategori);
      return {
        nama_kategori: kat?.nama_kategori || "Lainnya",
        icon_name: kat?.icon_name || "circle",
        total: totalKat,
        persentase: total > 0 ? Math.round((totalKat / total) * 100) : 0,
      };
    })
    .sort((a, b) => b.total - a.total);
}

/**
 * Calculate weekly trend data for bar chart
 */
export function hitungTrenMingguan(
  transaksiList: Transaksi[],
  bulan: string,
): TrenMingguan[] {
  const filtered = transaksiList.filter((t) => t.tanggal.startsWith(bulan));

  // Group by week of month
  const weeks: TrenMingguan[] = [
    { minggu: "Minggu 1", pemasukan: 0, pengeluaran: 0 },
    { minggu: "Minggu 2", pemasukan: 0, pengeluaran: 0 },
    { minggu: "Minggu 3", pemasukan: 0, pengeluaran: 0 },
    { minggu: "Minggu 4", pemasukan: 0, pengeluaran: 0 },
    { minggu: "Minggu 5", pemasukan: 0, pengeluaran: 0 },
  ];

  filtered.forEach((t) => {
    const day = new Date(t.tanggal).getDate();
    const weekIndex = Math.min(Math.floor((day - 1) / 7), 4);

    if (t.jenis === "Pemasukan") {
      weeks[weekIndex].pemasukan += t.nominal;
    } else if (t.jenis === "Pengeluaran") {
      weeks[weekIndex].pengeluaran += t.nominal;
    }
  });

  // Remove empty trailing weeks
  while (
    weeks.length > 1 &&
    weeks[weeks.length - 1].pemasukan === 0 &&
    weeks[weeks.length - 1].pengeluaran === 0
  ) {
    weeks.pop();
  }

  return weeks;
}

/**
 * Calculate budget status per category
 */
export function hitungBudgetStatus(
  transaksiList: Transaksi[],
  kategoriList: Kategori[],
  budgetList: Budget[],
  bulan: string, // YYYY-MM
): BudgetStatus[] {
  const [yearStr, monthStr] = bulan.split("-");
  const yearNum = parseInt(yearStr);
  const monthNum = parseInt(monthStr);

  const filtered = transaksiList.filter(
    (t) => t.jenis === "Pengeluaran" && t.tanggal.startsWith(bulan),
  );

  return budgetList
    .filter((b) => b.bulan === monthNum && b.tahun === yearNum)
    .map((b) => {
      const kat = kategoriList.find((k) => k.id_kategori === b.id_kategori);
      const terpakai = filtered
        .filter((t) => t.id_kategori === b.id_kategori)
        .reduce((sum, t) => sum + t.nominal, 0);
      const persentase =
        b.nominal_limit > 0
          ? Math.round((terpakai / b.nominal_limit) * 100)
          : 0;

      return {
        id_kategori: b.id_kategori,
        nama_kategori: kat?.nama_kategori || "Lainnya",
        batas: b.nominal_limit,
        terpakai,
        persentase,
        status:
          persentase >= 100
            ? "bahaya"
            : persentase >= 80
              ? "peringatan"
              : "aman",
      } as BudgetStatus;
    });
}

/**
 * Generate a short unique ID
 */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Pie chart color palette
 */
export const CHART_COLORS = [
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
  "#6366f1", // indigo
  "#84cc16", // lime
];

/**
 * Get month name in Indonesian
 */
export function getNamaBulan(bulan: string): string {
  const [year, month] = bulan.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(date);
}
