import { $hashCodeToStr } from "./hashCode";


/**
 * Read the header bytes of a buffer as a number.
 *
 * @throws {RangeError} if buffer size < 2
 */
export function peekHeader(b: ArrayBuffer | ArrayBufferView): number {
  return (ArrayBuffer.isView(b) ? new DataView(b.buffer, b.byteOffset, 2) : new DataView(b, 0, 2)).getUint16(0, false);
}

/**
 * Read the header bytes of a buffer as a string.
 *
 * @throws {RangeError} if buffer length < 2
 */
export function peekHeaderStr(b: ArrayBuffer | ArrayBufferView): string {
  return $hashCodeToStr(peekHeader(b));
}
