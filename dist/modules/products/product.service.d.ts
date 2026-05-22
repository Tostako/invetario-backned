import { PaginationMeta } from '../../shared/types';
import { CreateProductDto, UpdateProductDto, ProductFilter, ProductoConEstado } from './product.types';
export declare const listProductsService: (shopId: string, filter: ProductFilter) => Promise<{
    products: ProductoConEstado[];
    meta: PaginationMeta;
}>;
export declare const getProductService: (shopId: string, productId: string) => Promise<ProductoConEstado>;
export declare const createProductService: (shopId: string, dto: CreateProductDto) => Promise<ProductoConEstado>;
export declare const updateProductService: (shopId: string, productId: string, dto: UpdateProductDto) => Promise<ProductoConEstado>;
export declare const deleteProductService: (shopId: string, productId: string) => Promise<void>;
export declare const adjustStockService: (shopId: string, productId: string, delta: number, userId: string, tipo?: string, notas?: string) => Promise<ProductoConEstado>;
//# sourceMappingURL=product.service.d.ts.map