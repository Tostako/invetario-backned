import { UpdateShopDto } from './shop.types';
import { SessionMeta } from '../auth/auth.service';
export declare const obtenerTiendaService: (shopId: string) => Promise<import("./shop.types").TiendaPerfil>;
export declare const actualizarTiendaService: (shopId: string, dto: UpdateShopDto) => Promise<import("./shop.types").TiendaPerfil>;
export declare const subirLogoTiendaService: (shopId: string, file: Express.Multer.File) => Promise<import("./shop.types").TiendaPerfil>;
export declare const eliminarTiendaService: (shopId: string, userEmail: string, sessionMeta?: SessionMeta) => Promise<{
    deletedShopId: string;
    switchedTo: {
        token: string;
        shopId: string;
        shopName: string;
        userId: string;
    };
} | {
    deletedShopId: string;
    switchedTo: null;
}>;
//# sourceMappingURL=shop.service.d.ts.map