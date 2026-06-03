"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcOffset = exports.parsePagination = void 0;
const parsePagination = (req) => {
    const page = Math.max(1, parseInt(req.query['page']) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query['limit']) || 20));
    return { page, limit };
};
exports.parsePagination = parsePagination;
const calcOffset = ({ page, limit }) => (page - 1) * limit;
exports.calcOffset = calcOffset;
//# sourceMappingURL=pagination.js.map