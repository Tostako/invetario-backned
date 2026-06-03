import { PaginationMeta } from '../../shared/types';
import { ListCustomersQuery, CreateCustomerDto, UpdateCustomerDto, CustomerDetailQuery, Customer, PedidoClienteResumen } from './customer.types';
export declare const listarClientesService: (shopId: string, q: ListCustomersQuery) => Promise<{
    clientes: Customer[];
    meta: PaginationMeta;
}>;
export declare const obtenerClienteService: (shopId: string, customerId: string, q: CustomerDetailQuery) => Promise<{
    cliente: Customer;
} | {
    cliente: Customer;
    pedidos: PedidoClienteResumen[];
}>;
export declare const crearClienteService: (shopId: string, dto: CreateCustomerDto) => Promise<Customer>;
export declare const actualizarClienteService: (shopId: string, customerId: string, dto: UpdateCustomerDto) => Promise<Customer>;
export declare const eliminarClienteService: (shopId: string, customerId: string) => Promise<void>;
//# sourceMappingURL=customer.service.d.ts.map