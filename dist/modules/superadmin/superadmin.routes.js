"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.superAdminRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../middlewares/authenticate");
const authorize_1 = require("../../middlewares/authorize");
const validateUuid_1 = require("../../middlewares/validateUuid");
const superadmin_controller_1 = require("./superadmin.controller");
const router = (0, express_1.Router)();
exports.superAdminRouter = router;
// ─── Auth de superadmin ───────────────────────────────────────────────────────
// POST /api/v1/admin/auth/login
router.post('/auth/login', superadmin_controller_1.loginSuperAdmin);
// POST /api/v1/admin/auth/bootstrap  — solo funciona si NO hay superadmins aún
router.post('/auth/bootstrap', superadmin_controller_1.bootstrapSuperAdmin);
// POST /api/v1/admin/auth/register  — requiere ser superadmin activo
router.post('/auth/register', authenticate_1.authenticate, (0, authorize_1.authorize)('superadmin'), superadmin_controller_1.registrarSuperAdmin);
// ─── CRUD Tiendas ─────────────────────────────────────────────────────────────
// Todas estas rutas requieren token de superadmin
router.use(authenticate_1.authenticate, (0, authorize_1.authorize)('superadmin'));
// GET    /api/v1/admin/shops
router.get('/shops', superadmin_controller_1.listarTiendas);
// POST   /api/v1/admin/shops
router.post('/shops', superadmin_controller_1.crearTienda);
// GET    /api/v1/admin/shops/:id
router.get('/shops/:id', (0, validateUuid_1.validateUuid)('id'), superadmin_controller_1.obtenerTienda);
// PATCH  /api/v1/admin/shops/:id
router.patch('/shops/:id', (0, validateUuid_1.validateUuid)('id'), superadmin_controller_1.actualizarTienda);
// DELETE /api/v1/admin/shops/:id  (soft delete)
router.delete('/shops/:id', (0, validateUuid_1.validateUuid)('id'), superadmin_controller_1.eliminarTienda);
//# sourceMappingURL=superadmin.routes.js.map