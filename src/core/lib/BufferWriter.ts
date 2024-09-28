import { cfg } from "../config";
import { TinybufError } from "./errors";

/**
 * Wraps a buffer with a write head pointer.
 *
 * @internal
 */
export class BufferWriter {
  public $byteLength: number = 0;
  public _$dataView: DataView;
  private _$writeHead: number = 0;

  public constructor(initialSize: number) {
    this._$dataView = new DataView(new ArrayBuffer(initialSize));
  }

  public $viewBytes(): Uint8Array {
    return new Uint8Array(this._$dataView.buffer, this._$dataView.byteOffset, this.$byteLength);
  }

  public $copyBytes(): Uint8Array {
    return new Uint8Array(this._$dataView.buffer.slice(0, this.$byteLength));
  }

  // ----- Writers: -----

  public $writeInt8(value: number): void {
    this._$alloc(1).setInt8(this._$writeHead, value);
  }

  public $writeInt16(value: number): void {
    this._$alloc(2).setInt16(this._$writeHead, value, true);
  }

  public $writeInt32(value: number): void {
    this._$alloc(4).setInt32(this._$writeHead, value, true);
  }

  public $writeUint8(value: number): void {
    this._$alloc(1).setUint8(this._$writeHead, value);
  }

  public $writeUint16(value: number): void {
    this._$alloc(2).setUint16(this._$writeHead, value, false); // big-endian for varint
  }

  public $writeUint32(value: number): void {
    this._$alloc(4).setUint32(this._$writeHead, value, false); // big-endian for varint
  }

  public $writeFloat32(value: number): void {
    this._$alloc(4).setFloat32(this._$writeHead, value, true);
  }

  public $writeFloat64(value: number): void {
    this._$alloc(8).setFloat64(this._$writeHead, value, true);
  }

  public $writeBytes(b: Uint8Array | ArrayBuffer | ArrayBufferView): void {
    // allocate bytes first
    this._$alloc(b.byteLength);

    let bBytes: Uint8Array = ArrayBuffer.isView(b)
      ? b instanceof Uint8Array
        ? b
        : new Uint8Array(b.buffer, b.byteOffset, b.byteLength)
      : new Uint8Array(b);

    // copy bytes
    new Uint8Array(
      this._$dataView.buffer,
      this._$dataView.byteOffset + this._$writeHead,
      b.byteLength
    ).set(bBytes);
  }

  // ----- Private methods: -----

  private _$alloc(bytes: number): DataView {
    if (this.$byteLength + bytes > this._$dataView.byteLength) {
      const minBytesNeeded = this.$byteLength + bytes - this._$dataView.byteLength;
      const requestedNewBytes = Math.ceil(minBytesNeeded / cfg.encodingBufferIncrement) * cfg.encodingBufferIncrement;
      this._$resizeBuffer(this._$dataView.byteLength + requestedNewBytes);
    }

    this._$writeHead = this.$byteLength;
    this.$byteLength += bytes;

    return this._$dataView;
  }

  private _$resizeBuffer(newSize: number): void {
    if (newSize > cfg.encodingBufferMaxSize) {
      // safety check
      throw new TinybufError(`exceeded encodingBufferMaxSize: ${cfg.encodingBufferMaxSize}`);
    }

    const newBuf = new ArrayBuffer(newSize);

    // copy bytes
    const oldView = new Uint8Array(this._$dataView.buffer, this._$dataView.byteOffset, this._$dataView.byteLength);
    new Uint8Array(newBuf).set(oldView);

    // update ref
    this._$dataView = new DataView(newBuf);
  }
}
