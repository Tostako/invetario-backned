import { z } from 'zod';
export declare const UpdateShopSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    email: z.ZodOptional<z.ZodString>;
    address: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    currency: z.ZodOptional<z.ZodString>;
    timezone: z.ZodOptional<z.ZodString>;
    vat_rate: z.ZodOptional<z.ZodNumber>;
    min_order_amount: z.ZodOptional<z.ZodNumber>;
    logo_url: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    name?: string | undefined;
    phone?: string | null | undefined;
    address?: string | null | undefined;
    description?: string | null | undefined;
    logo_url?: string | null | undefined;
    currency?: string | undefined;
    timezone?: string | undefined;
    vat_rate?: number | undefined;
    min_order_amount?: number | undefined;
}, {
    email?: string | undefined;
    name?: string | undefined;
    phone?: string | null | undefined;
    address?: string | null | undefined;
    description?: string | null | undefined;
    logo_url?: string | null | undefined;
    currency?: string | undefined;
    timezone?: string | undefined;
    vat_rate?: number | undefined;
    min_order_amount?: number | undefined;
}>, {
    email?: string | undefined;
    name?: string | undefined;
    phone?: string | null | undefined;
    address?: string | null | undefined;
    description?: string | null | undefined;
    logo_url?: string | null | undefined;
    currency?: string | undefined;
    timezone?: string | undefined;
    vat_rate?: number | undefined;
    min_order_amount?: number | undefined;
}, {
    email?: string | undefined;
    name?: string | undefined;
    phone?: string | null | undefined;
    address?: string | null | undefined;
    description?: string | null | undefined;
    logo_url?: string | null | undefined;
    currency?: string | undefined;
    timezone?: string | undefined;
    vat_rate?: number | undefined;
    min_order_amount?: number | undefined;
}>;
export type UpdateShopDto = z.infer<typeof UpdateShopSchema>;
export interface TiendaPerfil {
    id: string;
    name: string;
    slug: string;
    email: string;
    phone: string | null;
    address: string | null;
    description: string | null;
    logo_url: string | null;
    currency: string;
    timezone: string;
    vat_rate: number;
    min_order_amount: number;
    is_active: boolean;
    plan: string;
    created_at: string;
    updated_at: string;
}
//# sourceMappingURL=shop.types.d.ts.map