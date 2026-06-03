import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
export declare const listCustomerConfigs: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getCustomerConfig: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteCustomerConfig: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getOwnCustomerConfig: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const upsertOwnCustomerConfig: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=customer-config.controller.d.ts.map