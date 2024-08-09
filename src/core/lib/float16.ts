/**
 * The f16round() method returns the nearest 16-bit half precision float representation of a number.
 *
 * @param doubleFloat A number.
 * @returns The nearest 16-bit half precision float representation of x.
 */
export function f16round(doubleFloat: number): number {
  return $f16unmask($f16mask(doubleFloat));
}

/**
 * Convert a float64 to float16 binary format (to be stored as uint)
 *
 * @author greggman, Sam Hocevar, James Tursa
 * @see https://stackoverflow.com/a/32633586
 */
export const $f16mask = (function() {
  const f32 = new Float32Array(1);
  const i32 = new Uint32Array(f32.buffer);

  return function (v: number): number {
    f32[0] = v;

    const i = i32[0];
    const e = i >> 23 & 255; // exponent (0b0000000011111111)

    // check underflow
    if (e < 113) {
      // if zero, or denormal, or exponent underflows too much for a denormal half
      if (e < 103) return i >> 16 & 32768; // signed zero

      let m = i >> 12 & 2047; //  mantissa (0b0000011111111111)

      // exponent underflows but not too much, return a denormal
      m |= 2048; // (0b0000100000000000)

      // extra rounding may overflow and set significand to 0 and exponent
      // to 1, which is ok
      return i >> 16 & 32768 /* <-- sign bit */ | m >> (113 - e) + (m >> (112 - e)) & 1;
    }
    else if (e >= 142) { // check overflow: NaN or Infinity (incl. exponent overflow)
      if (v > 65_504) return 31744; // f16 Infinity (0b0111110000000000)
      if (v < -65_504) return 64512; // f16 -Infinity (0b1111110000000000)
      if (v !== v) return 31745; // f16 NaN (0b0111110000000001)
    }

    const m = i >> 12 & 2047; //  mantissa (0b0000011111111111)

    // extra rounding. an overflow will set significand to 0 and increment
    // the exponent, which is ok.
    return i >> 16 & 32768 /* <-- sign bit */ | (e - 112) << 10 | (m >> 1) + (m & 1);
  };
}());

/**
 * Convert a uint binary representation of a float16 into a float64
 */
export const $f16unmask = (function() {
  let t!: Record<number, number>;

  return function $f16unmask(b: number): number {
    if (!t) {
      const sub = Math.pow(2, -24); // precalculate subnormal

      const precalc = function(e: number, s: number): number {
        if (e === 0) return (s === 0) ? 0 : sub * (s / 1024); // subnormal
        if (e === 0x1F /* expo */) return s === 0 ? Infinity : NaN; // Infinity or NaN
        e -= 15; // adjust exponent bias
        return Math.pow(2, e) * (1 + s / 1024);
      };

      t = [];
      for (let exponent = 0; exponent < 1 << 5 /* expo bits */; exponent++) {
        for (let significand = 0; significand < 1 << 10 /* signif bits */; significand++) {
          const value = precalc(exponent, significand);
          t[(exponent << 10 /* signif bits */) + significand] = value;
        }
      }
    }

    if ((b & 0x8000) === 0) return t[(((/* exponent: */ b >> 10 /* signif bits */) & 0x1F) << 10 /* signif bits */) + (/* signif: */ b & 0x3FF  /* signif mask */)];
    else return -t[(((/* exponent: */ b >> 10 /* signif bits */) & 0x1F) << 10 /* signif bits */) + (/* signif: */ b & 0x3FF  /* signif mask */)];
  };
}());
