"use strict";
// ─── Offers Service ───────────────────────────────────────────────────────────
// Con Database-Centric Architecture, la lógica de negocio vive en los
// stored procedures de la BD. El servicio traduce errores y enriquece
// la respuesta con el estado calculado de la oferta.
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPublicOffersService = exports.deleteOfferService = exports.updateOfferService = exports.createOfferService = exports.getOfferService = exports.listOffersService = void 0;
const AppError_1 = require("../../shared/errors/AppError");
const offer_repository_1 = require("./offer.repository");
const dbErrors_1 = require("../../shared/utils/dbErrors");
const calcularStatus = (offer) => {
    if (!offer.is_active)
        return 'disabled';
    const now = new Date();
    const start = new Date(offer.starts_at);
    const end = new Date(offer.ends_at);
    if (now < start)
        return 'scheduled';
    if (now > end)
        return 'expired';
    return 'active';
};
const conStatus = (o) => ({
    ...o,
    status: calcularStatus(o),
});
const listOffersService = async (shopId, filter) => {
    const { rows, total } = await (0, offer_repository_1.findAllOffers)(shopId, filter);
    return {
        offers: rows.map(conStatus),
        meta: {
            total,
            page: filter.page,
            limit: filter.limit,
            totalPages: Math.ceil(total / filter.limit),
        },
    };
};
exports.listOffersService = listOffersService;
const getOfferService = async (shopId, offerId) => {
    const offer = await (0, offer_repository_1.findOfferById)(shopId, offerId);
    if (!offer)
        throw new AppError_1.NotFoundError('Oferta');
    return conStatus(offer);
};
exports.getOfferService = getOfferService;
const createOfferService = async (shopId, dto) => {
    try {
        return conStatus(await (0, offer_repository_1.createOffer)(shopId, dto));
    }
    catch (err) {
        throw (0, dbErrors_1.traducirErrorDB)(err, {
            CODIGO_DUPLICADO: (msg) => new AppError_1.ConflictError(`El código "${msg.split(':')[1]}" ya existe en esta tienda`),
            PRODUCTO_REQUERIDO: () => new AppError_1.ValidationError('scope=product requiere product_id'),
            CATEGORIA_REQUERIDA: () => new AppError_1.ValidationError('scope=category requiere category_id'),
            AMBITO_INVALIDO: () => new AppError_1.ValidationError('scope=storewide no admite product_id ni category_id'),
            PRODUCTO_NO_ENCONTRADO: () => new AppError_1.NotFoundError('Producto'),
            CATEGORIA_NO_ENCONTRADA: () => new AppError_1.NotFoundError('Categoría'),
        });
    }
};
exports.createOfferService = createOfferService;
const updateOfferService = async (shopId, offerId, dto) => {
    try {
        const updated = await (0, offer_repository_1.updateOffer)(shopId, offerId, dto);
        if (!updated)
            throw new AppError_1.NotFoundError('Oferta');
        return conStatus(updated);
    }
    catch (err) {
        throw (0, dbErrors_1.traducirErrorDB)(err, {
            OFFER_NOT_FOUND: () => new AppError_1.NotFoundError('Oferta'),
            CODIGO_DUPLICADO: (msg) => new AppError_1.ConflictError(`El código "${msg.split(':')[1]}" ya existe en esta tienda`),
            PRODUCTO_REQUERIDO: () => new AppError_1.ValidationError('scope=product requiere product_id'),
            CATEGORIA_REQUERIDA: () => new AppError_1.ValidationError('scope=category requiere category_id'),
            AMBITO_INVALIDO: () => new AppError_1.ValidationError('scope=storewide no admite product_id ni category_id'),
            PRODUCTO_NO_ENCONTRADO: () => new AppError_1.NotFoundError('Producto'),
            CATEGORIA_NO_ENCONTRADA: () => new AppError_1.NotFoundError('Categoría'),
        });
    }
};
exports.updateOfferService = updateOfferService;
const deleteOfferService = async (shopId, offerId) => {
    try {
        await (0, offer_repository_1.softDeleteOffer)(shopId, offerId);
    }
    catch (err) {
        throw (0, dbErrors_1.traducirErrorDB)(err, {
            OFFER_NOT_FOUND: () => new AppError_1.NotFoundError('Oferta'),
        });
    }
};
exports.deleteOfferService = deleteOfferService;
const listPublicOffersService = async (shopId) => {
    return (0, offer_repository_1.findPublicOffers)(shopId);
};
exports.listPublicOffersService = listPublicOffersService;
//# sourceMappingURL=offer.service.js.map