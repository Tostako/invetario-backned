import { NotFoundError, ForbiddenError, ValidationError } from '../../shared/errors/AppError';
import { traducirErrorDB } from '../../shared/utils/dbErrors';
import {
  dbCrearPlanPago,
  dbActualizarPlanPago,
  dbEliminarPlanPago,
  dbMarcarPlanPagoDefault,
  dbListarPlanesPago,
  dbObtenerPlanPago,
} from './payment-plan.repository';
import { CreatePaymentPlanDto, UpdatePaymentPlanDto, PaymentPlan } from './payment-plan.types';

export const crearPlanPagoService = async (
  shopId: string,
  customerId: string | undefined,
  dto: CreatePaymentPlanDto
): Promise<PaymentPlan> => {
  // Si el usuario es customer, se asocia el plan obligatoriamente a él
  // Si es un rol del staff/admin, debe proporcionar el customer_id al que pertenece el plan
  const targetCustomerId = customerId ?? dto.customer_id;
  if (!targetCustomerId) {
    throw new ValidationError('El customer_id es obligatorio para crear un plan de pago.');
  }

  try {
    return await dbCrearPlanPago(shopId, targetCustomerId, dto);
  } catch (err) {
    throw traducirErrorDB(err, {
      CUSTOMER_NOT_FOUND: () => new NotFoundError('Cliente'),
    });
  }
};

export const listarPlanesPagoService = async (
  shopId: string,
  customerId?: string
): Promise<PaymentPlan[]> => {
  return await dbListarPlanesPago(shopId, customerId);
};

export const obtenerPlanPagoService = async (
  shopId: string,
  planId: string,
  customerId?: string
): Promise<PaymentPlan> => {
  const plan = await dbObtenerPlanPago(shopId, planId);
  if (!plan) throw new NotFoundError('Plan de pago');

  // Si es un cliente, verificar que el plan le pertenece
  if (customerId && plan.customer_id !== customerId) {
    throw new ForbiddenError('No tienes permiso para ver este plan de pagos.');
  }

  return plan;
};

export const actualizarPlanPagoService = async (
  shopId: string,
  planId: string,
  dto: UpdatePaymentPlanDto,
  customerId?: string
): Promise<PaymentPlan> => {
  // Verificar existencia y pertenencia
  await obtenerPlanPagoService(shopId, planId, customerId);

  try {
    const updated = await dbActualizarPlanPago(shopId, planId, dto);
    if (!updated) throw new NotFoundError('Plan de pago');
    return updated;
  } catch (err) {
    throw traducirErrorDB(err, {
      PLAN_NOT_FOUND: () => new NotFoundError('Plan de pago'),
    });
  }
};

export const eliminarPlanPagoService = async (
  shopId: string,
  planId: string,
  customerId?: string
): Promise<void> => {
  // Verificar existencia y pertenencia
  await obtenerPlanPagoService(shopId, planId, customerId);

  try {
    await dbEliminarPlanPago(shopId, planId);
  } catch (err) {
    throw traducirErrorDB(err, {
      PLAN_NOT_FOUND: () => new NotFoundError('Plan de pago'),
    });
  }
};

export const marcarPlanPagoDefaultService = async (
  shopId: string,
  planId: string,
  customerId?: string
): Promise<PaymentPlan> => {
  // Verificar existencia y pertenencia
  await obtenerPlanPagoService(shopId, planId, customerId);

  try {
    const plan = await dbMarcarPlanPagoDefault(shopId, planId);
    if (!plan) throw new NotFoundError('Plan de pago');
    return plan;
  } catch (err) {
    throw traducirErrorDB(err, {
      PLAN_NOT_FOUND: () => new NotFoundError('Plan de pago'),
    });
  }
};
