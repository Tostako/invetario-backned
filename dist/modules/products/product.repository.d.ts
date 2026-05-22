import { CreateProductDto, UpdateProductDto, ProductFilter, Product } from './product.types';
interface FindAllResult {
    rows: Product[];
    total: number;
}
export declare const findAllProducts: (shopId: string, filter: ProductFilter) => Promise<FindAllResult>;
export declare const findProductById: (shopId: string, productId: string) => Promise<Product | null>;
export declare const createProduct: (shopId: string, dto: CreateProductDto) => Promise<Product>;
export declare const updateProduct: (shopId: string, productId: string, dto: UpdateProductDto) => Promise<Product | null>;
export declare const softDeleteProduct: (shopId: string, productId: string) => Promise<boolean>;
export declare const adjustStock: (shopId: string, productId: string, delta: number, userId: string, tipo?: string, orderId?: string, notas?: string) => Promise<Product | null>;
export {};
//# sourceMappingURL=product.repository.d.ts.map