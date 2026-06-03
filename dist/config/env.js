"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Valida que todas las variables de entorno críticas existan al arrancar
const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'MERCADOPAGO_ACCESS_TOKEN',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
];
for (const key of required) {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
}
exports.env = {
    port: parseInt(process.env['PORT'] ?? '3000', 10),
    nodeEnv: process.env['NODE_ENV'] ?? 'development',
    isDev: process.env['NODE_ENV'] !== 'production',
    db: {
        url: process.env['DATABASE_URL'],
    },
    supabase: {
        url: process.env['SUPABASE_URL'],
        serviceRoleKey: process.env['SUPABASE_SERVICE_ROLE_KEY'],
    },
    jwt: {
        secret: process.env['JWT_SECRET'],
        expiresIn: process.env['JWT_EXPIRES_IN'] ?? '7d',
    },
    mercadopago: {
        accessToken: process.env['MERCADOPAGO_ACCESS_TOKEN'],
    },
};
//# sourceMappingURL=env.js.map