import { z } from 'zod';
export declare const RegisterShopSchema: z.ZodObject<{
    shop_name: z.ZodString;
    shop_slug: z.ZodString;
    shop_email: z.ZodString;
    owner_name: z.ZodString;
    owner_email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    shop_name: string;
    shop_slug: string;
    shop_email: string;
    owner_name: string;
    owner_email: string;
    password: string;
}, {
    shop_name: string;
    shop_slug: string;
    shop_email: string;
    owner_name: string;
    owner_email: string;
    password: string;
}>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
}, {
    password: string;
    email: string;
}>;
export declare const SelectShopSchema: z.ZodEffects<z.ZodObject<{
    shop_id: z.ZodOptional<z.ZodString>;
    shop_slug: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    shop_slug?: string | undefined;
    shop_id?: string | undefined;
}, {
    shop_slug?: string | undefined;
    shop_id?: string | undefined;
}>, {
    shop_slug?: string | undefined;
    shop_id?: string | undefined;
}, {
    shop_slug?: string | undefined;
    shop_id?: string | undefined;
}>;
export type SelectShopDto = z.infer<typeof SelectShopSchema>;
export declare const RegisterCustomerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    shop_slug: z.ZodString;
}, "strip", z.ZodTypeAny, {
    shop_slug: string;
    password: string;
    email: string;
    name: string;
    phone?: string | undefined;
    address?: string | undefined;
}, {
    shop_slug: string;
    password: string;
    email: string;
    name: string;
    phone?: string | undefined;
    address?: string | undefined;
}>;
export declare const LoginCustomerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    shop_slug: z.ZodString;
}, "strip", z.ZodTypeAny, {
    shop_slug: string;
    password: string;
    email: string;
}, {
    shop_slug: string;
    password: string;
    email: string;
}>;
export declare const CreateAdditionalShopSchema: z.ZodObject<{
    shop_name: z.ZodString;
    shop_slug: z.ZodString;
    shop_email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    shop_name: string;
    shop_slug: string;
    shop_email: string;
}, {
    shop_name: string;
    shop_slug: string;
    shop_email: string;
}>;
export type CreateAdditionalShopDto = z.infer<typeof CreateAdditionalShopSchema>;
export type RegisterShopDto = z.infer<typeof RegisterShopSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type RegisterCustomerDto = z.infer<typeof RegisterCustomerSchema>;
export type LoginCustomerDto = z.infer<typeof LoginCustomerSchema>;
//# sourceMappingURL=auth.types.d.ts.map