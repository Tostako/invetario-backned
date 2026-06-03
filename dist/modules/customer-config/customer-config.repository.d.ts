import { UpsertCustomerConfigDto, CustomerConfigFilter, CustomerConfig } from './customer-config.types';
interface FindAllResult {
    rows: CustomerConfig[];
    total: number;
}
export declare const findAllCustomerConfigs: (shopId: string, filter: CustomerConfigFilter) => Promise<FindAllResult>;
export declare const findCustomerConfigById: (shopId: string, configId: string) => Promise<CustomerConfig | null>;
export declare const findOwnCustomerConfig: (shopId: string, customerId: string) => Promise<CustomerConfig | null>;
export declare const upsertCustomerConfig: (shopId: string, customerId: string, dto: UpsertCustomerConfigDto) => Promise<CustomerConfig>;
export declare const deleteCustomerConfig: (shopId: string, configId: string) => Promise<boolean>;
export {};
//# sourceMappingURL=customer-config.repository.d.ts.map