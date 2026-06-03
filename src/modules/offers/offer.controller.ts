import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { sendSuccess, sendCreated } from '../../shared/utils/response';
import {
  CreateOfferSchema,
  UpdateOfferSchema,
  OfferFilterSchema,
} from './offer.types';
import {
  listOffersService,
  getOfferService,
  createOfferService,
  updateOfferService,
  deleteOfferService,
} from './offer.service';

// Los controllers son delgados: parsear → llamar service → responder.
// No contienen lógica de negocio ni queries SQL.

export const listOffers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filter = OfferFilterSchema.parse(req.query);
    const { offers, meta } = await listOffersService(req.user.shop_id, filter);
    sendSuccess(res, offers, 200, meta);
  } catch (err) {
    next(err);
  }
};

export const getOffer = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const offer = await getOfferService(req.user.shop_id, req.params['id']!);
    sendSuccess(res, offer);
  } catch (err) {
    next(err);
  }
};

export const createOffer = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto = CreateOfferSchema.parse(req.body);
    const offer = await createOfferService(req.user.shop_id, dto);
    sendCreated(res, offer);
  } catch (err) {
    next(err);
  }
};

export const updateOffer = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto = UpdateOfferSchema.parse(req.body);
    const offer = await updateOfferService(req.user.shop_id, req.params['id']!, dto);
    sendSuccess(res, offer);
  } catch (err) {
    next(err);
  }
};

export const deleteOffer = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await deleteOfferService(req.user.shop_id, req.params['id']!);
    sendSuccess(res, { message: 'Offer deactivated successfully' });
  } catch (err) {
    next(err);
  }
};
