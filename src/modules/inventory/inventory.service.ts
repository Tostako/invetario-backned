import { listarAlertasInventario, listarMovimientos } from './inventory.repository';
import { MovimientosFilter, MovimientoInventario } from './inventory.types';
import { PaginationMeta } from '../../shared/types';

export const listarAlertasService = (shopId: string) => listarAlertasInventario(shopId);

export const listarMovimientosService = async (
  shopId: string,
  filtro: MovimientosFilter
): Promise<{ movimientos: MovimientoInventario[]; meta: PaginationMeta }> => {
  const { rows, total } = await listarMovimientos(shopId, filtro);
  return {
    movimientos: rows,
    meta: {
      total,
      page: filtro.page,
      limit: filtro.limit,
      totalPages: Math.ceil(total / filtro.limit),
    },
  };
};
