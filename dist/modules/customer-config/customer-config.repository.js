"use strict";
// ─── Customer Config Repository ──────────────────────────────────────────────
// Thin adapter: invoca stored procedures / funciones de la BD.
// Sin SQL ad-hoc sobre las tablas base.
// Funciones definidas en: database/39_fn_customer_configs.sql
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomerConfig = exports.upsertCustomerConfig = exports.findOwnCustomerConfig = exports.findCustomerConfigById = exports.findAllCustomerConfigs = void 0;
const database_1 = require("../../config/database");
const findAllCustomerConfigs = async (shopId, filter) => {
    const offset = (filter.page - 1) * filter.limit;
    const result = await (0, database_1.query)(`SELECT * FROM fn_listar_customer_configs($1, $2, $3)`, [shopId, filter.limit, offset]);
    return {
        rows: result.rows,
        total: result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0,
    };
};
exports.findAllCustomerConfigs = findAllCustomerConfigs;
const findCustomerConfigById = async (shopId, configId) => {
    const result = await (0, database_1.query)(`SELECT * FROM fn_obtener_customer_config($1, $2)`, [shopId, configId]);
    return result.rows[0] ?? null;
};
exports.findCustomerConfigById = findCustomerConfigById;
const findOwnCustomerConfig = async (shopId, customerId) => {
    const result = await (0, database_1.query)(`SELECT * FROM fn_obtener_customer_config_propia($1, $2)`, [shopId, customerId]);
    return result.rows[0] ?? null;
};
exports.findOwnCustomerConfig = findOwnCustomerConfig;
const upsertCustomerConfig = async (shopId, customerId, dto) => {
    const result = await (0, database_1.query)(`SELECT * FROM sp_upsert_customer_config($1, $2, $3, $4, $5, $6, $7, $8)`, [
        shopId,
        customerId,
        JSON.stringify(dto.services),
        JSON.stringify(dto.sub_packages),
        JSON.stringify(dto.complete_package),
        JSON.stringify(dto.payment_plan),
        JSON.stringify(dto.invoice),
        JSON.stringify(dto.estimation),
    ]);
    return result.rows[0];
};
exports.upsertCustomerConfig = upsertCustomerConfig;
const deleteCustomerConfig = async (shopId, configId) => {
    await (0, database_1.query)(`SELECT sp_eliminar_customer_config($1, $2)`, [shopId, configId]);
    return true;
};
exports.deleteCustomerConfig = deleteCustomerConfig;
//# sourceMappingURL=customer-config.repository.js.map