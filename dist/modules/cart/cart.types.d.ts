import { z } from 'zod';
export declare const AgregarItemSchema: z.ZodObject<{
    product_id: z.ZodString;
    quantity: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    product_id: string;
    quantity: number;
}, {
    product_id: string;
    quantity: number;
}>;
export declare const ActualizarItemSchema: z.ZodObject<{
    quantity: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    quantity: number;
}, {
    quantity: number;
}>;
export type AgregarItemDto = z.infer<typeof AgregarItemSchema>;
export type ActualizarItemDto = z.infer<typeof ActualizarItemSchema>;
export interface CartItem {
    id: string;
    shop_id: string;
    customer_id: string;
    product_id: string;
    quantity: number;
    created_at: string;
    updated_at: string;
    product_name?: string;
    product_sku?: string;
    unit_price?: number;
    subtotal?: number;
    stock_available?: number;
}
export interface CartResumen {
    items: CartItem[];
    total: number;
}
//# sourceMappingURL=cart.types.d.ts.map