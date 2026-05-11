import multer from 'multer';

// Usamos memoryStorage porque vamos a subir el archivo a Supabase Storage
const storage = multer.memoryStorage();
const MAX_IMAGE_SIZE_MB = 5;

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de imagen no permitido. Solo se aceptan JPG, PNG y WEBP.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE_MB * 1024 * 1024, // 5MB
  },
});
