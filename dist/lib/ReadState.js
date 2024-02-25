"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadState = void 0;
/**
 * Wraps a buffer with a read head pointer.
 */
class ReadState {
    constructor(arrayBuffer) {
        this._offset = 0;
        this._dataView = new DataView(arrayBuffer);
    }
    /** Used to skip bytes for reading headers. */
    incrementOffset() {
        this._offset++;
    }
    peekUInt8() {
        return this._dataView.getUint8(this._offset);
    }
    readUInt8() {
        return this._dataView.getUint8(this._offset++);
    }
    readUInt16() {
        var r = this._dataView.getUint16(this._offset);
        this._offset += 2;
        return r;
    }
    readUInt32() {
        var r = this._dataView.getUint32(this._offset);
        this._offset += 4;
        return r;
    }
    readInt8() {
        return this._dataView.getInt8(this._offset++);
    }
    readInt16() {
        var r = this._dataView.getInt16(this._offset, true);
        this._offset += 2;
        return r;
    }
    readInt32() {
        var r = this._dataView.getInt32(this._offset, true);
        this._offset += 4;
        return r;
    }
    readFloat() {
        var r = this._dataView.getFloat32(this._offset);
        this._offset += 4;
        return r;
    }
    readDouble() {
        var r = this._dataView.getFloat64(this._offset);
        this._offset += 8;
        return r;
    }
    readBuffer(length) {
        if (this._offset + length > this._dataView.byteLength) {
            throw new RangeError('Trying to access beyond byte length');
        }
        const arrayBuffer = this._dataView.buffer.slice(this._offset, this._offset + length);
        this._offset += length;
        return arrayBuffer;
    }
    hasEnded() {
        return this._offset === this._dataView.byteLength;
    }
}
exports.ReadState = ReadState;
exports.default = ReadState;
//# sourceMappingURL=ReadState.js.map