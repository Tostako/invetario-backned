import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { sendSuccess, sendCreated } from '../../shared/utils/response';
import { CrearPedidoSchema, ActualizarEstadoSchema, FiltrosPedidoSchema } from './order.types';
import {
  crearPedidoService,
  listarPedidosService,
  obtenerPedidoService,
  actualizarEstadoService,
} from './order.service';
import { findShopOrderActorUserId } from './order.repository';
import { ForbiddenError, ValidationError } from '../../shared/errors/AppError';

// HU8 – Finalizar compra (crea pedido desde carrito o ítems explícitos)
export const crearPedido = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto = CrearPedidoSchema.parse(req.body);
    
    // Si es un customer, forzamos su customer_id.
    // Si es staff, puede pasarlo en el body.
    let customerIdStr = dto.customer_id;
    if (req.user.role === 'customer') {
      customerIdStr = req.user.customer_id;
    }

    const dtoConCustomer = { ...dto, customer_id: customerIdStr };

    // customers.id ≠ users.id: la BD exige users.id en created_by e inventory_movements.
    let dbUserIdForAudit = req.user.id;
    if (req.user.role === 'customer') {
      const actorId = await findShopOrderActorUserId(req.user.shop_id);
      if (!actorId) {
        throw new ValidationError(
          'La tienda no tiene un usuario activo para registrar el pedido en auditoría.'
        );
      }
      dbUserIdForAudit = actorId;
    }

    const orden = await crearPedidoService(
      req.user.shop_id,
      dbUserIdForAudit,
      req.user.customer_id ?? null,   // Si es un customer, usamos su customer_id para vaciar SU carrito
      dtoConCustomer
    );
    sendCreated(res, orden);
  } catch (err) {
    next(err);
  }
};

// HU9 – Listar pedidos
export const listarPedidos = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filtros          = FiltrosPedidoSchema.parse(req.query);
    const { pedidos, meta } = await listarPedidosService(req.user.shop_id, filtros);
    sendSuccess(res, pedidos, 200, meta);
  } catch (err) {
    next(err);
  }
};

// Listar pedidos del cliente autenticado
export const listarMisPedidos = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filtros = FiltrosPedidoSchema.parse({
      ...req.query,
      customer_id: req.user.customer_id ?? req.user.id,
    });
    const { pedidos, meta } = await listarPedidosService(req.user.shop_id, filtros);
    sendSuccess(res, pedidos, 200, meta);
  } catch (err) {
    next(err);
  }
};

// Obtener detalle de un pedido
export const obtenerPedido = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orden = await obtenerPedidoService(req.user.shop_id, req.params['id']!);
    
    if (req.user.role === 'customer' && orden.customer_id !== req.user.customer_id) {
       throw new ForbiddenError('No tienes permiso para ver este pedido.');
    }

    sendSuccess(res, orden);
  } catch (err) {
    next(err);
  }
};

// HU10 – Actualizar estado del pedido
export const actualizarEstado = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto   = ActualizarEstadoSchema.parse(req.body);
    const orden = await actualizarEstadoService(req.user.shop_id, req.params['id']!, dto);
    sendSuccess(res, orden);
  } catch (err) {
    next(err);
  }
};
