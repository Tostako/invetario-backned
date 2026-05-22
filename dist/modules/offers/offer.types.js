"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferFilterSchema = exports.UpdateOfferSchema = exports.CreateOfferSchema = void 0;
const zod_1 = require("zod");
const emptyStringToUndefined = (value) => typeof value === 'string' && value.trim() === '' ? undefined : value;
const booleanFromForm = (value) => {
    if (typeof value !== 'string')
        return value;
    const normalized = value.trim().toLowerCase();
    if (normalized === '')
        return undefined;
    if (['true', '1', 'yes', 'on'].includes(normalized))
        return true;
    if (['false', '0', 'no', 'off'].includes(normalized))
        return false;
    return value;
};
// ─── Esquemas de validación ───────────────────────────────────────────────────
const OfferBaseSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200),
    description: zod_1.z.preprocess(emptyStringToUndefined, zod_1.z.string().max(2000).optional()),
    discount_type: zod_1.z.enum(['percentage', 'fixed_amount']),
    discount_value: zod_1.z.coerce.number().min(0),
    scope: zod_1.z.enum(['storewide', 'category', 'product']),
    product_id: zod_1.z.preprocess(emptyStringToUndefined, zod_1.z.string().uuid().optional()),
    category_id: zod_1.z.preprocess(emptyStringToUndefined, zod_1.z.string().uuid().optional()),
    code: zod_1.z.preprocess((v) => (typeof v === 'string' ? v.trim().toUpperCase() : v), zod_1.z.string().min(1).max(50).optional()),
    starts_at: zod_1.z.coerce.date(),
    ends_at: zod_1.z.coerce.date(),
    is_active: zod_1.z.preprocess(booleanFromForm, zod_1.z.boolean().default(true)),
    usage_limit: zod_1.z.coerce.number().int().min(0).optional(),
});
exports.CreateOfferSchema = OfferBaseSchema.refine((data) => data.ends_at > data.starts_at, { message: 'ends_at debe ser posterior a starts_at', path: ['ends_at'] }).refine((data) => {
    if (data.discount_type === 'percentage')
        return data.discount_value <= 100;
    return true;
}, { message: 'El porcentaje no puede superar 100', path: ['discount_value'] });
exports.UpdateOfferSchema = OfferBaseSchema.partial().refine((data) => {
    if (data.starts_at && data.ends_at) {
        return data.ends_at > data.starts_at;
    }
    return true;
}, { message: 'ends_at debe ser posterior a starts_at', path: ['ends_at'] }).refine((data) => {
    if (data.discount_type === 'percentage' && data.discount_value !== undefined) {
        return data.discount_value <= 100;
    }
    return true;
}, { message: 'El porcentaje no puede superar 100', path: ['discount_value'] });
exports.OfferFilterSchema = zod_1.z.object({
    is_active: zod_1.z.preprocess(booleanFromForm, zod_1.z.boolean().optional()),
    scope: zod_1.z.enum(['storewide', 'category', 'product']).optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
//# sourceMappingURL=offer.types.js.map