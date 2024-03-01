/**
 * A mutable-length write-only array buffer.
 *
 * If you use beyond the byte limit of the underlying buffer, it will be dynamically resized.
 */
export declare class MutableArrayBuffer {
    private maxAutoResizeIncrementBytes;
    private _dataView;
    private _length;
    constructor(initialBytes?: number, maxAutoResizeIncrementBytes?: number);
    /** The amount of bytes consumed by actual data. */
    get byteLength(): number;
    /** The amount of bytes currently available to the underlying memory. */
    get currentAllocatedBytes(): number;
    appendBuffer(data: ArrayBuffer): void;
    writeInt8(value: number): void;
    writeInt16(value: number): void;
    writeInt32(value: number): void;
    writeUInt8(value: number): void;
    writeUInt16(value: number): void;
    writeUInt32(value: number): void;
    writeFloat16(value: number): void;
    writeFloat32(value: number): void;
    writeFloat64(value: number): void;
    /**
     * Return the data as a correctly-sized array buffer.
     *
     * Note: The returned buffer and the internal buffer share the same memory
     */
    toArrayBuffer(): ArrayBuffer;
    /**
     * Alloc the given number of bytes (if needed).
     */
    private _alloc;
}
export default MutableArrayBuffer;
//# sourceMappingURL=MutableArrayBuffer.d.ts.map