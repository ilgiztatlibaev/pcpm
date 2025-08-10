import { sql } from './_db.mjs';

export default async function handler(req, res) {
  try {
    // Добавлено — сразу говорим, что отдаём JSON
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    await sql`CREATE TABLE IF NOT EXISTS subprojects (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL
    );`;

    await sql`CREATE TABLE IF NOT EXISTS vendors (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL
    );`;

    await sql`CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value_json JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
    );`;

    await sql`CREATE TABLE IF NOT EXISTS purchases (
      id SERIAL PRIMARY KEY,
      subproject_id INT REFERENCES subprojects(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      vendor_id INT REFERENCES vendors(id) ON DELETE SET NULL,
      goal TEXT,
      qty_planned NUMERIC(18,3) DEFAULT 0 NOT NULL,
      price NUMERIC(18,2) DEFAULT 0 NOT NULL,
      sum_planned NUMERIC(18,2) GENERATED ALWAYS AS (qty_planned * price) STORED,
      qty_ordered NUMERIC(18,3) DEFAULT 0 NOT NULL,
      qty_shipped NUMERIC(18,3) DEFAULT 0 NOT NULL,
      sum_paid NUMERIC(18,2) DEFAULT 0 NOT NULL,
      status TEXT DEFAULT 'Планируется' NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
    );`;

    await sql`CREATE INDEX IF NOT EXISTS purchases_status_idx ON purchases(status);`;
    await sql`CREATE INDEX IF NOT EXISTS purchases_sub_idx ON purchases(subproject_id);`;
    await sql`CREATE INDEX IF NOT EXISTS purchases_vendor_idx ON purchases(vendor_id);`;

    await sql`CREATE OR REPLACE VIEW v_progress AS
      SELECT
        COUNT(*) AS items_total,
        COALESCE(SUM(sum_planned),0) AS planned_total,
        COALESCE(SUM(CASE WHEN status IN ('Заказано','Отгружено частично','Отгружено полностью','Оплачено') THEN sum_planned ELSE 0 END),0) AS ordered_total,
        COALESCE(SUM(CASE WHEN status IN ('Отгружено частично','Отгружено полностью','Оплачено') THEN sum_planned ELSE 0 END),0) AS shipped_total,
        COALESCE(SUM(sum_paid),0) AS paid_total
      FROM purchases;
    `;

    await sql`INSERT INTO settings(key, value_json)
      VALUES ('fx', '{"base":"USD","display":"RUB","rate":90.00}')
      ON CONFLICT (key) DO NOTHING;`;

    res.status(200).json({ ok: true, message: 'База готова' });
  } catch (e) {
    res.status(500).json({ ok:false, error: String(e) });
  }
}
