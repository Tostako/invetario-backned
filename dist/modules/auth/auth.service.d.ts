import { UserRole } from '../../shared/types';
import { LoginDto, RegisterShopDto, LoginCustomerDto, RegisterCustomerDto, CreateAdditionalShopDto } from './auth.types';
export type SessionMeta = {
    userAgent: string | null;
    ipAddress: string | null;
};
export declare const firmarTokenConSesionOpcional: (base: {
    sub: string;
    shop_id: string;
    email: string;
    role: UserRole;
}, sessionMeta?: SessionMeta) => Promise<string>;
export declare const loginService: (dto: LoginDto) => Promise<{
    token: string;
    shops: {
        shop_id: string;
        shop_name: string;
        shop_slug: string;
        role: string;
    }[];
}>;
export declare const selectShopService: (email: string, shopId: string, sessionMeta?: SessionMeta) => Promise<{
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
}>;
export declare const registerShopService: (dto: RegisterShopDto, sessionMeta?: SessionMeta) => Promise<{
    token: string;
    shopId: string;
    userId: string;
}>;
export declare const loginCustomerService: (dto: LoginCustomerDto) => Promise<{
    token: string;
    customer: {
        id: string;
        name: string;
        email: string;
    };
}>;
export declare const registerCustomerService: (dto: RegisterCustomerDto) => Promise<{
    token: string;
    customer: {
        id: string;
        name: string;
        email: string;
        phone: string | undefined;
        address: string | undefined;
    };
}>;
export declare const getUserShopsService: (email: string) => Promise<{
    shop_id: string;
    shop_name: string;
    shop_slug: string;
    role: string;
}[]>;
export declare const createShopForExistingUserService: (_userId: string, _userEmail: string, _dto: CreateAdditionalShopDto, _sessionMeta?: SessionMeta) => Promise<never>;
//# sourceMappingURL=auth.service.d.ts.map