import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

import { format, parseISO, isValid } from "date-fns";
import { id } from "date-fns/locale";

/**
 * Format a date string to localized Indonesian date
 */
export function formatTanggal(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return dateStr;
    return format(date, "d MMMM yyyy", { locale: id });
  } catch (error) {
    return dateStr;
  }
}

/**
 * Format a date to dd MMMM yyyy
 */
export function formatTanggalDDMMYYYY(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return dateStr;
    return format(date, "dd MMMM yyyy", { locale: id });
  } catch (error) {
    return dateStr;
  }
}

/**
 * Format a date to short form
 */
export function formatTanggalPendek(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return dateStr;
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
    }).format(date);
  } catch (error) {
    return dateStr;
  }
}

/**
 * Get current month in YYYY-MM format
 * Based on custom cycle: if day >= cycleStartDay, it's the next month's cycle
 */
export function getCurrentMonth(cycleStartDay: number = 25): string {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1;
  const day = now.getDate();

  if (day >= cycleStartDay) {
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return `${year}-${String(month).padStart(2, "0")}`;
}

/**
 * Check if a date falls within the custom month cycle (cycleStartDay to cycleStartDay-1)
 */
export function isInCustomMonth(
  dateStr: string,
  monthId: string,
  cycleStartDay: number = 25,
): boolean {
  if (!dateStr || !monthId) return false;
  const [targetYear, targetMonth] = monthId.split("-").map(Number);

  // Custom month cycle starts on cycleStartDay of previous month and ends on cycleStartDay-1 of target month
  const startDate = new Date(targetYear, targetMonth - 2, cycleStartDay);
  const endDate = new Date(
    targetYear,
    targetMonth - 1,
    cycleStartDay - 1,
    23,
    59,
    59,
    999,
  );

  const date = new Date(dateStr);
  return date >= startDate && date <= endDate;
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
        t.id_target_dana === sd.id_sumber_dana
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
  cycleStartDay: number = 25,
): RingkasanBulanan {
  const filtered = transaksiList.filter((t) =>
    isInCustomMonth(t.tanggal, bulan, cycleStartDay),
  );

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
  cycleStartDay: number = 25,
): PengeluaranPerKategori[] {
  const filtered = transaksiList.filter(
    (t) =>
      t.jenis === "Pengeluaran" &&
      isInCustomMonth(t.tanggal, bulan, cycleStartDay),
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
        id_kategori,
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
  cycleStartDay: number = 25,
): TrenMingguan[] {
  const filtered = transaksiList.filter((t) =>
    isInCustomMonth(t.tanggal, bulan, cycleStartDay),
  );
  const [targetYear, targetMonth] = bulan.split("-").map(Number);
  const startDate = new Date(targetYear, targetMonth - 2, cycleStartDay);

  // Group by 7-day chunks starting from the 25th
  const weeks: TrenMingguan[] = [
    { minggu: "Minggu 1", pemasukan: 0, pengeluaran: 0 },
    { minggu: "Minggu 2", pemasukan: 0, pengeluaran: 0 },
    { minggu: "Minggu 3", pemasukan: 0, pengeluaran: 0 },
    { minggu: "Minggu 4", pemasukan: 0, pengeluaran: 0 },
    { minggu: "Minggu 5", pemasukan: 0, pengeluaran: 0 },
  ];

  filtered.forEach((t) => {
    const date = new Date(t.tanggal);
    const diffTime = date.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weekIndex = Math.min(Math.floor(diffDays / 7), 4);

    if (weekIndex >= 0) {
      if (t.jenis === "Pemasukan") {
        weeks[weekIndex].pemasukan += t.nominal;
      } else if (t.jenis === "Pengeluaran") {
        weeks[weekIndex].pengeluaran += t.nominal;
      }
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
 * Calculate multi-month trend for categories
 */
export function hitungTrenBulananKategori(
  transaksiList: Transaksi[],
  kategoriList: Kategori[],
  bulanAkhir: string, // YYYY-MM
  jumlahBulan: number = 6,
  cycleStartDay: number = 25,
): any[] {
  const result = [];
  const [year, month] = bulanAkhir.split("-").map(Number);

  for (let i = jumlahBulan - 1; i >= 0; i--) {
    const d = new Date(year, month - 1 - i, 1);
    const bulanKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bulanNama = new Intl.DateTimeFormat("id-ID", {
      month: "short",
    }).format(d);

    const pengeluaranBulan = hitungPengeluaranPerKategori(
      transaksiList,
      kategoriList,
      bulanKey,
      cycleStartDay,
    );
    const entry: any = { name: bulanNama, total: 0 };

    pengeluaranBulan.forEach((p) => {
      entry[p.nama_kategori] = p.total;
      entry.total += p.total;
    });

    result.push(entry);
  }

  return result;
}

/**
 * Calculate month-over-month spending comparison per category
 */
export function hitungPerbandinganKategori(
  transaksiList: Transaksi[],
  kategoriList: Kategori[],
  bulanAktif: string,
  cycleStartDay: number = 25,
): {
  id_kategori: string;
  nama_kategori: string;
  totalAktif: number;
  totalLalu: number;
  selisih: number;
  persentase: number;
  icon_name: string;
}[] {
  const [year, month] = bulanAktif.split("-").map(Number);
  const dLalu = new Date(year, month - 2, 1);
  const bulanLalu = `${dLalu.getFullYear()}-${String(dLalu.getMonth() + 1).padStart(2, "0")}`;

  const aktif = hitungPengeluaranPerKategori(
    transaksiList,
    kategoriList,
    bulanAktif,
    cycleStartDay,
  );
  const lalu = hitungPengeluaranPerKategori(
    transaksiList,
    kategoriList,
    bulanLalu,
    cycleStartDay,
  );

  const katAktifMap = new Map<string, PengeluaranPerKategori>();
  aktif.forEach((item) => katAktifMap.set(item.nama_kategori, item));

  const katLaluMap = new Map<string, PengeluaranPerKategori>();
  lalu.forEach((item) => katLaluMap.set(item.nama_kategori, item));

  const allKategoriNames = Array.from(
    new Set([...katAktifMap.keys(), ...katLaluMap.keys()]),
  );

  const perbandingan = allKategoriNames.map((name) => {
    const dataAktif = katAktifMap.get(name);
    const dataLalu = katLaluMap.get(name);
    const totalAktif = dataAktif?.total || 0;
    const totalLalu = dataLalu?.total || 0;
    const selisih = totalAktif - totalLalu;

    // Find the id_kategori and icon_name from either active or previous month's data
    const id_kategori = dataAktif?.id_kategori || dataLalu?.id_kategori || "";
    const icon_name = dataAktif?.icon_name || dataLalu?.icon_name || "circle";

    return {
      id_kategori,
      nama_kategori: name,
      totalAktif,
      totalLalu,
      selisih,
      icon_name,
    };
  });

  return perbandingan
    .map((item) => ({
      ...item,
      persentase:
        item.totalLalu > 0
          ? Math.round((item.selisih / item.totalLalu) * 100)
          : item.totalAktif > 0
            ? 100
            : 0, // If previous month was 0 and current is >0, it's 100% increase. If both 0, 0%.
    }))
    .sort((a, b) => b.totalAktif - a.totalAktif);
}

/**
 * Calculate budget status per category
 */
export function hitungBudgetStatus(
  transaksiList: Transaksi[],
  kategoriList: Kategori[],
  budgetList: Budget[],
  bulan: string, // YYYY-MM
  cycleStartDay: number = 25,
): BudgetStatus[] {
  const [yearStr, monthStr] = bulan.split("-");
  const yearNum = parseInt(yearStr);
  const monthNum = parseInt(monthStr);

  const filtered = transaksiList.filter(
    (t) =>
      t.jenis === "Pengeluaran" &&
      isInCustomMonth(t.tanggal, bulan, cycleStartDay),
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
  "#06b6d4", // cyan (replaced violet)
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
  if (!bulan) return "";
  const [year, month] = bulan.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export const hitungTanggalBerikutnya = (tanggal: string, frekuensi: string) => {
  const date = new Date(tanggal);
  if (isNaN(date.getTime())) return "";

  switch (frekuensi) {
    case "Harian":
      date.setDate(date.getDate() + 1);
      break;
    case "Mingguan":
      date.setDate(date.getDate() + 7);
      break;
    case "Bulanan":
      date.setMonth(date.getMonth() + 1);
      break;
    case "3 Bulan":
      date.setMonth(date.getMonth() + 3);
      break;
    case "6 Bulan":
      date.setMonth(date.getMonth() + 6);
      break;
    case "Tahunan":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      return tanggal;
  }
  return date.toISOString().split("T")[0];
};

/**
 * Mendapatkan tanggal efektif yang harus ditampilkan ke user.
 * Jika tanggal_mulai belum lewat hari ini, gunakan itu.
 * Jika sudah lewat, gunakan tanggal_berikutnya.
 */
export function getJadwalTerdekat(mulai: string, berikutnya: string): string {
  const today = getToday();
  if (!mulai) return berikutnya;
  return mulai >= today ? mulai : berikutnya;
}

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat("id-ID").format(num);
};

/**
 * Safely evaluate basic math expressions (+, -, *, /)
 */
export function evaluateMathExpression(expr: string): number | null {
  // Remove spaces
  let sanitized = expr.replace(/\s+/g, "");
  
  // Remove any trailing operators that make the expression invalid for evaluation
  sanitized = sanitized.replace(/[+\-*/.]+$/, "");

  // Only allow digits, operators, and decimal points
  sanitized = sanitized.replace(/[^0-9+\-*/.]/g, "");
  
  if (!sanitized) return null;

  try {
    // eslint-disable-next-line no-new-func
    const result = new Function(`return ${sanitized}`)();
    if (typeof result === 'number' && isFinite(result)) {
      return result;
    }
  } catch {
    // If it's just an incomplete expression, we don't need to log an error
    return null;
  }
  return null;
}
