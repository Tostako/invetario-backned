import { query } from '../../config/database';
import { UpdateShopDto, TiendaPerfil } from './shop.types';

const mapRow = (row: Record<string, unknown>): TiendaPerfil => ({
  id: String(row['id']),
  name: String(row['name']),
  slug: String(row['slug']),
  email: String(row['email']),
  phone: row['phone'] != null ? String(row['phone']) : null,
  address: row['address'] != null ? String(row['address']) : null,
  description: row['description'] != null ? String(row['description']) : null,
  logo_url: row['logo_url'] != null ? String(row['logo_url']) : null,
  currency: String(row['currency']),
  timezone: String(row['timezone']),
  vat_rate: parseFloat(String(row['vat_rate'])),
  min_order_amount: parseFloat(String(row['min_order_amount'])),
  is_active: Boolean(row['is_active']),
  plan: String(row['plan']),
  created_at:
    row['created_at'] instanceof Date
      ? (row['created_at'] as Date).toISOString()
      : String(row['created_at']),
  updated_at:
    row['updated_at'] instanceof Date
      ? (row['updated_at'] as Date).toISOString()
      : String(row['updated_at']),
});

export const obtenerTiendaPorId = async (shopId: string): Promise<TiendaPerfil | null> => {
  const r = await query(
    `SELECT id, name, slug, email, phone, address, description, logo_url,
            currency, timezone, vat_rate, min_order_amount, is_active, plan, created_at, updated_at
     FROM shops WHERE id = $1`,
    [shopId]
  );
  const row = r.rows[0];
  return row ? mapRow(row as Record<string, unknown>) : null;
};

export const actualizarTienda = async (
  shopId: string,
  dto: UpdateShopDto
): Promise<TiendaPerfil | null> => {
  const sets: string[] = [];
  const vals: unknown[] = [];
  let i = 1;

  const add = (col: string, v: unknown) => {
    sets.push(`${col} = $${i++}`);
    vals.push(v);
  };

  if (dto.name !== undefined) add('name', dto.name);
  if (dto.phone !== undefined) add('phone', dto.phone);
  if (dto.email !== undefined) add('email', dto.email.toLowerCase());
  if (dto.address !== undefined) add('address', dto.address);
  if (dto.description !== undefined) add('description', dto.description);
  if (dto.currency !== undefined) add('currency', dto.currency);
  if (dto.timezone !== undefined) add('timezone', dto.timezone);
  if (dto.vat_rate !== undefined) add('vat_rate', dto.vat_rate);
  if (dto.min_order_amount !== undefined) add('min_order_amount', dto.min_order_amount);
  if (dto.logo_url !== undefined) add('logo_url', dto.logo_url);

  if (sets.length === 0) return obtenerTiendaPorId(shopId);

  vals.push(shopId);
  const r = await query(
    `UPDATE shops SET ${sets.join(', ')}
     WHERE id = $${i}
     RETURNING id, name, slug, email, phone, address, description, logo_url,
               currency, timezone, vat_rate, min_order_amount, is_active, plan, created_at, updated_at`,
    vals
  );
  const row = r.rows[0];
  return row ? mapRow(row as Record<string, unknown>) : null;
};

export const eliminarTienda = async (shopId: string): Promise<void> => {
  await query(`SELECT sp_desactivar_tienda($1)`, [shopId]);
};
