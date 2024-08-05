import { cfg } from "../settings";
import { EncodeError } from "./errors";
import { $f16mask } from "./float16";

/**
 * Wraps a view into an underlying buffer, and can be dynamically resized.
 *
 * @internal
 */
export class BufferWriter {
  public $byteOffset: number = 0;

  private _$dataView: DataView;
  private _$buf: ArrayBuffer;
  private readonly _$autoResize: boolean;

  public constructor(value: number | ArrayBuffer) {
    if (value instanceof ArrayBuffer) {
      this._$buf = value;
      this._$autoResize = false;
    }
    else {
      this._$buf = new ArrayBuffer(value);
      this._$autoResize = true;
    }

    this._$dataView = new DataView(this._$buf, 0, this._$buf.byteLength);
  }

  public $asView(): Uint8Array {
    return new Uint8Array(this._$dataView.buffer, 0, this.$byteOffset);
  }

  public $asCopy(): Uint8Array {
    return new Uint8Array(this._$dataView.buffer.slice(0, this.$byteOffset));
  }

  // ----- Writers: -----

  public $writeInt8(value: number): void {
    this._$dataView.setInt8(this._$alloc(1), value);
  }

  public $writeInt16(value: number): void {
    this._$dataView.setInt16(this._$alloc(2), value, true);
  }

  public $writeInt32(value: number): void {
    this._$dataView.setInt32(this._$alloc(4), value, true);
  }

  public $writeUInt8(value: number): void {
    this._$dataView.setUint8(this._$alloc(1), value);
  }

  public $writeUInt16(value: number): void {
    this._$dataView.setUint16(this._$alloc(2), value); // big-endian
  }

  public $writeUInt32(value: number): void {
    this._$dataView.setUint32(this._$alloc(4), value); // big-endian
  }

  public $writeFloat16(value: number): void {
    this._$dataView.setUint16(this._$alloc(2), $f16mask(value));
  }

  public $writeFloat32(value: number): void {
    this._$dataView.setFloat32(this._$alloc(4), value, true);
  }

  public $writeFloat64(value: number): void {
    this._$dataView.setFloat64(this._$alloc(8), value, true);
  }

  public $writeBuffer(b: ArrayBuffer | ArrayBufferView): void {
    const byteOffset = this._$alloc(b.byteLength);
    const readView = b instanceof Uint8Array ? b
      : b instanceof ArrayBuffer ? new Uint8Array(b)
        : new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
    new Uint8Array(this._$dataView.buffer, byteOffset, b.byteLength).set(readView);
  }

  // ----- Private methods: -----

  /** Allocate the given number of bytes, and then return the current header position (byteOffset). */
  private _$alloc(bytes: number): number {
    if (this.$byteOffset + bytes <= this._$dataView.byteLength) {
      const i = this.$byteOffset; // copy
      this.$byteOffset += bytes;

      return i;
    }

    const currentAlloc = this._$dataView.byteLength;
    const minRequestedSize = currentAlloc + bytes;
    if (!this._$autoResize || minRequestedSize > cfg.encodingBufferMaxSize) {
      throw new EncodeError(`exceeded max encoding buffer size: ${cfg.encodingBufferMaxSize}`);
    }

    let newLength = this._$dataView.byteLength;
    do {
      newLength = Math.min(newLength + cfg.encodingBufferIncrement, cfg.encodingBufferMaxSize);
    }
    while (newLength < this.$byteOffset + bytes);

    // copy bytes to new buffer
    const newBuffer = new ArrayBuffer(newLength);
    const currentData = new Uint8Array(this._$dataView.buffer, this._$dataView.byteOffset, currentAlloc);
    new Uint8Array(newBuffer).set(currentData);

    // update the view
    this._$buf = newBuffer;
    this._$dataView = new DataView(newBuffer);

    // increment the pointer
    const i = this.$byteOffset; // copy
    this.$byteOffset += bytes;

    return i;
  }
}
