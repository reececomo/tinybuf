/** @returns A UInt8 bitmask representation. */
export declare function toUScalar8(uScalar: number): number;
/** @returns A UInt8 bitmask representation. */
export declare function toScalar8(scalar: number): number;
/** @returns An unsigned scalar between 0.0 and 1.0. */
export declare function fromUScalar8(uInt8: number): number;
/** @returns A signed scalar between -1.0 and 1.0. */
export declare function fromScalar8(uInt8: number): number;
/**
 * Quantize a number to an 8-bit scalar between 0.0 and 1.0.
 *
 * @param doubleFloat A number.
 * @returns A number (double) in its closest signed scalar representation.
 */
export declare function uScalarRound(doubleFloat: number): number;
/**
 * Quantize a number to an 8-bit signed scalar between -1.0 and 1.0.
 *
 * @param doubleFloat A number.
 * @returns A number (double) in its closest signed scalar representation.
 */
export declare function scalarRound(doubleFloat: number): number;
//# sourceMappingURL=scalar.d.ts.map