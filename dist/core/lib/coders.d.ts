import { MutableArrayBuffer } from '../MutableArrayBuffer';
import { ReadState } from '../ReadState';
export interface BinaryTypeCoder<T> {
    write(value: T, data: MutableArrayBuffer, path?: string): void;
    read(state: ReadState): T;
}
export declare class WriteTypeError extends TypeError {
    constructor(expectedType: string, value: any, path?: string);
}
/**
 * Dynamic resize.
 *
 * Formats (big-endian):
 * 7b  0xxx xxxx
 * 14b  10xx xxxx  xxxx xxxx
 * 29b  110x xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx
 * 61b  111x xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx
 */
export declare const uintCoder: BinaryTypeCoder<number>;
export declare const uint8Coder: BinaryTypeCoder<number>;
export declare const uint16Coder: BinaryTypeCoder<number>;
export declare const uint32Coder: BinaryTypeCoder<number>;
/**
 * Same format as uint
 */
export declare const intCoder: BinaryTypeCoder<number>;
export declare const int8Coder: BinaryTypeCoder<number>;
export declare const int16Coder: BinaryTypeCoder<number>;
export declare const int32Coder: BinaryTypeCoder<number>;
/**
 * 16-bit half precision float
 */
export declare const float16Coder: BinaryTypeCoder<number>;
/**
 * 32-bit single precision float
 */
export declare const float32Coder: BinaryTypeCoder<number>;
/**
 * 64-bit double precision float
 */
export declare const float64Coder: BinaryTypeCoder<number>;
/**
 * <uint_length> <buffer_data>
 */
export declare const stringCoder: BinaryTypeCoder<string>;
/**
 * <uint_length> <buffer_data>
 */
export declare const arrayBufferCoder: BinaryTypeCoder<ArrayBuffer>;
/**
 * either 0x00 or 0x01
 */
export declare const booleanCoder: BinaryTypeCoder<boolean>;
/**
 * Encode any number of booleans as one or more UInt8s.
 *
 * <padding> <is_last> <payload ...>
 */
export declare const booleanArrayCoder: BinaryTypeCoder<boolean[]>;
/**
 * Encode exactly 8 booleans as a UInt8.
 */
export declare const bitmask8Coder: BinaryTypeCoder<boolean[]>;
/**
 * Encode exactly 16 booleans as a UInt16.
 */
export declare const bitmask16Coder: BinaryTypeCoder<boolean[]>;
/**
 * Encode exactly 32 booleans as a UInt32.
 */
export declare const bitmask32Coder: BinaryTypeCoder<boolean[]>;
/**
 * <uint_length> <buffer_data>
 */
export declare const jsonCoder: BinaryTypeCoder<any>;
/**
 * <uint_source_length> <buffer_source_data> <flags>
 * flags is a bit-mask: g=1, i=2, m=4
 */
export declare const regexCoder: BinaryTypeCoder<RegExp>;
/**
 * <uint_time_ms>
 */
export declare const dateCoder: BinaryTypeCoder<Date>;
//# sourceMappingURL=coders.d.ts.map