import { UsuarioConPassword } from './user.repository';
import { UpdateProfileDto, ChangePasswordDto, NotificationPreferencesPatch, PreferenciasNotificacion, PerfilUsuario } from './user.types';
export declare const aPerfilPublico: (u: UsuarioConPassword) => PerfilUsuario;
export declare const obtenerPerfilService: (shopId: string, userId: string) => Promise<PerfilUsuario>;
export declare const actualizarPerfilService: (shopId: string, userId: string, dto: UpdateProfileDto) => Promise<PerfilUsuario>;
export declare const cambiarPasswordService: (shopId: string, userId: string, dto: ChangePasswordDto) => Promise<void>;
export declare const obtenerPreferenciasService: (shopId: string, userId: string) => Promise<PreferenciasNotificacion>;
export declare const actualizarPreferenciasService: (shopId: string, userId: string, patch: NotificationPreferencesPatch) => Promise<PreferenciasNotificacion>;
export declare const listarSesionesService: (shopId: string, userId: string, jtiActual: string | undefined) => Promise<{
    id: string;
    created_at: string;
    last_seen_at: string;
    user_agent: string | null;
    ip_address: string | null;
    revocada: boolean;
    sesion_actual: boolean;
}[]>;
export declare const revocarSesionService: (shopId: string, userId: string, sessionId: string) => Promise<void>;
export declare const configurar2faService: (shopId: string, userId: string) => Promise<{
    secret: string;
    otpauth_url: string;
}>;
export declare const activar2faService: (shopId: string, userId: string, code: string) => Promise<{
    two_factor_enabled: boolean;
}>;
export declare const desactivar2faService: (shopId: string, userId: string, password: string) => Promise<{
    two_factor_enabled: boolean;
}>;
//# sourceMappingURL=user.service.d.ts.map