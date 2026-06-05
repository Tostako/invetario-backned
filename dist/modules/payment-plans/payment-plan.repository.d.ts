import { CreatePaymentPlanDto, UpdatePaymentPlanDto, PaymentPlan } from './payment-plan.types';
export declare const dbCrearPlanPago: (shopId: string, customerId: string, dto: CreatePaymentPlanDto) => Promise<PaymentPlan>;
export declare const dbActualizarPlanPago: (shopId: string, planId: string, dto: UpdatePaymentPlanDto) => Promise<PaymentPlan | null>;
export declare const dbEliminarPlanPago: (shopId: string, planId: string) => Promise<boolean>;
export declare const dbMarcarPlanPagoDefault: (shopId: string, planId: string) => Promise<PaymentPlan | null>;
export declare const dbListarPlanesPago: (shopId: string, customerId?: string) => Promise<PaymentPlan[]>;
export declare const dbObtenerPlanPago: (shopId: string, planId: string) => Promise<PaymentPlan | null>;
//# sourceMappingURL=payment-plan.repository.d.ts.map