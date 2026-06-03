import { z } from 'zod';
export declare const UpsertCustomerConfigSchema: z.ZodObject<{
    services: z.ZodDefault<z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodUnknown>, Record<string, unknown>, unknown>>;
    sub_packages: z.ZodDefault<z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodUnknown>, Record<string, unknown>, unknown>>;
    complete_package: z.ZodDefault<z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodUnknown>, Record<string, unknown>, unknown>>;
    payment_plan: z.ZodDefault<z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodUnknown>, Record<string, unknown>, unknown>>;
    invoice: z.ZodDefault<z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodUnknown>, Record<string, unknown>, unknown>>;
    estimation: z.ZodDefault<z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodUnknown>, Record<string, unknown>, unknown>>;
}, "strip", z.ZodTypeAny, {
    services: Record<string, unknown>;
    sub_packages: Record<string, unknown>;
    complete_package: Record<string, unknown>;
    payment_plan: Record<string, unknown>;
    invoice: Record<string, unknown>;
    estimation: Record<string, unknown>;
}, {
    services?: unknown;
    sub_packages?: unknown;
    complete_package?: unknown;
    payment_plan?: unknown;
    invoice?: unknown;
    estimation?: unknown;
}>;
export declare const CustomerConfigFilterSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
}, {
    limit?: number | undefined;
    page?: number | undefined;
}>;
export type UpsertCustomerConfigDto = z.infer<typeof UpsertCustomerConfigSchema>;
export type CustomerConfigFilter = z.infer<typeof CustomerConfigFilterSchema>;
export interface CustomerConfig {
    id: string;
    shop_id: string;
    customer_id: string;
    services: Record<string, unknown>;
    sub_packages: Record<string, unknown>;
    complete_package: Record<string, unknown>;
    payment_plan: Record<string, unknown>;
    invoice: Record<string, unknown>;
    estimation: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}
//# sourceMappingURL=customer-config.types.d.ts.map