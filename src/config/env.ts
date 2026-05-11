import dotenv from 'dotenv';
dotenv.config();

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

export const env = {
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  isDev: process.env['NODE_ENV'] !== 'production',
  db: {
    url: process.env['DATABASE_URL'] as string,
  },
  supabase: {
    url: process.env['SUPABASE_URL'] as string,
    serviceRoleKey: process.env['SUPABASE_SERVICE_ROLE_KEY'] as string,
  },
  jwt: {
    secret: process.env['JWT_SECRET'] as string,
    expiresIn: process.env['JWT_EXPIRES_IN'] ?? '7d',
  },
  mercadopago: {
    accessToken: process.env['MERCADOPAGO_ACCESS_TOKEN'] as string,
  },
} as const;
