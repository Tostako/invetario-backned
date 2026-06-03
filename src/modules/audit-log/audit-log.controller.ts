import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { sendSuccess } from '../../shared/utils/response';
import { AuditLogFilterSchema } from './audit-log.types';
import {
  listAuditLogsService,
  getAuditLogService,
} from './audit-log.service';

export const listAuditLogs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filter = AuditLogFilterSchema.parse(req.query);
    const { logs, meta } = await listAuditLogsService(req.user.shop_id, filter);
    sendSuccess(res, logs, 200, meta);
  } catch (err) {
    next(err);
  }
};

export const getAuditLog = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const log = await getAuditLogService(req.user.shop_id, req.params['id']!);
    sendSuccess(res, log);
  } catch (err) {
    next(err);
  }
};
