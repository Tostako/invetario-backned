import { PaginationMeta } from '../../shared/types';
import { CreateQuoteDto, UpdateQuoteDto, QuoteFilter, Quote } from './quote.types';
import { Payment } from '../payments/payment.types';
export declare const listQuotesService: (shopId: string, filter: QuoteFilter, customerId?: string) => Promise<{
    quotes: Quote[];
    meta: PaginationMeta;
}>;
export declare const getQuoteService: (shopId: string, quoteId: string, customerId?: string) => Promise<Quote>;
export declare const createQuoteService: (shopId: string, customerId: string, dto: CreateQuoteDto) => Promise<Quote>;
export declare const updateQuoteService: (shopId: string, quoteId: string, dto: UpdateQuoteDto, customerId?: string) => Promise<Quote>;
export declare const deleteQuoteService: (shopId: string, quoteId: string, customerId?: string) => Promise<void>;
export declare const selectPlanForQuoteService: (shopId: string, quoteId: string, planId: string | null, customerId?: string) => Promise<Quote>;
export declare const registrarPagoManualService: (shopId: string, quoteId: string, method: string, amount: number, installmentIdx: number | null, notes: string | null, userId: string | null, customerId?: string) => Promise<Payment>;
export declare const listQuotePaymentsService: (shopId: string, quoteId: string, customerId?: string) => Promise<Payment[]>;
//# sourceMappingURL=quote.service.d.ts.map