import { z } from 'zod';

export const InstallmentSchema = z.object({
  name: z.string().min(1, 'El nombre de la cuota es requerido').max(100),
  percentage: z.number().min(0, 'El porcentaje no puede ser negativo').max(100, 'El porcentaje no puede superar 100'),
  order: z.number().int().min(1, 'El orden debe ser mayor o igual a 1'),
});

const CreatePaymentPlanObject = z.object({
  customer_id: z.string().uuid('El ID del cliente debe ser un UUID válido').optional(),
  name: z.string().min(1, 'El nombre del plan es requerido').max(120),
  description: z.string().optional().nullable(),
  installments: z.array(InstallmentSchema).min(1, 'Debe haber al menos una cuota en el plan'),
  is_default: z.boolean().default(false),
});

export const CreatePaymentPlanSchema = CreatePaymentPlanObject.refine((data) => {
  const total = data.installments.reduce((sum, inst) => sum + inst.percentage, 0);
  // Permitimos una tolerancia mínima para problemas de precisión flotante
  return Math.abs(total - 100) < 0.01;
}, {
  message: 'La suma de los porcentajes de las cuotas debe ser igual a 100%',
  path: ['installments'],
});

export const UpdatePaymentPlanSchema = CreatePaymentPlanObject.partial().refine((data) => {
  if (!data.installments) return true;
  const total = data.installments.reduce((sum, inst) => sum + inst.percentage, 0);
  return Math.abs(total - 100) < 0.01;
}, {
  message: 'La suma de los porcentajes de las cuotas debe ser igual a 100%',
  path: ['installments'],
});

export type CreatePaymentPlanDto = z.infer<typeof CreatePaymentPlanSchema>;
export type UpdatePaymentPlanDto = z.infer<typeof UpdatePaymentPlanSchema>;

export interface PaymentPlanInstallment {
  name: string;
  percentage: number;
  order: number;
}

export interface PaymentPlan {
  id: string;
  shop_id: string;
  customer_id: string;
  name: string;
  description: string | null;
  installments: PaymentPlanInstallment[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}
