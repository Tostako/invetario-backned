import { z } from 'zod';
export declare const CreateProductSchema: z.ZodObject<{
    sku: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    image_url: z.ZodOptional<z.ZodString>;
    category_id: z.ZodOptional<z.ZodString>;
    supplier_id: z.ZodOptional<z.ZodString>;
    price: z.ZodNumber;
    cost: z.ZodOptional<z.ZodNumber>;
    stock: z.ZodDefault<z.ZodNumber>;
    stock_min: z.ZodDefault<z.ZodNumber>;
    stock_max: z.ZodOptional<z.ZodNumber>;
    unit: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    sku: string;
    price: number;
    stock: number;
    stock_min: number;
    unit: string;
    description?: string | undefined;
    image_url?: string | undefined;
    category_id?: string | undefined;
    supplier_id?: string | undefined;
    cost?: number | undefined;
    stock_max?: number | undefined;
}, {
    name: string;
    sku: string;
    price: number;
    description?: string | undefined;
    image_url?: string | undefined;
    category_id?: string | undefined;
    supplier_id?: string | undefined;
    cost?: number | undefined;
    stock?: number | undefined;
    stock_min?: number | undefined;
    stock_max?: number | undefined;
    unit?: string | undefined;
}>;
export declare const UpdateProductSchema: z.ZodObject<{
    sku: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    image_url: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    category_id: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    supplier_id: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    price: z.ZodOptional<z.ZodNumber>;
    cost: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    stock: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    stock_min: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    stock_max: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    unit: z.ZodOptional<z.ZodDefault<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    sku?: string | undefined;
    description?: string | undefined;
    image_url?: string | undefined;
    category_id?: string | undefined;
    supplier_id?: string | undefined;
    price?: number | undefined;
    cost?: number | undefined;
    stock?: number | undefined;
    stock_min?: number | undefined;
    stock_max?: number | undefined;
    unit?: string | undefined;
}, {
    name?: string | undefined;
    sku?: string | undefined;
    description?: string | undefined;
    image_url?: string | undefined;
    category_id?: string | undefined;
    supplier_id?: string | undefined;
    price?: number | undefined;
    cost?: number | undefined;
    stock?: number | undefined;
    stock_min?: number | undefined;
    stock_max?: number | undefined;
    unit?: string | undefined;
}>;
export declare const ProductFilterSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    category_id: z.ZodEffects<z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>, string | undefined, unknown>;
    supplier_id: z.ZodEffects<z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>, string | undefined, unknown>;
    low_stock: z.ZodOptional<z.ZodBoolean>;
    is_active: z.ZodOptional<z.ZodBoolean>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    category_id?: string | undefined;
    supplier_id?: string | undefined;
    search?: string | undefined;
    low_stock?: boolean | undefined;
    is_active?: boolean | undefined;
}, {
    limit?: number | undefined;
    category_id?: unknown;
    supplier_id?: unknown;
    search?: string | undefined;
    low_stock?: boolean | undefined;
    is_active?: boolean | undefined;
    page?: number | undefined;
}>;
/** Catálogo público: category_id puede ser UUID o nombre exacto de categoría (se resuelve en el controller). */
export declare const PublicProductFilterSchema: z.ZodObject<Omit<{
    search: z.ZodOptional<z.ZodString>;
    category_id: z.ZodEffects<z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>, string | undefined, unknown>;
    supplier_id: z.ZodEffects<z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>, string | undefined, unknown>;
    low_stock: z.ZodOptional<z.ZodBoolean>;
    is_active: z.ZodOptional<z.ZodBoolean>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "category_id"> & {
    category_id: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    category_id?: string | undefined;
    supplier_id?: string | undefined;
    search?: string | undefined;
    low_stock?: boolean | undefined;
    is_active?: boolean | undefined;
}, {
    limit?: number | undefined;
    category_id?: unknown;
    supplier_id?: unknown;
    search?: string | undefined;
    low_stock?: boolean | undefined;
    is_active?: boolean | undefined;
    page?: number | undefined;
}>;
export type EstadoStock = 'ok' | 'bajo' | 'sin_stock';
export type CreateProductDto = z.infer<typeof CreateProductSchema>;
export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;
export type ProductFilter = z.infer<typeof ProductFilterSchema>;
/** Producto tal como lo devuelve la API (incluye estado de inventario calculado). */
export type ProductoConEstado = Product & {
    estado_stock: EstadoStock;
};
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
    category_name?: string | null;
    supplier_name?: string | null;
}
//# sourceMappingURL=product.types.d.ts.map