"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.siteConfigRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../middlewares/authenticate");
const authorize_1 = require("../../middlewares/authorize");
const tenantGuard_1 = require("../../middlewares/tenantGuard");
const validateUuid_1 = require("../../middlewares/validateUuid");
const site_config_controller_1 = require("./site-config.controller");
// Cadena de seguridad por capa:
//   1. authenticate  → JWT válido + extrae shop_id
//   2. tenantGuard   → shop existe y está activa en DB
//   3. authorize     → rol suficiente para la operación
//   4. validateUuid  → :id es UUID bien formado antes de llegar al controller
const router = (0, express_1.Router)();
exports.siteConfigRouter = router;
// Los tres primeros middlewares aplican a TODO el módulo
router.use(authenticate_1.authenticate, tenantGuard_1.tenantGuard);
// ─── Rutas sin parámetro :id ──────────────────────────────────────────────────
router.get('/', (0, authorize_1.authorize)('admin', 'owner'), site_config_controller_1.listSiteConfigs);
router.post('/', (0, authorize_1.authorize)('admin', 'owner'), site_config_controller_1.createSiteConfig);
// ─── Rutas con :id ───────────────────────────────────────────────────────────
router.get('/:id', (0, validateUuid_1.validateUuid)('id'), (0, authorize_1.authorize)('admin', 'owner'), site_config_controller_1.getSiteConfig);
router.patch('/:id', (0, validateUuid_1.validateUuid)('id'), (0, authorize_1.authorize)('admin', 'owner'), site_config_controller_1.updateSiteConfig);
router.delete('/:id', (0, validateUuid_1.validateUuid)('id'), (0, authorize_1.authorize)('admin', 'owner'), site_config_controller_1.deleteSiteConfig);
//# sourceMappingURL=site-config.routes.js.map