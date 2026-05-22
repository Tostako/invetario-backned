import { MovimientosFilter, MovimientoInventario, AlertaInventario } from './inventory.types';
export declare const listarAlertasInventario: (shopId: string) => Promise<AlertaInventario[]>;
export declare const listarMovimientos: (shopId: string, filtro: MovimientosFilter) => Promise<{
    rows: MovimientoInventario[];
    total: number;
}>;
//# sourceMappingURL=inventory.repository.d.ts.map