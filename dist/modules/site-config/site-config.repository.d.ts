import { CreateSiteConfigDto, UpdateSiteConfigDto, SiteConfigFilter, SiteConfig, PublicSiteConfig } from './site-config.types';
interface FindAllResult {
    rows: SiteConfig[];
    total: number;
}
export declare const findAllSiteConfigs: (shopId: string, filter: SiteConfigFilter) => Promise<FindAllResult>;
export declare const findSiteConfigById: (shopId: string, configId: string) => Promise<SiteConfig | null>;
export declare const findPublicSiteConfigs: (shopId: string) => Promise<PublicSiteConfig[]>;
export declare const createSiteConfig: (shopId: string, dto: CreateSiteConfigDto, updatedBy?: string) => Promise<SiteConfig>;
export declare const updateSiteConfig: (shopId: string, configId: string, dto: UpdateSiteConfigDto, updatedBy?: string) => Promise<SiteConfig | null>;
export declare const softDeleteSiteConfig: (shopId: string, configId: string) => Promise<boolean>;
export {};
//# sourceMappingURL=site-config.repository.d.ts.map