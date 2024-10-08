/**
 * Wraps a buffer with a read head pointer.
 *
 * @internal
 */
export class BufferReader {
  public i: number;
  private _$dataView: DataView;

  public constructor(b: Uint8Array | ArrayBufferView | ArrayBuffer, headerBytes?: number) {
    this._$dataView = ArrayBuffer.isView(b)
      ? new DataView(b.buffer, b.byteOffset, b.byteLength)
      : new DataView(b);

    this.i = headerBytes ?? 0; // internal offset (header)
  }

  /** Read the next byte, without moving the read head pointer. */
  public $peek(): number {
    return this._$dataView.getUint8(this.i);
  }

  /** Skip the next byte without reading it. */
  public $skip(): void {
    this.i++;
  }

  // ----- Readers: -----

  public $readUint8(): number {
    return this._$dataView.getUint8(this.i++);
  }

  public $readUint16(): number {
    const r = this._$dataView.getUint16(this.i); // big-endian
    this.i += 2;
    return r;
  }

  public $readUint32(): number {
    const r = this._$dataView.getUint32(this.i); // big-endian
    this.i += 4;
    return r;
  }

  public $readInt8(): number {
    return this._$dataView.getInt8(this.i++);
  }

  public $readInt16(): number {
    const r = this._$dataView.getInt16(this.i, true); // little-endian
    this.i += 2;
    return r;
  }

  public $readInt32(): number {
    const r = this._$dataView.getInt32(this.i, true); // little-endian
    this.i += 4;
    return r;
  }

  public $readFloat32(): number {
    const r = this._$dataView.getFloat32(this.i, true); // little-endian
    this.i += 4;
    return r;
  }

  public $readFloat64(): number {
    const r = this._$dataView.getFloat64(this.i, true); // little-endian
    this.i += 8;
    return r;
  }

  /** @throws RangeError if exceeds length */
  public $readBytes(bytes: number): Uint8Array {
    if (this._$dataView.byteOffset + this.i + bytes > this._$dataView.byteLength) {
      throw new RangeError("exceeded bytes");
    }

    const view = new Uint8Array(this._$dataView.buffer, this._$dataView.byteOffset + this.i, bytes);
    this.i += bytes;

    return view;
  }
}
