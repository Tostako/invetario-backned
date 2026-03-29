import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '../shared/errors/AppError';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Fábrica: valida que los params indicados sean UUIDs válidos antes de llegar al controller.
// Evita queries a DB con valores malformados y previene inyección por path param.
// Uso: router.get('/:id', validateUuid('id'), controller.getOne)
export const validateUuid = (...paramNames: string[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    for (const param of paramNames) {
      const value = req.params[param];
      if (!value || !UUID_REGEX.test(value)) {
        throw new ValidationError(`Invalid UUID for parameter: ${param}`);
      }
    }
    next();
  };
