/**
 * DJB2 hash algorithm (modified for 16-bit uints).
 *
 * DJB2 is a simple and widely used non-cryptographic
 * hash function created by Daniel J. Bernstein.
 *
 * @returns 16-bit unsigned integer
 */
export function djb2HashUInt16(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash & 0xFFFF; // Ensure the result is a Uint16
}

/**
 * Returns an unsigned 16-bit integer hashcode for some string.
 * Prefers 2 character string.
 *
 * @returns A UInt16 between 0 and 65535 (inclusive).
 */
export function strToHashCode(str: string): number {
  // Prefer 2 character string
  if (str.length === 2) {
    return str.charCodeAt(0) * 256 + str.charCodeAt(1);
  }

  return djb2HashUInt16(str); // Fallback to DJB2
}

/**
 * Convert UInt16 to a 2-character String.
 */
export function hashCodeToStr(hashCode: number): string {
  return String.fromCharCode(Math.floor(hashCode / 256)) + String.fromCharCode(hashCode % 256);
}
