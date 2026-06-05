import { z } from 'zod';
export declare const METODOS_PAGO: readonly ["card", "pse", "manual", "cash", "transfer", "wompi", "other"];
export type MetodoPago = typeof METODOS_PAGO[number];
export declare const RegistrarPagoSchema: z.ZodObject<{
    order_id: z.ZodString;
    method: z.ZodEnum<["card", "pse", "manual", "cash", "transfer", "wompi", "other"]>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    order_id: string;
    method: "card" | "pse" | "manual" | "cash" | "transfer" | "wompi" | "other";
    notes?: string | undefined;
}, {
    order_id: string;
    method: "card" | "pse" | "manual" | "cash" | "transfer" | "wompi" | "other";
    notes?: string | undefined;
}>;
export declare const ActualizarPagoSchema: z.ZodObject<{
    status: z.ZodEnum<["pending", "approved", "rejected", "cancelled", "refunded", "in_process", "confirmed"]>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "confirmed" | "cancelled" | "approved" | "rejected" | "refunded" | "in_process";
    notes?: string | undefined;
}, {
    status: "pending" | "confirmed" | "cancelled" | "approved" | "rejected" | "refunded" | "in_process";
    notes?: string | undefined;
}>;
export type RegistrarPagoDto = z.infer<typeof RegistrarPagoSchema>;
export type ActualizarPagoDto = z.infer<typeof ActualizarPagoSchema>;
export interface Payment {
    id: string;
    shop_id: string;
    order_id: string | null;
    quote_id: string | null;
    plan_installment_index: number | null;
    installmentIndex?: number | null;
    notes: string | null;
    recorded_by: string | null;
    mp_payment_id: number | null;
    method: string;
    status: string;
    status_detail: string | null;
    transaction_amount: number;
    transactionAmount?: number;
    amount?: number;
    external_resource_url: string | null;
    raw_response: unknown;
    created_at: string;
    updated_at: string;
}
//# sourceMappingURL=payment.types.d.ts.map