import { PaginationMeta } from '../../shared/types';
import { CreateSiteConfigDto, UpdateSiteConfigDto, SiteConfigFilter, SiteConfig, PublicSiteConfig } from './site-config.types';
export declare const listSiteConfigsService: (shopId: string, filter: SiteConfigFilter) => Promise<{
    configs: SiteConfig[];
    meta: PaginationMeta;
}>;
export declare const getSiteConfigService: (shopId: string, configId: string) => Promise<SiteConfig>;
export declare const listPublicSiteConfigsService: (shopId: string) => Promise<PublicSiteConfig[]>;
export declare const createSiteConfigService: (shopId: string, dto: CreateSiteConfigDto, updatedBy?: string) => Promise<SiteConfig>;
export declare const updateSiteConfigService: (shopId: string, configId: string, dto: UpdateSiteConfigDto, updatedBy?: string) => Promise<SiteConfig>;
export declare const deleteSiteConfigService: (shopId: string, configId: string) => Promise<void>;
//# sourceMappingURL=site-config.service.d.ts.map