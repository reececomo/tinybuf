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
    this._$pre(1).setInt8(this._$writeHead, value);
  }

  public $writeInt16(value: number): void {
    this._$pre(2).setInt16(this._$writeHead, value, true);
  }

  public $writeInt32(value: number): void {
    this._$pre(4).setInt32(this._$writeHead, value, true);
  }

  public $writeUint8(value: number): void {
    this._$pre(1).setUint8(this._$writeHead, value);
  }

  public $writeUint16(value: number): void {
    this._$pre(2).setUint16(this._$writeHead, value, false); // big-endian for varint
  }

  public $writeUint32(value: number): void {
    this._$pre(4).setUint32(this._$writeHead, value, false); // big-endian for varint
  }

  public $writeFloat32(value: number): void {
    this._$pre(4).setFloat32(this._$writeHead, value, true);
  }

  public $writeFloat64(value: number): void {
    this._$pre(8).setFloat64(this._$writeHead, value, true);
  }

  public $writeBytes(b: Uint8Array | ArrayBuffer | ArrayBufferView): void {
    // allocate bytes first
    this._$pre(b.byteLength);

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

  /**
   * Pre-allocate some bytes on the dataview, moving the write head into
   * position.
   *
   * @throws TinybufError
   */
  private _$pre(bytes: number): DataView {
    if (this.$byteLength + bytes > this._$dataView.byteLength) {
      this._$malloc(bytes);
    }

    this._$writeHead = this.$byteLength;
    this.$byteLength += bytes;

    return this._$dataView;
  }

  /**
   * @throws TinybufError
   */
  private _$malloc(bytes: number): void {
    if (!this._$resizable) {
      throw new TinybufError("exceeded buffer length: " + this._$dataView.byteLength);
    }

    const currentBytes = this._$dataView.byteLength;
    const minNewBytes = this.$byteLength + bytes - currentBytes;
    const availableBytes = cfg.encodingBufferMaxSize - currentBytes;

    if (minNewBytes > availableBytes) {
      throw new TinybufError("exceeded encodingBufferMaxSize: " + cfg.encodingBufferMaxSize);
    }

    const increment = cfg.encodingBufferIncrement;
    const newBytes = Math.ceil(minNewBytes / increment) * increment;
    const newSize = currentBytes + Math.min(newBytes, availableBytes);
    const buf = new Uint8Array(newSize);

    // copy bytes
    buf.set(this._$bytes);

    // update refs
    this._$dataView = new DataView(buf.buffer);
    this._$bytes = buf;
  }
}
