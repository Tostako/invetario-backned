import { AgregarItemDto, CartItem } from './cart.types';
export declare const findCartItems: (shopId: string, customerId: string) => Promise<CartItem[]>;
export declare const findCartItem: (shopId: string, customerId: string, itemId: string) => Promise<CartItem | null>;
export declare const upsertCartItem: (shopId: string, customerId: string, dto: AgregarItemDto) => Promise<CartItem>;
export declare const updateCartItemQuantity: (shopId: string, customerId: string, itemId: string, quantity: number) => Promise<CartItem | null>;
export declare const deleteCartItem: (shopId: string, customerId: string, itemId: string) => Promise<boolean>;
export declare const clearCart: (shopId: string, customerId: string) => Promise<void>;
//# sourceMappingURL=cart.repository.d.ts.map