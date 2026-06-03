import { z } from 'zod';
export declare const AuditLogFilterSchema: z.ZodObject<{
    entity: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
    user_id: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    entity?: string | undefined;
    user_id?: string | undefined;
}, {
    limit?: number | undefined;
    page?: number | undefined;
    entity?: unknown;
    user_id?: unknown;
}>;
export type AuditLogFilter = z.infer<typeof AuditLogFilterSchema>;
export interface AuditLog {
    id: string;
    shop_id: string;
    action: string;
    entity: string;
    entity_id: string | null;
    old_value: string | null;
    new_value: string | null;
    user_id: string;
    created_at: string;
}
//# sourceMappingURL=audit-log.types.d.ts.map