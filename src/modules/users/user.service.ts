import bcrypt from 'bcryptjs';
import { generateSecret, generateURI, verifySync } from 'otplib';
import {
  NotFoundError,
  ConflictError,
  ValidationError,
  UnauthorizedError,
} from '../../shared/errors/AppError';
import {
  obtenerUsuarioCompleto,
  emailUsuarioExisteEnTienda,
  actualizarPerfilUsuario,
  actualizarPasswordUsuario,
  guardarPreferenciasNotificacion,
  guardarPending2fa,
  activar2faUsuario,
  desactivar2faUsuario,
  UsuarioConPassword,
} from './user.repository';
import {
  UpdateProfileDto,
  ChangePasswordDto,
  NotificationPreferencesPatch,
  PREFERENCIAS_DEFECTO,
  PreferenciasNotificacion,
  PerfilUsuario,
} from './user.types';
import { listarSesionesUsuario, revocarSesion } from './userSession.repository';

const normalizarPreferencias = (raw: unknown): PreferenciasNotificacion => {
  const o =
    typeof raw === 'object' && raw !== null && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};
  return {
    email_orders: Boolean(o['email_orders'] ?? PREFERENCIAS_DEFECTO.email_orders),
    email_low_stock: Boolean(o['email_low_stock'] ?? PREFERENCIAS_DEFECTO.email_low_stock),
    email_marketing: Boolean(o['email_marketing'] ?? PREFERENCIAS_DEFECTO.email_marketing),
    push_enabled: Boolean(o['push_enabled'] ?? PREFERENCIAS_DEFECTO.push_enabled),
  };
};

export const aPerfilPublico = (u: UsuarioConPassword): PerfilUsuario => ({
  id: u.id,
  shop_id: u.shop_id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
  is_active: u.is_active,
  two_factor_enabled: u.two_factor_enabled,
  last_login: u.last_login ? u.last_login.toISOString() : null,
  created_at: u.created_at.toISOString(),
  updated_at: u.updated_at.toISOString(),
});

export const obtenerPerfilService = async (shopId: string, userId: string): Promise<PerfilUsuario> => {
  const u = await obtenerUsuarioCompleto(shopId, userId);
  if (!u) throw new NotFoundError('Usuario');
  return aPerfilPublico(u);
};

export const actualizarPerfilService = async (
  shopId: string,
  userId: string,
  dto: UpdateProfileDto
) => {
  if (dto.email && (await emailUsuarioExisteEnTienda(shopId, dto.email, userId))) {
    throw new ConflictError('Ya existe un usuario con ese email en esta tienda');
  }
  const u = await actualizarPerfilUsuario(shopId, userId, dto);
  if (!u) throw new NotFoundError('Usuario');
  return aPerfilPublico(u);
};

export const cambiarPasswordService = async (
  shopId: string,
  userId: string,
  dto: ChangePasswordDto
) => {
  const u = await obtenerUsuarioCompleto(shopId, userId);
  if (!u) throw new NotFoundError('Usuario');
  const ok = await bcrypt.compare(dto.current_password, u.password);
  if (!ok) throw new UnauthorizedError('Contraseña actual incorrecta');
  const hash = await bcrypt.hash(dto.new_password, 12);
  await actualizarPasswordUsuario(shopId, userId, hash);
};

export const obtenerPreferenciasService = async (shopId: string, userId: string) => {
  const u = await obtenerUsuarioCompleto(shopId, userId);
  if (!u) throw new NotFoundError('Usuario');
  return normalizarPreferencias(u.notification_preferences);
};

export const actualizarPreferenciasService = async (
  shopId: string,
  userId: string,
  patch: NotificationPreferencesPatch
) => {
  const u = await obtenerUsuarioCompleto(shopId, userId);
  if (!u) throw new NotFoundError('Usuario');
  const actual = normalizarPreferencias(u.notification_preferences);
  const siguiente: PreferenciasNotificacion = { ...actual, ...patch };
  await guardarPreferenciasNotificacion(shopId, userId, siguiente);
  return siguiente;
};

export const listarSesionesService = async (
  shopId: string,
  userId: string,
  jtiActual: string | undefined
) => {
  const r = await listarSesionesUsuario(userId, shopId);
  return r.rows.map((row) => ({
    id: row.id,
    created_at: row.created_at.toISOString(),
    last_seen_at: row.last_seen_at.toISOString(),
    user_agent: row.user_agent,
    ip_address: row.ip_address,
    revocada: row.revoked_at != null,
    sesion_actual: Boolean(jtiActual && row.jti === jtiActual && row.revoked_at == null),
  }));
};

export const revocarSesionService = async (
  shopId: string,
  userId: string,
  sessionId: string
): Promise<void> => {
  const ok = await revocarSesion(userId, shopId, sessionId);
  if (!ok) throw new NotFoundError('Sesión');
};

export const configurar2faService = async (shopId: string, userId: string) => {
  const u = await obtenerUsuarioCompleto(shopId, userId);
  if (!u) throw new NotFoundError('Usuario');
  if (u.two_factor_enabled) {
    throw new ConflictError('El 2FA ya está activo. Desactívelo antes de generar un nuevo enlace.');
  }
  const secret = generateSecret();
  await guardarPending2fa(shopId, userId, secret);
  const issuer = 'InventarioTiendas';
  const otpauth_url = generateURI({
    issuer,
    label: `${issuer}:${u.email}`,
    secret,
  });
  return { secret, otpauth_url };
};

export const activar2faService = async (shopId: string, userId: string, code: string) => {
  const u = await obtenerUsuarioCompleto(shopId, userId);
  if (!u) throw new NotFoundError('Usuario');
  const pending = u.two_factor_pending_secret;
  if (!pending) {
    throw new ValidationError('No hay configuración 2FA pendiente. Ejecute primero POST /users/me/2fa/setup');
  }
  const result = verifySync({ secret: pending, token: code });
  if (!result.valid) {
    throw new ValidationError('Código de autenticación inválido');
  }
  await activar2faUsuario(shopId, userId, pending);
  return { two_factor_enabled: true };
};

export const desactivar2faService = async (shopId: string, userId: string, password: string) => {
  const u = await obtenerUsuarioCompleto(shopId, userId);
  if (!u) throw new NotFoundError('Usuario');
  const ok = await bcrypt.compare(password, u.password);
  if (!ok) throw new UnauthorizedError('Contraseña incorrecta');
  await desactivar2faUsuario(shopId, userId);
  return { two_factor_enabled: false };
};
