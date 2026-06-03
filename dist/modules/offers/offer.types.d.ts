import { z } from 'zod';
export declare const CreateOfferSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    title: z.ZodString;
    description: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
    discount_type: z.ZodEnum<["percentage", "fixed_amount"]>;
    discount_value: z.ZodNumber;
    scope: z.ZodEnum<["storewide", "category", "product"]>;
    product_id: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
    category_id: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
    code: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
    starts_at: z.ZodDate;
    ends_at: z.ZodDate;
    is_active: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>;
    usage_limit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    is_active: boolean;
    title: string;
    discount_type: "percentage" | "fixed_amount";
    discount_value: number;
    scope: "storewide" | "category" | "product";
    starts_at: Date;
    ends_at: Date;
    code?: string | undefined;
    description?: string | undefined;
    category_id?: string | undefined;
    product_id?: string | undefined;
    usage_limit?: number | undefined;
}, {
    title: string;
    discount_type: "percentage" | "fixed_amount";
    discount_value: number;
    scope: "storewide" | "category" | "product";
    starts_at: Date;
    ends_at: Date;
    code?: unknown;
    is_active?: unknown;
    description?: unknown;
    category_id?: unknown;
    product_id?: unknown;
    usage_limit?: number | undefined;
}>, {
    is_active: boolean;
    title: string;
    discount_type: "percentage" | "fixed_amount";
    discount_value: number;
    scope: "storewide" | "category" | "product";
    starts_at: Date;
    ends_at: Date;
    code?: string | undefined;
    description?: string | undefined;
    category_id?: string | undefined;
    product_id?: string | undefined;
    usage_limit?: number | undefined;
}, {
    title: string;
    discount_type: "percentage" | "fixed_amount";
    discount_value: number;
    scope: "storewide" | "category" | "product";
    starts_at: Date;
    ends_at: Date;
    code?: unknown;
    is_active?: unknown;
    description?: unknown;
    category_id?: unknown;
    product_id?: unknown;
    usage_limit?: number | undefined;
}>, {
    is_active: boolean;
    title: string;
    discount_type: "percentage" | "fixed_amount";
    discount_value: number;
    scope: "storewide" | "category" | "product";
    starts_at: Date;
    ends_at: Date;
    code?: string | undefined;
    description?: string | undefined;
    category_id?: string | undefined;
    product_id?: string | undefined;
    usage_limit?: number | undefined;
}, {
    title: string;
    discount_type: "percentage" | "fixed_amount";
    discount_value: number;
    scope: "storewide" | "category" | "product";
    starts_at: Date;
    ends_at: Date;
    code?: unknown;
    is_active?: unknown;
    description?: unknown;
    category_id?: unknown;
    product_id?: unknown;
    usage_limit?: number | undefined;
}>;
export declare const UpdateOfferSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>>;
    discount_type: z.ZodOptional<z.ZodEnum<["percentage", "fixed_amount"]>>;
    discount_value: z.ZodOptional<z.ZodNumber>;
    scope: z.ZodOptional<z.ZodEnum<["storewide", "category", "product"]>>;
    product_id: z.ZodOptional<z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>>;
    category_id: z.ZodOptional<z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>>;
    code: z.ZodOptional<z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>>;
    starts_at: z.ZodOptional<z.ZodDate>;
    ends_at: z.ZodOptional<z.ZodDate>;
    is_active: z.ZodOptional<z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>>;
    usage_limit: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    code?: string | undefined;
    is_active?: boolean | undefined;
    description?: string | undefined;
    category_id?: string | undefined;
    product_id?: string | undefined;
    title?: string | undefined;
    discount_type?: "percentage" | "fixed_amount" | undefined;
    discount_value?: number | undefined;
    scope?: "storewide" | "category" | "product" | undefined;
    starts_at?: Date | undefined;
    ends_at?: Date | undefined;
    usage_limit?: number | undefined;
}, {
    code?: unknown;
    is_active?: unknown;
    description?: unknown;
    category_id?: unknown;
    product_id?: unknown;
    title?: string | undefined;
    discount_type?: "percentage" | "fixed_amount" | undefined;
    discount_value?: number | undefined;
    scope?: "storewide" | "category" | "product" | undefined;
    starts_at?: Date | undefined;
    ends_at?: Date | undefined;
    usage_limit?: number | undefined;
}>, {
    code?: string | undefined;
    is_active?: boolean | undefined;
    description?: string | undefined;
    category_id?: string | undefined;
    product_id?: string | undefined;
    title?: string | undefined;
    discount_type?: "percentage" | "fixed_amount" | undefined;
    discount_value?: number | undefined;
    scope?: "storewide" | "category" | "product" | undefined;
    starts_at?: Date | undefined;
    ends_at?: Date | undefined;
    usage_limit?: number | undefined;
}, {
    code?: unknown;
    is_active?: unknown;
    description?: unknown;
    category_id?: unknown;
    product_id?: unknown;
    title?: string | undefined;
    discount_type?: "percentage" | "fixed_amount" | undefined;
    discount_value?: number | undefined;
    scope?: "storewide" | "category" | "product" | undefined;
    starts_at?: Date | undefined;
    ends_at?: Date | undefined;
    usage_limit?: number | undefined;
}>, {
    code?: string | undefined;
    is_active?: boolean | undefined;
    description?: string | undefined;
    category_id?: string | undefined;
    product_id?: string | undefined;
    title?: string | undefined;
    discount_type?: "percentage" | "fixed_amount" | undefined;
    discount_value?: number | undefined;
    scope?: "storewide" | "category" | "product" | undefined;
    starts_at?: Date | undefined;
    ends_at?: Date | undefined;
    usage_limit?: number | undefined;
}, {
    code?: unknown;
    is_active?: unknown;
    description?: unknown;
    category_id?: unknown;
    product_id?: unknown;
    title?: string | undefined;
    discount_type?: "percentage" | "fixed_amount" | undefined;
    discount_value?: number | undefined;
    scope?: "storewide" | "category" | "product" | undefined;
    starts_at?: Date | undefined;
    ends_at?: Date | undefined;
    usage_limit?: number | undefined;
}>;
export declare const OfferFilterSchema: z.ZodObject<{
    is_active: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    scope: z.ZodOptional<z.ZodEnum<["storewide", "category", "product"]>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    is_active?: boolean | undefined;
    scope?: "storewide" | "category" | "product" | undefined;
}, {
    limit?: number | undefined;
    is_active?: unknown;
    page?: number | undefined;
    scope?: "storewide" | "category" | "product" | undefined;
}>;
export type CreateOfferDto = z.infer<typeof CreateOfferSchema>;
export type UpdateOfferDto = z.infer<typeof UpdateOfferSchema>;
export type OfferFilter = z.infer<typeof OfferFilterSchema>;
export interface Offer {
    id: string;
    shop_id: string;
    title: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed_amount';
    discount_value: number;
    scope: 'storewide' | 'category' | 'product';
    product_id: string | null;
    category_id: string | null;
    code: string | null;
    starts_at: string;
    ends_at: string;
    is_active: boolean;
    usage_limit: number | null;
    usage_count: number;
    created_at: string;
    updated_at: string;
    product_name?: string | null;
    category_name?: string | null;
}
export interface OfferWithStatus extends Offer {
    status: 'active' | 'expired' | 'scheduled' | 'disabled';
}
/** Oferta tal como se ve en el catálogo público (sin campos internos). */
export interface PublicOffer {
    id: string;
    title: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed_amount';
    discount_value: number;
    scope: 'storewide' | 'category' | 'product';
    product_id: string | null;
    category_id: string | null;
    code: string | null;
    starts_at: string;
    ends_at: string;
    product_name?: string | null;
    category_name?: string | null;
    product_image?: string | null;
    product_price?: number | null;
}
//# sourceMappingURL=offer.types.d.ts.map