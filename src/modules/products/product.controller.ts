import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { sendSuccess, sendCreated } from '../../shared/utils/response';
import {
  CreateProductSchema,
  UpdateProductSchema,
  ProductFilterSchema,
} from './product.types';
import {
  listProductsService,
  getProductService,
  createProductService,
  updateProductService,
  deleteProductService,
  adjustStockService,
} from './product.service';

// Los controllers son delgados: parsear → llamar service → responder.
// No contienen lógica de negocio ni queries SQL.

export const listProducts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filter = ProductFilterSchema.parse(req.query);
    const { products, meta } = await listProductsService(req.user.shop_id, filter);
    sendSuccess(res, products, 200, meta);
  } catch (err) {
    next(err);
  }
};

export const getProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await getProductService(req.user.shop_id, req.params['id']!);
    sendSuccess(res, product);
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto = CreateProductSchema.parse(req.body);
    const product = await createProductService(req.user.shop_id, dto);
    sendCreated(res, product);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto = UpdateProductSchema.parse(req.body);
    const product = await updateProductService(req.user.shop_id, req.params['id']!, dto);
    sendSuccess(res, product);
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await deleteProductService(req.user.shop_id, req.params['id']!);
    sendSuccess(res, { message: 'Product deactivated successfully' });
  } catch (err) {
    next(err);
  }
};

export const adjustStock = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // delta puede ser positivo (entrada) o negativo (salida)
    const { delta } = req.body as { delta: unknown };
    if (typeof delta !== 'number' || !Number.isInteger(delta) || delta === 0) {
      res.status(422).json({
        success: false,
        message: 'delta must be a non-zero integer',
      });
      return;
    }

    const product = await adjustStockService(req.user.shop_id, req.params['id']!, delta);
    sendSuccess(res, product);
  } catch (err) {
    next(err);
  }
};
