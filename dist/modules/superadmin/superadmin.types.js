"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateShopSchema = exports.CreateShopSchema = exports.RegisterSuperAdminSchema = exports.LoginSuperAdminSchema = void 0;
const zod_1 = require("zod");
exports.LoginSuperAdminSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
exports.RegisterSuperAdminSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(10).max(72),
    name: zod_1.z.string().min(2).max(100),
});
exports.CreateShopSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(150),
    slug: zod_1.z.string().min(2).max(60).regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().max(30).optional(),
    address: zod_1.z.string().optional(),
    logo_url: zod_1.z.string().url().optional(),
    currency: zod_1.z.string().length(3).default('USD'),
    timezone: zod_1.z.string().max(60).default('UTC'),
    plan: zod_1.z.enum(['free', 'basic', 'pro', 'enterprise']).default('free'),
    owner_name: zod_1.z.string().min(2).max(100),
    owner_email: zod_1.z.string().email(),
    owner_password: zod_1.z.string().min(8).max(72),
});
exports.UpdateShopSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(150).optional(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().max(30).optional(),
    address: zod_1.z.string().optional(),
    logo_url: zod_1.z.string().url().optional(),
    currency: zod_1.z.string().length(3).optional(),
    timezone: zod_1.z.string().max(60).optional(),
    is_active: zod_1.z.boolean().optional(),
    plan: zod_1.z.enum(['free', 'basic', 'pro', 'enterprise']).optional(),
});
//# sourceMappingURL=superadmin.types.js.map