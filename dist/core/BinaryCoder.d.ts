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
export type Infer<FromBinaryCoder> = FromBinaryCoder extends BinaryCoder<infer EncoderType, any> ? InferredDecodedType<EncoderType> : never;
/**
 * BinaryCoder is a utility class for encoding and decoding binary data based
 * on a provided encoding format.
 *
 * @see {Id}
 * @see {encode(data)}
 * @see {decode(binary)}
 */
export declare class BinaryCoder<EncoderType extends EncoderDefinition, IdType extends string | number = number> {
    protected readonly type: Type;
    protected readonly fields: Field[];
    protected _hash?: number;
    protected _format?: string;
    protected _id?: IdType;
    /**
     * @param encoderDefinition A defined encoding format.
     * @param Id Defaults to hash code. Set `false` to disable. Must be a 16-bit unsigned integer.
     */
    constructor(encoderDefinition: EncoderType, Id?: IdType | false);
    /**
     * Read the first two bytes of a buffer as an unsigned 16-bit integer.
     *
     * When passed an ArrayBufferView, accesses the underlying 'buffer' instance directly.
     *
     * @see {BinaryCoder.Id}
     * @throws {RangeError} if buffer size < 2
     */
    static peekIntId(buffer: ArrayBuffer | ArrayBufferView): number;
    /**
     * Read the first two bytes of a buffer as a 2-character string.
     *
     * When passed an ArrayBufferView, accesses the underlying 'buffer' instance directly.
     *
     * @see {BinaryCoder.Id}
     * @throws {RangeError} if buffer size < 2
     */
    static peekStrId(buffer: ArrayBuffer | ArrayBufferView): string;
    /**
     * A unique identifier as an unsigned 16-bit integer. Encoded as the first 2 bytes.
     *
     * @see {BinaryCoder.peekIntId(...)}
     * @see {BinaryCoder.peekStrId(...)}
     * @see {BinaryCoder.hashCode}
     */
    get Id(): IdType | undefined;
    /**
     * @returns A hash code representing the encoding format. An unsigned 16-bit integer.
     */
    get hashCode(): number;
    /**
     * @returns A string describing the encoding format.
     * @example "{uint8,str[]?}"
     */
    get format(): string;
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
     * Generate read function code for this coder.
     *
     * @example
     * // new Type({a:'int', 'b?':['string']}) would emit:
     *
     * `return {
     *   a: this._readField(0, state),
     *   b: this._readField(1, state),
     * }`
     */
    private generateObjectReadCode;
    /** Read an individual field. */
    private _readField;
    /** Compile the decode method for this object. */
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