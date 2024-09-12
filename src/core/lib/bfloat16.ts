const i = new Uint32Array(1);
const f = new Float32Array(i.buffer);

/**
 * Returns the nearest bfloat16 representation of a number.
 * @param x A numeric expression.
 */
export function bf16round(x: number): number {
  f[0] = x;
  i[0] = i[0] & 0xFFFF0000;
  return f[0];
}

/** Returns a 16-bit bfloat16 bitmask for a given float. */
export function $tobf16(x: number): number {
  f[0] = x;
  return i[0] >>> 16;
}

/** Returns the nearest value from a 16-bit bfloat16 bitmask. */
export function $frombf16(x: number): number {
  i[0] = x << 16;
  return f[0];
}
