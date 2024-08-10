/**
 * Returns the nearest half precision float representation of a number.
 * @param x A numeric expression.
 */
export function f16round(x: number): number {
  return $fromf16($tof16(x));
}

/**
 * Returns the nearest half precision float representation of a number as a 16-bit bitmask.
 */
export const $tof16 = (function() {
  const x = new Float32Array(1);
  const y = new Int32Array(x.buffer);

  return function (f: number) {
    x[0] = f;
    let i = y[0]; // 32-bit int
    let s = (i >> 16) & 0X8000; // sign
    let z = (i & 0X7FFFFFFF) + 0X1000 | 0;

    if (z >= 0X47800000) {
      if ((i & 0X7FFFFFFF) < 0X47800000) return s | 0X7BFF;
      if (z < 0X7F800000) return s | 0X7C00;
      return s | 0X7C00 | (i & 0X007FFFFF) >> 13;
    }
    if (z >= 0X38800000) return s | z - 0X38000000 >> 13;
    else if (z < 0X33000000) return s;
    z = (i & 0X7FFFFFFF) >> 23;
    return s | ((i & 0X7FFFFF | 0X800000)
      + (0X800000 >>> z - 102)
      >> 126 - z);
  };
}());

/**
 * Returns the nearest half precision float value for a 16-bit bitmask.
 */
export const $fromf16 = (function() {
  const x = Float64Array.from({ length: 32 }, (_, e) => Math.pow(2, e - 15)); // biased exponents
  const y = Float64Array.from({ length: 1024 }, (_, m) => 1 + m / 1024); // normalized mantissas
  const z = Math.pow(2, -24); // subnormal constant

  return function (b: number): number {
    const s = (b & 32768) === 32768 ? -1 : 1; // sign: 1 bit
    const e = b & 31744; // exponent: 5 bits
    const m = b & 1023; // mantissa: 10 bits

    if (e === 0) return m === 0 ? s * 0 : s * z;
    if (e === 31744) return m === 0 ? s * Infinity : NaN;
    return s * x[e >> 10] * y[m];
  };
}());
