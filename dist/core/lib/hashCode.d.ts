/**
 * DJB2 hash algorithm (modified for 16-bit uints).
 *
 * DJB2 is a simple and widely used non-cryptographic
 * hash function created by Daniel J. Bernstein.
 *
 * @returns 16-bit unsigned integer
 */
export declare function djb2HashUInt16(str: string): number;
/**
 * Returns an unsigned 16-bit integer hashcode for some string.
 * Prefers 2 character string.
 *
 * @returns A UInt16 between 0 and 65535 (inclusive).
 */
export declare function strToHashCode(str: string): number;
/**
 * Convert UInt16 to a 2-character String.
 */
export declare function hashCodeTo2CharStr(hashCode: number): string;
//# sourceMappingURL=hashCode.d.ts.map