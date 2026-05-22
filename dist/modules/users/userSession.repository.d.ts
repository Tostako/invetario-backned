export interface CrearSesionParams {
    userId: string;
    shopId: string;
    jti: string;
    userAgent: string | null;
    ipAddress: string | null;
}
export declare const crearSesionUsuario: (p: CrearSesionParams) => Promise<void>;
export declare const sesionActivaPorJti: (userId: string, shopId: string, jti: string) => Promise<boolean>;
export declare const listarSesionesUsuario: (userId: string, shopId: string) => Promise<import("pg").QueryResult<{
    id: string;
    created_at: Date;
    last_seen_at: Date;
    user_agent: string | null;
    ip_address: string | null;
    revoked_at: Date | null;
    jti: string;
}>>;
export declare const revocarSesion: (userId: string, shopId: string, sessionId: string) => Promise<boolean>;
//# sourceMappingURL=userSession.repository.d.ts.map