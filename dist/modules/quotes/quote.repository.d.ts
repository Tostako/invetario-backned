import { CreateQuoteDto, UpdateQuoteDto, QuoteFilter, Quote } from './quote.types';
import { Payment } from '../payments/payment.types';
interface FindAllResult {
    rows: Quote[];
    total: number;
}
export declare const findAllQuotes: (shopId: string, filter: QuoteFilter, customerId?: string) => Promise<FindAllResult>;
export declare const findQuoteById: (shopId: string, quoteId: string) => Promise<Quote | null>;
export declare const createQuote: (shopId: string, customerId: string, dto: CreateQuoteDto) => Promise<Quote>;
export declare const updateQuote: (shopId: string, quoteId: string, dto: UpdateQuoteDto) => Promise<Quote | null>;
export declare const deleteQuote: (shopId: string, quoteId: string) => Promise<boolean>;
export declare const asignarPlanACotizacion: (shopId: string, quoteId: string, planId: string | null) => Promise<Quote>;
export declare const registrarPagoManual: (shopId: string, quoteId: string, method: string, amount: number, installmentIdx: number | null, notes: string | null, userId: string | null) => Promise<Payment>;
export declare const findPaymentsByQuote: (shopId: string, quoteId: string) => Promise<Payment[]>;
export {};
//# sourceMappingURL=quote.repository.d.ts.map