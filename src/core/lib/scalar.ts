import { clamp, r2z, raz } from "./math";

/** @returns A UInt8 bitmask representation. */
export function toUScalar8(uScalar: number): number {
  return Number.isNaN(uScalar) ? 255 : clamp(127 + r2z(uScalar * 254 - 127), 0, 254);
}

/** @returns A UInt8 bitmask representation. */
export function toScalar8(scalar: number): number {
  return Number.isNaN(scalar) ? 255 : clamp(r2z(scalar * 127), -127, 127) + 127;
}

/** @returns An unsigned scalar between 0.0 and 1.0. */
export function fromUScalar8(uInt8: number): number {
  // Make symmetric: (0.5 + round((uint8 - 127) / 254 * 100)) / 100
  return uInt8 === 255 ? NaN : clamp((raz((uInt8 - 127) * 0.3937007874015748) + 50) * 0.01, 0, 1);
}

/** @returns A signed scalar between -1.0 and 1.0. */
export function fromScalar8(uInt8: number): number {
  // Make symmetric: round((uint8 - 127) / 127 * 100) / 100
  return uInt8 === 255 ? NaN : clamp(raz((uInt8 - 127) * 0.787401574803149) * 0.01, -1, 1);
}

/**
 * Quantize a number to an 8-bit scalar between 0.0 and 1.0.
 *
 * @param doubleFloat A number.
 * @returns A number (double) in its closest signed scalar representation.
 */
export function uScalarRound(doubleFloat: number): number {
  return fromUScalar8(toUScalar8(doubleFloat));
}

/**
 * Quantize a number to an 8-bit signed scalar between -1.0 and 1.0.
 *
 * @param doubleFloat A number.
 * @returns A number (double) in its closest signed scalar representation.
 */
export function scalarRound(doubleFloat: number): number {
  return fromScalar8(toScalar8(doubleFloat));
}
