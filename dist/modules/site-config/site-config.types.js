"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteConfigFilterSchema = exports.UpdateSiteConfigSchema = exports.CreateSiteConfigSchema = void 0;
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
exports.CreateSiteConfigSchema = zod_1.z.object({
    section: zod_1.z.string().min(1).max(50),
    key: zod_1.z.string().min(1).max(100),
    value: zod_1.z.string().min(1),
    value_type: zod_1.z.enum(['text', 'markdown', 'image_url', 'color', 'json', 'boolean']).default('text'),
    active: zod_1.z.preprocess(booleanFromForm, zod_1.z.boolean().default(true)),
});
exports.UpdateSiteConfigSchema = exports.CreateSiteConfigSchema.partial().omit({ key: true, section: true });
exports.SiteConfigFilterSchema = zod_1.z.object({
    section: zod_1.z.preprocess(emptyStringToUndefined, zod_1.z.string().optional()),
    is_active: zod_1.z.preprocess(booleanFromForm, zod_1.z.boolean().optional()),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(50),
});
//# sourceMappingURL=site-config.types.js.map