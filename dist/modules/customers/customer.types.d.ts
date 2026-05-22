import { z } from 'zod';
export declare const ListCustomersQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    is_active: z.ZodOptional<z.ZodBoolean>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    is_active?: boolean | undefined;
    search?: string | undefined;
}, {
    limit?: number | undefined;
    is_active?: boolean | undefined;
    search?: string | undefined;
    page?: number | undefined;
}>;
export type ListCustomersQuery = z.infer<typeof ListCustomersQuerySchema>;
export declare const CreateCustomerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    address: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email?: string | null | undefined;
    phone?: string | null | undefined;
    address?: string | null | undefined;
    notes?: string | null | undefined;
}, {
    name: string;
    email?: string | null | undefined;
    phone?: string | null | undefined;
    address?: string | null | undefined;
    notes?: string | null | undefined;
}>;
export declare const UpdateCustomerSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    phone: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    address: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
} & {
    is_active: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email?: string | null | undefined;
    name?: string | undefined;
    phone?: string | null | undefined;
    address?: string | null | undefined;
    is_active?: boolean | undefined;
    notes?: string | null | undefined;
}, {
    email?: string | null | undefined;
    name?: string | undefined;
    phone?: string | null | undefined;
    address?: string | null | undefined;
    is_active?: boolean | undefined;
    notes?: string | null | undefined;
}>;
export type CreateCustomerDto = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerDto = z.infer<typeof UpdateCustomerSchema>;
export interface PedidoClienteResumen {
    id: string;
    order_number: string;
    status: string;
    total: number;
    created_at: string;
}
export interface Customer {
    id: string;
    shop_id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    notes: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
export declare const CustomerDetailQuerySchema: z.ZodObject<{
    /** Query: ?include_orders=true */
    include_orders: z.ZodEffects<z.ZodOptional<z.ZodString>, boolean, string | undefined>;
}, "strip", z.ZodTypeAny, {
    include_orders: boolean;
}, {
    include_orders?: string | undefined;
}>;
export type CustomerDetailQuery = z.infer<typeof CustomerDetailQuerySchema>;
//# sourceMappingURL=customer.types.d.ts.map