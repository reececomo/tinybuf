/**
 * Convert a number to the nearest 16-bit half precision float representation (as a UInt16 bitmask).
 *
 * @param doubleFloat A number.
 * @returns A UInt16 bitmask representation of a half precision float.
 *
 * @see https://stackoverflow.com/a/32633586
 */
export declare const toFloat16: (doubleFloat: number) => number;
/**
 * Convert a UInt16 bitmask of a 16-bit half precision float representation into a normal double precision float (number).
 *
 * @param halfPrecisionBits A UInt16 bitmask representation of a half precision float.
 * @returns A number (standard 64-bit double precision representation).
 */
export declare function fromFloat16(halfPrecisionBits: number): number;
/**
 * The fround16() method returns the nearest 16-bit half precision float representation of a number.
 *
 * @param doubleFloat A number.
 * @returns The nearest 16-bit half precision float representation of x.
 */
export declare function fround16(doubleFloat: number): number;
//# sourceMappingURL=float16.d.ts.map