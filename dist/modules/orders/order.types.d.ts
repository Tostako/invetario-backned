import { z } from 'zod';
export declare const ESTADOS_PEDIDO: readonly ["pending", "confirmed", "shipped", "delivered", "cancelled"];
export type EstadoPedido = typeof ESTADOS_PEDIDO[number];
export declare const CrearPedidoSchema: z.ZodObject<{
    customer_id: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        product_id: z.ZodString;
        quantity: z.ZodNumber;
        discount: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        product_id: string;
        quantity: number;
        discount: number;
    }, {
        product_id: string;
        quantity: number;
        discount?: number | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    items?: {
        product_id: string;
        quantity: number;
        discount: number;
    }[] | undefined;
    customer_id?: string | undefined;
    notes?: string | undefined;
}, {
    items?: {
        product_id: string;
        quantity: number;
        discount?: number | undefined;
    }[] | undefined;
    customer_id?: string | undefined;
    notes?: string | undefined;
}>;
export declare const ActualizarEstadoSchema: z.ZodObject<{
    status: z.ZodEnum<["pending", "confirmed", "shipped", "delivered", "cancelled"]>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
    notes?: string | undefined;
}, {
    status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
    notes?: string | undefined;
}>;
export declare const FiltrosPedidoSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["pending", "confirmed", "shipped", "delivered", "cancelled"]>>;
    customer_id: z.ZodOptional<z.ZodString>;
    desde: z.ZodOptional<z.ZodString>;
    hasta: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    status?: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | undefined;
    customer_id?: string | undefined;
    desde?: string | undefined;
    hasta?: string | undefined;
}, {
    limit?: number | undefined;
    status?: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | undefined;
    page?: number | undefined;
    customer_id?: string | undefined;
    desde?: string | undefined;
    hasta?: string | undefined;
}>;
export type CrearPedidoDto = z.infer<typeof CrearPedidoSchema>;
export type ActualizarEstadoDto = z.infer<typeof ActualizarEstadoSchema>;
export type FiltrosPedido = z.infer<typeof FiltrosPedidoSchema>;
export interface OrderItem {
    id: string;
    shop_id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    discount: number;
    subtotal: number;
    created_at: string;
    product_name?: string;
    product_sku?: string;
}
export interface Order {
    id: string;
    shop_id: string;
    customer_id: string | null;
    created_by: string;
    order_number: string;
    status: EstadoPedido;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    notes: string | null;
    created_at: string;
    updated_at: string;
    customer_name?: string | null;
    items?: OrderItem[];
}
//# sourceMappingURL=order.types.d.ts.map