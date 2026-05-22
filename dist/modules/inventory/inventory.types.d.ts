import { z } from 'zod';
export declare const MovimientosFilterSchema: z.ZodObject<{
    product_id: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["purchase", "sale", "adjustment", "return", "loss"]>>;
    desde: z.ZodOptional<z.ZodDate>;
    hasta: z.ZodOptional<z.ZodDate>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    type?: "adjustment" | "purchase" | "sale" | "return" | "loss" | undefined;
    product_id?: string | undefined;
    desde?: Date | undefined;
    hasta?: Date | undefined;
}, {
    limit?: number | undefined;
    type?: "adjustment" | "purchase" | "sale" | "return" | "loss" | undefined;
    page?: number | undefined;
    product_id?: string | undefined;
    desde?: Date | undefined;
    hasta?: Date | undefined;
}>;
export type MovimientosFilter = z.infer<typeof MovimientosFilterSchema>;
export interface MovimientoInventario {
    id: string;
    shop_id: string;
    product_id: string;
    user_id: string;
    order_id: string | null;
    type: string;
    quantity: number;
    stock_before: number;
    stock_after: number;
    notes: string | null;
    created_at: string;
    product_name: string;
    product_sku: string;
}
export interface AlertaInventario {
    product_id: string;
    sku: string;
    name: string;
    stock: number;
    stock_min: number;
    stock_max: number | null;
    image_url: string | null;
    is_active: boolean;
    tipo_alerta: 'sin_stock' | 'stock_bajo';
}
//# sourceMappingURL=inventory.types.d.ts.map