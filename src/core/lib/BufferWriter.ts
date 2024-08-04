import { SETTINGS } from "../settings";
import { BufferEncodingError } from "./errors";
import { f16mask } from "./float16";

/**
 * Wraps a view into an underlying buffer, and can be dynamically resized.
 */
export class BufferWriter {
  /** byteOffset */
  public o: number = 0;

  private view: DataView;
  private buf: ArrayBuffer;
  private resize: boolean = true;

  public constructor(value: number | ArrayBuffer) {
    if (value instanceof ArrayBuffer) {
      this.buf = value;
      this.resize = false;
    }
    else {
      if (SETTINGS.debug) {
        console.debug(`[tinybuf] allocating new buffer (${value} bytes)`);
      }
      this.buf = new ArrayBuffer(value);
    }
    this.view = new DataView(this.buf, 0, this.buf.byteLength);
  }

  public asView(): Uint8Array {
    return new Uint8Array(this.view.buffer, 0, this.o);
  }

  public asCopy(): Uint8Array {
    return new Uint8Array(this.view.buffer.slice(0, this.o));
  }

  // ----- Writers: -----

  public writeInt8(value: number): void {
    this.view.setInt8(this.alloc(1), value);
  }

  public writeInt16(value: number): void {
    this.view.setInt16(this.alloc(2), value, true);
  }

  public writeInt32(value: number): void {
    this.view.setInt32(this.alloc(4), value, true);
  }

  public writeUInt8(value: number): void {
    this.view.setUint8(this.alloc(1), value);
  }

  public writeUInt16(value: number): void {
    this.view.setUint16(this.alloc(2), value);
  }

  public writeUInt32(value: number): void {
    this.view.setUint32(this.alloc(4), value);
  }

  public writeFloat16(value: number): void {
    this.view.setUint16(this.alloc(2), f16mask(value));
  }

  public writeFloat32(value: number): void {
    this.view.setFloat32(this.alloc(4), value);
  }

  public writeFloat64(value: number): void {
    this.view.setFloat64(this.alloc(8), value);
  }

  public writeBuffer(b: ArrayBuffer | ArrayBufferView): void {
    const byteOffset = this.alloc(b.byteLength);
    const readView = b instanceof Uint8Array ? b
      : b instanceof ArrayBuffer ? new Uint8Array(b)
        : new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
    new Uint8Array(this.view.buffer, byteOffset, b.byteLength).set(readView);
  }

  // ----- Private methods: -----

  /** Allocate the given number of bytes, and then return the current header position (byteOffset). */
  private alloc(bytes: number): number {
    const byteOffset = this.o;

    if (this.o + bytes <= this.view.byteLength) {
      this.o += bytes;

      return byteOffset;
    }

    if (!this.resize) {
      throw new BufferEncodingError(`Write buffer exceeded maximum size of global buffer.`);
    }

    const currentAlloc = this.view.byteLength;
    const minRequestedSize = currentAlloc + bytes;
    if (minRequestedSize > SETTINGS.encodingBufferMaxSize) {
      throw new BufferEncodingError(`Write buffer exceeded maximum size. Bytes requested: ${minRequestedSize}. Max size: ${SETTINGS.encodingBufferMaxSize}.`);
    }

    let newLength = this.view.byteLength;
    do {
      newLength = Math.min(newLength + SETTINGS.encodingBufferIncrement, SETTINGS.encodingBufferMaxSize);
    }
    while (newLength < this.o + bytes);

    if (SETTINGS.debug) {
      console.debug(`[tinybuf] resizing buffer ${currentAlloc} -> ${newLength}`);
    }

    // copy bytes to new buffer
    const newBuffer = new ArrayBuffer(newLength);
    const currentData = new Uint8Array(this.view.buffer, this.view.byteOffset, currentAlloc);
    new Uint8Array(newBuffer).set(currentData);

    // update the view
    this.buf = newBuffer;
    this.view = new DataView(newBuffer);

    // increment the pointer
    this.o += bytes;

    return byteOffset;
  }
}
