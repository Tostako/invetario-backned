"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUuid = void 0;
const AppError_1 = require("../shared/errors/AppError");
const uuidV4_1 = require("../shared/utils/uuidV4");
// Fábrica: valida que los params indicados sean UUIDs válidos antes de llegar al controller.
// Evita queries a DB con valores malformados y previene inyección por path param.
// Uso: router.get('/:id', validateUuid('id'), controller.getOne)
const validateUuid = (...paramNames) => (req, _res, next) => {
    for (const param of paramNames) {
        const value = req.params[param];
        if (!value || !uuidV4_1.UUID_V4_REGEX.test(value)) {
            throw new AppError_1.ValidationError(`Invalid UUID for parameter: ${param}`);
        }
    }
    next();
};
exports.validateUuid = validateUuid;
//# sourceMappingURL=validateUuid.js.map