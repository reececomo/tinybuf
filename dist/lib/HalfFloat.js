"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quantizeAsHalfFloat = exports.fromHalf = exports.toHalf = void 0;
/**
 * @param val 64-bit float
 * @returns uint16 bitmask representing a 16-bit float
 *
 * @see https://stackoverflow.com/a/32633586
 */
exports.toHalf = (function () {
    const floatView = new Float32Array(1);
    const int32View = new Int32Array(floatView.buffer);
    // This method is faster than the OpenEXR implementation (very often
    // used, eg. in Ogre), with the additional benefit of rounding, inspired
    // by James Tursa's half-precision code.
    return function toHalf(val) {
        if (Number.isNaN(val)) {
            return 0b0111110000000001;
        }
        floatView[0] = val;
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
            // If exponent was 0xff and one mantissa bit was set, it means NaN,
            // not Inf, so make sure we set one mantissa bit too.
            bits |= ((e == 255) ? 0 : 1) && (x & 0x007fffff);
            return bits;
        }
        // If exponent underflows but not too much, return a denormal
        if (e < 113) {
            m |= 0x0800;
            // Extra rounding may overflow and set mantissa to 0 and exponent
            // to 1, which is OK.
            bits |= (m >> (114 - e)) + ((m >> (113 - e)) & 1);
            return bits;
        }
        bits |= ((e - 112) << 10) | (m >> 1);
        // Extra rounding. An overflow will set mantissa to 0 and increment
        // the exponent, which is OK.
        bits += m & 1;
        return bits;
    };
}());
/**
 * @param halfPrecisionBits uint16 bitmask representing a 16-bit float
 * @returns 64-bit float
 */
function fromHalf(halfPrecisionBits) {
    // Extract sign, exponent, and mantissa bits
    let sign = ((halfPrecisionBits & 0b1000000000000000) >> 15) === 0 ? 1 : -1;
    let exponent = (halfPrecisionBits & 0b111110000000000) >> 10;
    let mantissa = halfPrecisionBits & 0b000001111111111;
    // Handle special cases: zero, denormal, infinity, NaN
    if (exponent === 0) {
        // Subnormal or zero
        if (mantissa === 0) {
            return sign * 0; // Signed zero
        }
        else {
            return sign * Math.pow(2, -14) * (mantissa / 1024); // Subnormal
        }
    }
    else if (exponent === 0b11111) {
        // Infinity or NaN
        if (mantissa === 0) {
            return sign * Infinity; // Infinity
        }
        else {
            return NaN; // NaN
        }
    }
    // Normalized number
    exponent -= 15; // Adjust exponent bias
    return sign * Math.pow(2, exponent) * (1 + mantissa / 1024);
}
exports.fromHalf = fromHalf;
/**
 * Quantize a double to a half.
 * @param value A double value (64-bit floating point number).
 * @returns A quantized double value (after being converted to a half and back).
 */
function quantizeAsHalfFloat(value) {
    return fromHalf((0, exports.toHalf)(value));
}
exports.quantizeAsHalfFloat = quantizeAsHalfFloat;
//# sourceMappingURL=HalfFloat.js.map