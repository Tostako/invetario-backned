import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { sendSuccess, sendCreated } from '../../shared/utils/response';
import { ForbiddenError } from '../../shared/errors/AppError';
import { AgregarItemSchema, ActualizarItemSchema } from './cart.types';
import {
  agregarAlCarritoService,
  verCarritoService,
  actualizarItemService,
  eliminarItemService,
} from './cart.service';

const getCustomerId = (req: AuthenticatedRequest): string => {
  if (!req.user.customer_id) {
    throw new ForbiddenError('Solo los clientes (customers) pueden usar el carrito.');
  }
  return req.user.customer_id;
};

// HU7 – Ver carrito
export const verCarrito = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customerId = getCustomerId(req);
    const resumen = await verCarritoService(req.user.shop_id, customerId);
    sendSuccess(res, resumen);
  } catch (err) {
    next(err);
  }
};

// HU6 – Agregar ítem al carrito
export const agregarItem = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customerId = getCustomerId(req);
    const dto = AgregarItemSchema.parse(req.body);
    const item = await agregarAlCarritoService(req.user.shop_id, customerId, dto);
    sendCreated(res, item);
  } catch (err) {
    next(err);
  }
};

// HU7 – Actualizar cantidad de un ítem
export const actualizarItem = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customerId = getCustomerId(req);
    const dto = ActualizarItemSchema.parse(req.body);
    const item = await actualizarItemService(
      req.user.shop_id,
      customerId,
      req.params['id']!,
      dto
    );
    sendSuccess(res, item);
  } catch (err) {
    next(err);
  }
};

// HU7 – Eliminar ítem del carrito
export const eliminarItem = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customerId = getCustomerId(req);
    await eliminarItemService(req.user.shop_id, customerId, req.params['id']!);
    sendSuccess(res, { message: 'Ítem eliminado del carrito' });
  } catch (err) {
    next(err);
  }
};
