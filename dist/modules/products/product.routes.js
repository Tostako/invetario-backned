"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../middlewares/authenticate");
const authorize_1 = require("../../middlewares/authorize");
const tenantGuard_1 = require("../../middlewares/tenantGuard");
const validateUuid_1 = require("../../middlewares/validateUuid");
const product_controller_1 = require("./product.controller");
const upload_1 = require("../../middlewares/upload");
// Cadena de seguridad por capa:
//   1. authenticate  → JWT válido + extrae shop_id
//   2. tenantGuard   → shop existe y está activa en DB
//   3. authorize     → rol suficiente para la operación
//   4. validateUuid  → :id es UUID bien formado antes de llegar al controller
const router = (0, express_1.Router)();
exports.productRouter = router;
// Los tres primeros middlewares aplican a TODO el módulo
router.use(authenticate_1.authenticate, tenantGuard_1.tenantGuard);
// ─── Rutas sin parámetro :id ──────────────────────────────────────────────────
router.get('/', product_controller_1.listProducts);
router.post('/', (0, authorize_1.authorize)('admin', 'owner'), upload_1.upload.single('image'), product_controller_1.createProduct);
// ─── Rutas con :id ───────────────────────────────────────────────────────────
router.get('/:id', (0, validateUuid_1.validateUuid)('id'), product_controller_1.getProduct);
router.patch('/:id', (0, validateUuid_1.validateUuid)('id'), (0, authorize_1.authorize)('admin', 'owner'), upload_1.upload.single('image'), product_controller_1.updateProduct);
router.delete('/:id', (0, validateUuid_1.validateUuid)('id'), (0, authorize_1.authorize)('owner'), product_controller_1.deleteProduct);
router.patch('/:id/stock', (0, validateUuid_1.validateUuid)('id'), (0, authorize_1.authorize)('staff', 'admin', 'owner'), product_controller_1.adjustStock);
//# sourceMappingURL=product.routes.js.map