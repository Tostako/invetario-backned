import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { sendSuccess, sendCreated } from '../../shared/utils/response';
import {
  CreateSiteConfigSchema,
  UpdateSiteConfigSchema,
  SiteConfigFilterSchema,
} from './site-config.types';
import {
  listSiteConfigsService,
  getSiteConfigService,
  listPublicSiteConfigsService,
  createSiteConfigService,
  updateSiteConfigService,
  deleteSiteConfigService,
} from './site-config.service';

// ─── Admin Controllers ───────────────────────────────────────────────────────

export const listSiteConfigs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filter = SiteConfigFilterSchema.parse(req.query);
    const { configs, meta } = await listSiteConfigsService(req.user.shop_id, filter);
    sendSuccess(res, configs, 200, meta);
  } catch (err) {
    next(err);
  }
};

export const getSiteConfig = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const config = await getSiteConfigService(req.user.shop_id, req.params['id']!);
    sendSuccess(res, config);
  } catch (err) {
    next(err);
  }
};

export const createSiteConfig = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto = CreateSiteConfigSchema.parse(req.body);
    const config = await createSiteConfigService(req.user.shop_id, dto, req.user.id);
    sendCreated(res, config);
  } catch (err) {
    next(err);
  }
};

export const updateSiteConfig = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto = UpdateSiteConfigSchema.parse(req.body);
    const config = await updateSiteConfigService(req.user.shop_id, req.params['id']!, dto, req.user.id);
    sendSuccess(res, config);
  } catch (err) {
    next(err);
  }
};

export const deleteSiteConfig = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await deleteSiteConfigService(req.user.shop_id, req.params['id']!);
    sendSuccess(res, { message: 'Config deactivated successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── Public Controller ───────────────────────────────────────────────────────

export const listPublicSiteConfigs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const configs = await listPublicSiteConfigsService(req.user.shop_id);
    sendSuccess(res, configs);
  } catch (err) {
    next(err);
  }
};
