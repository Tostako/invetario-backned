"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FiltrosPedidoSchema = exports.ActualizarEstadoSchema = exports.CrearPedidoSchema = exports.ESTADOS_PEDIDO = void 0;
const zod_1 = require("zod");
// ─── Estados válidos del pedido ───────────────────────────────────────────────
exports.ESTADOS_PEDIDO = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
// ─── Esquemas de validación ───────────────────────────────────────────────────
exports.CrearPedidoSchema = zod_1.z.object({
    customer_id: zod_1.z.string().uuid().optional(),
    notes: zod_1.z.string().max(500).optional(),
    // Los ítems vienen del carrito; opcionalmente se pueden pasar directo
    items: zod_1.z.array(zod_1.z.object({
        product_id: zod_1.z.string().uuid(),
        quantity: zod_1.z.number().int().min(1),
        discount: zod_1.z.number().min(0).default(0),
    })).min(1).optional(),
});
exports.ActualizarEstadoSchema = zod_1.z.object({
    status: zod_1.z.enum(exports.ESTADOS_PEDIDO),
    notes: zod_1.z.string().max(500).optional(),
});
exports.FiltrosPedidoSchema = zod_1.z.object({
    status: zod_1.z.enum(exports.ESTADOS_PEDIDO).optional(),
    customer_id: zod_1.z.string().uuid().optional(),
    desde: zod_1.z.string().datetime().optional(),
    hasta: zod_1.z.string().datetime().optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
//# sourceMappingURL=order.types.js.map