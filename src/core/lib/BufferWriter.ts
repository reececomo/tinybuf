import { cfg } from "../config";
import { TinybufError } from "./errors";

/**
 * Wraps a buffer with a write head pointer.
 *
 * @internal
 */
export class BufferWriter {
  public i: number = 0;
  private _$dataView: DataView;

  public constructor(value: number | ArrayBuffer) {
    if (typeof value === 'number') {
      // internal buffer
      this._$dataView = new DataView(new ArrayBuffer(value));
    }
    else {
      // external buffer
      this._$dataView = new DataView(value);
    }
  }

  public $viewBytes(): Uint8Array {
    return new Uint8Array(this._$dataView.buffer, this._$dataView.byteOffset, this.i);
  }

  public $copyBytes(): Uint8Array {
    return new Uint8Array(this._$dataView.buffer.slice(0, this.i));
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

  public $writeUint8(value: number): void {
    this._$dataView.setUint8(this._$alloc(1), value);
  }

  public $writeUint16(value: number): void {
    this._$dataView.setUint16(this._$alloc(2), value, false); // big-endian for varint
  }

  public $writeUint32(value: number): void {
    this._$dataView.setUint32(this._$alloc(4), value, false); // big-endian for varint
  }

  public $writeFloat32(value: number): void {
    this._$dataView.setFloat32(this._$alloc(4), value, true);
  }

  public $writeFloat64(value: number): void {
    this._$dataView.setFloat64(this._$alloc(8), value, true);
  }

  public $writeBuffer(b: Uint8Array | ArrayBuffer | ArrayBufferView): void {
    // allocate bytes first
    const offset = this._$alloc(b.byteLength);

    const bBytes = ArrayBuffer.isView(b)
      ? b instanceof Uint8Array ? b : new Uint8Array(b.buffer, b.byteOffset, b.byteLength)
      : new Uint8Array(b);

    // copy bytes
    new Uint8Array(this._$dataView.buffer, offset, b.byteLength).set(bBytes);
  }

  // ----- Private methods: -----

  /** @returns writer head (byteOffset) */
  private _$alloc(bytes: number): number {
    if (this.i + bytes > this._$dataView.byteLength) {
      const minBytesNeeded = this.i + bytes - this._$dataView.byteLength;
      const requestedNewBytes = Math.ceil(minBytesNeeded / cfg.encodingBufferIncrement) * cfg.encodingBufferIncrement;
      this._$resizeBuffer(this._$dataView.byteLength + requestedNewBytes);
    }

    const j = this.i;
    this.i += bytes;

    return j;
  }

  private _$resizeBuffer(newLength: number): void {
    if (newLength > cfg.encodingBufferMaxSize) {
      // safety check
      throw new TinybufError(`exceeded max encoding buffer size: ${cfg.encodingBufferMaxSize}`);
    }

    const newBuffer = new ArrayBuffer(newLength);

    // copy bytes
    const bytes = new Uint8Array(this._$dataView.buffer, this._$dataView.byteOffset, this._$dataView.byteLength);
    new Uint8Array(newBuffer).set(bytes);

    // update view
    this._$dataView = new DataView(newBuffer);
  }
}
