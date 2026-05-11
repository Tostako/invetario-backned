import { query } from '../../config/database';
import {
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
  ListCustomersQuery,
  PedidoClienteResumen,
} from './customer.types';

export const listarClientes = async (
  shopId: string,
  q: ListCustomersQuery
): Promise<{ rows: Customer[]; total: number }> => {
  const condiciones: string[] = ['c.shop_id = $1'];
  const params: unknown[] = [shopId];
  let idx = 2;

  if (q.is_active !== undefined) {
    condiciones.push(`c.is_active = $${idx++}`);
    params.push(q.is_active);
  }
  if (q.search?.trim()) {
    const term = `%${q.search.trim()}%`;
    condiciones.push(
      `(c.name ILIKE $${idx} OR COALESCE(c.email::text, '') ILIKE $${idx} OR COALESCE(c.phone, '') ILIKE $${idx})`
    );
    params.push(term);
    idx++;
  }

  const whereSql = condiciones.join(' AND ');
  const offset = (q.page - 1) * q.limit;

  const countR = await query<{ c: string }>(
    `SELECT COUNT(*)::text AS c FROM customers c WHERE ${whereSql}`,
    params
  );
  const total = parseInt(countR.rows[0]!.c, 10);

  const dataParams = [...params, q.limit, offset];
  const limIdx = idx;
  const offIdx = idx + 1;

  const r = await query<Customer>(
    `SELECT c.id, c.shop_id, c.name, c.email, c.phone, c.address, c.notes, c.is_active, c.created_at, c.updated_at
     FROM customers c
     WHERE ${whereSql}
     ORDER BY c.created_at DESC
     LIMIT $${limIdx} OFFSET $${offIdx}`,
    dataParams
  );

  return { rows: r.rows, total };
};

export const obtenerClientePorId = async (
  shopId: string,
  customerId: string
): Promise<Customer | null> => {
  const r = await query<Customer>(
    `SELECT id, shop_id, name, email, phone, address, notes, is_active, created_at, updated_at
     FROM customers
     WHERE id = $1 AND shop_id = $2`,
    [customerId, shopId]
  );
  return r.rows[0] ?? null;
};

export const listarPedidosCliente = async (
  shopId: string,
  customerId: string
): Promise<PedidoClienteResumen[]> => {
  const r = await query<{
    id: string;
    order_number: string;
    status: string;
    total: string;
    created_at: Date;
  }>(
    `SELECT id, order_number, status, total::text, created_at
     FROM orders
     WHERE shop_id = $1 AND customer_id = $2
     ORDER BY created_at DESC
     LIMIT 100`,
    [shopId, customerId]
  );

  return r.rows.map((row) => ({
    id: row.id,
    order_number: row.order_number,
    status: row.status,
    total: parseFloat(row.total),
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  }));
};

export const emailExisteEnTienda = async (
  shopId: string,
  email: string | null | undefined,
  excludeCustomerId?: string
): Promise<boolean> => {
  if (!email?.trim()) return false;
  const normalized = email.trim().toLowerCase();
  const r = excludeCustomerId
    ? await query<{ c: string }>(
        `SELECT COUNT(*)::text AS c FROM customers
         WHERE shop_id = $1 AND lower(email::text) = $2 AND id != $3`,
        [shopId, normalized, excludeCustomerId]
      )
    : await query<{ c: string }>(
        `SELECT COUNT(*)::text AS c FROM customers
         WHERE shop_id = $1 AND lower(email::text) = $2`,
        [shopId, normalized]
      );
  return parseInt(r.rows[0]!.c, 10) > 0;
};

export const crearCliente = async (shopId: string, dto: CreateCustomerDto): Promise<Customer> => {
  const r = await query<Customer>(
    `INSERT INTO customers (shop_id, name, email, phone, address, notes, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, TRUE)
     RETURNING id, shop_id, name, email, phone, address, notes, is_active, created_at, updated_at`,
    [
      shopId,
      dto.name,
      dto.email?.trim() || null,
      dto.phone?.trim() || null,
      dto.address?.trim() || null,
      dto.notes?.trim() || null,
    ]
  );
  return r.rows[0]!;
};

export const actualizarCliente = async (
  shopId: string,
  customerId: string,
  dto: UpdateCustomerDto
): Promise<Customer | null> => {
  const r = await query<Customer>(
    `UPDATE customers SET
       name      = COALESCE($3, name),
       email     = COALESCE($4, email),
       phone     = COALESCE($5, phone),
       address   = COALESCE($6, address),
       notes     = COALESCE($7, notes),
       is_active = COALESCE($8, is_active)
     WHERE id = $2 AND shop_id = $1
     RETURNING id, shop_id, name, email, phone, address, notes, is_active, created_at, updated_at`,
    [
      shopId,
      customerId,
      dto.name ?? null,
      dto.email !== undefined ? (dto.email?.trim() || null) : null,
      dto.phone !== undefined ? (dto.phone?.trim() || null) : null,
      dto.address !== undefined ? (dto.address?.trim() || null) : null,
      dto.notes !== undefined ? (dto.notes?.trim() || null) : null,
      dto.is_active !== undefined ? dto.is_active : null,
    ]
  );

  return r.rows[0] ?? null;
};

/** Desactiva el cliente (eliminación lógica). */
export const desactivarCliente = async (shopId: string, customerId: string): Promise<boolean> => {
  const r = await query(
    `UPDATE customers SET is_active = FALSE WHERE id = $1 AND shop_id = $2`,
    [customerId, shopId]
  );
  return (r.rowCount ?? 0) > 0;
};
