"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Optional = exports.OptionalType = void 0;
/**
 * A wrapper around any Type definition that declares it as optional.
 */
class OptionalType {
    constructor(type) {
        this.type = type;
    }
}
exports.OptionalType = OptionalType;
/**
 * Wrap any definition as optional.
 */
function Optional(t) {
    return new OptionalType(t);
}
exports.Optional = Optional;
//# sourceMappingURL=Type.js.map