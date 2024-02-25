"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MutableArrayBuffer = void 0;
/**
 * A mutable-length write-only array buffer.
 *
 * If you use beyond the byte limit of the underlying buffer, it will be dynamically resized.
 */
class MutableArrayBuffer {
    constructor(initialBytes = 128, maxAutoResizeIncrementBytes = 1024) {
        this.maxAutoResizeIncrementBytes = maxAutoResizeIncrementBytes;
        this._length = 0;
        this.appendBuffer = function (data) {
            this._alloc(data.byteLength);
            const tempDataView = new DataView(data instanceof ArrayBuffer ? data : data.buffer);
            for (let i = 0; i < data.byteLength; i++) {
                this._dataView.setUint8(this._length + i, tempDataView.getUint8(i));
            }
            this._length += data.byteLength;
        };
        const arrayBuffer = new ArrayBuffer(initialBytes);
        this._dataView = new DataView(arrayBuffer);
    }
    /** The amount of bytes consumed by actual data. */
    get byteLength() {
        return this._length;
    }
    /** The amount of bytes currently available to the underlying memory. */
    get currentAllocatedBytes() {
        return this._dataView.byteLength;
    }
    writeInt8(value) {
        this._alloc(1);
        this._dataView.setInt8(this._length, value);
        this._length++;
    }
    writeInt16(value) {
        this._alloc(2);
        this._dataView.setInt16(this._length, value, true);
        this._length += 2;
    }
    writeInt32(value) {
        this._alloc(4);
        this._dataView.setInt32(this._length, value, true);
        this._length += 4;
    }
    writeUInt8(value) {
        this._alloc(1);
        this._dataView.setUint8(this._length, value);
        this._length++;
    }
    writeUInt16(value) {
        this._alloc(2);
        this._dataView.setUint16(this._length, value);
        this._length += 2;
    }
    writeUInt32(value) {
        this._alloc(4);
        this._dataView.setUint32(this._length, value);
        this._length += 4;
    }
    writeFloat(value) {
        this._alloc(4);
        this._dataView.setFloat32(this._length, value);
        this._length += 4;
    }
    writeDouble(value) {
        this._alloc(8);
        this._dataView.setFloat64(this._length, value);
        this._length += 8;
    }
    /**
     * Return the data as a correctly-sized array buffer.
     *
     * Note: The returned buffer and the internal buffer share the same memory
     */
    toArrayBuffer() {
        return this._dataView.buffer.slice(0, this._length);
    }
    /**
     * Alloc the given number of bytes (if needed).
     */
    _alloc(bytes) {
        const currentDataViewLength = this._dataView.byteLength;
        if (this._length + bytes <= currentDataViewLength) {
            return;
        }
        let newBufferLength = this._dataView.byteLength;
        do {
            // Extend the length of the buffer until we're above the limit.
            newBufferLength += Math.min(newBufferLength, this.maxAutoResizeIncrementBytes);
        } while (this._length + bytes > newBufferLength);
        // Copy
        const newArrayBuffer = new ArrayBuffer(newBufferLength);
        const newDataView = new DataView(newArrayBuffer);
        for (let i = 0; i < currentDataViewLength; i++) {
            const value = this._dataView.getUint8(i);
            newDataView.setUint8(i, value);
        }
        this._dataView = newDataView;
    }
}
exports.MutableArrayBuffer = MutableArrayBuffer;
exports.default = MutableArrayBuffer;
//# sourceMappingURL=MutableArrayBuffer.js.map