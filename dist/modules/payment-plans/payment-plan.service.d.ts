import { CreatePaymentPlanDto, UpdatePaymentPlanDto, PaymentPlan } from './payment-plan.types';
export declare const crearPlanPagoService: (shopId: string, customerId: string | undefined, dto: CreatePaymentPlanDto) => Promise<PaymentPlan>;
export declare const listarPlanesPagoService: (shopId: string, customerId?: string) => Promise<PaymentPlan[]>;
export declare const obtenerPlanPagoService: (shopId: string, planId: string, customerId?: string) => Promise<PaymentPlan>;
export declare const actualizarPlanPagoService: (shopId: string, planId: string, dto: UpdatePaymentPlanDto, customerId?: string) => Promise<PaymentPlan>;
export declare const eliminarPlanPagoService: (shopId: string, planId: string, customerId?: string) => Promise<void>;
export declare const marcarPlanPagoDefaultService: (shopId: string, planId: string, customerId?: string) => Promise<PaymentPlan>;
//# sourceMappingURL=payment-plan.service.d.ts.map