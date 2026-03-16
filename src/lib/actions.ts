"use server";

// ============================================================
// Server Actions - Google Sheets API Integration
// Uses Service Account for authentication
// ============================================================

import { google } from "googleapis";
import type {
  Transaksi,
  Kategori,
  SumberDana,
  RecurringTransaction,
  Budget,
} from "@/lib/types";

// ---------- Google Sheets Auth Setup ----------
function getAuth() {
  const credentials = JSON.parse(
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "{}",
  );

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getSheets() {
  const auth = getAuth();
  return google.sheets({ version: "v4", auth });
}

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;

// ============================================================
// Helper: Find row by ID and get sheet metadata
// ============================================================

async function findRowAndGetSheetId(sheetName: string, id: string) {
  const sheets = getSheets();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:A`,
  });

  const rows = response.data.values || [];
  const rowIndex = rows.findIndex((row) => row[0] === id);
  if (rowIndex === -1) return null;

  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });

  const sheet = spreadsheet.data.sheets?.find(
    (s) => s.properties?.title === sheetName,
  );

  if (!sheet?.properties?.sheetId && sheet?.properties?.sheetId !== 0)
    return null;

  return { rowIndex, sheetId: sheet.properties.sheetId, sheets };
}

async function deleteRowByIdFromSheet(
  sheetName: string,
  id: string,
): Promise<boolean> {
  try {
    const result = await findRowAndGetSheetId(sheetName, id);
    if (!result) return false;

    const { rowIndex, sheetId, sheets } = result;
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: "ROWS",
                startIndex: rowIndex,
                endIndex: rowIndex + 1,
              },
            },
          },
        ],
      },
    });
    return true;
  } catch (error) {
    console.error(`Error deleting from ${sheetName}:`, error);
    return false;
  }
}

// ============================================================
// READ Operations
// ============================================================

export async function fetchKategori(): Promise<Kategori[]> {
  try {
    const sheets = getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Master_Kategori!A2:D",
    });

    const rows = response.data.values || [];
    return rows.map((row) => ({
      id_kategori: row[0] || "",
      nama_kategori: row[1] || "",
      tipe: (row[2] as "Pengeluaran" | "Pemasukan") || "Pengeluaran",
      icon_name: row[3] || "circle",
    }));
  } catch (error) {
    console.error("Error fetching kategori:", error);
    return [];
  }
}

export async function fetchSumberDana(): Promise<SumberDana[]> {
  try {
    const sheets = getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Master_Sumber_Dana!A2:C",
    });

    const rows = response.data.values || [];
    return rows.map((row) => ({
      id_sumber_dana: row[0] || "",
      nama_sumber: row[1] || "",
      saldo_awal: parseFloat(row[2]) || 0,
    }));
  } catch (error) {
    console.error("Error fetching sumber dana:", error);
    return [];
  }
}

export async function fetchTransaksi(bulan?: string): Promise<Transaksi[]> {
  try {
    const sheets = getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Transaksi!A2:I",
    });

    const rows = response.data.values || [];
    const all: Transaksi[] = rows.map((row) => ({
      id: row[0] || "",
      tanggal: row[1] || "",
      jenis: (row[2] as Transaksi["jenis"]) || "Pengeluaran",
      id_sumber_dana: row[3] || "",
      id_kategori: row[4] || "",
      nominal: parseFloat(row[5]) || 0,
      catatan: row[6] || "",
      id_target_dana: row[7] || undefined,
      label: row[8] || "",
    }));

    if (bulan) {
      return all.filter((t) => t.tanggal.startsWith(bulan));
    }
    return all;
  } catch (error) {
    console.error("Error fetching transaksi:", error);
    return [];
  }
}

export async function fetchRecurring(): Promise<RecurringTransaction[]> {
  try {
    const sheets = getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Recurring!A2:K",
    });

    const rows = response.data.values || [];
    return rows.map((row) => ({
      id: row[0] || "",
      id_kategori: row[1] || "",
      id_sumber_dana: row[2] || "",
      jenis: (row[3] as "Pengeluaran" | "Pemasukan") || "Pengeluaran",
      nominal: parseFloat(row[4]) || 0,
      catatan: row[5] || "",
      label: row[6] || "",
      frekuensi: (row[7] as RecurringTransaction["frekuensi"]) || "Bulanan",
      tanggal_mulai: row[8] || "",
      tanggal_berikutnya: row[9] || "",
      aktif: String(row[10]).toLowerCase() === "true",
    }));
  } catch (error) {
    console.error("Error fetching recurring:", error);
    return [];
  }
}

export async function fetchBudgets(): Promise<Budget[]> {
  try {
    const sheets = getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Anggaran!A2:E",
    });

    const rows = response.data.values || [];
    return rows.map((row) => ({
      id_anggaran: row[0] || "",
      id_kategori: row[1] || "",
      bulan: parseInt(row[2]) || 1,
      tahun: parseInt(row[3]) || new Date().getFullYear(),
      nominal_limit: parseFloat(row[4]) || 0,
    }));
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return [];
  }
}

// ============================================================
// WRITE Operations - Transaksi
// ============================================================

export async function tambahTransaksi(transaksi: Transaksi): Promise<boolean> {
  try {
    const sheets = getSheets();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Transaksi!A:I",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            transaksi.id,
            transaksi.tanggal,
            transaksi.jenis,
            transaksi.id_sumber_dana,
            transaksi.id_kategori,
            transaksi.nominal,
            transaksi.catatan,
            transaksi.id_target_dana || "",
            transaksi.label,
          ],
        ],
      },
    });
    return true;
  } catch (error) {
    console.error("Error adding transaksi:", error);
    return false;
  }
}

export async function updateTransaksi(transaksi: Transaksi): Promise<boolean> {
  try {
    const result = await findRowAndGetSheetId("Transaksi", transaksi.id);
    if (!result) return false;

    const { rowIndex } = result;
    const sheets = getSheets();

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Transaksi!A${rowIndex + 1}:I${rowIndex + 1}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            transaksi.id,
            transaksi.tanggal,
            transaksi.jenis,
            transaksi.id_sumber_dana,
            transaksi.id_kategori,
            transaksi.nominal,
            transaksi.catatan,
            transaksi.id_target_dana || "",
            transaksi.label,
          ],
        ],
      },
    });
    return true;
  } catch (error) {
    console.error("Error updating transaksi:", error);
    return false;
  }
}

export async function tambahTransfer(transaksi: Transaksi): Promise<boolean> {
  return tambahTransaksi(transaksi);
}

export async function tambahRecurring(
  recurring: RecurringTransaction,
): Promise<boolean> {
  try {
    const sheets = getSheets();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Recurring!A:K",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            recurring.id,
            recurring.id_kategori,
            recurring.id_sumber_dana,
            recurring.jenis,
            recurring.nominal,
            recurring.catatan,
            recurring.label,
            recurring.frekuensi,
            recurring.tanggal_mulai,
            recurring.tanggal_berikutnya,
            recurring.aktif.toString(),
          ],
        ],
      },
    });
    return true;
  } catch (error) {
    console.error("Error adding recurring:", error);
    return false;
  }
}

export async function updateRecurring(
  recurring: RecurringTransaction,
): Promise<boolean> {
  try {
    const result = await findRowAndGetSheetId("Recurring", recurring.id);
    if (!result) return false;

    const { rowIndex } = result;
    const sheets = getSheets();

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Recurring!A${rowIndex + 1}:K${rowIndex + 1}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            recurring.id,
            recurring.id_kategori,
            recurring.id_sumber_dana,
            recurring.jenis,
            recurring.nominal,
            recurring.catatan,
            recurring.label,
            recurring.frekuensi,
            recurring.tanggal_mulai,
            recurring.tanggal_berikutnya,
            recurring.aktif.toString(),
          ],
        ],
      },
    });
    return true;
  } catch (error) {
    console.error("Error updating recurring:", error);
    return false;
  }
}

export async function hapusRecurring(id: string): Promise<boolean> {
  return deleteRowByIdFromSheet("Recurring", id);
}

export async function tambahBudget(budget: Budget): Promise<boolean> {
  try {
    const sheets = getSheets();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Anggaran!A:E",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            budget.id_anggaran,
            budget.id_kategori,
            budget.bulan,
            budget.tahun,
            budget.nominal_limit,
          ],
        ],
      },
    });
    return true;
  } catch (error) {
    console.error("Error adding budget:", error);
    return false;
  }
}

export async function updateBudget(budget: Budget): Promise<boolean> {
  try {
    const result = await findRowAndGetSheetId("Anggaran", budget.id_anggaran);
    if (!result) return false;

    const { rowIndex } = result;
    const sheets = getSheets();

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Anggaran!A${rowIndex + 1}:E${rowIndex + 1}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            budget.id_anggaran,
            budget.id_kategori,
            budget.bulan,
            budget.tahun,
            budget.nominal_limit,
          ],
        ],
      },
    });
    return true;
  } catch (error) {
    console.error("Error updating budget:", error);
    return false;
  }
}

export async function hapusBudget(id: string): Promise<boolean> {
  return deleteRowByIdFromSheet("Anggaran", id);
}

export async function hapusTransaksi(id: string): Promise<boolean> {
  return deleteRowByIdFromSheet("Transaksi", id);
}

/**
 * Process due recurring transactions and create real transactions
 */
export async function prosesRecurring(): Promise<boolean> {
  try {
    const [recurringList, transaksiList] = await Promise.all([
      fetchRecurring(),
      fetchTransaksi(),
    ]);

    const activeRecurring = recurringList.filter((r) => r.aktif);
    const today = new Date().toISOString().split("T")[0];
    const newTransactions: Transaksi[] = [];
    const updatedRecurring: RecurringTransaction[] = [];

    const { hitungTanggalBerikutnya, generateId } = await import("./utils");

    for (const r of activeRecurring) {
      let nextDate = r.tanggal_berikutnya;

      // If next date is today or in the past, process it
      while (nextDate <= today && nextDate !== "") {
        // Create new transaction
        const newTx: Transaksi = {
          id: generateId(),
          tanggal: nextDate,
          jenis: r.jenis,
          id_sumber_dana: r.id_sumber_dana,
          id_kategori: r.id_kategori,
          nominal: r.nominal,
          label: r.label,
          catatan: r.catatan ? `[RECURRING] ${r.catatan}` : "[RECURRING]",
        };

        // Check if this transaction already exists to avoid duplicates
        // (Simplified check: same date, same category, same nominal, same source)
        const exists = transaksiList.some(
          (t) =>
            t.tanggal === newTx.tanggal &&
            t.id_kategori === newTx.id_kategori &&
            t.nominal === newTx.nominal &&
            t.id_sumber_dana === newTx.id_sumber_dana &&
            t.catatan.includes("[RECURRING]"),
        );

        if (!exists) {
          newTransactions.push(newTx);
        }

        // Calculate next occurrence
        nextDate = hitungTanggalBerikutnya(nextDate, r.frekuensi);
      }

      if (nextDate !== r.tanggal_berikutnya) {
        updatedRecurring.push({ ...r, tanggal_berikutnya: nextDate });
      }
    }

    if (newTransactions.length === 0 && updatedRecurring.length === 0) {
      return true;
    }

    const sheets = getSheets();

    // 1. Add all new transactions
    if (newTransactions.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: "Transaksi!A:I",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: newTransactions.map((t) => [
            t.id,
            t.tanggal,
            t.jenis,
            t.id_sumber_dana,
            t.id_kategori,
            t.nominal,
            t.catatan,
            t.id_target_dana || "",
            t.label,
          ]),
        },
      });
    }

    // 2. Update recurring dates (individually for now as Sheets batch update is complex with indices)
    for (const r of updatedRecurring) {
      await updateRecurring(r);
    }

    return true;
  } catch (error) {
    console.error("Error processing recurring:", error);
    return false;
  }
}

// ============================================================
// KATEGORI CRUD
// ============================================================

export async function tambahKategori(kategori: Kategori): Promise<boolean> {
  try {
    const sheets = getSheets();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Master_Kategori!A:D",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            kategori.id_kategori,
            kategori.nama_kategori,
            kategori.tipe,
            kategori.icon_name,
          ],
        ],
      },
    });
    return true;
  } catch (error) {
    console.error("Error adding kategori:", error);
    return false;
  }
}

export async function updateKategori(kategori: Kategori): Promise<boolean> {
  try {
    const result = await findRowAndGetSheetId(
      "Master_Kategori",
      kategori.id_kategori,
    );
    if (!result) return false;

    const { rowIndex } = result;
    const sheets = getSheets();

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Master_Kategori!A${rowIndex + 1}:D${rowIndex + 1}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            kategori.id_kategori,
            kategori.nama_kategori,
            kategori.tipe,
            kategori.icon_name,
          ],
        ],
      },
    });
    return true;
  } catch (error) {
    console.error("Error updating kategori:", error);
    return false;
  }
}

export async function hapusKategori(id_kategori: string): Promise<boolean> {
  return deleteRowByIdFromSheet("Master_Kategori", id_kategori);
}

// ============================================================
// SUMBER DANA CRUD
// ============================================================

export async function tambahSumberDana(
  sumberDana: SumberDana,
): Promise<boolean> {
  try {
    const sheets = getSheets();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Master_Sumber_Dana!A:C",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            sumberDana.id_sumber_dana,
            sumberDana.nama_sumber,
            sumberDana.saldo_awal,
          ],
        ],
      },
    });
    return true;
  } catch (error) {
    console.error("Error adding sumber dana:", error);
    return false;
  }
}

export async function updateSumberDana(
  sumberDana: SumberDana,
): Promise<boolean> {
  try {
    const result = await findRowAndGetSheetId(
      "Master_Sumber_Dana",
      sumberDana.id_sumber_dana,
    );
    if (!result) return false;

    const { rowIndex } = result;
    const sheets = getSheets();

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Master_Sumber_Dana!A${rowIndex + 1}:C${rowIndex + 1}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            sumberDana.id_sumber_dana,
            sumberDana.nama_sumber,
            sumberDana.saldo_awal,
          ],
        ],
      },
    });
    return true;
  } catch (error) {
    console.error("Error updating sumber dana:", error);
    return false;
  }
}

export async function hapusSumberDana(
  id_sumber_dana: string,
): Promise<boolean> {
  return deleteRowByIdFromSheet("Master_Sumber_Dana", id_sumber_dana);
}
