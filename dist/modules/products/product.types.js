"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicProductFilterSchema = exports.ProductFilterSchema = exports.UpdateProductSchema = exports.CreateProductSchema = void 0;
const zod_1 = require("zod");
const uuidV4_1 = require("../../shared/utils/uuidV4");
const mensajeCategoryIdUuid = 'category_id debe ser el UUID de la categoría (no el nombre). Obtén los ids con GET /api/v1/public/categories?shop_slug=tu-tienda. En el catálogo público también puedes enviar el nombre exacto de la categoría.';
const mensajeSupplierIdUuid = 'supplier_id debe ser el UUID del proveedor.';
// ─── Esquemas de validación ───────────────────────────────────────────────────
exports.CreateProductSchema = zod_1.z.object({
    sku: zod_1.z
        .string()
        .min(1)
        .max(100)
        .regex(/^[A-Za-z0-9_\-]+$/, 'SKU only allows letters, numbers, hyphens and underscores'),
    name: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().max(2000).optional(),
    image_url: zod_1.z.string().url().optional(),
    category_id: zod_1.z.string().uuid().optional(),
    supplier_id: zod_1.z.string().uuid().optional(),
    price: zod_1.z.coerce.number().min(0),
    cost: zod_1.z.coerce.number().min(0).optional(),
    stock: zod_1.z.coerce.number().int().min(0).default(0),
    stock_min: zod_1.z.coerce.number().int().min(0).default(0),
    stock_max: zod_1.z.coerce.number().int().min(1).optional(),
    unit: zod_1.z.string().max(30).default('unit'),
});
exports.UpdateProductSchema = exports.CreateProductSchema.partial();
const queryUuidOpcional = (mensajeInvalido) => zod_1.z.preprocess((v) => (v === '' || v === null || v === undefined ? undefined : String(v)), zod_1.z
    .string()
    .optional()
    .superRefine((val, ctx) => {
    if (val === undefined)
        return;
    if (!(0, uuidV4_1.esUuidV4)(val)) {
        ctx.addIssue({ code: zod_1.z.ZodIssueCode.custom, message: mensajeInvalido });
    }
}));
exports.ProductFilterSchema = zod_1.z.object({
    search: zod_1.z.string().optional(), // busca en name y sku
    category_id: queryUuidOpcional(mensajeCategoryIdUuid),
    supplier_id: queryUuidOpcional(mensajeSupplierIdUuid),
    low_stock: zod_1.z.coerce.boolean().optional(), // solo productos con stock <= stock_min
    is_active: zod_1.z.coerce.boolean().optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
/** Catálogo público: category_id puede ser UUID o nombre exacto de categoría (se resuelve en el controller). */
exports.PublicProductFilterSchema = exports.ProductFilterSchema.omit({ category_id: true }).extend({
    category_id: zod_1.z.preprocess((v) => (v === '' || v === null || v === undefined ? undefined : String(v).trim()), zod_1.z.string().optional()),
});
//# sourceMappingURL=product.types.js.map