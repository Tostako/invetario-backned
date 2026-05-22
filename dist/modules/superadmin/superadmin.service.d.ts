import { LoginSuperAdminDto, RegisterSuperAdminDto, CreateShopDto, UpdateShopDto } from './superadmin.types';
export declare const loginSuperAdminService: (dto: LoginSuperAdminDto) => Promise<{
    token: string;
    admin: {
        id: string;
        name: string;
        email: string;
    };
}>;
export declare const registrarSuperAdminService: (dto: RegisterSuperAdminDto, solicitanteId: string) => Promise<{
    token: string;
    adminId: string;
} | undefined>;
export declare const bootstrapSuperAdminService: (dto: RegisterSuperAdminDto) => Promise<{
    token: string;
    adminId: string;
} | undefined>;
export declare const listarTiendasService: (page: number, limit: number) => Promise<{
    tiendas: {
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
    }[];
    total: number;
}>;
export declare const obtenerTiendaService: (id: string) => Promise<{
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
export declare const crearTiendaService: (dto: CreateShopDto) => Promise<{
    shop_id: string;
    owner_id: string;
} | undefined>;
export declare const actualizarTiendaService: (id: string, dto: UpdateShopDto) => Promise<{
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
export declare const eliminarTiendaService: (id: string) => Promise<void>;
//# sourceMappingURL=superadmin.service.d.ts.map