import { hashCodeToStr } from "./hashCode";


/**
 * Read the header bytes of a buffer as a number.
 *
 * @throws {RangeError} if buffer size < 2
 */
export function peekHeader(buffer: ArrayBuffer | ArrayBufferView): number {
  return new DataView(buffer instanceof ArrayBuffer ? buffer : buffer.buffer).getUint16(0, false);
}

/**
 * Read the header bytes of a buffer as a string.
 *
 * @throws {RangeError} if buffer size < 2
 */
export function peekHeaderStr(buffer: ArrayBuffer | ArrayBufferView): string {
  return hashCodeToStr(peekHeader(buffer));
}
