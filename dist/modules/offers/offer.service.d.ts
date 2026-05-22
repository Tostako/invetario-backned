import { PaginationMeta } from '../../shared/types';
import { CreateOfferDto, UpdateOfferDto, OfferFilter, OfferWithStatus, PublicOffer } from './offer.types';
export declare const listOffersService: (shopId: string, filter: OfferFilter) => Promise<{
    offers: OfferWithStatus[];
    meta: PaginationMeta;
}>;
export declare const getOfferService: (shopId: string, offerId: string) => Promise<OfferWithStatus>;
export declare const createOfferService: (shopId: string, dto: CreateOfferDto) => Promise<OfferWithStatus>;
export declare const updateOfferService: (shopId: string, offerId: string, dto: UpdateOfferDto) => Promise<OfferWithStatus>;
export declare const deleteOfferService: (shopId: string, offerId: string) => Promise<void>;
export declare const listPublicOffersService: (shopId: string) => Promise<PublicOffer[]>;
//# sourceMappingURL=offer.service.d.ts.map