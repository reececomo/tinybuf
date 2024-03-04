import * as coders from './lib/coders';
import { Field } from './Field';
import { MutableArrayBuffer } from './MutableArrayBuffer';
import { InferredDecodedType, EncoderDefinition, Type } from './Type';
/**
 * Infer the decoded type of a BinaryCoder.
 *
 * @example
 * let onData = (data: Infer<typeof MyBinaryCoder>) => {...};
 */
export type Infer<FromBinaryCoder> = FromBinaryCoder extends BinaryCoder<infer EncoderType> ? InferredDecodedType<EncoderType> : never;
/**
 * BinaryCoder is a utility class for encoding and decoding binary data based
 * on a provided encoding format.
 *
 * @see {Id}
 * @see {hashCode}
 * @see {encode(data)}
 * @see {decode(binary)}
 */
export declare class BinaryCoder<EncoderType extends EncoderDefinition> {
    /**
     * A 16-bit integer identifier, encoded as the first 2 bytes.
     * @see {BinaryCoder.peek(...)}
     */
    readonly Id?: number;
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
     * Read the first two bytes of a buffer.
     *
     * When passed an ArrayBufferView, accesses the underlying 'buffer' instance directly.
     *
     * @see {BinaryCoder.Id}
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
     * @param value
     * @param data
     * @param path
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
     * Helper to get the right coder.
     */
    protected getCoder(type: Type): coders.BinaryTypeCoder<any>;
    /**
     * This function will be executed only the first time
     * After that, we'll compile the read routine and add it directly to the instance
     * @param state
     * @returns
     * @throws if fails
     */
    private read;
    /**
     * Compile the decode method for this object.
     */
    private compileRead;
    /**
     * @param value
     * @param data
     * @param path
     * @param type
     * @throws if the value is invalid
     */
    private _writeArray;
    /**
     * @throws if invalid data
     */
    private _readArray;
    private _readOptional;
}
export default BinaryCoder;
//# sourceMappingURL=BinaryCoder.d.ts.map