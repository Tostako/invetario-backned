"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePaymentPlanSchema = exports.CreatePaymentPlanSchema = exports.InstallmentSchema = void 0;
const zod_1 = require("zod");
exports.InstallmentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'El nombre de la cuota es requerido').max(100),
    percentage: zod_1.z.number().min(0, 'El porcentaje no puede ser negativo').max(100, 'El porcentaje no puede superar 100'),
    order: zod_1.z.number().int().min(1, 'El orden debe ser mayor o igual a 1'),
});
const CreatePaymentPlanObject = zod_1.z.object({
    customer_id: zod_1.z.string().uuid('El ID del cliente debe ser un UUID válido').optional(),
    name: zod_1.z.string().min(1, 'El nombre del plan es requerido').max(120),
    description: zod_1.z.string().optional().nullable(),
    installments: zod_1.z.array(exports.InstallmentSchema).min(1, 'Debe haber al menos una cuota en el plan'),
    is_default: zod_1.z.boolean().default(false),
});
exports.CreatePaymentPlanSchema = CreatePaymentPlanObject.refine((data) => {
    const total = data.installments.reduce((sum, inst) => sum + inst.percentage, 0);
    // Permitimos una tolerancia mínima para problemas de precisión flotante
    return Math.abs(total - 100) < 0.01;
}, {
    message: 'La suma de los porcentajes de las cuotas debe ser igual a 100%',
    path: ['installments'],
});
exports.UpdatePaymentPlanSchema = CreatePaymentPlanObject.partial().refine((data) => {
    if (!data.installments)
        return true;
    const total = data.installments.reduce((sum, inst) => sum + inst.percentage, 0);
    return Math.abs(total - 100) < 0.01;
}, {
    message: 'La suma de los porcentajes de las cuotas debe ser igual a 100%',
    path: ['installments'],
});
//# sourceMappingURL=payment-plan.types.js.map