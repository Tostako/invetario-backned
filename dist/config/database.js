"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = exports.withTransaction = exports.query = void 0;
const pg_1 = require("pg");
const env_1 = require("./env");
// Pool de conexiones — reutiliza conexiones en lugar de abrir una por request
const isSupabase = env_1.env.db.url.includes('supabase.co') || env_1.env.db.url.includes('supabase.com');
const pool = new pg_1.Pool({
    connectionString: env_1.env.db.url,
    max: 20, // máximo de conexiones simultáneas
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: isSupabase ? { rejectUnauthorized: false } : (env_1.env.isDev ? false : { rejectUnauthorized: false }),
});
pool.on('error', (err) => {
    console.error('[DB] Unexpected error on idle client', err);
    process.exit(1);
});
// query: para operaciones simples de lectura/escritura
const query = (text, params) => pool.query(text, params);
exports.query = query;
// withTransaction: envuelve múltiples operaciones en una transacción atómica
const withTransaction = async (fn) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await fn(client);
        await client.query('COMMIT');
        return result;
    }
    catch (err) {
        await client.query('ROLLBACK');
        throw err;
    }
    finally {
        client.release();
    }
};
exports.withTransaction = withTransaction;
const testConnection = async () => {
    const client = await pool.connect();
    client.release();
    console.log('[DB] Connection established successfully');
};
exports.testConnection = testConnection;
exports.default = pool;
//# sourceMappingURL=database.js.map