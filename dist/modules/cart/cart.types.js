"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActualizarItemSchema = exports.AgregarItemSchema = void 0;
const zod_1 = require("zod");
// ─── Esquemas de validación ───────────────────────────────────────────────────
exports.AgregarItemSchema = zod_1.z.object({
    product_id: zod_1.z.string().uuid(),
    quantity: zod_1.z.number().int().min(1),
});
exports.ActualizarItemSchema = zod_1.z.object({
    quantity: zod_1.z.number().int().min(1),
});
//# sourceMappingURL=cart.types.js.map