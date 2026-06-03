import { CreateCategoryDto, UpdateCategoryDto, CategoryFilter, Category } from './category.types';
interface FindAllResult {
    rows: Category[];
    total: number;
}
export declare const findAllCategories: (shopId: string, filter: CategoryFilter) => Promise<FindAllResult>;
/** Nombres activos coincidentes (sin distinguir mayúsculas). Puede devolver varias filas si hay duplicados de nombre. */
export declare const buscarIdsCategoriaActivaPorNombre: (shopId: string, nombre: string) => Promise<string[]>;
export declare const findCategoryById: (shopId: string, categoryId: string) => Promise<Category | null>;
export declare const createCategory: (shopId: string, dto: CreateCategoryDto) => Promise<Category>;
export declare const updateCategory: (shopId: string, categoryId: string, dto: UpdateCategoryDto) => Promise<Category | null>;
export declare const actualizarImagenCategoria: (shopId: string, categoryId: string, imageUrl: string) => Promise<Category | null>;
export declare const softDeleteCategory: (shopId: string, categoryId: string) => Promise<boolean>;
export declare const countProductsByCategory: (shopId: string, categoryId: string) => Promise<number>;
export {};
//# sourceMappingURL=category.repository.d.ts.map