"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdditionalShop = exports.switchShop = exports.getUserShops = exports.registerCustomer = exports.loginCustomer = exports.registerShop = exports.selectShop = exports.login = void 0;
const auth_types_1 = require("./auth.types");
const auth_service_1 = require("./auth.service");
const response_1 = require("../../shared/utils/response");
const pickSessionMeta = (req) => ({
    userAgent: req.get('user-agent') ?? null,
    ipAddress: (() => {
        const xff = req.headers['x-forwarded-for'];
        if (typeof xff === 'string' && xff.length > 0) {
            return xff.split(',')[0].trim();
        }
        return req.socket.remoteAddress ?? null;
    })(),
});
// Los controllers solo parsean input, llaman al service y formatean la respuesta
const login = async (req, res, next) => {
    try {
        const dto = auth_types_1.LoginSchema.parse(req.body);
        const result = await (0, auth_service_1.loginService)(dto);
        (0, response_1.sendSuccess)(res, result);
    }
    catch (err) {
        next(err);
    }
};
exports.login = login;
const selectShop = async (req, res, next) => {
    try {
        const { shop_id } = auth_types_1.SelectShopSchema.parse(req.body);
        const result = await (0, auth_service_1.selectShopService)(req.user.email, shop_id, pickSessionMeta(req));
        (0, response_1.sendSuccess)(res, result);
    }
    catch (err) {
        next(err);
    }
};
exports.selectShop = selectShop;
const registerShop = async (req, res, next) => {
    try {
        const dto = auth_types_1.RegisterShopSchema.parse(req.body);
        const result = await (0, auth_service_1.registerShopService)(dto, pickSessionMeta(req));
        (0, response_1.sendCreated)(res, result);
    }
    catch (err) {
        next(err);
    }
};
exports.registerShop = registerShop;
const loginCustomer = async (req, res, next) => {
    try {
        const dto = auth_types_1.LoginCustomerSchema.parse(req.body);
        const result = await (0, auth_service_1.loginCustomerService)(dto);
        (0, response_1.sendSuccess)(res, result);
    }
    catch (err) {
        next(err);
    }
};
exports.loginCustomer = loginCustomer;
const registerCustomer = async (req, res, next) => {
    try {
        const dto = auth_types_1.RegisterCustomerSchema.parse(req.body);
        const result = await (0, auth_service_1.registerCustomerService)(dto);
        (0, response_1.sendCreated)(res, result);
    }
    catch (err) {
        next(err);
    }
};
exports.registerCustomer = registerCustomer;
const getUserShops = async (req, res, next) => {
    try {
        const result = await (0, auth_service_1.getUserShopsService)(req.user.email);
        (0, response_1.sendSuccess)(res, result);
    }
    catch (err) {
        next(err);
    }
};
exports.getUserShops = getUserShops;
const switchShop = async (req, res, next) => {
    try {
        const { shop_id } = auth_types_1.SelectShopSchema.parse(req.body);
        const result = await (0, auth_service_1.selectShopService)(req.user.email, shop_id, pickSessionMeta(req));
        (0, response_1.sendSuccess)(res, result);
    }
    catch (err) {
        next(err);
    }
};
exports.switchShop = switchShop;
const createAdditionalShop = async (req, res, next) => {
    try {
        const dto = auth_types_1.CreateAdditionalShopSchema.parse(req.body);
        const result = await (0, auth_service_1.createShopForExistingUserService)(req.user.id, req.user.email, dto, pickSessionMeta(req));
        (0, response_1.sendCreated)(res, result);
    }
    catch (err) {
        next(err);
    }
};
exports.createAdditionalShop = createAdditionalShop;
//# sourceMappingURL=auth.controller.js.map