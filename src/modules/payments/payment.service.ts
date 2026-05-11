// ─── Payments Service — Modo estático ────────────────────────────────────────
// Todos los pagos se registran directamente como "approved".
// No hay integración con ninguna pasarela de pago externa.
// ─────────────────────────────────────────────────────────────────────────────

import { NotFoundError, ValidationError, ForbiddenError } from '../../shared/errors/AppError';
import { findOrderById } from '../orders/order.repository';
import {
  insertarPago,
  actualizarEstadoPago,
  findPaymentByOrder,
  findPaymentById,
  listarPagosPorTienda,
} from './payment.repository';
import { RegistrarPagoDto, ActualizarPagoDto, Payment } from './payment.types';

// ─── Helper: validar que la orden exista y sea pagable ────────────────────────

const validarOrden = async (shopId: string, orderId: string, customerId?: string) => {
  const orden = await findOrderById(shopId, orderId);
  if (!orden) throw new NotFoundError('Pedido');

  if (customerId && orden.customer_id !== customerId) {
    throw new ForbiddenError('No tienes permiso para pagar este pedido.');
  }

  if (orden.status === 'cancelled') {
    throw new ValidationError('No se puede pagar un pedido cancelado.');
  }

  const pagoExistente = await findPaymentByOrder(shopId, orderId);
  if (pagoExistente?.status === 'approved') {
    throw new ValidationError('Este pedido ya fue pagado.');
  }

  return orden;
};

// ─── Registrar pago (siempre se aprueba automáticamente) ─────────────────────

export const registrarPagoService = async (
  shopId:     string,
  customerId: string | undefined,
  dto:        RegistrarPagoDto
): Promise<Payment> => {
  const orden = await validarOrden(shopId, dto.order_id, customerId);

  return insertarPago({
    shopId,
    orderId:           dto.order_id,
    method:            dto.method,
    transactionAmount: Number(orden.total),
    status:            'approved',
    statusDetail:      'static_approved',
    notes:             dto.notes ?? null,
  });
};

// ─── Obtener pago por ID ──────────────────────────────────────────────────────

export const obtenerPagoService = async (
  shopId:    string,
  paymentId: string
): Promise<Payment> => {
  const pago = await findPaymentById(shopId, paymentId);
  if (!pago) throw new NotFoundError('Pago');
  return pago;
};

// ─── Obtener pago de una orden ────────────────────────────────────────────────

export const obtenerPagoPorOrdenService = async (
  shopId:  string,
  orderId: string
): Promise<Payment | null> => {
  return findPaymentByOrder(shopId, orderId);
};

// ─── Listar pagos de la tienda ────────────────────────────────────────────────

export const listarPagosService = async (
  shopId: string,
  page   = 1,
  limit  = 20
): Promise<Payment[]> => {
  const offset = (page - 1) * limit;
  return listarPagosPorTienda(shopId, limit, offset);
};

// ─── Actualizar estado de un pago (sólo admin/owner) ─────────────────────────

export const actualizarPagoService = async (
  shopId:    string,
  paymentId: string,
  dto:       ActualizarPagoDto
): Promise<Payment> => {
  const pago = await findPaymentById(shopId, paymentId);
  if (!pago) throw new NotFoundError('Pago');

  const actualizado = await actualizarEstadoPago(
    shopId,
    paymentId,
    dto.status,
    dto.notes ?? null
  );
  return actualizado!;
};
