import { createClient } from '@vercel/postgres';

const client = createClient({
  connectionString: process.env.POSTGRES_URL,
});

await client.connect();

export const sql = client.sql.bind(client);
