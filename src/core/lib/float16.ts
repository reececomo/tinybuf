const FLOAT16_EXPONENT_BITS = 5;
const FLOAT16_EXPONENT_BIAS = 15;
const FLOAT16_SIGNIFICAND_BITS = 10;
const FLOAT16_EXPONENT_MASK = 0x1F;
const FLOAT16_SIGNIFICAND_MASK = 0x3FF;
const FLOAT16_PRECALCULATE_SUBNORMAL = Math.pow(2, -24);

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class F16 {
  /**
   * Precomputed table of the conversion factors for each possible
   * combination of exponent and significand bits. Unsigned.
   */
  public static readonly t = _initFloat16LookupTable(); // lazy init
}

/**
 * Convert a number to the nearest 16-bit half precision float representation (as a UInt16 bitmask).
 *
 * @param doubleFloat A number.
 * @returns A UInt16 bitmask representation of a half precision float.
 *
 * @see https://stackoverflow.com/a/32633586
 */
export const toFloat16 = (function() {
  const floatView = new Float32Array(1);
  const int32View = new Int32Array(floatView.buffer);

  // This method is faster than the OpenEXR implementation (very often
  // used, eg. in Ogre), with the additional benefit of rounding, inspired
  // by James Tursa's half-precision code.
  return function toHalf(v: number): number {
    floatView[0] = v;
    const x = int32View[0];

    let bits = (x >> 16) & 0b1000000000000000;
    let m = (x >> 12) & 0b0000011111111111;
    const e = (x >> 23) & 0b0000000011111111;

    // If zero, or denormal, or exponent underflows too much for a denormal
    // half, return signed zero.
    if (e < 103) {
      return bits;
    }

    // If NaN, return NaN. If Inf or exponent overflow, return Inf.
    if (e > 142) {
      if (isNaN(v)) {
        return 0b0111110000000001; // Float 16 NaN
      }

      bits |= 0x7c00;
      // If exponent was 0xff and one significand bit was set, it means NaN,
      // not Inf, so make sure we set one significand bit too.
      bits |= ((e == 255) ? 0 : 1) && (x & 0x007fffff);
      return bits;
    }

    // If exponent underflows but not too much, return a denormal
    if (e < 113) {
      m |= 0x0800;
      // Extra rounding may overflow and set significand to 0 and exponent
      // to 1, which is OK.
      bits |= (m >> (114 - e)) + ((m >> (113 - e)) & 1);
      return bits;
    }

    bits |= ((e - 112) << 10) | (m >> 1);

    // Extra rounding. An overflow will set significand to 0 and increment
    // the exponent, which is OK.
    bits += m & 1;

    return bits;
  };
}());


/**
 * Convert a UInt16 bitmask of a 16-bit half precision float representation into a normal double precision float (number).
 *
 * @param b A UInt16 bitmask representation of a half precision float.
 * @returns A number (standard 64-bit double precision representation).
 */
export function fromFloat16(b: number): number {
  const sign = (b & 0x8000) === 0 ? 1 : -1;
  const exponent = (b >> FLOAT16_SIGNIFICAND_BITS) & FLOAT16_EXPONENT_MASK;
  const significand = b & FLOAT16_SIGNIFICAND_MASK;

  return (sign) * F16.t[(exponent << FLOAT16_SIGNIFICAND_BITS) + significand];
}

/**
 * The fround16() method returns the nearest 16-bit half precision float representation of a number.
 *
 * @param doubleFloat A number.
 * @returns The nearest 16-bit half precision float representation of x.
 */
export function fround16(doubleFloat: number): number {
  return fromFloat16(toFloat16(doubleFloat));
}

// ----- Precalculated table: -----

function _initFloat16LookupTable(): number[] {
  const t = [];
  for (let exponent = 0; exponent < 1 << FLOAT16_EXPONENT_BITS; exponent++) {
    for (let significand = 0; significand < 1 << FLOAT16_SIGNIFICAND_BITS; significand++) {
      const value = fromFloat16Helper(exponent, significand);
      t[(exponent << FLOAT16_SIGNIFICAND_BITS) + significand] = value;
    }
  }
  return t;
}


// Helper function used to precalculate the value for a given exponent and significand
function fromFloat16Helper(exponent: number, significand: number): number {
  if (exponent === 0) {
    // Subnormal or zero
    if (significand === 0) {
      return 0;
    }
    return FLOAT16_PRECALCULATE_SUBNORMAL * (significand / 1024); // Subnormal
  }
  if (exponent === 0x1F) {
    // Infinity or NaN
    return significand === 0 ? Infinity : NaN;
  }
  // Normalized number
  exponent -= FLOAT16_EXPONENT_BIAS; // Adjust exponent bias
  return Math.pow(2, exponent) * (1 + significand / 1024);
}