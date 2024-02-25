"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Optional = exports.OptionalType = void 0;
class OptionalType {
    constructor(type) {
        this.type = type;
    }
}
exports.OptionalType = OptionalType;
function Optional(t) {
    return new OptionalType(t);
}
exports.Optional = Optional;
//# sourceMappingURL=Type.js.map