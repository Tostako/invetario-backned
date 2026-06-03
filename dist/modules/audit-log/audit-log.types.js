"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogFilterSchema = void 0;
const zod_1 = require("zod");
const emptyStringToUndefined = (value) => typeof value === 'string' && value.trim() === '' ? undefined : value;
// ─── Esquemas de validación ───────────────────────────────────────────────────
exports.AuditLogFilterSchema = zod_1.z.object({
    entity: zod_1.z.preprocess(emptyStringToUndefined, zod_1.z.string().optional()),
    user_id: zod_1.z.preprocess(emptyStringToUndefined, zod_1.z.string().uuid().optional()),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(50),
});
//# sourceMappingURL=audit-log.types.js.map