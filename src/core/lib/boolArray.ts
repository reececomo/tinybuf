/**
 * Encode a boolean array as an integer.
 * Modified version of: https://github.com/geckosio/typed-array-buffer-schema/blob/d1e2330c8910e29280ab59e92619e5019b6405d4/src/serialize.ts#L29
 */
export function $bools2Mask(bools: boolean[], length: number): number {
  let str = '';
  for (let i = 0; i < length; i++) {
    str += +!!bools[i];
  }
  return parseInt(str, 2);
}

/**
 * Decode a boolean array as an integer.
 * Modified version of: https://github.com/geckosio/typed-array-buffer-schema/blob/d1e2330c8910e29280ab59e92619e5019b6405d4/src/serialize.ts#L39
 */
export function $mask2Bools(int: number, length: 8 | 16 | 32): boolean[] {
  return [...(int >>> 0).toString(2).padStart(length, '0')].map(e => (e == '0' ? false : true));
}


/**
 * Encode a variable-sized boolean array as an integer.
 * Modified version of: https://github.com/geckosio/typed-array-buffer-schema/blob/d1e2330c8910e29280ab59e92619e5019b6405d4/src/serialize.ts#L29
 */
export function $vBools2Mask(bools: boolean[]): number {
  let str = '';
  for (let i = 0; i < bools.length; i++) {
    str += +!!bools[i];
  }
  return parseInt(str, 2);
}

/**
 * Decode a variable-sized boolean array from an integer.
 * Modified version of: https://github.com/geckosio/typed-array-buffer-schema/blob/d1e2330c8910e29280ab59e92619e5019b6405d4/src/serialize.ts#L39
 */
export function $mask2vBools(u: number): boolean[] {
  return [...(u >>> 0).toString(2)].map(e => (e == '0' ? false : true));
}
