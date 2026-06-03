// ─── Customer Config Service ─────────────────────────────────────────────────
// Traduce errores de BD. Admin ve todas, customer solo la suya.
// ─────────────────────────────────────────────────────────────────────────────

import { NotFoundError, ForbiddenError } from '../../shared/errors/AppError';
import { PaginationMeta } from '../../shared/types';
import {
  findAllCustomerConfigs,
  findCustomerConfigById,
  findOwnCustomerConfig,
  upsertCustomerConfig,
  deleteCustomerConfig,
} from './customer-config.repository';
import { query } from '../../config/database';
import {
  UpsertCustomerConfigDto,
  CustomerConfigFilter,
  CustomerConfig,
} from './customer-config.types';
import { traducirErrorDB } from '../../shared/utils/dbErrors';

export const listCustomerConfigsService = async (
  shopId: string,
  filter: CustomerConfigFilter
): Promise<{ configs: CustomerConfig[]; meta: PaginationMeta }> => {
  const { rows, total } = await findAllCustomerConfigs(shopId, filter);
  return {
    configs: rows,
    meta: {
      total,
      page: filter.page,
      limit: filter.limit,
      totalPages: Math.ceil(total / filter.limit),
    },
  };
};

export const getCustomerConfigService = async (
  shopId: string,
  configId: string,
  customerId?: string
): Promise<any> => {
  const config = await findCustomerConfigById(shopId, configId);
  if (!config) throw new NotFoundError('Configuración de customer');

  // Si es customer, verificar que sea suya
  if (customerId && config.customer_id !== customerId) {
    throw new ForbiddenError('No puedes ver configuraciones de otros clientes');
  }

  // Buscar los detalles de perfil del customer para adjuntarlos
  const customerResult = await query(
    'SELECT id, name, email, phone, address FROM customers WHERE id = $1 AND shop_id = $2',
    [config.customer_id, shopId]
  );
  
  return {
    ...config,
    customer: customerResult.rows[0] ?? null,
  };
};

export const getOwnCustomerConfigService = async (
  shopId: string,
  customerId: string
): Promise<any> => {
  let config = await findOwnCustomerConfig(shopId, customerId);
  if (!config) {
    // Si no existe configuración previa, la creamos automáticamente con valores vacíos por defecto
    config = await upsertCustomerConfig(shopId, customerId, {
      services: {},
      sub_packages: {},
      complete_package: {},
      payment_plan: {},
      invoice: {},
      estimation: {},
    });
  }

  // Buscar los detalles de perfil del customer para adjuntarlos
  const customerResult = await query(
    'SELECT id, name, email, phone, address FROM customers WHERE id = $1 AND shop_id = $2',
    [customerId, shopId]
  );

  return {
    ...config,
    customer: customerResult.rows[0] ?? null,
  };
};

export const upsertOwnCustomerConfigService = async (
  shopId: string,
  customerId: string,
  dto: UpsertCustomerConfigDto
): Promise<CustomerConfig> => {
  return await upsertCustomerConfig(shopId, customerId, dto);
};

export const deleteCustomerConfigService = async (
  shopId: string,
  configId: string
): Promise<void> => {
  try {
    await deleteCustomerConfig(shopId, configId);
  } catch (err) {
    throw traducirErrorDB(err, {
      CUSTOMER_CONFIG_NOT_FOUND: () => new NotFoundError('Configuración de customer'),
    });
  }
};
