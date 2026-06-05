import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { tenantGuard } from '../../middlewares/tenantGuard';
import { validateUuid } from '../../middlewares/validateUuid';
import {
  listQuotes,
  getQuote,
  createQuote,
  updateQuote,
  deleteQuote,
  selectPlanForQuote,
  registerQuotePayment,
  listQuotePayments,
} from './quote.controller';

const router = Router();

router.use(authenticate, tenantGuard);

// Admin/Owner: ven TODAS las cotizaciones de la tienda
// Customer: ve SOLO las suyas
// Los tres roles pueden acceder; el controller filtra por customer_id
router.get('/', listQuotes);

router.post('/', createQuote);

router.get('/:id',
  validateUuid('id'),
  getQuote
);

router.patch('/:id',
  validateUuid('id'),
  updateQuote
);

router.delete('/:id',
  validateUuid('id'),
  deleteQuote
);

router.post('/:id/select-plan',
  validateUuid('id'),
  selectPlanForQuote
);

router.post('/:id/payments',
  validateUuid('id'),
  registerQuotePayment
);

router.get('/:id/payments',
  validateUuid('id'),
  listQuotePayments
);

export { router as quoteRouter };
