import { z } from 'zod';

export const TopProductsQuerySchema = z.object({
  orden: z.enum(['unidades', 'ingresos']).default('unidades'),
  limite: z.coerce.number().int().min(1).max(50).default(10),
});

export type TopProductsQuery = z.infer<typeof TopProductsQuerySchema>;

export interface ResumenDashboard {
  total_pedidos: number;
  total_ventas: number;
  total_productos_activos: number;
  alertas_stock: number;
  clientes_nuevos_mes: number;
  pedidos_mes: number;
  ingresos_mes: number;
}

export interface IngresosMes {
  ingresos_mes: number;
  mes: string;
}

export interface PedidosMes {
  pedidos_mes: number;
  mes: string;
}

export interface VentaDiaSemana {
  fecha: string;
  dia_semana: number;
  nombre_dia: string;
  ventas: number;
  pedidos: number;
}

export interface EstadoPedidosFila {
  status: string;
  total: number;
}

export interface ProductoTop {
  product_id: string;
  sku: string;
  name: string;
  unidades_vendidas: number;
  ingresos_generados: number;
}
