import { Request, Response, NextFunction } from 'express';
import {
  LoginSuperAdminSchema,
  RegisterSuperAdminSchema,
  CreateShopSchema,
  UpdateShopSchema,
} from './superadmin.types';
import {
  loginSuperAdminService,
  registrarSuperAdminService,
  bootstrapSuperAdminService,
  listarTiendasService,
  obtenerTiendaService,
  crearTiendaService,
  actualizarTiendaService,
  eliminarTiendaService,
} from './superadmin.service';
import { sendSuccess, sendCreated } from '../../shared/utils/response';
import { parsePagination } from '../../shared/utils/pagination';
import { AuthenticatedRequest } from '../../shared/types';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto = LoginSuperAdminSchema.parse(req.body);
    const result = await loginSuperAdminService(dto);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

// Bootstrap: crea el primer superadmin (no requiere autenticación previa)
export const bootstrapSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto = RegisterSuperAdminSchema.parse(req.body);
    const result = await bootstrapSuperAdminService(dto);
    sendCreated(res, result);
  } catch (err) {
    next(err);
  }
};

// Registrar superadmin adicional (requiere estar autenticado como superadmin)
export const registrarSuperAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto = RegisterSuperAdminSchema.parse(req.body);
    const result = await registrarSuperAdminService(dto, req.user.id);
    sendCreated(res, result);
  } catch (err) {
    next(err);
  }
};

// ─── CRUD Tiendas ─────────────────────────────────────────────────────────────

export const listarTiendas = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit } = parsePagination(req);
    const { tiendas, total } = await listarTiendasService(page, limit);
    sendSuccess(res, tiendas, 200, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

export const obtenerTienda = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tienda = await obtenerTiendaService(req.params['id']!);
    sendSuccess(res, tienda);
  } catch (err) {
    next(err);
  }
};

export const crearTienda = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto = CreateShopSchema.parse(req.body);
    const result = await crearTiendaService(dto);
    sendCreated(res, result);
  } catch (err) {
    next(err);
  }
};

export const actualizarTienda = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto = UpdateShopSchema.parse(req.body);
    const tienda = await actualizarTiendaService(req.params['id']!, dto);
    sendSuccess(res, tienda);
  } catch (err) {
    next(err);
  }
};

export const eliminarTienda = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await eliminarTiendaService(req.params['id']!);
    sendSuccess(res, { message: 'Tienda desactivada correctamente' });
  } catch (err) {
    next(err);
  }
};
