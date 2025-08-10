// api/_db.mjs
import { createClient } from '@vercel/postgres';

// Берём строку подключения из env (оба варианта, вдруг один из них задан)
const connectionString =
  process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;

console.log('ENV DEBUG', process.env);
if (!connectionString) {
  throw new Error('Database connection string not found in env');
}

const client = createClient({ connectionString });
await client.connect();

// Экспортируем тот же интерфейс, что и раньше: sql`...`
export const sql = client.sql.bind(client);
