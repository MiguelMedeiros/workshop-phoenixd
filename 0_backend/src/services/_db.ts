import sqlite3, { Database } from "sqlite3";
import { open } from "sqlite";

async function openDb() {
  try {
    return await open({
      filename: "./data/database.db",
      driver: sqlite3.Database,
    });
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function initDb() {
  try {
    const db = await openDb();

    if (!db) return null;

    await db.exec(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        websocket_id TEXT,
        author TEXT,
        message TEXT,
        invoice_bolt11 TEXT,
        invoice TEXT,
        amount INTEGER,
        status TEXT,
        created_at TEXT,
        updated_at TEXT
      )
          `);
    return db;
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function createInvoice({
  db,
  websocket_id,
  author,
  message,
  invoice_bolt11,
  invoice,
  amount,
}: {
  db: Database;
  websocket_id: string;
  author: string;
  message: string;
  invoice_bolt11: string;
  invoice: string;
  amount: number;
}) {
  if (!db) return null;

  const result = db.run(
    `
    INSERT INTO invoices (
        websocket_id,
        author,
        message,
        invoice_bolt11,
        invoice,
        amount,
        status,
        created_at,
        updated_at
    ) VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        'waiting_payment',
        datetime('now'),
        datetime('now')
    )
  `,
    [
      websocket_id,
      author,
      message,
      invoice_bolt11,
      JSON.stringify(invoice),
      amount,
    ]
  );

  return result;
}

async function checkInvoiceExists(invoice: string, db: any) {
  if (!db) return null;

  return db.get(
    `
    SELECT * FROM invoices
    WHERE invoice = ?
  `,
    [invoice]
  );
}

async function getAllInvoices(db: any, limit: number, offset: number) {
  if (!db) return null;

  return db.all(
    `
    WITH filtered_invoices AS (
      SELECT 
        author, message, amount, status, updated_at 
      FROM invoices 
      WHERE 
        message IS NOT NULL
        AND status = 'paid'
    )
    SELECT 
      fi.*,
      (SELECT COUNT(*) FROM filtered_invoices) as total_questions
    FROM filtered_invoices fi
    ORDER BY updated_at DESC
    LIMIT ? OFFSET ?
    `,
    [limit, offset]
  );
}

async function getInvoiceByInvoice(db: any, invoice: string) {
  if (!db) return null;

  try {
    return db.get(
      `
      WITH filtered_invoices AS (
        SELECT 
          invoice_bolt11,
          author, 
          message, 
          amount, 
          status, 
          updated_at 
        FROM invoices 
        WHERE 
          message IS NOT NULL
          AND status = 'paid'
      )
      SELECT 
        fi.*,
        (SELECT COUNT(*) FROM filtered_invoices) as total_questions
      FROM filtered_invoices fi
      WHERE fi.invoice_bolt11 = ?
      `,
      [invoice]
    );
  } catch (error) {
    console.error("Error fetching invoice by invoice ID:", error);
    return null;
  }
}

async function updateInvoiceStatus(
  invoice_bolt11: string,
  status: string,
  db: any
) {
  if (!db) return null;

  return db.run(
    `
    UPDATE invoices
    SET 
        status = ?,
        updated_at = datetime('now')
    WHERE invoice_bolt11 = ?
  `,
    [status, invoice_bolt11]
  );
}

export {
  initDb,
  createInvoice,
  updateInvoiceStatus,
  checkInvoiceExists,
  getAllInvoices,
  getInvoiceByInvoice,
};
