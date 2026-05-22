"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offerRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../middlewares/authenticate");
const authorize_1 = require("../../middlewares/authorize");
const tenantGuard_1 = require("../../middlewares/tenantGuard");
const validateUuid_1 = require("../../middlewares/validateUuid");
const offer_controller_1 = require("./offer.controller");
// Cadena de seguridad por capa:
//   1. authenticate  → JWT válido + extrae shop_id
//   2. tenantGuard   → shop existe y está activa en DB
//   3. authorize     → rol suficiente para la operación
//   4. validateUuid  → :id es UUID bien formado antes de llegar al controller
const router = (0, express_1.Router)();
exports.offerRouter = router;
// Los tres primeros middlewares aplican a TODO el módulo
router.use(authenticate_1.authenticate, tenantGuard_1.tenantGuard);
// ─── Rutas sin parámetro :id ──────────────────────────────────────────────────
router.get('/', offer_controller_1.listOffers);
router.post('/', (0, authorize_1.authorize)('admin', 'owner'), offer_controller_1.createOffer);
// ─── Rutas con :id ───────────────────────────────────────────────────────────
router.get('/:id', (0, validateUuid_1.validateUuid)('id'), offer_controller_1.getOffer);
router.patch('/:id', (0, validateUuid_1.validateUuid)('id'), (0, authorize_1.authorize)('admin', 'owner'), offer_controller_1.updateOffer);
router.delete('/:id', (0, validateUuid_1.validateUuid)('id'), (0, authorize_1.authorize)('owner'), offer_controller_1.deleteOffer);
//# sourceMappingURL=offer.routes.js.map