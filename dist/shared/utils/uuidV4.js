"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.esUuidV4 = exports.UUID_V4_REGEX = void 0;
/** UUID v4 (mismo criterio que validateUuid en path params). */
exports.UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const esUuidV4 = (value) => exports.UUID_V4_REGEX.test(value);
exports.esUuidV4 = esUuidV4;
//# sourceMappingURL=uuidV4.js.map