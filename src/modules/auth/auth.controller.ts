import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { LoginSchema, RegisterShopSchema, LoginCustomerSchema, RegisterCustomerSchema, SelectShopSchema, CreateAdditionalShopSchema } from './auth.types';
import { loginService, registerShopService, loginCustomerService, registerCustomerService, selectShopService, getUserShopsService, createShopForExistingUserService, SessionMeta } from './auth.service';
import { sendSuccess, sendCreated } from '../../shared/utils/response';

const pickSessionMeta = (req: Request): SessionMeta => ({
  userAgent: req.get('user-agent') ?? null,
  ipAddress: (() => {
    const xff = req.headers['x-forwarded-for'];
    if (typeof xff === 'string' && xff.length > 0) {
      return xff.split(',')[0]!.trim();
    }
    return req.socket.remoteAddress ?? null;
  })(),
});

// Los controllers solo parsean input, llaman al service y formatean la respuesta
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dto = LoginSchema.parse(req.body);
    const result = await loginService(dto);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const selectShop = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { shop_id, shop_slug } = SelectShopSchema.parse(req.body);
    const result = await selectShopService(req.user.email, { shopId: shop_id, shopSlug: shop_slug }, pickSessionMeta(req));
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const registerShop = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dto = RegisterShopSchema.parse(req.body);
    const result = await registerShopService(dto, pickSessionMeta(req));
    sendCreated(res, result);
  } catch (err) {
    next(err);
  }
};

export const loginCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dto = LoginCustomerSchema.parse(req.body);
    const result = await loginCustomerService(dto);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const registerCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dto = RegisterCustomerSchema.parse(req.body);
    const result = await registerCustomerService(dto);
    sendCreated(res, result);
  } catch (err) {
    next(err);
  }
};

export const getUserShops = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await getUserShopsService(req.user.email);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const switchShop = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { shop_id, shop_slug } = SelectShopSchema.parse(req.body);
    const result = await selectShopService(req.user.email, { shopId: shop_id, shopSlug: shop_slug }, pickSessionMeta(req));
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const createAdditionalShop = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dto = CreateAdditionalShopSchema.parse(req.body);
    const result = await createShopForExistingUserService(req.user.id, req.user.email, dto, pickSessionMeta(req));
    sendCreated(res, result);
  } catch (err) {
    next(err);
  }
};
