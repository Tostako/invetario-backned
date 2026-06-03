import { z } from 'zod';
export declare const CreateLandingImageSchema: z.ZodObject<{
    type: z.ZodEnum<["hero_bg", "carousel", "logo_main", "logo_white", "logo_abbreviated", "about", "service_card", "cta_bg"]>;
    url: z.ZodString;
    alt: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
    order: z.ZodDefault<z.ZodNumber>;
    active: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>;
    metadata: z.ZodEffects<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>, Record<string, unknown> | undefined, unknown>;
}, "strip", z.ZodTypeAny, {
    type: "hero_bg" | "carousel" | "logo_main" | "logo_white" | "logo_abbreviated" | "about" | "service_card" | "cta_bg";
    active: boolean;
    url: string;
    order: number;
    alt?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}, {
    type: "hero_bg" | "carousel" | "logo_main" | "logo_white" | "logo_abbreviated" | "about" | "service_card" | "cta_bg";
    url: string;
    active?: unknown;
    alt?: unknown;
    order?: number | undefined;
    metadata?: unknown;
}>;
export declare const UpdateLandingImageSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<["hero_bg", "carousel", "logo_main", "logo_white", "logo_abbreviated", "about", "service_card", "cta_bg"]>>;
    url: z.ZodOptional<z.ZodString>;
    alt: z.ZodOptional<z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>>;
    order: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    active: z.ZodOptional<z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>>;
    metadata: z.ZodOptional<z.ZodEffects<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>, Record<string, unknown> | undefined, unknown>>;
}, "strip", z.ZodTypeAny, {
    type?: "hero_bg" | "carousel" | "logo_main" | "logo_white" | "logo_abbreviated" | "about" | "service_card" | "cta_bg" | undefined;
    active?: boolean | undefined;
    url?: string | undefined;
    alt?: string | undefined;
    order?: number | undefined;
    metadata?: Record<string, unknown> | undefined;
}, {
    type?: "hero_bg" | "carousel" | "logo_main" | "logo_white" | "logo_abbreviated" | "about" | "service_card" | "cta_bg" | undefined;
    active?: unknown;
    url?: string | undefined;
    alt?: unknown;
    order?: number | undefined;
    metadata?: unknown;
}>;
export declare const LandingImageFilterSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<["hero_bg", "carousel", "logo_main", "logo_white", "logo_abbreviated", "about", "service_card", "cta_bg"]>>;
    is_active: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    type?: "hero_bg" | "carousel" | "logo_main" | "logo_white" | "logo_abbreviated" | "about" | "service_card" | "cta_bg" | undefined;
    is_active?: boolean | undefined;
}, {
    limit?: number | undefined;
    type?: "hero_bg" | "carousel" | "logo_main" | "logo_white" | "logo_abbreviated" | "about" | "service_card" | "cta_bg" | undefined;
    is_active?: unknown;
    page?: number | undefined;
}>;
export type CreateLandingImageDto = z.infer<typeof CreateLandingImageSchema>;
export type UpdateLandingImageDto = z.infer<typeof UpdateLandingImageSchema>;
export type LandingImageFilter = z.infer<typeof LandingImageFilterSchema>;
export interface LandingImage {
    id: string;
    shop_id: string;
    type: string;
    url: string;
    alt: string | null;
    order: number;
    active: boolean;
    metadata: Record<string, unknown> | null;
    uploaded_by: string | null;
    created_at: string;
    updated_at: string;
}
/** Imagen tal como se ve en la landing pública (sin campos internos). */
export interface PublicLandingImage {
    type: string;
    url: string;
    alt: string | null;
    order: number;
    metadata: Record<string, unknown> | null;
}
//# sourceMappingURL=landing-image.types.d.ts.map