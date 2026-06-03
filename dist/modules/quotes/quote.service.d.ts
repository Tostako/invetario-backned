import { PaginationMeta } from '../../shared/types';
import { CreateQuoteDto, UpdateQuoteDto, QuoteFilter, Quote } from './quote.types';
export declare const listQuotesService: (shopId: string, filter: QuoteFilter, customerId?: string) => Promise<{
    quotes: Quote[];
    meta: PaginationMeta;
}>;
export declare const getQuoteService: (shopId: string, quoteId: string, customerId?: string) => Promise<Quote>;
export declare const createQuoteService: (shopId: string, customerId: string, dto: CreateQuoteDto) => Promise<Quote>;
export declare const updateQuoteService: (shopId: string, quoteId: string, dto: UpdateQuoteDto, customerId?: string) => Promise<Quote>;
export declare const deleteQuoteService: (shopId: string, quoteId: string, customerId?: string) => Promise<void>;
//# sourceMappingURL=quote.service.d.ts.map