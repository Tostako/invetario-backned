import { Request } from 'express';

export type UserRole = 'owner' | 'admin' | 'staff' | 'customer' | 'superadmin';

// Augmentación global del Request de Express.
// Esto permite que todos los handlers usen req.user sin castings manuales.
// authenticate.ts es el responsable de poblar este campo.
declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        shop_id: string;       // OBLIGATORIO para roles de tienda; vacío '' para superadmin o pending
        email: string;
        role: UserRole;
        customer_id?: string;  // ID en tabla customers (customer directo o vinculado por email)
        /** Presente en JWT de empleados tras login; usado para revocar sesiones. */
        jti?: string;
      };
    }
  }
}

// Alias tipado para handlers que requieren autenticación previa
export type AuthenticatedRequest = Request;

// Respuesta JSON estándar para toda la API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
}
