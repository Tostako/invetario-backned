"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryFilterSchema = exports.UpdateCategorySchema = exports.CreateCategorySchema = void 0;
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
exports.CreateCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.preprocess(emptyStringToUndefined, zod_1.z.string().max(500).optional()),
    is_active: zod_1.z.preprocess(booleanFromForm, zod_1.z.boolean().default(true)),
    parent_id: zod_1.z.preprocess(emptyStringToUndefined, zod_1.z.string().uuid().optional()),
});
exports.UpdateCategorySchema = exports.CreateCategorySchema.partial();
exports.CategoryFilterSchema = zod_1.z.object({
    is_active: zod_1.z.preprocess(booleanFromForm, zod_1.z.boolean().optional()),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
//# sourceMappingURL=category.types.js.map