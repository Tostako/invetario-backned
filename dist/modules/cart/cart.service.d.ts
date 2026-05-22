import { findCartItems } from './cart.repository';
import { AgregarItemDto, ActualizarItemDto, CartItem, CartResumen } from './cart.types';
export declare const agregarAlCarritoService: (shopId: string, customerId: string, dto: AgregarItemDto) => Promise<CartItem>;
export declare const verCarritoService: (shopId: string, customerId: string) => Promise<CartResumen>;
export declare const actualizarItemService: (shopId: string, customerId: string, itemId: string, dto: ActualizarItemDto) => Promise<CartItem>;
export declare const eliminarItemService: (shopId: string, customerId: string, itemId: string) => Promise<void>;
export declare const vaciarCarritoService: (shopId: string, customerId: string) => Promise<void>;
export { findCartItems };
//# sourceMappingURL=cart.service.d.ts.map