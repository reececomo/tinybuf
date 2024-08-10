import { $clamp, $roundTowardZero, $roundAwayFromZero } from "./math";

/**
 * Quantize a number to an 8-bit scalar between 0.0 and 1.0.
 *
 * @returns A number (double) in its closest signed scalar representation.
 */
export function uscalround(x: number): number {
  return $fromuscal8($touscal8(x));
}

/**
 * Quantize a number to an 8-bit signed scalar between -1.0 and 1.0.
 *
 * @returns A number (double) in its closest signed scalar representation.
 */
export function scalround(x: number): number {
  return $fromscal8($toscal8(x));
}

/** @returns A UInt8 bitmask representation. */
export function $touscal8(x: number): number {
  return $clamp(127 + $roundTowardZero(x * 254 - 127), 0, 254);
}

/** @returns A UInt8 bitmask representation. */
export function $toscal8(x: number): number {
  return $clamp($roundTowardZero(x * 127), -127, 127) + 127;
}

/** @returns An unsigned scalar between 0.0 and 1.0. */
export function $fromuscal8(x: number): number {
  // Make symmetric: (0.5 + round((uint8 - 127) / 254 * 100)) / 100
  return $clamp(($roundAwayFromZero((x - 127) * 0.3937007874015748) + 50) * 0.01, 0, 1);
}

/** @returns A signed scalar between -1.0 and 1.0. */
export function $fromscal8(x: number): number {
  // Make symmetric: round((uint8 - 127) / 127 * 100) / 100
  return $clamp($roundAwayFromZero((x - 127) * 0.787401574803149) * 0.01, -1, 1);
}
