"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
// Usamos memoryStorage porque vamos a subir el archivo a Supabase Storage
const storage = multer_1.default.memoryStorage();
const MAX_IMAGE_SIZE_MB = 5;
const fileFilter = (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Formato de imagen no permitido. Solo se aceptan JPG, PNG y WEBP.'));
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_IMAGE_SIZE_MB * 1024 * 1024, // 5MB
    },
});
//# sourceMappingURL=upload.js.map