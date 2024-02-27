import { Field } from './Field';
import { MutableArrayBuffer } from './MutableArrayBuffer';
import { ReadState } from './ReadState';
import { Type, TypedTypeDefinition } from './Type';
/**
 * A binary buffer encoder/decoder.
 *
 * Binary
 */
export declare class BinaryCodec<T = any> {
    /**
     * An optional Id (UInt16) to be encoded as the first 2 bytes.
     * Uses @see {hashCode} by default. Set `null` to disable.
     *
     * You can use this with @see {BinaryCodec.peek(...)} or @see {BinaryCodecInterpreter}
     */
    readonly Id?: number | false;
    protected readonly type: Type;
    protected readonly fields: Field[];
    protected readonly subBinaryCodec?: BinaryCodec<T>;
    /** A shape-unique hash. */
    readonly hashCode: number;
    constructor(definition: TypedTypeDefinition<T>, 
    /**
     * An optional Id (UInt16) to be encoded as the first 2 bytes.
     * Uses @see {hashCode} by default. Set `null` to disable.
     *
     * You can use this with @see {BinaryCodec.peek(...)} or @see {BinaryCodecInterpreter}
     */
    Id?: number | false);
    /**
     * Whether this data matches this
     */
    matches(data: any): data is T;
    /**
     * A helper function to peek the Id.
     *
     * Default is integer, but you can set `Type.String` to read a string, otherwise this will return the length of the string.
     *
     * If all your codecs have set a @see {Id}, you can use this to differentiate.
     */
    static peekId(buffer: ArrayBuffer | ArrayBufferView): number;
    /**
     * Encode an object to binary.
     *
     * @throws if the value is invalid
     */
    encode(value: T): ArrayBuffer;
    /**
     * Decode binary data to an object.
     *
     * @throws if fails (e.g. binary data is incompatible with schema).
     */
    decode(arrayBuffer: ArrayBuffer | ArrayBufferView): T;
    /**
    * @param {*} value
    * @param {MutableArrayBuffer} data
    * @param {string} path
    * @throws if the value is invalid
    */
    protected _write(value: {
        [x: string]: any;
    }, data: MutableArrayBuffer, path: string): void;
    /**
     * Writes @see {Id} as the prefix of the buffer.
     */
    protected _writePrefixIfSet(mutableArrayBuffer: MutableArrayBuffer): void;
    /**
    * @param {*} value
    * @param {MutableArrayBuffer} data
    * @param {string} path
    * @param {BinaryCodec} type
    * @throws if the value is invalid
    * @private
    */
    protected _writeArray(value: string | any[], data: any, path: string, type: BinaryCodec<T>): void;
    /**
    * This funciton will be executed only the first time
    * After that, we'll compile the read routine and add it directly to the instance
    * @param {ReadState} state
    * @return {*}
    * @throws if fails
    */
    protected read(state: ReadState): T;
    protected _readOptional(state: ReadState): boolean;
    /**
    * Compile the decode method for this object
    * @return {function(ReadState):*}
    * @private
    */
    protected _compileRead(): (state: ReadState) => T;
    /**
    * @param {BinaryCodec} type
    * @param {ReadState} state
    * @return {Array}
    * @throws - if invalid
    * @private
    */
    protected _readArray(type: {
        read: (arg0: any) => any;
    }, state: any): any[];
}
export default BinaryCodec;
//# sourceMappingURL=BinaryCodec.d.ts.map