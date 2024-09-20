export function asUint16Str(val: number): string {
  return new Uint16Array([val])[0].toString(2).padStart(16, "0");
}

export function asUint32Str(val: number): string {
  return new Uint32Array([val])[0].toString(2).padStart(32, "0");
}

export function asInt32Str(val: number): string {
  return new Int32Array([val])[0].toString(2).padStart(32, "0");
}

export function asInt64Str(val: bigint): string {
  return new BigInt64Array([val])[0].toString(2).padStart(64, "0");
}

export function getRandomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}