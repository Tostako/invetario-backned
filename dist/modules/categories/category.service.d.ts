import { PaginationMeta } from '../../shared/types';
import { CreateCategoryDto, UpdateCategoryDto, CategoryFilter, Category } from './category.types';
export declare const listCategoriesService: (shopId: string, filter: CategoryFilter) => Promise<{
    categorias: Category[];
    meta: PaginationMeta;
}>;
export declare const getCategoryService: (shopId: string, categoryId: string) => Promise<Category>;
export declare const createCategoryService: (shopId: string, dto: CreateCategoryDto) => Promise<Category>;
export declare const updateCategoryService: (shopId: string, categoryId: string, dto: UpdateCategoryDto) => Promise<Category>;
export declare const subirImagenCategoriaService: (shopId: string, categoryId: string, file: Express.Multer.File) => Promise<Category>;
export declare const deleteCategoryService: (shopId: string, categoryId: string) => Promise<void>;
//# sourceMappingURL=category.service.d.ts.map