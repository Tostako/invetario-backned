import { MovimientosFilter, MovimientoInventario } from './inventory.types';
import { PaginationMeta } from '../../shared/types';
export declare const listarAlertasService: (shopId: string) => Promise<import("./inventory.types").AlertaInventario[]>;
export declare const listarMovimientosService: (shopId: string, filtro: MovimientosFilter) => Promise<{
    movimientos: MovimientoInventario[];
    meta: PaginationMeta;
}>;
//# sourceMappingURL=inventory.service.d.ts.map