import { z } from 'zod';
export declare const LoginSuperAdminSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
}, {
    password: string;
    email: string;
}>;
export declare const RegisterSuperAdminSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
    name: string;
}, {
    password: string;
    email: string;
    name: string;
}>;
export declare const CreateShopSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    logo_url: z.ZodOptional<z.ZodString>;
    currency: z.ZodDefault<z.ZodString>;
    timezone: z.ZodDefault<z.ZodString>;
    plan: z.ZodDefault<z.ZodEnum<["free", "basic", "pro", "enterprise"]>>;
    owner_name: z.ZodString;
    owner_email: z.ZodString;
    owner_password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    owner_name: string;
    owner_email: string;
    email: string;
    name: string;
    slug: string;
    currency: string;
    timezone: string;
    plan: "free" | "basic" | "pro" | "enterprise";
    owner_password: string;
    phone?: string | undefined;
    address?: string | undefined;
    logo_url?: string | undefined;
}, {
    owner_name: string;
    owner_email: string;
    email: string;
    name: string;
    slug: string;
    owner_password: string;
    phone?: string | undefined;
    address?: string | undefined;
    logo_url?: string | undefined;
    currency?: string | undefined;
    timezone?: string | undefined;
    plan?: "free" | "basic" | "pro" | "enterprise" | undefined;
}>;
export declare const UpdateShopSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    logo_url: z.ZodOptional<z.ZodString>;
    currency: z.ZodOptional<z.ZodString>;
    timezone: z.ZodOptional<z.ZodString>;
    is_active: z.ZodOptional<z.ZodBoolean>;
    plan: z.ZodOptional<z.ZodEnum<["free", "basic", "pro", "enterprise"]>>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    name?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
    is_active?: boolean | undefined;
    logo_url?: string | undefined;
    currency?: string | undefined;
    timezone?: string | undefined;
    plan?: "free" | "basic" | "pro" | "enterprise" | undefined;
}, {
    email?: string | undefined;
    name?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
    is_active?: boolean | undefined;
    logo_url?: string | undefined;
    currency?: string | undefined;
    timezone?: string | undefined;
    plan?: "free" | "basic" | "pro" | "enterprise" | undefined;
}>;
export type LoginSuperAdminDto = z.infer<typeof LoginSuperAdminSchema>;
export type RegisterSuperAdminDto = z.infer<typeof RegisterSuperAdminSchema>;
export type CreateShopDto = z.infer<typeof CreateShopSchema>;
export type UpdateShopDto = z.infer<typeof UpdateShopSchema>;
//# sourceMappingURL=superadmin.types.d.ts.map