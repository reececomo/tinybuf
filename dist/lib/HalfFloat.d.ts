/**
 * @param val 64-bit float
 * @returns uint16 bitmask representing a 16-bit float
 *
 * @see https://stackoverflow.com/a/32633586
 */
export declare const toHalf: (val: number) => number;
/**
 * @param halfPrecisionBits uint16 bitmask representing a 16-bit float
 * @returns 64-bit float
 */
export declare function fromHalf(halfPrecisionBits: number): number;
/**
 * Quantize a double to a half.
 * @param value A double value (64-bit floating point number).
 * @returns A quantized double value (after being converted to a half and back).
 */
export declare function quantizeAsHalfFloat(value: number): number;
//# sourceMappingURL=HalfFloat.d.ts.map