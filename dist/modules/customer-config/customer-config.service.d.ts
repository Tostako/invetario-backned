import { PaginationMeta } from '../../shared/types';
import { UpsertCustomerConfigDto, CustomerConfigFilter, CustomerConfig } from './customer-config.types';
export declare const listCustomerConfigsService: (shopId: string, filter: CustomerConfigFilter) => Promise<{
    configs: CustomerConfig[];
    meta: PaginationMeta;
}>;
export declare const getCustomerConfigService: (shopId: string, configId: string, customerId?: string) => Promise<any>;
export declare const getOwnCustomerConfigService: (shopId: string, customerId: string) => Promise<any>;
export declare const upsertOwnCustomerConfigService: (shopId: string, customerId: string, dto: UpsertCustomerConfigDto) => Promise<CustomerConfig>;
export declare const deleteCustomerConfigService: (shopId: string, configId: string) => Promise<void>;
//# sourceMappingURL=customer-config.service.d.ts.map