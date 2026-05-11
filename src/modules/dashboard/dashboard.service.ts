import {
  obtenerResumenDashboard,
  obtenerIngresosMesConMeta,
  obtenerPedidosMesConMeta,
  obtenerVentasSemana,
  obtenerPedidosPorEstado,
  obtenerProductosTop,
} from './dashboard.repository';
import { TopProductsQuery } from './dashboard.types';

export const resumenDashboardService = (shopId: string) => obtenerResumenDashboard(shopId);

export const ingresosMesService = (shopId: string) => obtenerIngresosMesConMeta(shopId);

export const pedidosMesService = (shopId: string) => obtenerPedidosMesConMeta(shopId);

export const ventasSemanaService = (shopId: string) => obtenerVentasSemana(shopId);

export const pedidosPorEstadoService = (shopId: string) => obtenerPedidosPorEstado(shopId);

export const productosTopService = (shopId: string, q: TopProductsQuery) =>
  obtenerProductosTop(shopId, q);
