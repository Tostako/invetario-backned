import { AppError } from '../errors/AppError';
type Manejadores = Record<string, (mensaje: string) => AppError>;
export declare const traducirErrorDB: (err: unknown, manejadores: Manejadores) => AppError;
export {};
//# sourceMappingURL=dbErrors.d.ts.map