"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendCreated = exports.sendSuccess = void 0;
// Centraliza el formato de todas las respuestas HTTP de la API
const sendSuccess = (res, data, statusCode = 200, meta) => {
    const response = { success: true, data };
    if (meta)
        response.meta = meta;
    res.status(statusCode).json(response);
};
exports.sendSuccess = sendSuccess;
const sendCreated = (res, data) => {
    (0, exports.sendSuccess)(res, data, 201);
};
exports.sendCreated = sendCreated;
const sendError = (res, message, statusCode = 500) => {
    const response = { success: false, message };
    res.status(statusCode).json(response);
};
exports.sendError = sendError;
//# sourceMappingURL=response.js.map