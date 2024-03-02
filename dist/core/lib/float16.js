"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fround16 = exports.fromFloat16 = exports.toFloat16 = void 0;
/**
 * Convert a number to the nearest 16-bit half precision float representation (as a UInt16 bitmask).
 *
 * @param doubleFloat A number.
 * @returns A UInt16 bitmask representation of a half precision float.
 *
 * @see https://stackoverflow.com/a/32633586
 */
exports.toFloat16 = (function () {
    const floatView = new Float32Array(1);
    const int32View = new Int32Array(floatView.buffer);
    // This method is faster than the OpenEXR implementation (very often
    // used, eg. in Ogre), with the additional benefit of rounding, inspired
    // by James Tursa's half-precision code.
    return function toHalf(doubleFloat) {
        if (Number.isNaN(doubleFloat)) {
            return 0b0111110000000001;
        }
        floatView[0] = doubleFloat;
        const x = int32View[0];
        let bits = (x >> 16) & 0x8000; /* Get the sign */
        let m = (x >> 12) & 0x07ff; /* Keep one extra bit for rounding */
        const e = (x >> 23) & 0xff; /* Using int is faster here */
        // If zero, or denormal, or exponent underflows too much for a denormal
        // half, return signed zero.
        if (e < 103) {
            return bits;
        }
        // If NaN, return NaN. If Inf or exponent overflow, return Inf.
        if (e > 142) {
            bits |= 0x7c00;
            // If exponent was 0xff and one significand bit was set, it means NaN,
            // not Inf, so make sure we set one significand bit too.
            bits |= ((e == 255) ? 0 : 1) && (x & 0x007fffff);
            return bits;
        }
        // If exponent underflows but not too much, return a denormal
        if (e < 113) {
            m |= 0x0800;
            // Extra rounding may overflow and set significand to 0 and exponent
            // to 1, which is OK.
            bits |= (m >> (114 - e)) + ((m >> (113 - e)) & 1);
            return bits;
        }
        bits |= ((e - 112) << 10) | (m >> 1);
        // Extra rounding. An overflow will set significand to 0 and increment
        // the exponent, which is OK.
        bits += m & 1;
        return bits;
    };
}());
/**
 * Convert a UInt16 bitmask of a 16-bit half precision float representation into a normal double precision float (number).
 *
 * @param halfPrecisionBits A UInt16 bitmask representation of a half precision float.
 * @returns A number (standard 64-bit double precision representation).
 */
function fromFloat16(halfPrecisionBits) {
    // Extract sign, exponent, and significand bits
    let sign = ((halfPrecisionBits & 0b1000000000000000) >> 15) === 0 ? 1 : -1;
    let exponent = (halfPrecisionBits & 0b111110000000000) >> 10;
    let significand = halfPrecisionBits & 0b000001111111111;
    // Handle special cases: zero, denormal, infinity, NaN
    if (exponent === 0) {
        // Subnormal or zero
        if (significand === 0) {
            return sign * 0; // Signed zero
        }
        else {
            return sign * Math.pow(2, -14) * (significand / 1024); // Subnormal
        }
    }
    else if (exponent === 0b11111) {
        // Infinity or NaN
        if (significand === 0) {
            return sign * Infinity; // Infinity
        }
        else {
            return NaN; // NaN
        }
    }
    // Normalized number
    exponent -= 15; // Adjust exponent bias
    return sign * Math.pow(2, exponent) * (1 + significand / 1024);
}
exports.fromFloat16 = fromFloat16;
/**
 * The fround16() method returns the nearest 16-bit half precision float representation of a number.
 *
 * @param doubleFloat A number.
 * @returns The nearest 16-bit half precision float representation of x.
 */
function fround16(doubleFloat) {
    return fromFloat16((0, exports.toFloat16)(doubleFloat));
}
exports.fround16 = fround16;
//# sourceMappingURL=float16.js.map