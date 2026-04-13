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

// HU8 – Finalizar compra (crea pedido desde carrito o ítems explícitos)
export const crearPedido = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto   = CrearPedidoSchema.parse(req.body);
    const orden = await crearPedidoService(req.user.shop_id, req.user.id, dto);
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

// Obtener detalle de un pedido
export const obtenerPedido = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orden = await obtenerPedidoService(req.user.shop_id, req.params['id']!);
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
