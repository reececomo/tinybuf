import * as coders from './lib/coders';
import { Field } from './Field';
import { MutableArrayBuffer } from './MutableArrayBuffer';
import { InferredDecodedType, EncoderDefinition, Type } from './Type';
/**
 * BinaryCodec is a utility class for encoding and decoding binary data based
 * on a provided encoding format.
 *
 * @see {Id}
 * @see {hashCode}
 * @see {encode(data)}
 * @see {decode(binary)}
 */
export declare class BinaryCodec<EncoderType extends EncoderDefinition> {
    /**
     * A 16-bit integer identifier, encoded as the first 2 bytes.
     * @see {BinaryCodec.peek(...)}
     */
    readonly Id?: number | false;
    /**
     * A shape-based unique representation of the encoding format.
     */
    readonly hashCode: number;
    protected readonly type: Type;
    protected readonly fields: Field[];
    /**
     * @param encoderDefinition A defined encoding format.
     * @param Id Defaults to hash code. Set `false` to disable. Must be a 16-bit unsigned integer.
     */
    constructor(encoderDefinition: EncoderType, Id?: number | false);
    /**
     * Whether this data matches this
     */
    matches(data: any): data is EncoderType;
    /**
     * Read the first two bytes of a buffer.
     *
     * When passed an ArrayBufferView, accesses the underlying 'buffer' instance directly.
     *
     * @see {BinaryCodec.Id}
     * @throws {RangeError} if buffer size < 2
     */
    static peekId(buffer: ArrayBuffer | ArrayBufferView): number;
    /**
     * Encode an object to binary.
     *
     * @throws if the value is invalid
     */
    encode<DecodedType extends InferredDecodedType<EncoderType>>(value: DecodedType): ArrayBuffer;
    /**
     * Decode binary data to an object.
     *
     * @throws if fails (e.g. binary data is incompatible with schema).
     */
    decode<DecodedType = InferredDecodedType<EncoderType>>(arrayBuffer: ArrayBuffer | ArrayBufferView): DecodedType;
    /**
    * @param {*} value
    * @param {MutableArrayBuffer} data
    * @param {string} path
    * @throws if the value is invalid
    */
    protected write(value: {
        [x: string]: any;
    }, data: MutableArrayBuffer, path: string): void;
    /**
     * Writes @see {Id} as the prefix of the buffer.
     */
    protected writeId(mutableArrayBuffer: MutableArrayBuffer): void;
    /**
    * This function will be executed only the first time
    * After that, we'll compile the read routine and add it directly to the instance
    * @param {ReadState} state
    * @return {*}
    * @throws if fails
    */
    private read;
    /**
    * Compile the decode method for this object.
    */
    private compileRead;
    /**
     * Helper to get the right coder.
     */
    protected getCoder(type: Type): coders.BinaryTypeCoder<any>;
    /**
    * @param {*} value
    * @param {MutableArrayBuffer} data
    * @param {string} path
    * @param {BinaryCodec} type
    * @throws if the value is invalid
    */
    private _writeArray;
    /**
    * @param {BinaryCodec} type
    * @param {ReadState} state
    * @return {Array}
    * @throws - if invalid
    */
    private _readArray;
    private _readOptional;
}
export default BinaryCodec;
//# sourceMappingURL=BinaryCodec.d.ts.map