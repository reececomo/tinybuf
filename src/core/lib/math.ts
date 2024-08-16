export const $floor = Math.floor,
  $ceil = Math.ceil;

/** Clamp a number to a range. */
export const $clamp = (value: number, min: number, max: number): number =>
  value > max ? max : value < min ? min : value;

/** Round toward zero */
export const $roundTowardZero = (x: number): number => x < 0 ? $ceil(x) : $floor(x);

/** Round away zero */
export const $roundAwayFromZero = (x: number): number =>
  x < 0 ? $floor(x) : $ceil(x);
