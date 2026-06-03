"use strict";
// ─── Customer Config Service ─────────────────────────────────────────────────
// Traduce errores de BD. Admin ve todas, customer solo la suya.
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomerConfigService = exports.upsertOwnCustomerConfigService = exports.getOwnCustomerConfigService = exports.getCustomerConfigService = exports.listCustomerConfigsService = void 0;
const AppError_1 = require("../../shared/errors/AppError");
const customer_config_repository_1 = require("./customer-config.repository");
const database_1 = require("../../config/database");
const dbErrors_1 = require("../../shared/utils/dbErrors");
const listCustomerConfigsService = async (shopId, filter) => {
    const { rows, total } = await (0, customer_config_repository_1.findAllCustomerConfigs)(shopId, filter);
    return {
        configs: rows,
        meta: {
            total,
            page: filter.page,
            limit: filter.limit,
            totalPages: Math.ceil(total / filter.limit),
        },
    };
};
exports.listCustomerConfigsService = listCustomerConfigsService;
const getCustomerConfigService = async (shopId, configId, customerId) => {
    const config = await (0, customer_config_repository_1.findCustomerConfigById)(shopId, configId);
    if (!config)
        throw new AppError_1.NotFoundError('Configuración de customer');
    // Si es customer, verificar que sea suya
    if (customerId && config.customer_id !== customerId) {
        throw new AppError_1.ForbiddenError('No puedes ver configuraciones de otros clientes');
    }
    // Buscar los detalles de perfil del customer para adjuntarlos
    const customerResult = await (0, database_1.query)('SELECT id, name, email, phone, address FROM customers WHERE id = $1 AND shop_id = $2', [config.customer_id, shopId]);
    return {
        ...config,
        customer: customerResult.rows[0] ?? null,
    };
};
exports.getCustomerConfigService = getCustomerConfigService;
const getOwnCustomerConfigService = async (shopId, customerId) => {
    let config = await (0, customer_config_repository_1.findOwnCustomerConfig)(shopId, customerId);
    if (!config) {
        // Si no existe configuración previa, la creamos automáticamente con valores vacíos por defecto
        config = await (0, customer_config_repository_1.upsertCustomerConfig)(shopId, customerId, {
            services: {},
            sub_packages: {},
            complete_package: {},
            payment_plan: {},
            invoice: {},
            estimation: {},
        });
    }
    // Buscar los detalles de perfil del customer para adjuntarlos
    const customerResult = await (0, database_1.query)('SELECT id, name, email, phone, address FROM customers WHERE id = $1 AND shop_id = $2', [customerId, shopId]);
    return {
        ...config,
        customer: customerResult.rows[0] ?? null,
    };
};
exports.getOwnCustomerConfigService = getOwnCustomerConfigService;
const upsertOwnCustomerConfigService = async (shopId, customerId, dto) => {
    return await (0, customer_config_repository_1.upsertCustomerConfig)(shopId, customerId, dto);
};
exports.upsertOwnCustomerConfigService = upsertOwnCustomerConfigService;
const deleteCustomerConfigService = async (shopId, configId) => {
    try {
        await (0, customer_config_repository_1.deleteCustomerConfig)(shopId, configId);
    }
    catch (err) {
        throw (0, dbErrors_1.traducirErrorDB)(err, {
            CUSTOMER_CONFIG_NOT_FOUND: () => new AppError_1.NotFoundError('Configuración de customer'),
        });
    }
};
exports.deleteCustomerConfigService = deleteCustomerConfigService;
//# sourceMappingURL=customer-config.service.js.map