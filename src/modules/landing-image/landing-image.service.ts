// ─── Landing Image Service ────────────────────────────────────────────────────
// Traduce errores de BD y orquesta llamadas al repository.
// ─────────────────────────────────────────────────────────────────────────────

import { NotFoundError } from '../../shared/errors/AppError';
import { PaginationMeta } from '../../shared/types';
import {
  findAllLandingImages,
  findLandingImageById,
  findPublicLandingImages,
  createLandingImage,
  updateLandingImage,
  softDeleteLandingImage,
} from './landing-image.repository';
import {
  CreateLandingImageDto,
  UpdateLandingImageDto,
  LandingImageFilter,
  LandingImage,
  PublicLandingImage,
} from './landing-image.types';
import { traducirErrorDB } from '../../shared/utils/dbErrors';

export const listLandingImagesService = async (
  shopId: string,
  filter: LandingImageFilter
): Promise<{ images: LandingImage[]; meta: PaginationMeta }> => {
  const { rows, total } = await findAllLandingImages(shopId, filter);
  return {
    images: rows,
    meta: {
      total,
      page: filter.page,
      limit: filter.limit,
      totalPages: Math.ceil(total / filter.limit),
    },
  };
};

export const getLandingImageService = async (
  shopId: string,
  imageId: string
): Promise<LandingImage> => {
  const image = await findLandingImageById(shopId, imageId);
  if (!image) throw new NotFoundError('Imagen');
  return image;
};

export const listPublicLandingImagesService = async (
  shopId: string
): Promise<PublicLandingImage[]> => {
  return findPublicLandingImages(shopId);
};

export const createLandingImageService = async (
  shopId: string,
  dto: CreateLandingImageDto,
  uploadedBy?: string
): Promise<LandingImage> => {
  return await createLandingImage(shopId, dto, uploadedBy);
};

export const updateLandingImageService = async (
  shopId: string,
  imageId: string,
  dto: UpdateLandingImageDto,
  uploadedBy?: string
): Promise<LandingImage> => {
  try {
    const updated = await updateLandingImage(shopId, imageId, dto, uploadedBy);
    if (!updated) throw new NotFoundError('Imagen');
    return updated;
  } catch (err) {
    throw traducirErrorDB(err, {
      IMAGE_NOT_FOUND: () => new NotFoundError('Imagen'),
    });
  }
};

export const deleteLandingImageService = async (
  shopId: string,
  imageId: string
): Promise<void> => {
  try {
    await softDeleteLandingImage(shopId, imageId);
  } catch (err) {
    throw traducirErrorDB(err, {
      IMAGE_NOT_FOUND: () => new NotFoundError('Imagen'),
    });
  }
};
