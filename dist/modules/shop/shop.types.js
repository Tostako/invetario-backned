"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateShopSchema = void 0;
const zod_1 = require("zod");
exports.UpdateShopSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(1).max(150).optional(),
    phone: zod_1.z.string().max(30).optional().nullable(),
    email: zod_1.z.string().email().max(255).optional(),
    address: zod_1.z.string().max(2000).optional().nullable(),
    description: zod_1.z.string().max(5000).optional().nullable(),
    currency: zod_1.z.string().length(3).toUpperCase().optional(),
    timezone: zod_1.z.string().min(1).max(60).optional(),
    vat_rate: zod_1.z.coerce.number().min(0).max(100).optional(),
    min_order_amount: zod_1.z.coerce.number().min(0).optional(),
    logo_url: zod_1.z.string().url().max(2000).optional().nullable(),
})
    .refine((d) => Object.keys(d).length > 0, { message: 'Debe enviar al menos un campo para actualizar' });
//# sourceMappingURL=shop.types.js.map