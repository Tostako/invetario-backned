"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../middlewares/authenticate");
const authorize_1 = require("../../middlewares/authorize");
const tenantGuard_1 = require("../../middlewares/tenantGuard");
const validateUuid_1 = require("../../middlewares/validateUuid");
const customer_controller_1 = require("./customer.controller");
const router = (0, express_1.Router)();
exports.customerRouter = router;
router.use(authenticate_1.authenticate, tenantGuard_1.tenantGuard);
router.get('/', (0, authorize_1.authorize)('staff', 'admin', 'owner'), customer_controller_1.listarClientes);
router.get('/:id', (0, authorize_1.authorize)('staff', 'admin', 'owner'), (0, validateUuid_1.validateUuid)('id'), customer_controller_1.obtenerCliente);
router.post('/', (0, authorize_1.authorize)('admin', 'owner'), customer_controller_1.crearCliente);
router.patch('/:id', (0, authorize_1.authorize)('admin', 'owner'), (0, validateUuid_1.validateUuid)('id'), customer_controller_1.actualizarCliente);
router.delete('/:id', (0, authorize_1.authorize)('admin', 'owner'), (0, validateUuid_1.validateUuid)('id'), customer_controller_1.eliminarCliente);
//# sourceMappingURL=customer.routes.js.map