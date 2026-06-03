import { ResumenDashboard, IngresosMes, PedidosMes, VentaDiaSemana, EstadoPedidosFila, ProductoTop, TopProductsQuery } from './dashboard.types';
export declare const obtenerIngresosMes: (shopId: string) => Promise<number>;
export declare const obtenerPedidosMes: (shopId: string) => Promise<number>;
export declare const obtenerResumenDashboard: (shopId: string) => Promise<ResumenDashboard>;
export declare const obtenerIngresosMesConMeta: (shopId: string) => Promise<IngresosMes>;
export declare const obtenerPedidosMesConMeta: (shopId: string) => Promise<PedidosMes>;
/** Lunes a domingo de la semana ISO (date_trunc('week') en PostgreSQL comienza en lunes). */
export declare const obtenerVentasSemana: (shopId: string) => Promise<VentaDiaSemana[]>;
export declare const obtenerPedidosPorEstado: (shopId: string) => Promise<EstadoPedidosFila[]>;
export declare const obtenerProductosTop: (shopId: string, q: TopProductsQuery) => Promise<ProductoTop[]>;
//# sourceMappingURL=dashboard.repository.d.ts.map