import { UpdateProfileDto, PreferenciasNotificacion } from './user.types';
export interface UsuarioConPassword {
    id: string;
    shop_id: string;
    name: string;
    email: string;
    phone: string | null;
    password: string;
    role: string;
    is_active: boolean;
    notification_preferences: unknown;
    two_factor_enabled: boolean;
    two_factor_secret: string | null;
    two_factor_pending_secret: string | null;
    last_login: Date | null;
    created_at: Date;
    updated_at: Date;
}
export declare const obtenerUsuarioCompleto: (shopId: string, userId: string) => Promise<UsuarioConPassword | null>;
export declare const emailUsuarioExisteEnTienda: (shopId: string, email: string, excludeUserId: string) => Promise<boolean>;
export declare const actualizarPerfilUsuario: (shopId: string, userId: string, dto: UpdateProfileDto) => Promise<UsuarioConPassword | null>;
export declare const actualizarPasswordUsuario: (shopId: string, userId: string, passwordHash: string) => Promise<void>;
export declare const guardarPreferenciasNotificacion: (shopId: string, userId: string, prefs: PreferenciasNotificacion) => Promise<void>;
export declare const guardarPending2fa: (shopId: string, userId: string, pendingSecret: string | null) => Promise<void>;
export declare const activar2faUsuario: (shopId: string, userId: string, secret: string) => Promise<void>;
export declare const desactivar2faUsuario: (shopId: string, userId: string) => Promise<void>;
//# sourceMappingURL=user.repository.d.ts.map