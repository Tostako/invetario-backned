"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopProductsQuerySchema = void 0;
const zod_1 = require("zod");
exports.TopProductsQuerySchema = zod_1.z.object({
    orden: zod_1.z.enum(['unidades', 'ingresos']).default('unidades'),
    limite: zod_1.z.coerce.number().int().min(1).max(50).default(10),
});
//# sourceMappingURL=dashboard.types.js.map