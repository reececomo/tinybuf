/**
 * Whether the given value is a boolean array.
 */
export function isBooleanArray(value: any): value is boolean[] {
  return Array.isArray(value) && value.every(entry => typeof entry === 'boolean');
}

/**
 * Encode a boolean array as an integer.
 * Modified version of: https://github.com/geckosio/typed-array-buffer-schema/blob/d1e2330c8910e29280ab59e92619e5019b6405d4/src/serialize.ts#L29
 */
export function fixedLengthBooleanArrayToBitmask(booleanArray: boolean[], length: 8 | 16 | 32): number {
  let str = '';
  for (let i = 0; i < length; i++) {
    str += +!!booleanArray[i];
  }
  return parseInt(str, 2);
}

/**
 * Encode a boolean array as an integer.
 * Modified version of: https://github.com/geckosio/typed-array-buffer-schema/blob/d1e2330c8910e29280ab59e92619e5019b6405d4/src/serialize.ts#L29
 */
export function bools2Mask(booleanArray: boolean[]): number {
  let str = '';
  for (let i = 0; i < booleanArray.length; i++) {
    str += +!!booleanArray[i];
  }
  return parseInt(str, 2);
}

/**
 * Decode a boolean array as an integer.
 * Modified version of: https://github.com/geckosio/typed-array-buffer-schema/blob/d1e2330c8910e29280ab59e92619e5019b6405d4/src/serialize.ts#L39
 */
export function mask2Bools(int: number, length: 8 | 16 | 32): boolean[] {
  return [...(int >>> 0).toString(2).padStart(length, '0')].map(e => (e == '0' ? false : true));
}

/**
 * Decode a boolean array as an integer.
 * Modified version of: https://github.com/geckosio/typed-array-buffer-schema/blob/d1e2330c8910e29280ab59e92619e5019b6405d4/src/serialize.ts#L39
 */
export function uInt8ToBooleanArray(int: number): boolean[] {
  return [...(int >>> 0).toString(2)].map(e => (e == '0' ? false : true));
}
