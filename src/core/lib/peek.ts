import { $hashCodeToStr } from "./hashCode";


/**
 * Read the header bytes of a buffer as a number.
 *
 * @throws {RangeError} if buffer size < 2
 */
export function peekHeader(b: ArrayBuffer | ArrayBufferView): number {
  if (b.byteLength < 2) {
    throw new RangeError("buffer length < 2");
  }

  if (b instanceof Uint8Array) return (b[0] << 8) | b[1];
  if (b instanceof DataView) return b.getUint16(0, false);

  const u8 = ArrayBuffer.isView(b) ? new Uint8Array(b.buffer, b.byteOffset, 2) : new Uint8Array(b, 0, 2);

  return (u8[0] << 8) | u8[1];
}

/**
 * Read the header bytes of a buffer as a string.
 *
 * @throws {RangeError} if buffer length < 2
 */
export function peekHeaderStr(b: ArrayBuffer | ArrayBufferView): string {
  return $hashCodeToStr(peekHeader(b));
}
