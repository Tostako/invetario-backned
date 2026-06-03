import { z } from 'zod';
export declare const METODOS_PAGO: readonly ["cash", "card", "transfer", "pse", "other"];
export type MetodoPago = typeof METODOS_PAGO[number];
export declare const RegistrarPagoSchema: z.ZodObject<{
    order_id: z.ZodString;
    method: z.ZodEnum<["cash", "card", "transfer", "pse", "other"]>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    order_id: string;
    method: "cash" | "card" | "transfer" | "pse" | "other";
    notes?: string | undefined;
}, {
    order_id: string;
    method: "cash" | "card" | "transfer" | "pse" | "other";
    notes?: string | undefined;
}>;
export declare const ActualizarPagoSchema: z.ZodObject<{
    status: z.ZodEnum<["approved", "rejected", "cancelled", "refunded"]>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "cancelled" | "approved" | "rejected" | "refunded";
    notes?: string | undefined;
}, {
    status: "cancelled" | "approved" | "rejected" | "refunded";
    notes?: string | undefined;
}>;
export type RegistrarPagoDto = z.infer<typeof RegistrarPagoSchema>;
export type ActualizarPagoDto = z.infer<typeof ActualizarPagoSchema>;
export interface Payment {
    id: string;
    shop_id: string;
    order_id: string;
    mp_payment_id: number | null;
    method: string;
    status: string;
    status_detail: string | null;
    transaction_amount: number;
    external_resource_url: string | null;
    raw_response: unknown;
    created_at: string;
    updated_at: string;
}
//# sourceMappingURL=payment.types.d.ts.map