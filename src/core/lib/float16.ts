/* eslint-disable @typescript-eslint/no-extraneous-class */

const FLOAT16_PRECALCULATE_SUBNORMAL = Math.pow(2, -24);

/**
 * Convert a number to the nearest 16-bit half precision float representation (as a UInt16 bitmask).
 *
 * @param doubleFloat A number.
 * @returns A UInt16 bitmask representation of a half precision float.
 *
 * @see https://stackoverflow.com/a/32633586
 */
export const $f16mask = (function() {
  const floatView = new Float32Array(1);
  const int32View = new Int32Array(floatView.buffer);

  // This method is faster than the OpenEXR implementation (very often
  // used, eg. in Ogre), with the additional benefit of rounding, inspired
  // by James Tursa's half-precision code.
  return function toHalf(v: number): number {
    floatView[0] = v;
    const x = int32View[0];

    let b = (x >> 16) & 0b1000000000000000;
    let m = (x >> 12) & 0b0000011111111111;
    const e = (x >> 23) & 0b0000000011111111;

    // If zero, or denormal, or exponent underflows too much for a denormal
    // half, return signed zero.
    if (e < 103) return b;

    // If NaN, return NaN. If Inf or exponent overflow, return Inf.
    if (e > 142) {
      if (isNaN(v)) return 0b0111110000000001; // Float 16 NaN

      b |= 0x7c00;

      // If exponent was 0xff and one significand bit was set, it means NaN,
      // not Inf, so make sure we set one significand bit too.
      b |= ((e == 255) ? 0 : 1) && (x & 0x007fffff);
      return b;
    }

    // If exponent underflows but not too much, return a denormal
    if (e < 113) {
      m |= 0x0800;
      // Extra rounding may overflow and set significand to 0 and exponent
      // to 1, which is OK.
      b |= (m >> (114 - e)) + ((m >> (113 - e)) & 1);
      return b;
    }

    b |= ((e - 112) << 10) | (m >> 1);

    // Extra rounding. An overflow will set significand to 0 and increment
    // the exponent, which is OK.
    b += m & 1;

    return b;
  };
}());


/**
 * Convert a UInt16 bitmask of a 16-bit half precision float representation into
 * a double precision float (number).
 *
 * @param b A UInt16 bitmask representation of a half precision float.
 * @returns A number (standard 64-bit double precision representation).
 */
export function $f16unmask(b: number): number {
  // eslint-disable-next-line max-len
  if ((b & 0x8000) === 0) return f16.t[(((/* exponent: */ b >> 10 /* FLOAT16_SIGNIFICAND_BITS */) & 0x1F) << 10 /* FLOAT16_SIGNIFICAND_BITS */) + (/* significand: */ b & 0x3FF  /* FLOAT16_SIGNIFICAND_MASK */)];
  else return -f16.t[(((/* exponent: */ b >> 10 /* FLOAT16_SIGNIFICAND_BITS */) & 0x1F) << 10 /* FLOAT16_SIGNIFICAND_BITS */) + (/* significand: */ b & 0x3FF  /* FLOAT16_SIGNIFICAND_MASK */)];
}

/**
 * The fround16() method returns the nearest 16-bit half precision float representation of a number.
 *
 * @param doubleFloat A number.
 * @returns The nearest 16-bit half precision float representation of x.
 */
export function fround16(doubleFloat: number): number {
  return $f16unmask($f16mask(doubleFloat));
}

// ----- Precomputed table: -----

/** precomputed table of the conversion factors for each possible combination of exponent and significand bits (unsigned) */
class f16 {
  public static readonly t = this._$initF16LookupTable(); // static: lazy initializer

  private static _$initF16LookupTable(): number[] {
    const t = [];
    for (let exponent = 0; exponent < 1 << 5 /* FLOAT16_EXPONENT_BITS */; exponent++) {
      for (let significand = 0; significand < 1 << 10 /* FLOAT16_SIGNIFICAND_BITS */; significand++) {
        const value = f16._$precalculate(exponent, significand);
        t[(exponent << 10 /* FLOAT16_SIGNIFICAND_BITS */) + significand] = value;
      }
    }
    return t;
  }


  /** precalculate the value for a given exponent and significand */
  private static _$precalculate(exponent: number, significand: number): number {
    if (exponent === 0) {
      if (significand === 0) return 0; // subnormal or zero
      return FLOAT16_PRECALCULATE_SUBNORMAL * (significand / 1024); // Subnormal
    }
    if (exponent === 0x1F /* FLOAT16_EXPONENT_MASK */) return significand === 0 ? Infinity : NaN; // Infinity or NaN
    // normalize
    exponent -= 15 /* FLOAT16_EXPONENT_BIAS */; // adjust exponent bias
    return Math.pow(2, exponent) * (1 + significand / 1024);
  }
}