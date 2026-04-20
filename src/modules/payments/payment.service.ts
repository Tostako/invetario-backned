import { MercadoPagoConfig, Payment as MpPayment } from 'mercadopago';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../config/env';
import { NotFoundError, ValidationError, ForbiddenError } from '../../shared/errors/AppError';
import { findOrderById } from '../orders/order.repository';
import {
  insertarPago,
  actualizarEstadoPago,
  findPaymentByOrder,
} from './payment.repository';
import { PagoTarjetaDto, PagoPseDto, Payment } from './payment.types';

// ─── Cliente Mercado Pago (singleton) ─────────────────────────────────────────
const mpClient = new MercadoPagoConfig({
  accessToken: env.mercadopago.accessToken,
});
const mpPayment = new MpPayment(mpClient);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const validarOrden = async (shopId: string, orderId: string, customerId?: string) => {
  const orden = await findOrderById(shopId, orderId);
  if (!orden) throw new NotFoundError('Pedido');

  if (customerId && orden.customer_id !== customerId) {
    throw new ForbiddenError('No tienes permiso para pagar este pedido.');
  }

  if (orden.status === 'cancelled') {
    throw new ValidationError('No se puede pagar un pedido cancelado');
  }

  const pagoExistente = await findPaymentByOrder(shopId, orderId);
  if (pagoExistente?.status === 'approved') {
    throw new ValidationError('Este pedido ya fue pagado');
  }

  return orden;
};

// ─── Pago con tarjeta de crédito / débito ─────────────────────────────────────

export const procesarPagoTarjetaService = async (
  shopId: string,
  customerId: string | undefined,
  dto: PagoTarjetaDto
): Promise<Payment> => {
  const orden = await validarOrden(shopId, dto.order_id, customerId);

  const respuestaMp = await mpPayment.create({
    body: {
      transaction_amount: Number(orden.total),
      token:              dto.token,
      description:        dto.description ?? `Pedido ${orden.order_number}`,
      installments:       dto.installments,
      payment_method_id:  dto.payment_method_id,
      issuer_id:          dto.issuer_id,
      payer: {
        email:          dto.payer.email,
        identification: {
          type:   dto.payer.identification.type,
          number: dto.payer.identification.number,
        },
      },
    },
    requestOptions: { idempotencyKey: uuidv4() },
  });

  return insertarPago({
    shopId,
    orderId:             dto.order_id,
    mpPaymentId:         respuestaMp.id ?? null,
    method:              'card',
    status:              respuestaMp.status ?? 'pending',
    statusDetail:        respuestaMp.status_detail ?? null,
    transactionAmount:   Number(orden.total),
    externalResourceUrl: null,
    rawResponse:         respuestaMp,
  });
};

// ─── Pago por PSE ─────────────────────────────────────────────────────────────

export const procesarPagoPseService = async (
  shopId: string,
  customerId: string | undefined,
  dto: PagoPseDto
): Promise<Payment> => {
  const orden = await validarOrden(shopId, dto.order_id, customerId);

  const respuestaMp = await mpPayment.create({
    body: {
      transaction_amount: Number(orden.total),
      description:        dto.description ?? `Pedido ${orden.order_number}`,
      payment_method_id:  'pse',
      callback_url:       dto.callback_url,
      notification_url:   dto.notification_url,
      payer: {
        entity_type: dto.payer.entity_type,
        email:       dto.payer.email,
        first_name:  dto.payer.first_name,
        last_name:   dto.payer.last_name,
        identification: {
          type:   dto.payer.identification.type,
          number: dto.payer.identification.number,
        },
        address: {
          zip_code:      dto.payer.address.zip_code,
          street_name:   dto.payer.address.street_name,
          street_number: dto.payer.address.street_number,
          neighborhood:  dto.payer.address.neighborhood,
          city:          dto.payer.address.city,
          federal_unit:  dto.payer.address.federal_unit,
        },
        phone: {
          area_code: dto.payer.phone.area_code,
          number:    dto.payer.phone.number,
        },
      },
      additional_info: {
        ip_address: '127.0.0.1',
      },
      transaction_details: {
        financial_institution: dto.financial_institution,
      },
    },
    requestOptions: { idempotencyKey: uuidv4() },
  });

  const externalUrl = (respuestaMp.transaction_details as Record<string, unknown> | undefined)
    ?.external_resource_url as string | undefined ?? null;

  return insertarPago({
    shopId,
    orderId:             dto.order_id,
    mpPaymentId:         respuestaMp.id ?? null,
    method:              'pse',
    status:              respuestaMp.status ?? 'pending',
    statusDetail:        respuestaMp.status_detail ?? null,
    transactionAmount:   Number(orden.total),
    externalResourceUrl: externalUrl,
    rawResponse:         respuestaMp,
  });
};

// ─── Webhook: sincronizar estado desde Mercado Pago ───────────────────────────

export const procesarWebhookService = async (
  mpPaymentIdStr: string
): Promise<void> => {
  const mpPaymentId = parseInt(mpPaymentIdStr, 10);
  if (isNaN(mpPaymentId)) return;

  // Consultar el estado real en la API de MP
  const respuestaMp = await mpPayment.get({ id: String(mpPaymentId) });

  await actualizarEstadoPago(
    mpPaymentId,
    respuestaMp.status ?? 'pending',
    respuestaMp.status_detail ?? null,
    respuestaMp
  );
};
