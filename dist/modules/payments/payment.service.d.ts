import { RegistrarPagoDto, ActualizarPagoDto, Payment } from './payment.types';
export declare const registrarPagoService: (shopId: string, customerId: string | undefined, dto: RegistrarPagoDto) => Promise<Payment>;
export declare const obtenerPagoService: (shopId: string, paymentId: string) => Promise<Payment>;
export declare const obtenerPagoPorOrdenService: (shopId: string, orderId: string) => Promise<Payment | null>;
export declare const listarPagosService: (shopId: string, page?: number, limit?: number) => Promise<Payment[]>;
export declare const actualizarPagoService: (shopId: string, paymentId: string, dto: ActualizarPagoDto) => Promise<Payment>;
//# sourceMappingURL=payment.service.d.ts.map