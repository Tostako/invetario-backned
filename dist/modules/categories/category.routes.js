"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../middlewares/authenticate");
const authorize_1 = require("../../middlewares/authorize");
const tenantGuard_1 = require("../../middlewares/tenantGuard");
const validateUuid_1 = require("../../middlewares/validateUuid");
const upload_1 = require("../../middlewares/upload");
const category_controller_1 = require("./category.controller");
// Cadena de seguridad por capa:
//   1. authenticate  → JWT válido + extrae shop_id
//   2. tenantGuard   → shop existe y está activa en DB
//   3. authorize     → rol suficiente para la operación
//   4. validateUuid  → :id es UUID bien formado antes de llegar al controller
const router = (0, express_1.Router)();
exports.categoryRouter = router;
// Los dos primeros middlewares aplican a TODO el módulo
router.use(authenticate_1.authenticate, tenantGuard_1.tenantGuard);
// ─── Rutas sin parámetro :id ──────────────────────────────────────────────────
// HU12: Listar categorías — cualquier usuario autenticado
router.get('/', category_controller_1.listCategories);
// HU11: Crear categoría — solo admin u owner
router.post('/', (0, authorize_1.authorize)('admin', 'owner'), category_controller_1.createCategory);
// ─── Rutas con :id ───────────────────────────────────────────────────────────
// HU12 (detalle): Obtener categoría — cualquier usuario autenticado
router.get('/:id', (0, validateUuid_1.validateUuid)('id'), category_controller_1.getCategory);
// HU13: Editar categoría — solo admin u owner
router.patch('/:id', (0, validateUuid_1.validateUuid)('id'), (0, authorize_1.authorize)('admin', 'owner'), upload_1.upload.single('image'), category_controller_1.updateCategory);
// Subir imagen de categoría
router.patch('/:id/image', (0, validateUuid_1.validateUuid)('id'), (0, authorize_1.authorize)('admin', 'owner'), upload_1.upload.single('image'), category_controller_1.subirImagenCategoria);
// HU14: Eliminar categoría — solo owner
router.delete('/:id', (0, validateUuid_1.validateUuid)('id'), (0, authorize_1.authorize)('owner'), category_controller_1.deleteCategory);
//# sourceMappingURL=category.routes.js.map