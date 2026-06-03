"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const app_1 = __importDefault(require("./app"));
const startServer = async () => {
    // Verificar conexión a DB antes de aceptar peticiones
    await (0, database_1.testConnection)();
    app_1.default.listen(env_1.env.port, () => {
        console.log(`[Server] Running on port ${env_1.env.port} (${env_1.env.nodeEnv})`);
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
//# sourceMappingURL=server.js.map