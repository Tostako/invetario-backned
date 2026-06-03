import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { sendSuccess, sendCreated } from '../../shared/utils/response';
import {
  CreateLandingImageSchema,
  UpdateLandingImageSchema,
  LandingImageFilterSchema,
} from './landing-image.types';
import {
  listLandingImagesService,
  getLandingImageService,
  listPublicLandingImagesService,
  createLandingImageService,
  updateLandingImageService,
  deleteLandingImageService,
} from './landing-image.service';

// ─── Admin Controllers ───────────────────────────────────────────────────────

export const listLandingImages = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filter = LandingImageFilterSchema.parse(req.query);
    const { images, meta } = await listLandingImagesService(req.user.shop_id, filter);
    sendSuccess(res, images, 200, meta);
  } catch (err) {
    next(err);
  }
};

export const getLandingImage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const image = await getLandingImageService(req.user.shop_id, req.params['id']!);
    sendSuccess(res, image);
  } catch (err) {
    next(err);
  }
};

export const createLandingImage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto = CreateLandingImageSchema.parse(req.body);
    const image = await createLandingImageService(req.user.shop_id, dto, req.user.id);
    sendCreated(res, image);
  } catch (err) {
    next(err);
  }
};

export const updateLandingImage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto = UpdateLandingImageSchema.parse(req.body);
    const image = await updateLandingImageService(req.user.shop_id, req.params['id']!, dto, req.user.id);
    sendSuccess(res, image);
  } catch (err) {
    next(err);
  }
};

export const deleteLandingImage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await deleteLandingImageService(req.user.shop_id, req.params['id']!);
    sendSuccess(res, { message: 'Image deactivated successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── Public Controller ────────────────────────────────────────────────────────

export const listPublicLandingImages = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const images = await listPublicLandingImagesService(req.user.shop_id);
    sendSuccess(res, images);
  } catch (err) {
    next(err);
  }
};
