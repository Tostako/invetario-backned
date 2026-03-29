import { env } from './config/env';
import { testConnection } from './config/database';
import app from './app';

const startServer = async (): Promise<void> => {
  // Verificar conexión a DB antes de aceptar peticiones
  await testConnection();

  app.listen(env.port, () => {
    console.log(`[Server] Running on port ${env.port} (${env.nodeEnv})`);
  });
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received — shutting down gracefully');
  process.exit(0);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Server] Unhandled rejection:', reason);
  process.exit(1);
});

startServer().catch((err) => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});
