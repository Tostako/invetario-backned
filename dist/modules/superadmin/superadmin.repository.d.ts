import { RegisterSuperAdminDto, CreateShopDto, UpdateShopDto } from './superadmin.types';
export declare const findSuperAdminByEmail: (email: string) => Promise<{
    id: string;
    email: string;
    password: string;
    name: string;
    is_active: boolean;
}>;
export declare const createSuperAdmin: (dto: RegisterSuperAdminDto) => Promise<{
    id: string;
}>;
export declare const updateSuperAdminLastLogin: (id: string) => Promise<void>;
export declare const countSuperAdmins: () => Promise<number>;
export declare const listarTiendas: (limit: number, offset: number) => Promise<{
    id: string;
    name: string;
    slug: string;
    email: string;
    phone: string | null;
    address: string | null;
    logo_url: string | null;
    currency: string;
    timezone: string;
    is_active: boolean;
    plan: string;
    created_at: Date;
    updated_at: Date;
    total: string;
}[]>;
export declare const findTiendaById: (id: string) => Promise<{
    id: string;
    name: string;
    slug: string;
    email: string;
    phone: string | null;
    address: string | null;
    logo_url: string | null;
    currency: string;
    timezone: string;
    is_active: boolean;
    plan: string;
    created_at: Date;
    updated_at: Date;
}>;
export declare const crearTienda: (dto: CreateShopDto) => Promise<{
    shop_id: string;
    owner_id: string;
}>;
export declare const actualizarTienda: (id: string, dto: UpdateShopDto) => Promise<{
    id: string;
}>;
export declare const eliminarTienda: (id: string) => Promise<void>;
//# sourceMappingURL=superadmin.repository.d.ts.map