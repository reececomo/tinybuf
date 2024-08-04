import { f16unmask } from "./float16";

/**
 * Wraps a buffer with a read head pointer.
 *
 * @internal
 */
export class BufferReader {
  private i: number;
  private data: DataView;

  public constructor(b: Uint8Array | ArrayBufferView | ArrayBuffer, byteOffset?: number) {
    this.data = b instanceof ArrayBuffer ? new DataView(b) : new DataView(b.buffer, b.byteOffset, b.byteLength);
    this.i = byteOffset ?? 0;
  }

  public get hasEnded(): boolean {
    return this.i === this.data.byteLength;
  }

  /** Read the next byte, without moving the read head pointer. */
  public peekUInt8(): number {
    return this.data.getUint8(this.i);
  }

  /** used to skip bytes for reading type headers. */
  public skipByte(): void {
    this.i++;
  }

  // ----- Readers: -----

  public readUint8(): number {
    return this.data.getUint8(this.i++);
  }

  public readUint16(): number {
    const r = this.data.getUint16(this.i);
    this.i += 2;
    return r;
  }

  public readUint32(): number {
    const r = this.data.getUint32(this.i);
    this.i += 4;
    return r;
  }

  public readInt8(): number {
    return this.data.getInt8(this.i++);
  }

  public readInt16(): number {
    const r = this.data.getInt16(this.i, true);
    this.i += 2;
    return r;
  }

  public readInt32(): number {
    const r = this.data.getInt32(this.i, true);
    this.i += 4;
    return r;
  }

  public readFloat16(): number {
    const r = this.data.getUint16(this.i);
    this.i += 2;
    return f16unmask(r);
  }

  public readFloat32(): number {
    const r = this.data.getFloat32(this.i);
    this.i += 4;
    return r;
  }

  public readFloat64(): number {
    const r = this.data.getFloat64(this.i);
    this.i += 8;
    return r;
  }

  /** @throws RangeError if exceeds length */
  public readBuffer(bytes: number): Uint8Array {
    if (this.i + bytes > this.data.byteLength) {
      throw new RangeError('Trying to access beyond byte length');
    }

    const view = new Uint8Array(this.data.buffer, this.i, bytes);
    this.i += bytes;

    return view;
  }
}
