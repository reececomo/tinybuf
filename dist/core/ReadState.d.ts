/**
 * Wraps a buffer with a read head pointer.
 */
export declare class ReadState {
    _offset: number;
    private _dataView;
    constructor(arrayBuffer: ArrayBuffer, skipBytes?: number);
    /** Used to skip bytes for reading headers. */
    incrementOffset(): void;
    peekUInt8(): number;
    readUInt8(): number;
    readUInt16(): number;
    readUInt32(): number;
    readInt8(): number;
    readInt16(): number;
    readInt32(): number;
    readFloat16(): number;
    readFloat32(): number;
    readFloat64(): number;
    /**
     * @throws RangeError
     */
    readBuffer(length: number): ArrayBuffer;
    hasEnded(): boolean;
}
export default ReadState;
//# sourceMappingURL=ReadState.d.ts.map