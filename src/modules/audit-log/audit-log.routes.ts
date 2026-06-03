import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { tenantGuard } from '../../middlewares/tenantGuard';
import { validateUuid } from '../../middlewares/validateUuid';
import {
  listAuditLogs,
  getAuditLog,
} from './audit-log.controller';

const router = Router();

router.use(authenticate, tenantGuard);

// Solo admin/owner puede ver auditoría
router.get('/', authorize('admin', 'owner'), listAuditLogs);

router.get('/:id',
  validateUuid('id'),
  authorize('admin', 'owner'),
  getAuditLog
);

export { router as auditLogRouter };
