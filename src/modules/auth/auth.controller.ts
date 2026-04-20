import { Request, Response, NextFunction } from 'express';
import { LoginSchema, RegisterShopSchema, LoginCustomerSchema, RegisterCustomerSchema } from './auth.types';
import { loginService, registerShopService, loginCustomerService, registerCustomerService } from './auth.service';
import { sendSuccess, sendCreated } from '../../shared/utils/response';

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

export const registerShop = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dto = RegisterShopSchema.parse(req.body);
    const result = await registerShopService(dto);
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
