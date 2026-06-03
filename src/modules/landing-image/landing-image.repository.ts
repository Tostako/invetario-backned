// ─── Landing Image Repository ────────────────────────────────────────────────
// Thin adapter: invoca stored procedures / funciones de la BD.
// Sin SQL ad-hoc sobre las tablas base.
// Funciones definidas en: database/34_fn_landing_images.sql
// ─────────────────────────────────────────────────────────────────────────────

import { query } from '../../config/database';
import { CreateLandingImageDto, UpdateLandingImageDto, LandingImageFilter, LandingImage, PublicLandingImage } from './landing-image.types';

interface FindAllResult {
  rows: LandingImage[];
  total: number;
}

export const findAllLandingImages = async (
  shopId: string,
  filter: LandingImageFilter
): Promise<FindAllResult> => {
  const offset = (filter.page - 1) * filter.limit;
  const result = await query<LandingImage & { total_count: string }>(
    `SELECT * FROM fn_listar_landing_images($1, $2, $3, $4, $5)`,
    [
      shopId,
      filter.type ?? null,
      filter.is_active ?? null,
      filter.limit,
      offset,
    ]
  );
  return {
    rows: result.rows,
    total: result.rows.length > 0 ? parseInt(result.rows[0]!.total_count) : 0,
  };
};

export const findLandingImageById = async (
  shopId: string,
  imageId: string
): Promise<LandingImage | null> => {
  const result = await query<LandingImage>(
    `SELECT * FROM fn_obtener_landing_image($1, $2)`,
    [shopId, imageId]
  );
  return result.rows[0] ?? null;
};

export const findPublicLandingImages = async (
  shopId: string
): Promise<PublicLandingImage[]> => {
  const result = await query<PublicLandingImage>(
    `SELECT * FROM fn_listar_landing_images_publicas($1)`,
    [shopId]
  );
  return result.rows;
};

export const createLandingImage = async (
  shopId: string,
  dto: CreateLandingImageDto,
  uploadedBy?: string
): Promise<LandingImage> => {
  const result = await query<LandingImage>(
    `SELECT * FROM sp_crear_landing_image($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      shopId,
      dto.type,
      dto.url,
      dto.alt ?? null,
      dto.order,
      dto.active,
      dto.metadata ? JSON.stringify(dto.metadata) : null,
      uploadedBy ?? null,
    ]
  );
  return result.rows[0]!;
};

export const updateLandingImage = async (
  shopId: string,
  imageId: string,
  dto: UpdateLandingImageDto,
  uploadedBy?: string
): Promise<LandingImage | null> => {
  const result = await query<LandingImage>(
    `SELECT * FROM sp_actualizar_landing_image($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      shopId,
      imageId,
      dto.type ?? null,
      dto.url ?? null,
      dto.alt ?? null,
      dto.order ?? null,
      dto.active ?? null,
      dto.metadata ? JSON.stringify(dto.metadata) : null,
      uploadedBy ?? null,
    ]
  );
  return result.rows[0] ?? null;
};

export const softDeleteLandingImage = async (
  shopId: string,
  imageId: string
): Promise<boolean> => {
  await query(`SELECT sp_eliminar_landing_image($1, $2)`, [shopId, imageId]);
  return true;
};
