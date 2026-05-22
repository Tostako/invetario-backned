import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
export declare const obtenerPerfil: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const actualizarPerfil: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const cambiarPassword: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const obtenerPreferencias: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const actualizarPreferencias: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const listarSesiones: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const eliminarSesion: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const setup2fa: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const enable2fa: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const disable2fa: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=user.controller.d.ts.map