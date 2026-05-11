import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { sendSuccess } from '../../shared/utils/response';
import { UpdateShopSchema } from './shop.types';
import { obtenerTiendaService, actualizarTiendaService, eliminarTiendaService, subirLogoTiendaService } from './shop.service';
import { SessionMeta } from '../auth/auth.service';
import { ValidationError } from '../../shared/errors/AppError';

const pickSessionMeta = (req: AuthenticatedRequest): SessionMeta => ({
  userAgent: req.headers['user-agent'] ?? null,
  ipAddress: req.ip ?? null,
});

export const obtenerTienda = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await obtenerTiendaService(req.user.shop_id);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export const actualizarTienda = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto = UpdateShopSchema.parse(req.body);
    const data = await actualizarTiendaService(req.user.shop_id, dto);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export const subirLogoTienda = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      throw new ValidationError('Debe enviar el archivo logo');
    }
    const data = await subirLogoTiendaService(req.user.shop_id, req.file);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export const eliminarTienda = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await eliminarTiendaService(
      req.user.shop_id,
      req.user.email,
      pickSessionMeta(req)
    );
    sendSuccess(res, { 
      message: 'Tienda desactivada exitosamente',
      ...result
    });
  } catch (err) {
    next(err);
  }
};
