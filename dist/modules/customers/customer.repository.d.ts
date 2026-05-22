import { Customer, CreateCustomerDto, UpdateCustomerDto, ListCustomersQuery, PedidoClienteResumen } from './customer.types';
export declare const listarClientes: (shopId: string, q: ListCustomersQuery) => Promise<{
    rows: Customer[];
    total: number;
}>;
export declare const obtenerClientePorId: (shopId: string, customerId: string) => Promise<Customer | null>;
export declare const listarPedidosCliente: (shopId: string, customerId: string) => Promise<PedidoClienteResumen[]>;
export declare const emailExisteEnTienda: (shopId: string, email: string | null | undefined, excludeCustomerId?: string) => Promise<boolean>;
export declare const crearCliente: (shopId: string, dto: CreateCustomerDto) => Promise<Customer>;
export declare const actualizarCliente: (shopId: string, customerId: string, dto: UpdateCustomerDto) => Promise<Customer | null>;
/** Desactiva el cliente (eliminación lógica). */
export declare const desactivarCliente: (shopId: string, customerId: string) => Promise<boolean>;
//# sourceMappingURL=customer.repository.d.ts.map