// api/_db.mjs
import { createPool } from '@vercel/postgres';

const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

if (!connectionString) {
  throw new Error('Database connection string not found in env');
}

export const pool = createPool({ connectionString });
// даём тот же интерфейс, что и раньше
export const sql = pool.sql.bind(pool);
