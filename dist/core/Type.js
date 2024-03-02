"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidValueTypes = exports.Optional = exports.OptionalType = void 0;
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
exports.ValidValueTypes = [
    "float16" /* Type.Float16 */,
    "float32" /* Type.Float32 */,
    "float64" /* Type.Float64 */,
    "int" /* Type.Int */,
    "int8" /* Type.Int8 */,
    "int16" /* Type.Int16 */,
    "int32" /* Type.Int32 */,
    "uint" /* Type.UInt */,
    "uint8" /* Type.UInt8 */,
    "uint16" /* Type.UInt16 */,
    "uint32" /* Type.UInt32 */,
    "bool" /* Type.Boolean */,
    "booltuple" /* Type.BooleanTuple */,
    "bitmask8" /* Type.Bitmask8 */,
    "bitmask16" /* Type.Bitmask16 */,
    "bitmask32" /* Type.Bitmask32 */,
    "str" /* Type.String */,
    "date" /* Type.Date */,
    "regex" /* Type.RegExp */,
    "json" /* Type.JSON */,
    "binary" /* Type.Binary */,
];
//# sourceMappingURL=Type.js.map