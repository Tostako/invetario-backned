"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const env_1 = require("../config/env");
// Logger estructurado. En desarrollo imprime una linea legible y, si la
// respuesta fue error, agrega el motivo que preparo errorHandler.
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const ms = Date.now() - start;
        const shopId = req.user?.shop_id ?? (() => {
            if (req.method === 'POST' && (req.originalUrl.includes('/auth/register') || req.originalUrl.includes('/admin/shops'))) {
                return `pending: ${req.body?.shop_slug ?? 'new'}`;
            }
            return 'unauthenticated';
        })();
        const errorInfo = res.locals['errorInfo'];
        if (env_1.env.isDev) {
            const color = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
            const errorSuffix = errorInfo
                ? ` - ${errorInfo.code ?? 'ERROR'}: ${errorInfo.message ?? ''}${errorInfo.fields?.length ? ` (${errorInfo.fields.join('; ')})` : ''}${errorInfo.details ? ` [${errorInfo.details}]` : ''}`
                : '';
            console.log(`${color}[${res.statusCode}]\x1b[0m ${req.method} ${req.originalUrl} - ${ms}ms (shop: ${shopId})${errorSuffix}`);
        }
        else {
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
exports.requestLogger = requestLogger;
//# sourceMappingURL=requestLogger.js.map