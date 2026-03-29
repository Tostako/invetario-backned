import rateLimit from 'express-rate-limit';

// Rate limiter estricto para endpoints de autenticación.
// Limita intentos de brute-force en login sin necesidad de bloquear IPs globalmente.
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,                   // 10 intentos por IP por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
  // Distinguir por IP: evita que un atacante bloquee a otro usuario legítimo
  keyGenerator: (req) => req.ip ?? 'unknown',
});

// Rate limiter general de la API (más permisivo)
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
});
