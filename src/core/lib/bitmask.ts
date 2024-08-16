/**
 * Mask booleans to a uint32.
 *
 * @param x - A boolean array.
 * @param padBit - A bit to pad the mask (for variable length data).
 */
export const mask = (x: boolean[], padBit: 0 | 1 = 0b1): number => {
  return x.reduce((n, b: any) => (n << 1) | b, padBit);
};

/**
 * Unmask booleans from a uint32.
 *
 * @param x - A uint32 number.
 * @param len - number of booleans to expect (default: infer lenth from x where x is encoded with a pad bit)
 */
export const unmask = (x: number, len = 31 - Math.clz32(x)): boolean[] => {
  const result = new Array<boolean>(len);
  for (let i = 0; i < len; i++) result[i] = !!(x & (1 << (len - 1 - i)));
  return result;
};
