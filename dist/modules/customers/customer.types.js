"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerDetailQuerySchema = exports.UpdateCustomerSchema = exports.CreateCustomerSchema = exports.ListCustomersQuerySchema = void 0;
const zod_1 = require("zod");
exports.ListCustomersQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    is_active: zod_1.z.coerce.boolean().optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
exports.CreateCustomerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(150),
    email: zod_1.z.string().email().max(255).optional().nullable(),
    phone: zod_1.z.string().max(30).optional().nullable(),
    address: zod_1.z.string().max(2000).optional().nullable(),
    notes: zod_1.z.string().max(2000).optional().nullable(),
});
exports.UpdateCustomerSchema = exports.CreateCustomerSchema.partial().extend({
    is_active: zod_1.z.boolean().optional(),
});
exports.CustomerDetailQuerySchema = zod_1.z.object({
    /** Query: ?include_orders=true */
    include_orders: zod_1.z
        .string()
        .optional()
        .transform((s) => s === 'true'),
});
//# sourceMappingURL=customer.types.js.map