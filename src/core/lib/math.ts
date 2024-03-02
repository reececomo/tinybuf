/** Clamp a number to a range. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Round toward zero */
export function r2z(x: number): number {
  return x < 0 ? Math.ceil(x) : Math.floor(x);
}
/** Round away zero */
export function raz(x: number): number {
  return x < 0 ? Math.floor(x) : Math.ceil(x);
}
