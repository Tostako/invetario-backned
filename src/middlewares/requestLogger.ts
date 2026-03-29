import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

// Logger estructurado en JSON para facilitar la ingesta en servicios como
// Datadog, Logtail o el panel de logs de Supabase.
// En desarrollo imprime una línea legible por humanos.
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();

  res.on('finish', () => {
    const ms = Date.now() - start;
    const shopId = req.user?.shop_id ?? 'unauthenticated';

    if (env.isDev) {
      const color = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
      console.log(
        `${color}[${res.statusCode}]\x1b[0m ${req.method} ${req.originalUrl} — ${ms}ms (shop: ${shopId})`
      );
    } else {
      // Producción: JSON estricto, sin datos sensibles
      console.log(JSON.stringify({
        ts: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        ms,
        shop_id: shopId,
        ip: req.ip,
      }));
    }
  });

  next();
};
