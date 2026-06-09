"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAdditionalShopSchema = exports.LoginCustomerSchema = exports.RegisterCustomerSchema = exports.SelectShopSchema = exports.LoginSchema = exports.RegisterShopSchema = void 0;
const zod_1 = require("zod");
exports.RegisterShopSchema = zod_1.z.object({
    shop_name: zod_1.z.string().min(2).max(150),
    shop_slug: zod_1.z.string().min(2).max(60).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers and hyphens'),
    shop_email: zod_1.z.string().email(),
    owner_name: zod_1.z.string().min(2).max(100),
    owner_email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).max(72),
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
exports.SelectShopSchema = zod_1.z.object({
    shop_id: zod_1.z.string().uuid().optional(),
    shop_slug: zod_1.z.string().min(1).optional(),
}).refine(data => data.shop_id || data.shop_slug, {
    message: "Either shop_id or shop_slug must be provided",
    path: ["shop_id", "shop_slug"],
});
exports.RegisterCustomerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(150),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6).max(72),
    phone: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    shop_slug: zod_1.z.string().min(1), // Customer registra en una tienda específica
});
exports.LoginCustomerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
    shop_slug: zod_1.z.string().min(1),
});
exports.CreateAdditionalShopSchema = zod_1.z.object({
    shop_name: zod_1.z.string().min(2).max(150),
    shop_slug: zod_1.z.string().min(2).max(60).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers and hyphens'),
    shop_email: zod_1.z.string().email(),
});
//# sourceMappingURL=auth.types.js.map