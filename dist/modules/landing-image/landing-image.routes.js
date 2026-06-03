"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.landingImageRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../middlewares/authenticate");
const authorize_1 = require("../../middlewares/authorize");
const tenantGuard_1 = require("../../middlewares/tenantGuard");
const validateUuid_1 = require("../../middlewares/validateUuid");
const landing_image_controller_1 = require("./landing-image.controller");
const router = (0, express_1.Router)();
exports.landingImageRouter = router;
router.use(authenticate_1.authenticate, tenantGuard_1.tenantGuard);
// ─── Rutas sin parámetro :id ──────────────────────────────────────────────────
router.get('/', (0, authorize_1.authorize)('admin', 'owner'), landing_image_controller_1.listLandingImages);
router.post('/', (0, authorize_1.authorize)('admin', 'owner'), landing_image_controller_1.createLandingImage);
// ─── Rutas con :id ───────────────────────────────────────────────────────────
router.get('/:id', (0, validateUuid_1.validateUuid)('id'), (0, authorize_1.authorize)('admin', 'owner'), landing_image_controller_1.getLandingImage);
router.patch('/:id', (0, validateUuid_1.validateUuid)('id'), (0, authorize_1.authorize)('admin', 'owner'), landing_image_controller_1.updateLandingImage);
router.delete('/:id', (0, validateUuid_1.validateUuid)('id'), (0, authorize_1.authorize)('admin', 'owner'), landing_image_controller_1.deleteLandingImage);
//# sourceMappingURL=landing-image.routes.js.map