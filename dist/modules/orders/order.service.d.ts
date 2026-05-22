import { PaginationMeta } from '../../shared/types';
import { CrearPedidoDto, ActualizarEstadoDto, FiltrosPedido, Order } from './order.types';
export declare const crearPedidoService: (shopId: string, userId: string, cartCustomerId: string | null, dto: CrearPedidoDto) => Promise<Order>;
export declare const listarPedidosService: (shopId: string, filtros: FiltrosPedido) => Promise<{
    pedidos: Order[];
    meta: PaginationMeta;
}>;
export declare const obtenerPedidoService: (shopId: string, orderId: string) => Promise<Order>;
export declare const actualizarEstadoService: (shopId: string, orderId: string, dto: ActualizarEstadoDto) => Promise<Order>;
//# sourceMappingURL=order.service.d.ts.map