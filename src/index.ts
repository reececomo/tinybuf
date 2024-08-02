import BinaryCoder from './core/BinaryCoder';
import { BinaryFormatHandler } from './core/BinaryFormatHandler';
import { EncoderDefinition, optional } from './core/Type';

export {
  Type,
  optional,
  EncoderDefinition,
  FieldDefinition,
  InferredDecodedType,
  ValueTypes,
} from './core/Type';

export * from './core/BinaryCoder';
export * from './core/BinaryFormatHandler';

export * from './core/MutableArrayBuffer';
export * from './core/ReadState';

export * from './core/lib/peek';
export * from './core/lib/float16';
export * from './core/lib/scalar';
export * as coders from './core/lib/coders';

// -- tinybuf: --

/**
 * Processes incoming binary buffers and forwards data to the appropriate registered handler.
 *
 * @example
 * const MyDecoder = decoder()
 *   .on(MyFormat, data => { ... });
 *
 * MyDecoder.processBuffer(rawBuffer);
 */
export const bufferParser = (): BinaryFormatHandler => new BinaryFormatHandler();

/**
 * Defines a format for encoding/decoding binary buffers.
 *
 * Optionally customize the identifier, either as a 2-byte string, an unsigned integer (0 -> 65,535), or as `null` to disable entirely.
 *
 * @example
 * const MyFormat = defineFormat({ ... });
 * const MyFormat = defineFormat('ab', { ... });
 * const MyFormat = defineFormat(1234, { ... });
 * const MyFormat = defineFormat(null, { ... });
 */
export function defineFormat<T extends EncoderDefinition, HeaderType extends string | number = number>(def: T): BinaryCoder<T, HeaderType>;
/**
 * Defines a format for encoding/decoding binary buffers.
 *
 * Optionally customize the identifier, either as a 2-byte string, an unsigned integer (0 -> 65,535), or as `null` to disable entirely.
 *
 * @example
 * const MyFormat = defineFormat({ ... });
 * const MyFormat = defineFormat('ab', { ... });
 * const MyFormat = defineFormat(1234, { ... });
 * const MyFormat = defineFormat(null, { ... });
 */
export function defineFormat<T extends EncoderDefinition, HeaderType extends string | number = number>(h: HeaderType | null, def: T): BinaryCoder<T, HeaderType>;
// eslint-disable-next-line disable-autofix/jsdoc/require-jsdoc
export function defineFormat<T extends EncoderDefinition, HeaderType extends string | number = number>(a?: HeaderType | T, b?: T): BinaryCoder<T, HeaderType> {
  return a !== null && typeof a === 'object'
    ? new BinaryCoder<T, HeaderType>(a as T)
    : new BinaryCoder<T, HeaderType>(b as T, a as HeaderType);
}

/** @deprecated use `optional()` instead */
export const Optional = optional;

/** @deprecated use `defineFormat()` instead */
export const encoder = defineFormat;

/** @deprecated use `bufferParser()` instead */
export const decoder = bufferParser;
