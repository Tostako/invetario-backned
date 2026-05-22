"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOffer = exports.updateOffer = exports.createOffer = exports.getOffer = exports.listOffers = void 0;
const response_1 = require("../../shared/utils/response");
const offer_types_1 = require("./offer.types");
const offer_service_1 = require("./offer.service");
// Los controllers son delgados: parsear → llamar service → responder.
// No contienen lógica de negocio ni queries SQL.
const listOffers = async (req, res, next) => {
    try {
        const filter = offer_types_1.OfferFilterSchema.parse(req.query);
        const { offers, meta } = await (0, offer_service_1.listOffersService)(req.user.shop_id, filter);
        (0, response_1.sendSuccess)(res, offers, 200, meta);
    }
    catch (err) {
        next(err);
    }
};
exports.listOffers = listOffers;
const getOffer = async (req, res, next) => {
    try {
        const offer = await (0, offer_service_1.getOfferService)(req.user.shop_id, req.params['id']);
        (0, response_1.sendSuccess)(res, offer);
    }
    catch (err) {
        next(err);
    }
};
exports.getOffer = getOffer;
const createOffer = async (req, res, next) => {
    try {
        const dto = offer_types_1.CreateOfferSchema.parse(req.body);
        const offer = await (0, offer_service_1.createOfferService)(req.user.shop_id, dto);
        (0, response_1.sendCreated)(res, offer);
    }
    catch (err) {
        next(err);
    }
};
exports.createOffer = createOffer;
const updateOffer = async (req, res, next) => {
    try {
        const dto = offer_types_1.UpdateOfferSchema.parse(req.body);
        const offer = await (0, offer_service_1.updateOfferService)(req.user.shop_id, req.params['id'], dto);
        (0, response_1.sendSuccess)(res, offer);
    }
    catch (err) {
        next(err);
    }
};
exports.updateOffer = updateOffer;
const deleteOffer = async (req, res, next) => {
    try {
        await (0, offer_service_1.deleteOfferService)(req.user.shop_id, req.params['id']);
        (0, response_1.sendSuccess)(res, { message: 'Offer deactivated successfully' });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteOffer = deleteOffer;
//# sourceMappingURL=offer.controller.js.map