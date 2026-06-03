import { z } from 'zod';
export declare const UpdateProfileSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    name?: string | undefined;
    phone?: string | null | undefined;
}, {
    email?: string | undefined;
    name?: string | undefined;
    phone?: string | null | undefined;
}>, {
    email?: string | undefined;
    name?: string | undefined;
    phone?: string | null | undefined;
}, {
    email?: string | undefined;
    name?: string | undefined;
    phone?: string | null | undefined;
}>;
export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
export declare const ChangePasswordSchema: z.ZodObject<{
    current_password: z.ZodString;
    new_password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    current_password: string;
    new_password: string;
}, {
    current_password: string;
    new_password: string;
}>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
export declare const NotificationPreferencesSchema: z.ZodEffects<z.ZodObject<{
    email_orders: z.ZodOptional<z.ZodBoolean>;
    email_low_stock: z.ZodOptional<z.ZodBoolean>;
    email_marketing: z.ZodOptional<z.ZodBoolean>;
    push_enabled: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email_orders?: boolean | undefined;
    email_low_stock?: boolean | undefined;
    email_marketing?: boolean | undefined;
    push_enabled?: boolean | undefined;
}, {
    email_orders?: boolean | undefined;
    email_low_stock?: boolean | undefined;
    email_marketing?: boolean | undefined;
    push_enabled?: boolean | undefined;
}>, {
    email_orders?: boolean | undefined;
    email_low_stock?: boolean | undefined;
    email_marketing?: boolean | undefined;
    push_enabled?: boolean | undefined;
}, {
    email_orders?: boolean | undefined;
    email_low_stock?: boolean | undefined;
    email_marketing?: boolean | undefined;
    push_enabled?: boolean | undefined;
}>;
export type NotificationPreferencesPatch = z.infer<typeof NotificationPreferencesSchema>;
export declare const Enable2faSchema: z.ZodObject<{
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
}, {
    code: string;
}>;
export declare const Disable2faSchema: z.ZodObject<{
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
}, {
    password: string;
}>;
export declare const PREFERENCIAS_DEFECTO: {
    readonly email_orders: true;
    readonly email_low_stock: true;
    readonly email_marketing: false;
    readonly push_enabled: false;
};
export type PreferenciasNotificacion = {
    email_orders: boolean;
    email_low_stock: boolean;
    email_marketing: boolean;
    push_enabled: boolean;
};
export interface PerfilUsuario {
    id: string;
    shop_id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    is_active: boolean;
    two_factor_enabled: boolean;
    last_login: string | null;
    created_at: string;
    updated_at: string;
}
//# sourceMappingURL=user.types.d.ts.map