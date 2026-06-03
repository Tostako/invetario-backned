"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertOwnCustomerConfig = exports.getOwnCustomerConfig = exports.deleteCustomerConfig = exports.getCustomerConfig = exports.listCustomerConfigs = void 0;
const response_1 = require("../../shared/utils/response");
const customer_config_types_1 = require("./customer-config.types");
const customer_config_service_1 = require("./customer-config.service");
// Helper: si el usuario es customer, devuelve su customer_id
const getCustomerId = (req) => {
    return req.user.role === 'customer' ? req.user.customer_id : undefined;
};
// ─── Admin Controllers ───────────────────────────────────────────────────────
const listCustomerConfigs = async (req, res, next) => {
    try {
        const filter = customer_config_types_1.CustomerConfigFilterSchema.parse(req.query);
        const { configs, meta } = await (0, customer_config_service_1.listCustomerConfigsService)(req.user.shop_id, filter);
        (0, response_1.sendSuccess)(res, configs, 200, meta);
    }
    catch (err) {
        next(err);
    }
};
exports.listCustomerConfigs = listCustomerConfigs;
const getCustomerConfig = async (req, res, next) => {
    try {
        const customerId = getCustomerId(req);
        const config = await (0, customer_config_service_1.getCustomerConfigService)(req.user.shop_id, req.params['id'], customerId);
        (0, response_1.sendSuccess)(res, config);
    }
    catch (err) {
        next(err);
    }
};
exports.getCustomerConfig = getCustomerConfig;
const deleteCustomerConfig = async (req, res, next) => {
    try {
        await (0, customer_config_service_1.deleteCustomerConfigService)(req.user.shop_id, req.params['id']);
        (0, response_1.sendSuccess)(res, { message: 'Customer config deleted successfully' });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteCustomerConfig = deleteCustomerConfig;
// ─── Customer Controllers ────────────────────────────────────────────────────
const getOwnCustomerConfig = async (req, res, next) => {
    try {
        const customerId = req.user.customer_id;
        if (!customerId) {
            res.status(403).json({ success: false, message: 'Only customers have configs' });
            return;
        }
        const config = await (0, customer_config_service_1.getOwnCustomerConfigService)(req.user.shop_id, customerId);
        (0, response_1.sendSuccess)(res, config);
    }
    catch (err) {
        next(err);
    }
};
exports.getOwnCustomerConfig = getOwnCustomerConfig;
const upsertOwnCustomerConfig = async (req, res, next) => {
    try {
        const customerId = req.user.customer_id;
        if (!customerId) {
            res.status(403).json({ success: false, message: 'Only customers can manage their config' });
            return;
        }
        const dto = customer_config_types_1.UpsertCustomerConfigSchema.parse(req.body);
        const config = await (0, customer_config_service_1.upsertOwnCustomerConfigService)(req.user.shop_id, customerId, dto);
        (0, response_1.sendSuccess)(res, config, 200);
    }
    catch (err) {
        next(err);
    }
};
exports.upsertOwnCustomerConfig = upsertOwnCustomerConfig;
//# sourceMappingURL=customer-config.controller.js.map