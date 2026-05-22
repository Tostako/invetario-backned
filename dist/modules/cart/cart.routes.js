"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../middlewares/authenticate");
const tenantGuard_1 = require("../../middlewares/tenantGuard");
const validateUuid_1 = require("../../middlewares/validateUuid");
const cart_controller_1 = require("./cart.controller");
// Carrito disponible para todos los roles autenticados (owner, admin, staff)
const router = (0, express_1.Router)();
exports.cartRouter = router;
router.use(authenticate_1.authenticate, tenantGuard_1.tenantGuard);
// HU7 – Ver carrito
router.get('/', cart_controller_1.verCarrito);
// HU6 – Agregar ítem
router.post('/items', cart_controller_1.agregarItem);
// HU7 – Actualizar cantidad
router.patch('/items/:id', (0, validateUuid_1.validateUuid)('id'), cart_controller_1.actualizarItem);
// HU7 – Eliminar ítem
router.delete('/items/:id', (0, validateUuid_1.validateUuid)('id'), cart_controller_1.eliminarItem);
//# sourceMappingURL=cart.routes.js.map