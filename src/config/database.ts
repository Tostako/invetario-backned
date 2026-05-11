import { Pool, PoolClient, QueryResultRow } from 'pg';
import { env } from './env';

// Pool de conexiones — reutiliza conexiones en lugar de abrir una por request
const isSupabase = env.db.url.includes('supabase.co') || env.db.url.includes('supabase.com');

const pool = new Pool({
  connectionString: env.db.url,
  max: 20,           // máximo de conexiones simultáneas
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ssl: isSupabase ? { rejectUnauthorized: false } : (env.isDev ? false : { rejectUnauthorized: false }),
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client', err);
  process.exit(1);
});

// query: para operaciones simples de lectura/escritura
export const query = <T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
) => pool.query<T>(text, params);

// withTransaction: envuelve múltiples operaciones en una transacción atómica
export const withTransaction = async <T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const testConnection = async (): Promise<void> => {
  const client = await pool.connect();
  client.release();
  console.log('[DB] Connection established successfully');
};

export default pool;
