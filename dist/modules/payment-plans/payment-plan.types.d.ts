import { z } from 'zod';
export declare const InstallmentSchema: z.ZodObject<{
    name: z.ZodString;
    percentage: z.ZodNumber;
    order: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    percentage: number;
    order: number;
}, {
    name: string;
    percentage: number;
    order: number;
}>;
export declare const CreatePaymentPlanSchema: z.ZodEffects<z.ZodObject<{
    customer_id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    installments: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        percentage: z.ZodNumber;
        order: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        percentage: number;
        order: number;
    }, {
        name: string;
        percentage: number;
        order: number;
    }>, "many">;
    is_default: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    installments: {
        name: string;
        percentage: number;
        order: number;
    }[];
    is_default: boolean;
    description?: string | null | undefined;
    customer_id?: string | undefined;
}, {
    name: string;
    installments: {
        name: string;
        percentage: number;
        order: number;
    }[];
    description?: string | null | undefined;
    customer_id?: string | undefined;
    is_default?: boolean | undefined;
}>, {
    name: string;
    installments: {
        name: string;
        percentage: number;
        order: number;
    }[];
    is_default: boolean;
    description?: string | null | undefined;
    customer_id?: string | undefined;
}, {
    name: string;
    installments: {
        name: string;
        percentage: number;
        order: number;
    }[];
    description?: string | null | undefined;
    customer_id?: string | undefined;
    is_default?: boolean | undefined;
}>;
export declare const UpdatePaymentPlanSchema: z.ZodEffects<z.ZodObject<{
    customer_id: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    installments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        percentage: z.ZodNumber;
        order: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        percentage: number;
        order: number;
    }, {
        name: string;
        percentage: number;
        order: number;
    }>, "many">>;
    is_default: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | null | undefined;
    customer_id?: string | undefined;
    installments?: {
        name: string;
        percentage: number;
        order: number;
    }[] | undefined;
    is_default?: boolean | undefined;
}, {
    name?: string | undefined;
    description?: string | null | undefined;
    customer_id?: string | undefined;
    installments?: {
        name: string;
        percentage: number;
        order: number;
    }[] | undefined;
    is_default?: boolean | undefined;
}>, {
    name?: string | undefined;
    description?: string | null | undefined;
    customer_id?: string | undefined;
    installments?: {
        name: string;
        percentage: number;
        order: number;
    }[] | undefined;
    is_default?: boolean | undefined;
}, {
    name?: string | undefined;
    description?: string | null | undefined;
    customer_id?: string | undefined;
    installments?: {
        name: string;
        percentage: number;
        order: number;
    }[] | undefined;
    is_default?: boolean | undefined;
}>;
export type CreatePaymentPlanDto = z.infer<typeof CreatePaymentPlanSchema>;
export type UpdatePaymentPlanDto = z.infer<typeof UpdatePaymentPlanSchema>;
export interface PaymentPlanInstallment {
    name: string;
    percentage: number;
    order: number;
}
export interface PaymentPlan {
    id: string;
    shop_id: string;
    customer_id: string;
    name: string;
    description: string | null;
    installments: PaymentPlanInstallment[];
    is_default: boolean;
    created_at: string;
    updated_at: string;
}
//# sourceMappingURL=payment-plan.types.d.ts.map