import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { sendSuccess } from '../../shared/utils/response';
import { TopProductsQuerySchema } from './dashboard.types';
import {
  resumenDashboardService,
  ingresosMesService,
  pedidosMesService,
  ventasSemanaService,
  pedidosPorEstadoService,
  productosTopService,
} from './dashboard.service';

export const obtenerResumen = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await resumenDashboardService(req.user.shop_id);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export const obtenerIngresosMes = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await ingresosMesService(req.user.shop_id);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export const obtenerPedidosMes = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await pedidosMesService(req.user.shop_id);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export const obtenerVentasSemana = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await ventasSemanaService(req.user.shop_id);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export const obtenerEstadoPedidos = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await pedidosPorEstadoService(req.user.shop_id);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export const obtenerProductosTop = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const q = TopProductsQuerySchema.parse(req.query);
    const data = await productosTopService(req.user.shop_id, q);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};
