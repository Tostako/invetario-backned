import { TopProductsQuery } from './dashboard.types';
export declare const resumenDashboardService: (shopId: string) => Promise<import("./dashboard.types").ResumenDashboard>;
export declare const ingresosMesService: (shopId: string) => Promise<import("./dashboard.types").IngresosMes>;
export declare const pedidosMesService: (shopId: string) => Promise<import("./dashboard.types").PedidosMes>;
export declare const ventasSemanaService: (shopId: string) => Promise<import("./dashboard.types").VentaDiaSemana[]>;
export declare const pedidosPorEstadoService: (shopId: string) => Promise<import("./dashboard.types").EstadoPedidosFila[]>;
export declare const productosTopService: (shopId: string, q: TopProductsQuery) => Promise<import("./dashboard.types").ProductoTop[]>;
//# sourceMappingURL=dashboard.service.d.ts.map