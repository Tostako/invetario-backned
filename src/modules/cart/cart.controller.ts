import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { sendSuccess, sendCreated } from '../../shared/utils/response';
import { AgregarItemSchema, ActualizarItemSchema } from './cart.types';
import {
  agregarAlCarritoService,
  verCarritoService,
  actualizarItemService,
  eliminarItemService,
} from './cart.service';

// HU7 – Ver carrito
export const verCarrito = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const resumen = await verCarritoService(req.user.shop_id, req.user.id);
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
    const dto = AgregarItemSchema.parse(req.body);
    const item = await agregarAlCarritoService(req.user.shop_id, req.user.id, dto);
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
    const dto = ActualizarItemSchema.parse(req.body);
    const item = await actualizarItemService(
      req.user.shop_id,
      req.user.id,
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
    await eliminarItemService(req.user.shop_id, req.user.id, req.params['id']!);
    sendSuccess(res, { message: 'Ítem eliminado del carrito' });
  } catch (err) {
    next(err);
  }
};
