/**
 * Wraps a buffer with a read head pointer.
 */
export declare class ReadState {
    private _dataView;
    private _offset;
    constructor(arrayBuffer: ArrayBuffer);
    /** Used to skip bytes for reading headers. */
    incrementOffset(): void;
    peekUInt8(): number;
    readUInt8(): number;
    readUInt16(): number;
    readUInt32(): number;
    readInt8(): number;
    readInt16(): number;
    readInt32(): number;
    readFloat(): number;
    readDouble(): number;
    readBuffer(length: number): ArrayBuffer;
    hasEnded(): boolean;
}
export default ReadState;
//# sourceMappingURL=ReadState.d.ts.map