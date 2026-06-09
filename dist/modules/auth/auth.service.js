"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createShopForExistingUserService = exports.getUserShopsService = exports.registerCustomerService = exports.loginCustomerService = exports.registerShopService = exports.selectShopService = exports.loginService = exports.firmarTokenConSesionOpcional = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = require("crypto");
const env_1 = require("../../config/env");
const AppError_1 = require("../../shared/errors/AppError");
const auth_repository_1 = require("./auth.repository");
const userSession_repository_1 = require("../users/userSession.repository");
// Genera el JWT con shop_id embebido — esto es lo que todos los middlewares validan
const signToken = (payload) => jsonwebtoken_1.default.sign(payload, env_1.env.jwt.secret, { expiresIn: env_1.env.jwt.expiresIn });
const firmarTokenConSesionOpcional = async (base, sessionMeta) => {
    const jti = (0, crypto_1.randomUUID)();
    const token = signToken({ ...base, jti });
    await (0, userSession_repository_1.crearSesionUsuario)({
        userId: base.sub,
        shopId: base.shop_id,
        jti,
        userAgent: sessionMeta?.userAgent ?? null,
        ipAddress: sessionMeta?.ipAddress ?? null,
    });
    return token;
};
exports.firmarTokenConSesionOpcional = firmarTokenConSesionOpcional;
const loginService = async (dto) => {
    const users = await (0, auth_repository_1.findUsersByEmail)(dto.email);
    if (users.length === 0) {
        throw new AppError_1.UnauthorizedError('Invalid credentials');
    }
    // Verificamos password contra el primer usuario encontrado (asumimos misma pwd para el mismo email)
    const passwordMatch = await bcryptjs_1.default.compare(dto.password, users[0].password);
    if (!passwordMatch) {
        throw new AppError_1.UnauthorizedError('Invalid credentials');
    }
    // Filtramos solo tiendas activas
    const activeShops = users.filter(u => u.is_active);
    if (activeShops.length === 0) {
        throw new AppError_1.UnauthorizedError('Account is disabled');
    }
    // Generamos un token temporal que solo contiene el email
    const token = signToken({
        sub: 'pending',
        email: dto.email,
    });
    return {
        token,
        shops: activeShops.map(u => ({
            shop_id: u.shop_id,
            shop_name: u.shop_name,
            shop_slug: u.shop_slug,
            role: u.role,
        })),
    };
};
exports.loginService = loginService;
const selectShopService = async (email, shopIdentifier, sessionMeta) => {
    const users = await (0, auth_repository_1.findUsersByEmail)(email);
    let userInShop;
    if (shopIdentifier.shopId) {
        const targetId = shopIdentifier.shopId;
        userInShop = users.find(u => u.shop_id === targetId);
    }
    else if (shopIdentifier.shopSlug) {
        const targetSlug = shopIdentifier.shopSlug.toLowerCase();
        userInShop = users.find(u => u.shop_slug.toLowerCase() === targetSlug);
    }
    if (!userInShop) {
        throw new AppError_1.UnauthorizedError('User does not belong to this shop');
    }
    if (!userInShop.is_active) {
        throw new AppError_1.UnauthorizedError('Account is disabled for this shop');
    }
    await (0, auth_repository_1.updateLastLogin)(userInShop.user_id);
    const jti = (0, crypto_1.randomUUID)();
    const token = signToken({
        sub: userInShop.user_id,
        shop_id: userInShop.shop_id,
        email: email,
        role: userInShop.role,
        jti,
    });
    await (0, userSession_repository_1.crearSesionUsuario)({
        userId: userInShop.user_id,
        shopId: userInShop.shop_id,
        jti,
        userAgent: sessionMeta?.userAgent ?? null,
        ipAddress: sessionMeta?.ipAddress ?? null,
    });
    return {
        token,
        user: {
            id: userInShop.user_id,
            name: userInShop.user_name,
            email: email,
            role: userInShop.role,
        },
        customer: {
            id: userInShop.user_id,
            name: userInShop.user_name,
            email: email,
        },
    };
};
exports.selectShopService = selectShopService;
const registerShopService = async (dto, sessionMeta) => {
    try {
        const { shopId, userId } = await (0, auth_repository_1.createShopWithOwner)(dto);
        const jti = (0, crypto_1.randomUUID)();
        const token = signToken({
            sub: userId,
            shop_id: shopId,
            email: dto.owner_email,
            role: 'owner',
            jti,
        });
        await (0, userSession_repository_1.crearSesionUsuario)({
            userId,
            shopId,
            jti,
            userAgent: sessionMeta?.userAgent ?? null,
            ipAddress: sessionMeta?.ipAddress ?? null,
        });
        return { token, shopId, userId };
    }
    catch (err) {
        // Violación de UNIQUE (slug o email duplicado)
        if (err instanceof Error &&
            'code' in err &&
            err.code === '23505') {
            throw new AppError_1.ConflictError('Shop slug or email already exists');
        }
        throw err;
    }
};
exports.registerShopService = registerShopService;
const loginCustomerService = async (dto) => {
    const customer = await (0, auth_repository_1.findCustomerByEmailAndShop)(dto.email, dto.shop_slug);
    if (!customer || !customer.password) {
        throw new AppError_1.UnauthorizedError('Invalid credentials');
    }
    if (!customer.is_active) {
        throw new AppError_1.UnauthorizedError('Account is disabled');
    }
    const passwordMatch = await bcryptjs_1.default.compare(dto.password, customer.password);
    if (!passwordMatch) {
        throw new AppError_1.UnauthorizedError('Invalid credentials');
    }
    await (0, auth_repository_1.updateCustomerLastLogin)(customer.id);
    const token = signToken({
        sub: customer.id,
        shop_id: customer.shop_id,
        email: customer.email,
        role: 'customer',
    });
    return {
        token,
        customer: {
            id: customer.id,
            name: customer.name,
            email: customer.email,
        },
    };
};
exports.loginCustomerService = loginCustomerService;
const registerCustomerService = async (dto) => {
    try {
        const { shopId, customerId } = await (0, auth_repository_1.createCustomer)(dto);
        const token = signToken({
            sub: customerId,
            shop_id: shopId,
            email: dto.email,
            role: 'customer',
        });
        return {
            token,
            customer: {
                id: customerId,
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                address: dto.address,
            },
        };
    }
    catch (err) {
        // Violación de UNIQUE (email duplicado en la misma tienda)
        if (err instanceof Error &&
            'code' in err &&
            err.code === '23505') {
            throw new AppError_1.ConflictError('Email already exists in this shop');
        }
        if (err instanceof Error && err.message === 'Shop not found') {
            throw new AppError_1.UnauthorizedError('Shop not found');
        }
        throw err;
    }
};
exports.registerCustomerService = registerCustomerService;
const getUserShopsService = async (email) => {
    const shops = await (0, auth_repository_1.findUsersByEmail)(email);
    return shops
        .filter((s) => s.is_active)
        .map((s) => ({
        shop_id: s.shop_id,
        shop_name: s.shop_name,
        shop_slug: s.shop_slug,
        role: s.role,
    }));
};
exports.getUserShopsService = getUserShopsService;
const createShopForExistingUserService = async (_userId, _userEmail, _dto, _sessionMeta) => {
    throw new AppError_1.UnauthorizedError('Use /auth/register to create a new shop in this version');
};
exports.createShopForExistingUserService = createShopForExistingUserService;
//# sourceMappingURL=auth.service.js.map