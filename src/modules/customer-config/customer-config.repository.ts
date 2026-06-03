// ─── Customer Config Repository ──────────────────────────────────────────────
// Thin adapter: invoca stored procedures / funciones de la BD.
// Sin SQL ad-hoc sobre las tablas base.
// Funciones definidas en: database/39_fn_customer_configs.sql
// ─────────────────────────────────────────────────────────────────────────────

import { query } from '../../config/database';
import { UpsertCustomerConfigDto, CustomerConfigFilter, CustomerConfig } from './customer-config.types';

interface FindAllResult {
  rows: CustomerConfig[];
  total: number;
}

export const findAllCustomerConfigs = async (
  shopId: string,
  filter: CustomerConfigFilter
): Promise<FindAllResult> => {
  const offset = (filter.page - 1) * filter.limit;
  const result = await query<CustomerConfig & { total_count: string }>(
    `SELECT * FROM fn_listar_customer_configs($1, $2, $3)`,
    [shopId, filter.limit, offset]
  );
  return {
    rows: result.rows,
    total: result.rows.length > 0 ? parseInt(result.rows[0]!.total_count) : 0,
  };
};

export const findCustomerConfigById = async (
  shopId: string,
  configId: string
): Promise<CustomerConfig | null> => {
  const result = await query<CustomerConfig>(
    `SELECT * FROM fn_obtener_customer_config($1, $2)`,
    [shopId, configId]
  );
  return result.rows[0] ?? null;
};

export const findOwnCustomerConfig = async (
  shopId: string,
  customerId: string
): Promise<CustomerConfig | null> => {
  const result = await query<CustomerConfig>(
    `SELECT * FROM fn_obtener_customer_config_propia($1, $2)`,
    [shopId, customerId]
  );
  return result.rows[0] ?? null;
};

export const upsertCustomerConfig = async (
  shopId: string,
  customerId: string,
  dto: UpsertCustomerConfigDto
): Promise<CustomerConfig> => {
  const result = await query<CustomerConfig>(
    `SELECT * FROM sp_upsert_customer_config($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      shopId,
      customerId,
      JSON.stringify(dto.services),
      JSON.stringify(dto.sub_packages),
      JSON.stringify(dto.complete_package),
      JSON.stringify(dto.payment_plan),
      JSON.stringify(dto.invoice),
      JSON.stringify(dto.estimation),
    ]
  );
  return result.rows[0]!;
};

export const deleteCustomerConfig = async (
  shopId: string,
  configId: string
): Promise<boolean> => {
  await query(`SELECT sp_eliminar_customer_config($1, $2)`, [shopId, configId]);
  return true;
};
