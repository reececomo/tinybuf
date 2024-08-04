import { SETTINGS } from "../settings";
import { BufferEncodingError } from "./errors";
import { toFloat16 } from "./float16";

export interface SharedBufferProvider {
  _buf?: ArrayBuffer;
}

/**
 * Wraps a view into an underlying buffer, and can be dynamically resized.
 * @internal
 */
export class BufferWriter {
  private data: DataView;
  /** byteOffset */
  private o: number = 0;
  /** reference to a shared buffer */
  private sbp?: SharedBufferProvider;

  public constructor(newBufferLength?: number)
  public constructor(bufferProvider: SharedBufferProvider)
  public constructor(value?: number | SharedBufferProvider) {
    if (value instanceof Object) {
      // use shared buffer
      this.sbp = value;
      // lazy init
      if (value._buf === undefined) value._buf = new ArrayBuffer(SETTINGS.writeBufferDefaultSize);
      this.data = new DataView(value._buf, 0);
    }
    else {
      // create new buffer
      this.data = new DataView(new ArrayBuffer(value ?? SETTINGS.writeBufferDefaultSize));
    }
  }

  public get allocatedBytes(): number {
    return this.data.byteLength;
  }

  public asView(): Uint8Array {
    return new Uint8Array(this.data.buffer, 0, this.o);
  }

  public asCopy(): Uint8Array {
    return new Uint8Array(this.data.buffer.slice(0, this.o));
  }

  // ----- Writers: -----
  /* eslint-disable disable-autofix/jsdoc/require-jsdoc */

  public writeBuffer(b: ArrayBuffer | ArrayBufferView): void {
    const byteOffset = this.alloc(b.byteLength);
    const readView = b instanceof Uint8Array ? b : b instanceof ArrayBuffer ? new Uint8Array(b) : new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
    const writeView = new Uint8Array(this.data.buffer, byteOffset, b.byteLength);
    writeView.set(readView);
  }

  public writeInt8(value: number): void {
    this.data.setInt8(this.alloc(1), value);
  }

  public writeInt16(value: number): void {
    this.data.setInt16(this.alloc(2), value, true);
  }

  public writeInt32(value: number): void {
    this.data.setInt32(this.alloc(4), value, true);
  }

  public writeUInt8(value: number): void {
    this.data.setUint8(this.alloc(1), value);
  }

  public writeUInt16(value: number): void {
    this.data.setUint16(this.alloc(2), value);
  }

  public writeUInt32(value: number): void {
    this.data.setUint32(this.alloc(4), value);
  }

  public writeFloat16(value: number): void {
    this.data.setUint16(this.alloc(2), toFloat16(value));
  }

  public writeFloat32(value: number): void {
    this.data.setFloat32(this.alloc(4), value);
  }

  public writeFloat64(value: number): void {
    this.data.setFloat64(this.alloc(8), value);
  }
  /* eslint-enable disable-autofix/jsdoc/require-jsdoc */

  // ----- Private methods: -----

  /** Get the current byte offset, allocate the given number of bytes (if needed), and then increment the offset. */
  private alloc(bytes: number): number {
    const byteOffset = this.o;

    if (this.o + bytes <= this.data.byteLength) {
      this.o += bytes;

      return byteOffset;
    }

    const currentAlloc = this.data.byteLength;
    const minRequestedSize = currentAlloc + bytes;
    if (minRequestedSize > SETTINGS.writeBufferMaxSize) {
      throw new BufferEncodingError(`Write buffer exceeded maximum size. Bytes requested: ${minRequestedSize}. SETTINGS.writeBufferMaxSize: ${SETTINGS.writeBufferMaxSize}.`);
    }

    let newLength = this.data.byteLength;
    do {
      newLength = Math.min(newLength + SETTINGS.writeBufferIncrement, SETTINGS.writeBufferMaxSize);
    }
    while (newLength < this.o + bytes);

    // copy bytes to new buffer
    const newBuffer = new ArrayBuffer(newLength);
    const currentData = new Uint8Array(this.data.buffer, this.data.byteOffset, currentAlloc);
    new Uint8Array(newBuffer).set(currentData);

    if (this.sbp) {
      this.sbp._buf = newBuffer;
    }

    // update the view
    this.data = new DataView(newBuffer);

    // increment the pointer
    this.o += bytes;

    return byteOffset;
  }
}
