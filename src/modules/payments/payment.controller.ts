import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { sendSuccess, sendCreated } from '../../shared/utils/response';
import { RegistrarPagoSchema, ActualizarPagoSchema } from './payment.types';
import {
  registrarPagoService,
  obtenerPagoService,
  obtenerPagoPorOrdenService,
  listarPagosService,
  actualizarPagoService,
} from './payment.service';

// POST /api/v1/payments
export const registrarPago = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto        = RegistrarPagoSchema.parse(req.body);
    const customerId = req.user.role === 'customer' ? req.user.customer_id : undefined;
    const pago       = await registrarPagoService(req.user.shop_id, customerId, dto);
    sendCreated(res, pago);
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/payments
export const listarPagos = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 20;
    const pagos = await listarPagosService(req.user.shop_id, page, limit);
    sendSuccess(res, pagos);
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/payments/:id
export const obtenerPago = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pago = await obtenerPagoService(req.user.shop_id, req.params.id);
    sendSuccess(res, pago);
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/payments/order/:orderId
export const obtenerPagoPorOrden = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pago = await obtenerPagoPorOrdenService(req.user.shop_id, req.params.orderId);
    sendSuccess(res, pago ?? null);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/payments/:id
export const actualizarPago = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto  = ActualizarPagoSchema.parse(req.body);
    const pago = await actualizarPagoService(req.user.shop_id, req.params.id, dto);
    sendSuccess(res, pago);
  } catch (err) {
    next(err);
  }
};
