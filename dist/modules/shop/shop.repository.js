"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarTienda = exports.actualizarTienda = exports.obtenerTiendaPorId = void 0;
const database_1 = require("../../config/database");
const mapRow = (row) => ({
    id: String(row['id']),
    name: String(row['name']),
    slug: String(row['slug']),
    email: String(row['email']),
    phone: row['phone'] != null ? String(row['phone']) : null,
    address: row['address'] != null ? String(row['address']) : null,
    description: row['description'] != null ? String(row['description']) : null,
    logo_url: row['logo_url'] != null ? String(row['logo_url']) : null,
    currency: String(row['currency']),
    timezone: String(row['timezone']),
    vat_rate: parseFloat(String(row['vat_rate'])),
    min_order_amount: parseFloat(String(row['min_order_amount'])),
    is_active: Boolean(row['is_active']),
    plan: String(row['plan']),
    created_at: row['created_at'] instanceof Date
        ? row['created_at'].toISOString()
        : String(row['created_at']),
    updated_at: row['updated_at'] instanceof Date
        ? row['updated_at'].toISOString()
        : String(row['updated_at']),
});
const obtenerTiendaPorId = async (shopId) => {
    const r = await (0, database_1.query)(`SELECT id, name, slug, email, phone, address, description, logo_url,
            currency, timezone, vat_rate, min_order_amount, is_active, plan, created_at, updated_at
     FROM shops WHERE id = $1`, [shopId]);
    const row = r.rows[0];
    return row ? mapRow(row) : null;
};
exports.obtenerTiendaPorId = obtenerTiendaPorId;
const actualizarTienda = async (shopId, dto) => {
    const sets = [];
    const vals = [];
    let i = 1;
    const add = (col, v) => {
        sets.push(`${col} = $${i++}`);
        vals.push(v);
    };
    if (dto.name !== undefined)
        add('name', dto.name);
    if (dto.phone !== undefined)
        add('phone', dto.phone);
    if (dto.email !== undefined)
        add('email', dto.email.toLowerCase());
    if (dto.address !== undefined)
        add('address', dto.address);
    if (dto.description !== undefined)
        add('description', dto.description);
    if (dto.currency !== undefined)
        add('currency', dto.currency);
    if (dto.timezone !== undefined)
        add('timezone', dto.timezone);
    if (dto.vat_rate !== undefined)
        add('vat_rate', dto.vat_rate);
    if (dto.min_order_amount !== undefined)
        add('min_order_amount', dto.min_order_amount);
    if (dto.logo_url !== undefined)
        add('logo_url', dto.logo_url);
    if (sets.length === 0)
        return (0, exports.obtenerTiendaPorId)(shopId);
    vals.push(shopId);
    const r = await (0, database_1.query)(`UPDATE shops SET ${sets.join(', ')}
     WHERE id = $${i}
     RETURNING id, name, slug, email, phone, address, description, logo_url,
               currency, timezone, vat_rate, min_order_amount, is_active, plan, created_at, updated_at`, vals);
    const row = r.rows[0];
    return row ? mapRow(row) : null;
};
exports.actualizarTienda = actualizarTienda;
const eliminarTienda = async (shopId) => {
    await (0, database_1.query)(`SELECT sp_desactivar_tienda($1)`, [shopId]);
};
exports.eliminarTienda = eliminarTienda;
//# sourceMappingURL=shop.repository.js.map