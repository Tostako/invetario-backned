"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActualizarPagoSchema = exports.RegistrarPagoSchema = exports.METODOS_PAGO = void 0;
const zod_1 = require("zod");
// Métodos de pago soportados
exports.METODOS_PAGO = ['card', 'pse', 'manual', 'cash', 'transfer', 'wompi', 'other'];
// ─── Esquema para registrar un pago ──────────────────────────────────────────
// El administrador o empleado confirma el pago que recibió (efectivo, tarjeta,
// transferencia, etc.). El monto lo calcula el backend desde la orden.
exports.RegistrarPagoSchema = zod_1.z.object({
    order_id: zod_1.z.string().uuid(),
    method: zod_1.z.enum(exports.METODOS_PAGO),
    notes: zod_1.z.string().max(500).optional(),
});
// ─── Esquema para actualizar estado de un pago ───────────────────────────────
exports.ActualizarPagoSchema = zod_1.z.object({
    status: zod_1.z.enum(['pending', 'approved', 'rejected', 'cancelled', 'refunded', 'in_process', 'confirmed']),
    notes: zod_1.z.string().max(500).optional(),
});
//# sourceMappingURL=payment.types.js.map