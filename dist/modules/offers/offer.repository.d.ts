import { CreateOfferDto, UpdateOfferDto, OfferFilter, Offer, PublicOffer } from './offer.types';
interface FindAllResult {
    rows: Offer[];
    total: number;
}
export declare const findAllOffers: (shopId: string, filter: OfferFilter) => Promise<FindAllResult>;
export declare const findOfferById: (shopId: string, offerId: string) => Promise<Offer | null>;
export declare const createOffer: (shopId: string, dto: CreateOfferDto) => Promise<Offer>;
export declare const updateOffer: (shopId: string, offerId: string, dto: UpdateOfferDto) => Promise<Offer | null>;
export declare const softDeleteOffer: (shopId: string, offerId: string) => Promise<boolean>;
export declare const findPublicOffers: (shopId: string) => Promise<PublicOffer[]>;
export {};
//# sourceMappingURL=offer.repository.d.ts.map