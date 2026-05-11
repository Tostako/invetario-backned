import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { UnauthorizedError, ConflictError, NotFoundError, ForbiddenError } from '../../shared/errors/AppError';
import {
  findSuperAdminByEmail,
  createSuperAdmin,
  updateSuperAdminLastLogin,
  countSuperAdmins,
  listarTiendas,
  findTiendaById,
  crearTienda,
  actualizarTienda,
  eliminarTienda,
} from './superadmin.repository';
import {
  LoginSuperAdminDto,
  RegisterSuperAdminDto,
  CreateShopDto,
  UpdateShopDto,
} from './superadmin.types';
import { calcOffset } from '../../shared/utils/pagination';
import { handlePgConflict } from '../../shared/utils/errors';

// Token de superadmin sin shop_id — el middleware lo acepta por el rol
const signSuperAdminToken = (id: string, email: string): string =>
  jwt.sign(
    { sub: id, email, role: 'superadmin' },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn } as jwt.SignOptions
  );

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSuperAdminService = async (dto: LoginSuperAdminDto) => {
  const admin = await findSuperAdminByEmail(dto.email);

  if (!admin) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  if (!admin.is_active) {
    throw new UnauthorizedError('Cuenta deshabilitada');
  }

  const passwordMatch = await bcrypt.compare(dto.password, admin.password);
  if (!passwordMatch) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  await updateSuperAdminLastLogin(admin.id);

  const token = signSuperAdminToken(admin.id, admin.email);

  return {
    token,
    admin: { id: admin.id, name: admin.name, email: admin.email },
  };
};

export const registrarSuperAdminService = async (
  dto: RegisterSuperAdminDto,
  solicitanteId: string
) => {
  // Solo el primer superadmin puede crearse sin restricción (bootstrap).
  // Los siguientes requieren que quien llama sea un superadmin activo (se
  // valida en el middleware de authorize antes de llegar aquí).
  // Este servicio no necesita verificar el rol: la ruta ya lo hace.
  // Se expone el solicitanteId por trazabilidad futura.
  void solicitanteId;

  try {
    const admin = await createSuperAdmin(dto);
    const token = signSuperAdminToken(admin.id, dto.email);
    return { token, adminId: admin.id };
  } catch (err: unknown) {
    handlePgConflict(err, 'Email ya existe');
  }
};

// Bootstrap: crea el primer superadmin (solo funciona si no hay ninguno aún)
export const bootstrapSuperAdminService = async (dto: RegisterSuperAdminDto) => {
  const total = await countSuperAdmins();
  if (total > 0) {
    throw new ForbiddenError('Bootstrap deshabilitado: ya existen superadmins');
  }

  try {
    const admin = await createSuperAdmin(dto);
    const token = signSuperAdminToken(admin.id, dto.email);
    return { token, adminId: admin.id };
  } catch (err: unknown) {
    handlePgConflict(err, 'Email ya existe');
  }
};

// ─── CRUD Tiendas ─────────────────────────────────────────────────────────────

export const listarTiendasService = async (page: number, limit: number) => {
  const offset = calcOffset({ page, limit });
  const rows = await listarTiendas(limit, offset);
  const total = rows.length > 0 ? parseInt(rows[0]!.total, 10) : 0;
  return { tiendas: rows.map(({ total: _, ...t }) => t), total };
};

export const obtenerTiendaService = async (id: string) => {
  const tienda = await findTiendaById(id);
  if (!tienda) throw new NotFoundError('Tienda');
  return tienda;
};

export const crearTiendaService = async (dto: CreateShopDto) => {
  try {
    return await crearTienda(dto);
  } catch (err: unknown) {
    handlePgConflict(err, 'El slug o email de la tienda ya existe');
  }
};

export const actualizarTiendaService = async (id: string, dto: UpdateShopDto) => {
  const tienda = await findTiendaById(id);
  if (!tienda) throw new NotFoundError('Tienda');

  const actualizada = await actualizarTienda(id, dto);
  if (!actualizada) throw new NotFoundError('Tienda');

  return findTiendaById(id);
};

export const eliminarTiendaService = async (id: string) => {
  const tienda = await findTiendaById(id);
  if (!tienda) throw new NotFoundError('Tienda');

  await eliminarTienda(id);
};
