// ─── Products Service ─────────────────────────────────────────────────────────
// Con Database-Centric Architecture, la lógica de negocio (SKU único, stock_max,
// stock negativo) vive en los stored procedures de la BD.
// El servicio se encarga de:
//   1. Traducir errores de BD a AppErrors con mensajes claros
//   2. Formatear la respuesta de paginación
//   3. Orquestar llamadas cuando el controller lo necesita
// ─────────────────────────────────────────────────────────────────────────────

import { NotFoundError, ConflictError, ValidationError } from '../../shared/errors/AppError';
import { PaginationMeta } from '../../shared/types';
import {
  findAllProducts,
  findProductById,
  createProduct,
  updateProduct,
  softDeleteProduct,
  adjustStock,
} from './product.repository';
import { CreateProductDto, UpdateProductDto, ProductFilter, Product } from './product.types';
import { traducirErrorDB } from '../../shared/utils/dbErrors';

export const listProductsService = async (
  shopId: string,
  filter: ProductFilter
): Promise<{ products: Product[]; meta: PaginationMeta }> => {
  const { rows, total } = await findAllProducts(shopId, filter);
  return {
    products: rows,
    meta: {
      total,
      page:       filter.page,
      limit:      filter.limit,
      totalPages: Math.ceil(total / filter.limit),
    },
  };
};

export const getProductService = async (
  shopId: string,
  productId: string
): Promise<Product> => {
  const product = await findProductById(shopId, productId);
  if (!product) throw new NotFoundError('Producto');
  return product;
};

export const createProductService = async (
  shopId: string,
  dto: CreateProductDto
): Promise<Product> => {
  try {
    return await createProduct(shopId, dto);
  } catch (err) {
    throw traducirErrorDB(err, {
      SKU_DUPLICADO: () => new ConflictError(`SKU "${dto.sku.toUpperCase()}" ya existe en esta tienda`),
      STOCK_MAX_INVALIDO: () => new ValidationError('stock_max debe ser mayor que stock_min'),
    });
  }
};

export const updateProductService = async (
  shopId: string,
  productId: string,
  dto: UpdateProductDto
): Promise<Product> => {
  try {
    const updated = await updateProduct(shopId, productId, dto);
    if (!updated) throw new NotFoundError('Producto');
    return updated;
  } catch (err) {
    throw traducirErrorDB(err, {
      PRODUCT_NOT_FOUND:  () => new NotFoundError('Producto'),
      SKU_DUPLICADO:      () => new ConflictError(`SKU "${dto.sku?.toUpperCase()}" ya existe en esta tienda`),
      STOCK_MAX_INVALIDO: () => new ValidationError('stock_max debe ser mayor que stock_min'),
    });
  }
};

export const deleteProductService = async (
  shopId: string,
  productId: string
): Promise<void> => {
  try {
    await softDeleteProduct(shopId, productId);
  } catch (err) {
    throw traducirErrorDB(err, {
      PRODUCT_NOT_FOUND: () => new NotFoundError('Producto'),
    });
  }
};

export const adjustStockService = async (
  shopId: string,
  productId: string,
  delta: number,
  userId: string,
  tipo?: string,
  notas?: string
): Promise<Product> => {
  try {
    const updated = await adjustStock(shopId, productId, delta, userId, tipo, undefined, notas);
    if (!updated) throw new NotFoundError('Producto');
    return updated;
  } catch (err) {
    throw traducirErrorDB(err, {
      PRODUCT_NOT_FOUND: () => new NotFoundError('Producto'),
      STOCK_NEGATIVO:    () => new ValidationError('El ajuste resultaría en stock negativo'),
    });
  }
};
