import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { sendSuccess } from '../../shared/utils/response';
import { MovimientosFilterSchema } from './inventory.types';
import { listarAlertasService, listarMovimientosService } from './inventory.service';

export const obtenerAlertas = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await listarAlertasService(req.user.shop_id);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export const obtenerMovimientos = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filtro = MovimientosFilterSchema.parse(req.query);
    const { movimientos, meta } = await listarMovimientosService(req.user.shop_id, filtro);
    sendSuccess(res, movimientos, 200, meta);
  } catch (err) {
    next(err);
  }
};
