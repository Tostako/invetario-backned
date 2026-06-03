import { Pool, PoolClient, QueryResultRow } from 'pg';
declare const pool: Pool;
export declare const query: <T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]) => Promise<import("pg").QueryResult<T>>;
export declare const withTransaction: <T>(fn: (client: PoolClient) => Promise<T>) => Promise<T>;
export declare const testConnection: () => Promise<void>;
export default pool;
//# sourceMappingURL=database.d.ts.map