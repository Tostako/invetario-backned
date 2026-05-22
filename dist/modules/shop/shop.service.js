"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarTiendaService = exports.subirLogoTiendaService = exports.actualizarTiendaService = exports.obtenerTiendaService = void 0;
const AppError_1 = require("../../shared/errors/AppError");
const shop_repository_1 = require("./shop.repository");
const auth_repository_1 = require("../auth/auth.repository");
const auth_service_1 = require("../auth/auth.service");
const supabase_1 = require("../../config/supabase");
const path_1 = __importDefault(require("path"));
const obtenerTiendaService = async (shopId) => {
    const tienda = await (0, shop_repository_1.obtenerTiendaPorId)(shopId);
    if (!tienda)
        throw new AppError_1.NotFoundError('Tienda');
    return tienda;
};
exports.obtenerTiendaService = obtenerTiendaService;
const actualizarTiendaService = async (shopId, dto) => {
    const tienda = await (0, shop_repository_1.actualizarTienda)(shopId, dto);
    if (!tienda)
        throw new AppError_1.NotFoundError('Tienda');
    return tienda;
};
exports.actualizarTiendaService = actualizarTiendaService;
const subirLogoTiendaService = async (shopId, file) => {
    const fileName = `${shopId}/${Date.now()}-${path_1.default.basename(file.originalname)}`;
    const { data, error } = await supabase_1.supabase.storage
        .from('shop-logos')
        .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
    });
    if (error) {
        throw new Error(`Supabase Storage error: ${error.message}`);
    }
    const { data: publicData } = supabase_1.supabase.storage
        .from('shop-logos')
        .getPublicUrl(data.path);
    const tienda = await (0, shop_repository_1.actualizarTienda)(shopId, { logo_url: publicData.publicUrl });
    if (!tienda)
        throw new AppError_1.NotFoundError('Tienda');
    return tienda;
};
exports.subirLogoTiendaService = subirLogoTiendaService;
const eliminarTiendaService = async (shopId, userEmail, sessionMeta) => {
    // 1. Desactivamos la tienda actual
    await (0, shop_repository_1.eliminarTienda)(shopId);
    // 2. Buscamos si el usuario tiene otras tiendas activas
    const allUserShops = await (0, auth_repository_1.findUsersByEmail)(userEmail);
    const otherActiveShops = allUserShops.filter((u) => u.shop_id !== shopId && u.is_active);
    if (otherActiveShops.length > 0) {
        // 3. Si tiene otra tienda, generamos un nuevo token para la primera que encontremos
        const nextShop = otherActiveShops[0];
        const newToken = await (0, auth_service_1.firmarTokenConSesionOpcional)({
            sub: nextShop.user_id,
            shop_id: nextShop.shop_id,
            email: userEmail,
            role: nextShop.role,
        }, sessionMeta);
        return {
            deletedShopId: shopId,
            switchedTo: {
                token: newToken,
                shopId: nextShop.shop_id,
                shopName: nextShop.shop_name,
                userId: nextShop.user_id,
            },
        };
    }
    // 4. Si no tiene más tiendas
    return {
        deletedShopId: shopId,
        switchedTo: null,
    };
};
exports.eliminarTiendaService = eliminarTiendaService;
//# sourceMappingURL=shop.service.js.map