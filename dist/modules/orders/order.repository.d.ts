import { Order, FiltrosPedido, EstadoPedido } from './order.types';
interface FindAllResult {
    rows: Order[];
    total: number;
}
interface CrearPedidoParams {
    shopId: string;
    userId: string;
    customerId: string | null;
    items: Array<{
        product_id: string;
        quantity: number;
        discount: number;
    }>;
    notes: string | null;
}
/** users.id de la tienda para auditoría (orders.created_by, inventory_movements). */
export declare const findShopOrderActorUserId: (shopId: string) => Promise<string | null>;
export declare const crearOrden: (params: CrearPedidoParams) => Promise<{
    id: string;
    order_number: string;
    total: number;
}>;
export declare const findAllOrders: (shopId: string, filtros: FiltrosPedido) => Promise<FindAllResult>;
export declare const findOrderById: (shopId: string, orderId: string) => Promise<Order | null>;
export declare const updateOrderStatus: (shopId: string, orderId: string, status: EstadoPedido, notes?: string) => Promise<Order | null>;
export declare const generarOrderNumber: (_shopId: string) => Promise<string>;
export {};
//# sourceMappingURL=order.repository.d.ts.map