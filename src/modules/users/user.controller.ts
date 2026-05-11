import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { sendSuccess } from '../../shared/utils/response';
import {
  UpdateProfileSchema,
  ChangePasswordSchema,
  NotificationPreferencesSchema,
  Enable2faSchema,
  Disable2faSchema,
} from './user.types';
import {
  obtenerPerfilService,
  actualizarPerfilService,
  cambiarPasswordService,
  obtenerPreferenciasService,
  actualizarPreferenciasService,
  listarSesionesService,
  revocarSesionService,
  configurar2faService,
  activar2faService,
  desactivar2faService,
} from './user.service';

export const obtenerPerfil = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await obtenerPerfilService(req.user.shop_id, req.user.id);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export const actualizarPerfil = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto = UpdateProfileSchema.parse(req.body);
    const data = await actualizarPerfilService(req.user.shop_id, req.user.id, dto);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export const cambiarPassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto = ChangePasswordSchema.parse(req.body);
    await cambiarPasswordService(req.user.shop_id, req.user.id, dto);
    sendSuccess(res, { message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    next(err);
  }
};

export const obtenerPreferencias = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await obtenerPreferenciasService(req.user.shop_id, req.user.id);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export const actualizarPreferencias = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const patch = NotificationPreferencesSchema.parse(req.body);
    const data = await actualizarPreferenciasService(req.user.shop_id, req.user.id, patch);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export const listarSesiones = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await listarSesionesService(req.user.shop_id, req.user.id, req.user.jti);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export const eliminarSesion = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await revocarSesionService(req.user.shop_id, req.user.id, req.params['sessionId']!);
    sendSuccess(res, { message: 'Sesión revocada' });
  } catch (err) {
    next(err);
  }
};

export const setup2fa = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await configurar2faService(req.user.shop_id, req.user.id);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export const enable2fa = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code } = Enable2faSchema.parse(req.body);
    const data = await activar2faService(req.user.shop_id, req.user.id, code);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export const disable2fa = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { password } = Disable2faSchema.parse(req.body);
    const data = await desactivar2faService(req.user.shop_id, req.user.id, password);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};
