"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuoteFilterSchema = exports.UpdateQuoteSchema = exports.CreateQuoteSchema = void 0;
const zod_1 = require("zod");
const emptyStringToUndefined = (value) => typeof value === 'string' && value.trim() === '' ? undefined : value;
// ─── Esquemas de validación ───────────────────────────────────────────────────
exports.CreateQuoteSchema = zod_1.z.object({
    client: zod_1.z.string().min(1).max(255),
    project: zod_1.z.string().min(1).max(255),
    area: zod_1.z.coerce.number().min(0),
    price: zod_1.z.coerce.number().min(0),
    status: zod_1.z.enum(['draft', 'sent', 'paid', 'completed']).default('draft'),
    data: zod_1.z.preprocess((v) => {
        if (typeof v === 'string') {
            try {
                return JSON.parse(v);
            }
            catch {
                return v;
            }
        }
        return v;
    }, zod_1.z.record(zod_1.z.unknown()).default({})),
    date: zod_1.z.coerce.date().optional(),
});
exports.UpdateQuoteSchema = exports.CreateQuoteSchema.partial();
exports.QuoteFilterSchema = zod_1.z.object({
    status: zod_1.z.enum(['draft', 'sent', 'paid', 'completed']).optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
//# sourceMappingURL=quote.types.js.map