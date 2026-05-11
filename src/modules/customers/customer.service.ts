import { NotFoundError, ConflictError } from '../../shared/errors/AppError';
import { PaginationMeta } from '../../shared/types';
import {
  listarClientes,
  obtenerClientePorId,
  listarPedidosCliente,
  crearCliente,
  actualizarCliente,
  desactivarCliente,
  emailExisteEnTienda,
} from './customer.repository';
import {
  ListCustomersQuery,
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerDetailQuery,
  Customer,
  PedidoClienteResumen,
} from './customer.types';

export const listarClientesService = async (
  shopId: string,
  q: ListCustomersQuery
): Promise<{ clientes: Customer[]; meta: PaginationMeta }> => {
  const { rows, total } = await listarClientes(shopId, q);
  return {
    clientes: rows,
    meta: {
      total,
      page: q.page,
      limit: q.limit,
      totalPages: Math.ceil(total / q.limit),
    },
  };
};

export const obtenerClienteService = async (
  shopId: string,
  customerId: string,
  q: CustomerDetailQuery
): Promise<
  | { cliente: Customer }
  | { cliente: Customer; pedidos: PedidoClienteResumen[] }
> => {
  const cliente = await obtenerClientePorId(shopId, customerId);
  if (!cliente) throw new NotFoundError('Cliente');

  if (!q.include_orders) {
    return { cliente };
  }

  const pedidos = await listarPedidosCliente(shopId, customerId);
  return { cliente, pedidos };
};

export const crearClienteService = async (shopId: string, dto: CreateCustomerDto) => {
  if (await emailExisteEnTienda(shopId, dto.email)) {
    throw new ConflictError('Ya existe un cliente con ese email en esta tienda');
  }
  return crearCliente(shopId, dto);
};

export const actualizarClienteService = async (
  shopId: string,
  customerId: string,
  dto: UpdateCustomerDto
) => {
  const existe = await obtenerClientePorId(shopId, customerId);
  if (!existe) throw new NotFoundError('Cliente');

  if (dto.email !== undefined && dto.email?.trim()) {
    if (await emailExisteEnTienda(shopId, dto.email, customerId)) {
      throw new ConflictError('Ya existe un cliente con ese email en esta tienda');
    }
  }

  const actualizado = await actualizarCliente(shopId, customerId, dto);
  if (!actualizado) throw new NotFoundError('Cliente');
  return actualizado;
};

export const eliminarClienteService = async (shopId: string, customerId: string): Promise<void> => {
  const ok = await desactivarCliente(shopId, customerId);
  if (!ok) throw new NotFoundError('Cliente');
};
