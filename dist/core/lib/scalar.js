"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scalar8Round = exports.uScalar8Round = exports.fromScalar8 = exports.fromUScalar8 = exports.toScalar8 = exports.toUScalar8 = void 0;
const math_1 = require("./math");
/** @returns A UInt8 bitmask representation. */
function toUScalar8(uScalar) {
    return Number.isNaN(uScalar) ? 255 : (0, math_1.clamp)(127 + (0, math_1.r2z)(uScalar * 254 - 127), 0, 254);
}
exports.toUScalar8 = toUScalar8;
/** @returns A UInt8 bitmask representation. */
function toScalar8(scalar) {
    return Number.isNaN(scalar) ? 255 : (0, math_1.clamp)((0, math_1.r2z)(scalar * 127), -127, 127) + 127;
}
exports.toScalar8 = toScalar8;
/** @returns An unsigned scalar between 0.0 and 1.0. */
function fromUScalar8(uInt8) {
    // Make symmetric: (0.5 + round((uint8 - 127) / 254 * 100)) / 100
    return uInt8 === 255 ? NaN : (0, math_1.clamp)(((0, math_1.raz)((uInt8 - 127) * 0.3937007874015748) + 50) * 0.01, 0, 1);
}
exports.fromUScalar8 = fromUScalar8;
/** @returns A signed scalar between -1.0 and 1.0. */
function fromScalar8(uInt8) {
    // Make symmetric: round((uint8 - 127) / 127 * 100) / 100
    return uInt8 === 255 ? NaN : (0, math_1.clamp)((0, math_1.raz)((uInt8 - 127) * 0.787401574803149) * 0.01, -1, 1);
}
exports.fromScalar8 = fromScalar8;
/**
 * Quantize a number to an 8-bit scalar between 0.0 and 1.0.
 *
 * @param doubleFloat A number.
 * @returns A number (double) in its closest signed scalar representation.
 */
function uScalar8Round(doubleFloat) {
    return fromUScalar8(toUScalar8(doubleFloat));
}
exports.uScalar8Round = uScalar8Round;
/**
 * Quantize a number to an 8-bit signed scalar between -1.0 and 1.0.
 *
 * @param doubleFloat A number.
 * @returns A number (double) in its closest signed scalar representation.
 */
function scalar8Round(doubleFloat) {
    return fromScalar8(toScalar8(doubleFloat));
}
exports.scalar8Round = scalar8Round;
//# sourceMappingURL=scalar.js.map