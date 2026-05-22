import { RegisterShopDto, RegisterCustomerDto } from './auth.types';
export declare const findUserByEmailAndShop: (email: string, shopSlug: string) => Promise<{
    id: string;
    shop_id: string;
    email: string;
    password: string;
    name: string;
    role: string;
    is_active: boolean;
}>;
export declare const findUsersByEmail: (email: string) => Promise<{
    user_id: string;
    shop_id: string;
    shop_name: string;
    shop_slug: string;
    user_name: string;
    role: string;
    password: string;
    is_active: boolean;
}[]>;
export declare const findUserByIdAndShop: (userId: string, shopId: string) => Promise<{
    id: string;
    shop_id: string;
    email: string;
    name: string;
    role: string;
    is_active: boolean;
}>;
export declare const createShopWithOwner: (dto: RegisterShopDto) => Promise<{
    shopId: string;
    userId: string;
}>;
export declare const updateLastLogin: (userId: string) => Promise<void>;
export declare const findCustomerByEmailAndShop: (email: string, shopSlug: string) => Promise<{
    id: string;
    shop_id: string;
    email: string;
    password: string;
    name: string;
    is_active: boolean;
}>;
export declare const createCustomer: (dto: RegisterCustomerDto) => Promise<{
    shopId: string;
    customerId: string;
}>;
export declare const updateCustomerLastLogin: (customerId: string) => Promise<void>;
export declare const createShopForExistingUser: (userId: string, dto: {
    shop_name: string;
    shop_slug: string;
    shop_email: string;
}) => Promise<{
    shopId: string;
    userId: string;
}>;
//# sourceMappingURL=auth.repository.d.ts.map