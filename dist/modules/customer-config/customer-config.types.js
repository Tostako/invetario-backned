"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerConfigFilterSchema = exports.UpsertCustomerConfigSchema = void 0;
const zod_1 = require("zod");
// ─── Esquemas de validación ───────────────────────────────────────────────────
const jsonOrObject = zod_1.z.preprocess((v) => {
    if (typeof v === 'string') {
        try {
            return JSON.parse(v);
        }
        catch {
            return v;
        }
    }
    return v;
}, zod_1.z.record(zod_1.z.unknown()));
exports.UpsertCustomerConfigSchema = zod_1.z.object({
    services: jsonOrObject.default({}),
    sub_packages: jsonOrObject.default({}),
    complete_package: jsonOrObject.default({}),
    payment_plan: jsonOrObject.default({}),
    invoice: jsonOrObject.default({}),
    estimation: jsonOrObject.default({}),
});
exports.CustomerConfigFilterSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(50),
});
//# sourceMappingURL=customer-config.types.js.map