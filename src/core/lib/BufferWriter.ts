import { cfg } from "../config";
import { TinybufError } from "./errors";

/**
 * Wraps a buffer with a write head pointer.
 *
 * @internal
 */
export class BufferWriter {
  public $byteLength: number = 0;
  private _$dataView: DataView;
  private _$bytes: Uint8Array;
  private _$writeHead: number = 0;
  private _$resizable: boolean;

  public constructor($0: number | Uint8Array) {
    this._$resizable = typeof $0 === "number";
    let b = $0 instanceof Uint8Array ? $0 : new Uint8Array($0);
    this._$bytes = b;
    this._$dataView = new DataView(b.buffer, b.byteOffset, b.byteLength);
  }

  public $viewBytes(): Uint8Array {
    return this._$bytes.subarray(0, this.$byteLength);
  }

  public $copyBytes(): Uint8Array {
    const buf = new Uint8Array(this.$byteLength);
    buf.set(this.$viewBytes());
    return buf;
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
      if (!this._$resizable) throw new TinybufError("exceeded buffer length: " + this._$dataView.byteLength);
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

    const buf = new Uint8Array(newSize);
    buf.set(this._$bytes); // copy bytes

    // update refs
    this._$dataView = new DataView(buf.buffer);
    this._$bytes = buf;
  }
}
