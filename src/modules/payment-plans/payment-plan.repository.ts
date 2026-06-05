import { query } from '../../config/database';
import { CreatePaymentPlanDto, UpdatePaymentPlanDto, PaymentPlan } from './payment-plan.types';

export const dbCrearPlanPago = async (
  shopId: string,
  customerId: string,
  dto: CreatePaymentPlanDto
): Promise<PaymentPlan> => {
  const result = await query<PaymentPlan>(
    `SELECT * FROM sp_crear_plan_pago($1, $2, $3, $4, $5, $6)`,
    [
      shopId,
      customerId,
      dto.name,
      dto.description ?? null,
      JSON.stringify(dto.installments),
      dto.is_default ?? false,
    ]
  );
  return result.rows[0]!;
};

export const dbActualizarPlanPago = async (
  shopId: string,
  planId: string,
  dto: UpdatePaymentPlanDto
): Promise<PaymentPlan | null> => {
  const result = await query<PaymentPlan>(
    `SELECT * FROM sp_actualizar_plan_pago($1, $2, $3, $4, $5, $6)`,
    [
      shopId,
      planId,
      dto.name ?? null,
      dto.description ?? null,
      dto.installments ? JSON.stringify(dto.installments) : null,
      dto.is_default !== undefined ? dto.is_default : null,
    ]
  );
  return result.rows[0] ?? null;
};

export const dbEliminarPlanPago = async (
  shopId: string,
  planId: string
): Promise<boolean> => {
  await query(`SELECT sp_eliminar_plan_pago($1, $2)`, [shopId, planId]);
  return true;
};

export const dbMarcarPlanPagoDefault = async (
  shopId: string,
  planId: string
): Promise<PaymentPlan | null> => {
  const result = await query<PaymentPlan>(
    `SELECT * FROM sp_marcar_plan_pago_default($1, $2)`,
    [shopId, planId]
  );
  return result.rows[0] ?? null;
};

export const dbListarPlanesPago = async (
  shopId: string,
  customerId?: string
): Promise<PaymentPlan[]> => {
  const result = await query<PaymentPlan>(
    `SELECT * FROM fn_listar_planes_pago($1, $2)`,
    [shopId, customerId ?? null]
  );
  return result.rows;
};

export const dbObtenerPlanPago = async (
  shopId: string,
  planId: string
): Promise<PaymentPlan | null> => {
  const result = await query<PaymentPlan>(
    `SELECT * FROM fn_obtener_plan_pago($1, $2)`,
    [shopId, planId]
  );
  return result.rows[0] ?? null;
};
