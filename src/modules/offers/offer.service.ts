// ─── Offers Service ───────────────────────────────────────────────────────────
// Con Database-Centric Architecture, la lógica de negocio vive en los
// stored procedures de la BD. El servicio traduce errores y enriquece
// la respuesta con el estado calculado de la oferta.
// ─────────────────────────────────────────────────────────────────────────────

import { NotFoundError, ConflictError, ValidationError } from '../../shared/errors/AppError';
import { PaginationMeta } from '../../shared/types';
import {
  findAllOffers,
  findOfferById,
  createOffer,
  updateOffer,
  softDeleteOffer,
  findPublicOffers,
} from './offer.repository';
import {
  CreateOfferDto,
  UpdateOfferDto,
  OfferFilter,
  Offer,
  OfferWithStatus,
  PublicOffer,
} from './offer.types';
import { traducirErrorDB } from '../../shared/utils/dbErrors';

const calcularStatus = (offer: Offer): OfferWithStatus['status'] => {
  if (!offer.is_active) return 'disabled';
  const now = new Date();
  const start = new Date(offer.starts_at);
  const end = new Date(offer.ends_at);
  if (now < start) return 'scheduled';
  if (now > end) return 'expired';
  return 'active';
};

const conStatus = (o: Offer): OfferWithStatus => ({
  ...o,
  status: calcularStatus(o),
});

export const listOffersService = async (
  shopId: string,
  filter: OfferFilter
): Promise<{ offers: OfferWithStatus[]; meta: PaginationMeta }> => {
  const { rows, total } = await findAllOffers(shopId, filter);
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

export const getOfferService = async (
  shopId: string,
  offerId: string
): Promise<OfferWithStatus> => {
  const offer = await findOfferById(shopId, offerId);
  if (!offer) throw new NotFoundError('Oferta');
  return conStatus(offer);
};

export const createOfferService = async (
  shopId: string,
  dto: CreateOfferDto
): Promise<OfferWithStatus> => {
  try {
    return conStatus(await createOffer(shopId, dto));
  } catch (err) {
    throw traducirErrorDB(err, {
      CODIGO_DUPLICADO: (msg) => new ConflictError(`El código "${msg.split(':')[1]}" ya existe en esta tienda`),
      PRODUCTO_REQUERIDO: () => new ValidationError('scope=product requiere product_id'),
      CATEGORIA_REQUERIDA: () => new ValidationError('scope=category requiere category_id'),
      AMBITO_INVALIDO: () => new ValidationError('scope=storewide no admite product_id ni category_id'),
      PRODUCTO_NO_ENCONTRADO: () => new NotFoundError('Producto'),
      CATEGORIA_NO_ENCONTRADA: () => new NotFoundError('Categoría'),
    });
  }
};

export const updateOfferService = async (
  shopId: string,
  offerId: string,
  dto: UpdateOfferDto
): Promise<OfferWithStatus> => {
  try {
    const updated = await updateOffer(shopId, offerId, dto);
    if (!updated) throw new NotFoundError('Oferta');
    return conStatus(updated);
  } catch (err) {
    throw traducirErrorDB(err, {
      OFFER_NOT_FOUND: () => new NotFoundError('Oferta'),
      CODIGO_DUPLICADO: (msg) => new ConflictError(`El código "${msg.split(':')[1]}" ya existe en esta tienda`),
      PRODUCTO_REQUERIDO: () => new ValidationError('scope=product requiere product_id'),
      CATEGORIA_REQUERIDA: () => new ValidationError('scope=category requiere category_id'),
      AMBITO_INVALIDO: () => new ValidationError('scope=storewide no admite product_id ni category_id'),
      PRODUCTO_NO_ENCONTRADO: () => new NotFoundError('Producto'),
      CATEGORIA_NO_ENCONTRADA: () => new NotFoundError('Categoría'),
    });
  }
};

export const deleteOfferService = async (
  shopId: string,
  offerId: string
): Promise<void> => {
  try {
    await softDeleteOffer(shopId, offerId);
  } catch (err) {
    throw traducirErrorDB(err, {
      OFFER_NOT_FOUND: () => new NotFoundError('Oferta'),
    });
  }
};

export const listPublicOffersService = async (
  shopId: string
): Promise<PublicOffer[]> => {
  return findPublicOffers(shopId);
};
