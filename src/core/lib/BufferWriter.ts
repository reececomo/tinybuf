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
    // allocate bytes first
    const lol = this.i;
    const j = this._$alloc(b.byteLength);

    console.log(`buffer: allocating ${j} for a total of ${this._$dataView.byteLength}`);

    let bBytes: Uint8Array
      try {
       bBytes = ArrayBuffer.isView(b)
       ? b instanceof Uint8Array ? b : new Uint8Array(b.buffer, b.byteOffset, b.byteLength)
       : new Uint8Array(b);
      }
      catch (error) {
        throw new Error('failed to copy bytes reason 11'); // FIXME: remove
      }

    // copy bytes
    let newView: Uint8Array;
    try {
      newView = new Uint8Array(this._$dataView.buffer, this._$dataView.byteOffset + j, b.byteLength);
    }
    catch (error) {
      throw new Error(`failed to copy bytes reason 61 - from ${lol} for ${b.byteLength} we're allocating ${j} for a total of ${this._$dataView.byteLength}`); // FIXME: remove
    }
    try {
      newView.set(bBytes);
    }
    catch (error) {
      throw new Error('failed to copy bytes reason 33'); // FIXME: remove
    }
    
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
