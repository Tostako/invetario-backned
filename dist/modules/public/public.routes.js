"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicRouter = void 0;
const express_1 = require("express");
const publicShopResolver_1 = require("../../middlewares/publicShopResolver");
const validateUuid_1 = require("../../middlewares/validateUuid");
const public_controller_1 = require("./public.controller");
const router = (0, express_1.Router)();
exports.publicRouter = router;
// TODAS las rutas públicas requieren resolver la tienda por shop_slug
router.use(publicShopResolver_1.publicShopResolver);
// ─── Productos públicos ───────────────────────────────────────────────────────
router.get('/products', public_controller_1.listPublicProducts);
router.get('/products/:id', (0, validateUuid_1.validateUuid)('id'), public_controller_1.getPublicProduct);
// ─── Categorías públicas ──────────────────────────────────────────────────────
router.get('/categories', public_controller_1.listPublicCategories);
// ─── Ofertas públicas ─────────────────────────────────────────────────────────
router.get('/offers', public_controller_1.listPublicOffers);
//# sourceMappingURL=public.routes.js.map