"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.traducirErrorDB = void 0;
const AppError_1 = require("../errors/AppError");
const traducirErrorDB = (err, manejadores) => {
    if (err instanceof AppError_1.AppError) {
        // Ya es un AppError (p.ej. NotFoundError lanzado antes del try/catch)
        return err;
    }
    if (err instanceof Error) {
        const mensaje = err.message;
        // Buscar el código de error en los manejadores registrados
        for (const codigo of Object.keys(manejadores)) {
            if (mensaje.startsWith(codigo)) {
                return manejadores[codigo](mensaje);
            }
        }
    }
    // Si no coincide ningún manejador, relanzar sin modificar
    throw err;
};
exports.traducirErrorDB = traducirErrorDB;
//# sourceMappingURL=dbErrors.js.map