import { NotFoundError, ConflictError, ValidationError } from '../../shared/errors/AppError';
import { PaginationMeta } from '../../shared/types';
import {
  findAllProducts,
  findProductById,
  findProductBySku,
  createProduct,
  updateProduct,
  softDeleteProduct,
  adjustStock,
} from './product.repository';
import { CreateProductDto, UpdateProductDto, ProductFilter, Product } from './product.types';

// Toda la lógica de negocio vive aquí — el repositorio no sabe de reglas,
// el controller no sabe de validaciones de negocio.

export const listProductsService = async (
  shopId: string,
  filter: ProductFilter
): Promise<{ products: Product[]; meta: PaginationMeta }> => {
  const { rows, total } = await findAllProducts(shopId, filter);

  const meta: PaginationMeta = {
    total,
    page: filter.page,
    limit: filter.limit,
    totalPages: Math.ceil(total / filter.limit),
  };

  return { products: rows, meta };
};

export const getProductService = async (
  shopId: string,
  productId: string
): Promise<Product> => {
  const product = await findProductById(shopId, productId);
  if (!product) throw new NotFoundError('Product');
  return product;
};

export const createProductService = async (
  shopId: string,
  dto: CreateProductDto
): Promise<Product> => {
  // Verificar SKU único dentro de la tienda
  const existing = await findProductBySku(shopId, dto.sku);
  if (existing) {
    throw new ConflictError(`SKU "${dto.sku.toUpperCase()}" already exists in this shop`);
  }

  // Validar coherencia de stock
  if (dto.stock_max !== undefined && dto.stock_max <= dto.stock_min) {
    throw new ValidationError('stock_max must be greater than stock_min');
  }

  return createProduct(shopId, dto);
};

export const updateProductService = async (
  shopId: string,
  productId: string,
  dto: UpdateProductDto
): Promise<Product> => {
  // Verificar que el producto existe y pertenece a esta tienda
  const existing = await findProductById(shopId, productId);
  if (!existing) throw new NotFoundError('Product');

  // Si se cambia el SKU, verificar que no esté ocupado por otro producto
  if (dto.sku) {
    const skuConflict = await findProductBySku(shopId, dto.sku, productId);
    if (skuConflict) {
      throw new ConflictError(`SKU "${dto.sku.toUpperCase()}" already exists in this shop`);
    }
  }

  // Validar stock_max con los valores finales (mezcla actual + dto)
  const finalStockMin = dto.stock_min ?? existing.stock_min;
  const finalStockMax = dto.stock_max ?? existing.stock_max;
  if (finalStockMax !== null && finalStockMax !== undefined && finalStockMax <= finalStockMin) {
    throw new ValidationError('stock_max must be greater than stock_min');
  }

  const updated = await updateProduct(shopId, productId, dto);
  if (!updated) throw new NotFoundError('Product');
  return updated;
};

export const deleteProductService = async (
  shopId: string,
  productId: string
): Promise<void> => {
  const product = await findProductById(shopId, productId);
  if (!product) throw new NotFoundError('Product');

  await softDeleteProduct(shopId, productId);
};

export const adjustStockService = async (
  shopId: string,
  productId: string,
  delta: number
): Promise<Product> => {
  const product = await findProductById(shopId, productId);
  if (!product) throw new NotFoundError('Product');

  const updated = await adjustStock(shopId, productId, delta);
  if (!updated) {
    throw new ValidationError('Stock adjustment would result in negative stock');
  }

  return updated;
};
