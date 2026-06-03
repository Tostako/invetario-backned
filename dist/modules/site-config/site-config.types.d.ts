import { z } from 'zod';
export declare const CreateSiteConfigSchema: z.ZodObject<{
    section: z.ZodString;
    key: z.ZodString;
    value: z.ZodString;
    value_type: z.ZodDefault<z.ZodEnum<["text", "markdown", "image_url", "color", "json", "boolean"]>>;
    active: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>;
}, "strip", z.ZodTypeAny, {
    value: string;
    active: boolean;
    section: string;
    key: string;
    value_type: "boolean" | "image_url" | "text" | "markdown" | "color" | "json";
}, {
    value: string;
    section: string;
    key: string;
    active?: unknown;
    value_type?: "boolean" | "image_url" | "text" | "markdown" | "color" | "json" | undefined;
}>;
export declare const UpdateSiteConfigSchema: z.ZodObject<Omit<{
    section: z.ZodOptional<z.ZodString>;
    key: z.ZodOptional<z.ZodString>;
    value: z.ZodOptional<z.ZodString>;
    value_type: z.ZodOptional<z.ZodDefault<z.ZodEnum<["text", "markdown", "image_url", "color", "json", "boolean"]>>>;
    active: z.ZodOptional<z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>>;
}, "section" | "key">, "strip", z.ZodTypeAny, {
    value?: string | undefined;
    active?: boolean | undefined;
    value_type?: "boolean" | "image_url" | "text" | "markdown" | "color" | "json" | undefined;
}, {
    value?: string | undefined;
    active?: unknown;
    value_type?: "boolean" | "image_url" | "text" | "markdown" | "color" | "json" | undefined;
}>;
export declare const SiteConfigFilterSchema: z.ZodObject<{
    section: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
    is_active: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    is_active?: boolean | undefined;
    section?: string | undefined;
}, {
    limit?: number | undefined;
    is_active?: unknown;
    page?: number | undefined;
    section?: unknown;
}>;
export type CreateSiteConfigDto = z.infer<typeof CreateSiteConfigSchema>;
export type UpdateSiteConfigDto = z.infer<typeof UpdateSiteConfigSchema>;
export type SiteConfigFilter = z.infer<typeof SiteConfigFilterSchema>;
export interface SiteConfig {
    id: string;
    shop_id: string;
    section: string;
    key: string;
    value: string;
    value_type: 'text' | 'markdown' | 'image_url' | 'color' | 'json' | 'boolean';
    active: boolean;
    updated_by: string | null;
    created_at: string;
    updated_at: string;
}
/** Config tal como se ve en la landing pública (sin campos internos). */
export interface PublicSiteConfig {
    section: string;
    key: string;
    value: string;
    value_type: string;
}
//# sourceMappingURL=site-config.types.d.ts.map