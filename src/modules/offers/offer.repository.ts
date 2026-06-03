// ─── Offers Repository ───────────────────────────────────────────────────────
// Thin adapter: invoca stored procedures / funciones de la BD.
// Sin SQL ad-hoc sobre las tablas base.
// Funciones definidas en: database/29_fn_offers.sql
// ─────────────────────────────────────────────────────────────────────────────

import { query } from '../../config/database';
import { CreateOfferDto, UpdateOfferDto, OfferFilter, Offer, PublicOffer } from './offer.types';

interface FindAllResult {
  rows: Offer[];
  total: number;
}

export const findAllOffers = async (
  shopId: string,
  filter: OfferFilter
): Promise<FindAllResult> => {
  const offset = (filter.page - 1) * filter.limit;
  const result = await query<Offer & { total_count: string }>(
    `SELECT * FROM fn_listar_ofertas($1, $2, $3, $4, $5)`,
    [
      shopId,
      filter.is_active ?? null,
      filter.scope ?? null,
      filter.limit,
      offset,
    ]
  );
  return {
    rows: result.rows,
    total: result.rows.length > 0 ? parseInt(result.rows[0]!.total_count) : 0,
  };
};

export const findOfferById = async (
  shopId: string,
  offerId: string
): Promise<Offer | null> => {
  const result = await query<Offer>(
    `SELECT * FROM fn_obtener_oferta($1, $2)`,
    [shopId, offerId]
  );
  return result.rows[0] ?? null;
};

export const createOffer = async (
  shopId: string,
  dto: CreateOfferDto
): Promise<Offer> => {
  const result = await query<Offer>(
    `SELECT * FROM sp_crear_oferta($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      shopId,
      dto.title,
      dto.discount_type,
      dto.discount_value,
      dto.scope,
      dto.starts_at,
      dto.ends_at,
      dto.description ?? null,
      dto.product_id ?? null,
      dto.category_id ?? null,
      dto.code ?? null,
      dto.is_active,
      dto.usage_limit ?? null,
    ]
  );
  return result.rows[0]!;
};

export const updateOffer = async (
  shopId: string,
  offerId: string,
  dto: UpdateOfferDto
): Promise<Offer | null> => {
  const result = await query<Offer>(
    `SELECT * FROM sp_actualizar_oferta($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
    [
      shopId,
      offerId,
      dto.title ?? null,
      dto.description ?? null,
      dto.discount_type ?? null,
      dto.discount_value ?? null,
      dto.scope ?? null,
      dto.product_id ?? null,
      dto.category_id ?? null,
      dto.code ?? null,
      dto.starts_at ?? null,
      dto.ends_at ?? null,
      dto.is_active ?? null,
      dto.usage_limit ?? null,
    ]
  );
  return result.rows[0] ?? null;
};

export const softDeleteOffer = async (
  shopId: string,
  offerId: string
): Promise<boolean> => {
  await query(`SELECT sp_eliminar_oferta($1, $2)`, [shopId, offerId]);
  return true;
};

export const findPublicOffers = async (
  shopId: string
): Promise<PublicOffer[]> => {
  const result = await query<PublicOffer>(
    `SELECT * FROM fn_listar_ofertas_publicas($1)`,
    [shopId]
  );
  return result.rows;
};
