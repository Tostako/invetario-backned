import { Payment } from './payment.types';
interface InsertarPagoParams {
    shopId: string;
    orderId: string;
    method: string;
    transactionAmount: number;
    status: string;
    statusDetail: string | null;
    notes: string | null;
}
export declare const insertarPago: (params: InsertarPagoParams) => Promise<Payment>;
export declare const actualizarEstadoPago: (shopId: string, paymentId: string, status: string, statusDetail: string | null) => Promise<Payment | null>;
export declare const findPaymentByOrder: (shopId: string, orderId: string) => Promise<Payment | null>;
export declare const findPaymentById: (shopId: string, paymentId: string) => Promise<Payment | null>;
export declare const listarPagosPorTienda: (shopId: string, limit?: number, offset?: number) => Promise<Payment[]>;
export {};
//# sourceMappingURL=payment.repository.d.ts.map