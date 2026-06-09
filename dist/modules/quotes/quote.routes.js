"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quoteRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../middlewares/authenticate");
const tenantGuard_1 = require("../../middlewares/tenantGuard");
const validateUuid_1 = require("../../middlewares/validateUuid");
const quote_controller_1 = require("./quote.controller");
const router = (0, express_1.Router)();
exports.quoteRouter = router;
router.use(authenticate_1.authenticate, tenantGuard_1.tenantGuard);
// Admin/Owner: ven TODAS las cotizaciones de la tienda
// Customer: ve SOLO las suyas
// Los tres roles pueden acceder; el controller filtra por customer_id
router.get('/', quote_controller_1.listQuotes);
router.post('/', quote_controller_1.createQuote);
router.get('/:id', (0, validateUuid_1.validateUuid)('id'), quote_controller_1.getQuote);
router.patch('/:id', (0, validateUuid_1.validateUuid)('id'), quote_controller_1.updateQuote);
router.delete('/:id', (0, validateUuid_1.validateUuid)('id'), quote_controller_1.deleteQuote);
router.post('/:id/select-plan', (0, validateUuid_1.validateUuid)('id'), quote_controller_1.selectPlanForQuote);
router.post('/:id/payments', (0, validateUuid_1.validateUuid)('id'), quote_controller_1.registerQuotePayment);
router.get('/:id/payments', (0, validateUuid_1.validateUuid)('id'), quote_controller_1.listQuotePayments);
//# sourceMappingURL=quote.routes.js.map