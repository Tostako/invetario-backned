import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { sendSuccess, sendCreated } from '../../shared/utils/response';
import {
  ListCustomersQuerySchema,
  CreateCustomerSchema,
  UpdateCustomerSchema,
  CustomerDetailQuerySchema,
} from './customer.types';
import {
  listarClientesService,
  obtenerClienteService,
  crearClienteService,
  actualizarClienteService,
  eliminarClienteService,
} from './customer.service';

export const listarClientes = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const q = ListCustomersQuerySchema.parse(req.query);
    const { clientes, meta } = await listarClientesService(req.user.shop_id, q);
    sendSuccess(res, clientes, 200, meta);
  } catch (err) {
    next(err);
  }
};

export const obtenerCliente = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const q = CustomerDetailQuerySchema.parse(req.query);
    const data = await obtenerClienteService(req.user.shop_id, req.params['id']!, q);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export const crearCliente = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto = CreateCustomerSchema.parse(req.body);
    const cliente = await crearClienteService(req.user.shop_id, dto);
    sendCreated(res, cliente);
  } catch (err) {
    next(err);
  }
};

export const actualizarCliente = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto = UpdateCustomerSchema.parse(req.body);
    const cliente = await actualizarClienteService(req.user.shop_id, req.params['id']!, dto);
    sendSuccess(res, cliente);
  } catch (err) {
    next(err);
  }
};

export const eliminarCliente = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await eliminarClienteService(req.user.shop_id, req.params['id']!);
    sendSuccess(res, { message: 'Cliente desactivado correctamente' });
  } catch (err) {
    next(err);
  }
};
