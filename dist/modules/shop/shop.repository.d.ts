import { UpdateShopDto, TiendaPerfil } from './shop.types';
export declare const obtenerTiendaPorId: (shopId: string) => Promise<TiendaPerfil | null>;
export declare const actualizarTienda: (shopId: string, dto: UpdateShopDto) => Promise<TiendaPerfil | null>;
export declare const eliminarTienda: (shopId: string) => Promise<void>;
//# sourceMappingURL=shop.repository.d.ts.map