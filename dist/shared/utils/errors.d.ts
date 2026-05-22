/**
 * Parsea errores de PostgreSQL (específicamente violaciones de UNIQUE code 23505)
 * para devolver un ConflictError con un mensaje y código más específico.
 */
export declare const handlePgConflict: (err: unknown, defaultMsg?: string) => never;
//# sourceMappingURL=errors.d.ts.map