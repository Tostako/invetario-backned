"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PREFERENCIAS_DEFECTO = exports.Disable2faSchema = exports.Enable2faSchema = exports.NotificationPreferencesSchema = exports.ChangePasswordSchema = exports.UpdateProfileSchema = void 0;
const zod_1 = require("zod");
exports.UpdateProfileSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(1).max(100).optional(),
    email: zod_1.z.string().email().max(255).optional(),
    phone: zod_1.z.string().max(30).optional().nullable(),
})
    .refine((d) => Object.keys(d).length > 0, { message: 'Debe enviar al menos un campo para actualizar' });
exports.ChangePasswordSchema = zod_1.z.object({
    current_password: zod_1.z.string().min(1),
    new_password: zod_1.z.string().min(8).max(72),
});
exports.NotificationPreferencesSchema = zod_1.z
    .object({
    email_orders: zod_1.z.boolean().optional(),
    email_low_stock: zod_1.z.boolean().optional(),
    email_marketing: zod_1.z.boolean().optional(),
    push_enabled: zod_1.z.boolean().optional(),
})
    .refine((d) => Object.keys(d).length > 0, { message: 'Debe enviar al menos una preferencia' });
exports.Enable2faSchema = zod_1.z.object({
    code: zod_1.z.string().regex(/^\d{6}$/, 'El código debe tener 6 dígitos'),
});
exports.Disable2faSchema = zod_1.z.object({
    password: zod_1.z.string().min(1),
});
exports.PREFERENCIAS_DEFECTO = {
    email_orders: true,
    email_low_stock: true,
    email_marketing: false,
    push_enabled: false,
};
//# sourceMappingURL=user.types.js.map