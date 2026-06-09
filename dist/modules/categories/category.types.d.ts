import { z } from 'zod';
export declare const CreateCategorySchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
    is_active: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>;
    parent_id: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
}, "strip", z.ZodTypeAny, {
    name: string;
    is_active: boolean;
    description?: string | undefined;
    parent_id?: string | undefined;
}, {
    name: string;
    description?: unknown;
    is_active?: unknown;
    parent_id?: unknown;
}>;
export declare const UpdateCategorySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>>;
    is_active: z.ZodOptional<z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>>;
    parent_id: z.ZodOptional<z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    is_active?: boolean | undefined;
    parent_id?: string | undefined;
}, {
    name?: string | undefined;
    description?: unknown;
    is_active?: unknown;
    parent_id?: unknown;
}>;
export declare const CategoryFilterSchema: z.ZodObject<{
    is_active: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    is_active?: boolean | undefined;
}, {
    limit?: number | undefined;
    is_active?: unknown;
    page?: number | undefined;
}>;
export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>;
export type CategoryFilter = z.infer<typeof CategoryFilterSchema>;
export interface Category {
    id: string;
    shop_id: string;
    parent_id: string | null;
    name: string;
    description: string | null;
    image_url: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
//# sourceMappingURL=category.types.d.ts.map