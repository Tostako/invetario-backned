import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../shared/errors/AppError';
import { UUID_V4_REGEX } from '../shared/utils/uuidV4';

// Fábrica: valida que los params indicados sean UUIDs válidos antes de llegar al controller.
// Evita queries a DB con valores malformados y previene inyección por path param.
// Uso: router.get('/:id', validateUuid('id'), controller.getOne)
export const validateUuid = (...paramNames: string[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    for (const param of paramNames) {
      const value = req.params[param];
      if (!value || !UUID_V4_REGEX.test(value)) {
        throw new ValidationError(`Invalid UUID for parameter: ${param}`);
      }
    }
    next();
  };
