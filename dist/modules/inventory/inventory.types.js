"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovimientosFilterSchema = void 0;
const zod_1 = require("zod");
const tiposMovimiento = ['purchase', 'sale', 'adjustment', 'return', 'loss'];
exports.MovimientosFilterSchema = zod_1.z.object({
    product_id: zod_1.z.string().uuid().optional(),
    type: zod_1.z.enum(tiposMovimiento).optional(),
    desde: zod_1.z.coerce.date().optional(),
    hasta: zod_1.z.coerce.date().optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
//# sourceMappingURL=inventory.types.js.map