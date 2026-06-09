import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { sendSuccess, sendCreated } from '../../shared/utils/response';
import {
  CreatePaymentPlanSchema,
  UpdatePaymentPlanSchema,
} from './payment-plan.types';
import {
  crearPlanPagoService,
  listarPlanesPagoService,
  actualizarPlanPagoService,
  eliminarPlanPagoService,
  marcarPlanPagoDefaultService,
} from './payment-plan.service';

const getCustomerId = (req: AuthenticatedRequest): string | undefined => {
  return req.user.role === 'customer' ? req.user.customer_id : undefined;
};

// POST /api/v1/payment-plans
export const crearPlanPago = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto = CreatePaymentPlanSchema.parse(req.body);
    const customerId = dto.customer_id ? undefined : req.user.customer_id;
    const plan = await crearPlanPagoService(req.user.shop_id, customerId, dto);
    sendCreated(res, plan);
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/payment-plans
export const listarPlanesPago = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customerId =
      getCustomerId(req)
      ?? (req.query['customer_id'] as string | undefined)
      ?? req.user.customer_id;
    const planes = await listarPlanesPagoService(req.user.shop_id, customerId);
    sendSuccess(res, planes);
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/payment-plans/:id
export const actualizarPlanPago = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto = UpdatePaymentPlanSchema.parse(req.body);
    const customerId = getCustomerId(req);
    const plan = await actualizarPlanPagoService(req.user.shop_id, req.params['id']!, dto, customerId);
    sendSuccess(res, plan);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/payment-plans/:id
export const eliminarPlanPago = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customerId = getCustomerId(req);
    await eliminarPlanPagoService(req.user.shop_id, req.params['id']!, customerId);
    sendSuccess(res, { message: 'Plan de pago eliminado correctamente' });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/payment-plans/:id/default
export const marcarPlanPagoDefault = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customerId = getCustomerId(req);
    const plan = await marcarPlanPagoDefaultService(req.user.shop_id, req.params['id']!, customerId);
    sendSuccess(res, plan);
  } catch (err) {
    next(err);
  }
};
