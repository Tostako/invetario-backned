import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

type LoggedErrorInfo = {
  code?: string;
  message?: string;
  fields?: string[];
  details?: string;
};

// Logger estructurado. En desarrollo imprime una linea legible y, si la
// respuesta fue error, agrega el motivo que preparo errorHandler.
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();

  res.on('finish', () => {
    const ms = Date.now() - start;
    const shopId = req.user?.shop_id ?? (() => {
      if (req.method === 'POST' && (req.originalUrl.includes('/auth/register') || req.originalUrl.includes('/admin/shops'))) {
        return `pending: ${req.body?.shop_slug ?? 'new'}`;
      }
      return 'unauthenticated';
    })();
    const errorInfo = res.locals['errorInfo'] as LoggedErrorInfo | undefined;

    if (env.isDev) {
      const color = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
      const errorSuffix = errorInfo
        ? ` - ${errorInfo.code ?? 'ERROR'}: ${errorInfo.message ?? ''}${
            errorInfo.fields?.length ? ` (${errorInfo.fields.join('; ')})` : ''
          }${errorInfo.details ? ` [${errorInfo.details}]` : ''}`
        : '';

      console.log(
        `${color}[${res.statusCode}]\x1b[0m ${req.method} ${req.originalUrl} - ${ms}ms (shop: ${shopId})${errorSuffix}`
      );
    } else {
      console.log(JSON.stringify({
        ts: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        ms,
        shop_id: shopId,
        ip: req.ip,
        ...(errorInfo && {
          error_code: errorInfo.code,
          error_message: errorInfo.message,
          error_fields: errorInfo.fields,
        }),
      }));
    }
  });

  next();
};
