"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LandingImageFilterSchema = exports.UpdateLandingImageSchema = exports.CreateLandingImageSchema = void 0;
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
exports.CreateLandingImageSchema = zod_1.z.object({
    type: zod_1.z.enum(['hero_bg', 'carousel', 'logo_main', 'logo_white', 'logo_abbreviated', 'about', 'service_card', 'cta_bg']),
    url: zod_1.z.string().url(),
    alt: zod_1.z.preprocess(emptyStringToUndefined, zod_1.z.string().max(255).optional()),
    order: zod_1.z.coerce.number().int().min(0).default(0),
    active: zod_1.z.preprocess(booleanFromForm, zod_1.z.boolean().default(true)),
    metadata: zod_1.z.preprocess((v) => {
        if (typeof v === 'string') {
            try {
                return JSON.parse(v);
            }
            catch {
                return v;
            }
        }
        return v;
    }, zod_1.z.record(zod_1.z.unknown()).optional()),
});
exports.UpdateLandingImageSchema = exports.CreateLandingImageSchema.partial();
exports.LandingImageFilterSchema = zod_1.z.object({
    type: zod_1.z.enum(['hero_bg', 'carousel', 'logo_main', 'logo_white', 'logo_abbreviated', 'about', 'service_card', 'cta_bg']).optional(),
    is_active: zod_1.z.preprocess(booleanFromForm, zod_1.z.boolean().optional()),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(50),
});
//# sourceMappingURL=landing-image.types.js.map