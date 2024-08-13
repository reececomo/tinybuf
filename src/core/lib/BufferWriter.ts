import { cfg } from "../config";
import { TinybufError } from "./errors";

/**
 * Wraps a buffer with a write head pointer.
 *
 * @internal
 */
export class BufferWriter {
  public i: number = 0;
  public _$dataView: DataView;

  public constructor(initialSize: number) {
    console.debug(`initializing buffer to ${initialSize}`);
    this._$dataView = new DataView(new ArrayBuffer(initialSize));
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

  public $writeBytes(b: Uint8Array | ArrayBuffer | ArrayBufferView): void {
    console.debug(`writeBytes: buf size ${b.byteLength}`);
    // allocate bytes first
    const j = this._$alloc(b.byteLength);

    const bBytes: Uint8Array = ArrayBuffer.isView(b)
      ? b instanceof Uint8Array ? b : new Uint8Array(b.buffer, b.byteOffset, b.byteLength)
      : new Uint8Array(b);

    // copy bytes
    console.warn(`writing bytes from buffer with length: ${bBytes.byteLength} and ${bBytes.byteOffset} into local buffer with length: ${this._$dataView.byteLength} and offset: ${this._$dataView.byteOffset} with head pointer at: ${j}`);
    new Uint8Array(this._$dataView.buffer, this._$dataView.byteOffset + j, b.byteLength).set(bBytes);
  }

  // ----- Private methods: -----

  /** @returns writer head (byteOffset) */
  private _$alloc(bytes: number): number {
    if (this.i + bytes > this._$dataView.byteLength) {
      const minBytesNeeded = this.i + bytes - this._$dataView.byteLength;
      const requestedNewBytes = Math.ceil(minBytesNeeded / cfg.encodingBufferIncrement) * cfg.encodingBufferIncrement;
      this._$resizeBuffer(this._$dataView.byteLength + requestedNewBytes);
    }

    if (bytes === undefined) throw new Error(`bytes undefined`);
    if (isNaN(this.i)) throw new Error(`i is NaN`);

    const j = this.i;
    this.i += bytes;

    return j;
  }

  private _$resizeBuffer(newSize: number): void {
    if (newSize > cfg.encodingBufferMaxSize) {
      // safety check
      throw new TinybufError(`exceeded encodingBufferMaxSize: ${cfg.encodingBufferMaxSize}`);
    }

    console.debug(`resized buffer from ${this._$dataView.byteLength} to ${newSize}`);
    const newBuf = new ArrayBuffer(newSize);

    // copy bytes
    const oldView = new Uint8Array(this._$dataView.buffer, this._$dataView.byteOffset, this._$dataView.byteLength);
    new Uint8Array(newBuf).set(oldView);

    // update view
    this._$dataView = new DataView(newBuf);
  }
}
