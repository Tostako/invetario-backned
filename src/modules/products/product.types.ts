import { z } from 'zod';
import { esUuidV4 } from '../../shared/utils/uuidV4';

const mensajeCategoryIdUuid =
  'category_id debe ser el UUID de la categoría (no el nombre). Obtén los ids con GET /api/v1/public/categories?shop_slug=tu-tienda. En el catálogo público también puedes enviar el nombre exacto de la categoría.';

const mensajeSupplierIdUuid =
  'supplier_id debe ser el UUID del proveedor.';

// ─── Esquemas de validación ───────────────────────────────────────────────────

export const CreateProductSchema = z.object({
  sku: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[A-Za-z0-9_\-]+$/, 'SKU only allows letters, numbers, hyphens and underscores'),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  image_url: z.string().url().optional(),
  category_id: z.string().uuid().optional(),
  supplier_id: z.string().uuid().optional(),
  price: z.coerce.number().min(0),
  cost: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0).default(0),
  stock_min: z.coerce.number().int().min(0).default(0),
  stock_max: z.coerce.number().int().min(1).optional(),
  unit: z.string().max(30).default('unit'),
});

export const UpdateProductSchema = CreateProductSchema.partial();

const queryUuidOpcional = (mensajeInvalido: string) =>
  z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : String(v)),
    z
      .string()
      .optional()
      .superRefine((val, ctx) => {
        if (val === undefined) return;
        if (!esUuidV4(val)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: mensajeInvalido });
        }
      })
  );

export const ProductFilterSchema = z.object({
  search: z.string().optional(),           // busca en name y sku
  category_id: queryUuidOpcional(mensajeCategoryIdUuid),
  supplier_id: queryUuidOpcional(mensajeSupplierIdUuid),
  low_stock: z.coerce.boolean().optional(), // solo productos con stock <= stock_min
  is_active: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/** Catálogo público: category_id puede ser UUID o nombre exacto de categoría (se resuelve en el controller). */
export const PublicProductFilterSchema = ProductFilterSchema.omit({ category_id: true }).extend({
  category_id: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : String(v).trim()),
    z.string().optional()
  ),
});

// ─── Tipos TypeScript ─────────────────────────────────────────────────────────

export type EstadoStock = 'ok' | 'bajo' | 'sin_stock';

export type CreateProductDto = z.infer<typeof CreateProductSchema>;
export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;
export type ProductFilter = z.infer<typeof ProductFilterSchema>;

/** Producto tal como lo devuelve la API (incluye estado de inventario calculado). */
export type ProductoConEstado = Product & { estado_stock: EstadoStock };

export interface Product {
  id: string;
  shop_id: string;
  category_id: string | null;
  supplier_id: string | null;
  sku: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  cost: number | null;
  stock: number;
  stock_min: number;
  stock_max: number | null;
  unit: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Campos enriquecidos del JOIN
  category_name?: string | null;
  supplier_name?: string | null;
}
