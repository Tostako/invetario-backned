import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { sendSuccess, sendCreated } from '../../shared/utils/response';
import {
  UpsertCustomerConfigSchema,
  CustomerConfigFilterSchema,
} from './customer-config.types';
import {
  listCustomerConfigsService,
  getCustomerConfigService,
  getOwnCustomerConfigService,
  upsertOwnCustomerConfigService,
  deleteCustomerConfigService,
} from './customer-config.service';

// Helper: si el usuario es customer, devuelve su customer_id
const getCustomerId = (req: AuthenticatedRequest): string | undefined => {
  return req.user.role === 'customer' ? req.user.customer_id : undefined;
};

// ─── Admin Controllers ───────────────────────────────────────────────────────

export const listCustomerConfigs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filter = CustomerConfigFilterSchema.parse(req.query);
    const { configs, meta } = await listCustomerConfigsService(req.user.shop_id, filter);
    sendSuccess(res, configs, 200, meta);
  } catch (err) {
    next(err);
  }
};

export const getCustomerConfig = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customerId = getCustomerId(req);
    const config = await getCustomerConfigService(req.user.shop_id, req.params['id']!, customerId);
    sendSuccess(res, config);
  } catch (err) {
    next(err);
  }
};

export const deleteCustomerConfig = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await deleteCustomerConfigService(req.user.shop_id, req.params['id']!);
    sendSuccess(res, { message: 'Customer config deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── Customer Controllers ────────────────────────────────────────────────────

export const getOwnCustomerConfig = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customerId = req.user.customer_id;
    if (!customerId) {
      res.status(403).json({ success: false, message: 'Only customers have configs' });
      return;
    }
    const config = await getOwnCustomerConfigService(req.user.shop_id, customerId);
    sendSuccess(res, config);
  } catch (err) {
    next(err);
  }
};

export const upsertOwnCustomerConfig = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customerId = req.user.customer_id;
    if (!customerId) {
      res.status(403).json({ success: false, message: 'Only customers can manage their config' });
      return;
    }
    const dto = UpsertCustomerConfigSchema.parse(req.body);
    const config = await upsertOwnCustomerConfigService(req.user.shop_id, customerId, dto);
    sendSuccess(res, config, 200);
  } catch (err) {
    next(err);
  }
};
