/**
 * Wraps a buffer with a read head pointer.
 *
 * @internal
 */
export class BufferReader {
  public i: number;
  private _$dataView!: DataView;
  private _$base!: number;
  private _$byteLength!: number;

  public constructor(b: Uint8Array | ArrayBufferView | ArrayBuffer, headerBytes?: number) {
    this.$reset(b, headerBytes);
  }

  /** Retarget the reader to a new buffer, reusing the existing DataView where possible. */
  public $reset(b: Uint8Array | ArrayBufferView | ArrayBuffer, headerBytes?: number): this {
    const isView = ArrayBuffer.isView(b);
    const buffer = isView ? b.buffer : b;
    const offset = isView ? b.byteOffset : 0;
    let dv = this._$dataView;

    if (
      dv === undefined
      || dv.buffer !== buffer
      || offset < dv.byteOffset
      || offset + b.byteLength > dv.byteOffset + dv.byteLength
    ) {
      dv = this._$dataView = b instanceof DataView ? b : new DataView(buffer);
    }

    this._$base = offset - dv.byteOffset;
    this._$byteLength = b.byteLength;
    this.i = headerBytes ?? 0; // internal offset (header)

    return this;
  }

  /** Read the next byte, without moving the read head pointer. */
  public $peek(): number {
    if (this.i >= this._$byteLength) {
      throw new RangeError("exceeded bytes");
    }

    return this._$dataView.getUint8(this._$base + this.i);
  }

  /** Skip the next byte without reading it. */
  public $skip(): void {
    this.i++;
  }

  // ----- Readers: -----

  public $readUint8(): number {
    return this._$dataView.getUint8(this._$at(1));
  }

  public $readUint16(): number {
    return this._$dataView.getUint16(this._$at(2)); // big-endian
  }

  public $readUint32(): number {
    return this._$dataView.getUint32(this._$at(4)); // big-endian
  }

  public $readInt8(): number {
    return this._$dataView.getInt8(this._$at(1));
  }

  public $readInt16(): number {
    return this._$dataView.getInt16(this._$at(2), true); // little-endian
  }

  public $readInt32(): number {
    return this._$dataView.getInt32(this._$at(4), true); // little-endian
  }

  public $readFloat32(): number {
    return this._$dataView.getFloat32(this._$at(4), true); // little-endian
  }

  public $readFloat64(): number {
    return this._$dataView.getFloat64(this._$at(8), true); // little-endian
  }

  /** @throws RangeError if exceeds length */
  public $readBytes(bytes: number): Uint8Array {
    return new Uint8Array(
      this._$dataView.buffer,
      this._$dataView.byteOffset + this._$at(bytes),
      bytes
    );
  }

  // ----- Private methods: -----

  /**
   * Advance the read head, returning the DataView offset to read from.
   *
   * @throws RangeError if exceeds length
   */
  private _$at(bytes: number): number {
    const i = this.i;

    if (i + bytes > this._$byteLength) {
      throw new RangeError("exceeded bytes");
    }

    this.i = i + bytes;

    return this._$base + i;
  }
}
