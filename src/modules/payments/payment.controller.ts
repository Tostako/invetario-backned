import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { sendSuccess, sendCreated } from '../../shared/utils/response';
import { PagoTarjetaSchema, PagoPseSchema, WebhookMpSchema } from './payment.types';
import {
  procesarPagoTarjetaService,
  procesarPagoPseService,
  procesarWebhookService,
} from './payment.service';

// Pago con tarjeta crédito / débito
export const pagarConTarjeta = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto  = PagoTarjetaSchema.parse(req.body);
    const pago = await procesarPagoTarjetaService(req.user.shop_id, dto);
    sendCreated(res, pago);
  } catch (err) {
    next(err);
  }
};

// Pago por PSE
export const pagarConPse = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto  = PagoPseSchema.parse(req.body);
    const pago = await procesarPagoPseService(req.user.shop_id, dto);
    sendCreated(res, pago);
  } catch (err) {
    next(err);
  }
};

// Webhook de Mercado Pago — NO requiere autenticación JWT (viene de MP)
// Responde siempre 200 para evitar reenvíos innecesarios de MP
export const webhookMercadoPago = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const payload = WebhookMpSchema.safeParse(req.body);

    if (!payload.success) {
      res.status(200).json({ success: true, data: { ignored: true } });
      return;
    }

    const { type, data } = payload.data;

    if (type === 'payment') {
      await procesarWebhookService(String(data.id));
    }

    res.status(200).json({ success: true, data: { procesado: true } });
  } catch {
    // Nunca devolver error al webhook — MP reintentaría indefinidamente
    res.status(200).json({ success: true, data: { procesado: false } });
  }
};
