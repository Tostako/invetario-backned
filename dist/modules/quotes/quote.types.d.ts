import { z } from 'zod';
export declare const CreateQuoteSchema: z.ZodObject<{
    client: z.ZodString;
    project: z.ZodString;
    area: z.ZodNumber;
    price: z.ZodNumber;
    status: z.ZodDefault<z.ZodEnum<["draft", "sent", "paid", "completed"]>>;
    data: z.ZodEffects<z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>, Record<string, unknown>, unknown>;
    date: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    status: "draft" | "sent" | "paid" | "completed";
    data: Record<string, unknown>;
    price: number;
    client: string;
    project: string;
    area: number;
    date?: Date | undefined;
}, {
    price: number;
    client: string;
    project: string;
    area: number;
    date?: Date | undefined;
    status?: "draft" | "sent" | "paid" | "completed" | undefined;
    data?: unknown;
}>;
export declare const UpdateQuoteSchema: z.ZodObject<{
    client: z.ZodOptional<z.ZodString>;
    project: z.ZodOptional<z.ZodString>;
    area: z.ZodOptional<z.ZodNumber>;
    price: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["draft", "sent", "paid", "completed"]>>>;
    data: z.ZodOptional<z.ZodEffects<z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>, Record<string, unknown>, unknown>>;
    date: z.ZodOptional<z.ZodOptional<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    date?: Date | undefined;
    status?: "draft" | "sent" | "paid" | "completed" | undefined;
    data?: Record<string, unknown> | undefined;
    price?: number | undefined;
    client?: string | undefined;
    project?: string | undefined;
    area?: number | undefined;
}, {
    date?: Date | undefined;
    status?: "draft" | "sent" | "paid" | "completed" | undefined;
    data?: unknown;
    price?: number | undefined;
    client?: string | undefined;
    project?: string | undefined;
    area?: number | undefined;
}>;
export declare const QuoteFilterSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["draft", "sent", "paid", "completed"]>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    status?: "draft" | "sent" | "paid" | "completed" | undefined;
}, {
    limit?: number | undefined;
    status?: "draft" | "sent" | "paid" | "completed" | undefined;
    page?: number | undefined;
}>;
export type CreateQuoteDto = z.infer<typeof CreateQuoteSchema>;
export type UpdateQuoteDto = z.infer<typeof UpdateQuoteSchema>;
export type QuoteFilter = z.infer<typeof QuoteFilterSchema>;
export interface Quote {
    id: string;
    shop_id: string;
    customer_id: string;
    client: string;
    project: string;
    area: number;
    price: number;
    status: 'draft' | 'sent' | 'paid' | 'completed';
    data: Record<string, unknown>;
    date: string;
    created_at: string;
    updated_at: string;
}
//# sourceMappingURL=quote.types.d.ts.map