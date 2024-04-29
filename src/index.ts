import BinaryCoder from './core/BinaryCoder';
import { BinaryFormatHandler } from './core/BinaryFormatHandler';
import { EncoderDefinition } from './core/Type';

export {
  Type,
  Optional,
  EncoderDefinition,
  FieldDefinition,
  InferredDecodedType,
  ValueTypes
} from './core/Type';

export * from './core/BinaryCoder';
export * from './core/BinaryFormatHandler';

export * from './core/MutableArrayBuffer';
export * from './core/Field';
export * from './core/ReadState';

export * from './core/lib/float16';
export * from './core/lib/scalar';
export * as coders from './core/lib/coders';

// -- tinybuf: --

/**
 * Processes incoming binary buffers and forwards data to the appropriate registered handler.
 *
 * @example
 * let MyDecoder = decoder()
 *   .on(MyFormat, data => { ... });
 *
 * MyDecoder.processBuffer(rawBuffer);
 */
export const decoder = (): BinaryFormatHandler => new BinaryFormatHandler();

/**
 * Defines a format for encoding/decoding binary buffers.
 *
 * Optionally customize the identifier, either as a 2-byte string, an unsigned integer (0 -> 65,535), or as `null` to disable entirely.
 *
 * @example
 * let MyFormat = encoder({ ... });
 * let MyFormat = encoder('ab', { ... });
 * let MyFormat = encoder(1234, { ... });
 * let MyFormat = encoder(null, { ... });
 */
export function encoder<T extends EncoderDefinition, IdType extends string | number = number>(Id: IdType | null, def: T): BinaryCoder<T, IdType>;
/**
 * Defines a format for encoding/decoding binary buffers.
 *
 * Optionally customize the identifier, either as a 2-byte string, an unsigned integer (0 -> 65,535), or as `null` to disable entirely.
 *
 * @example
 * let MyFormat = encoder({ ... });
 * let MyFormat = encoder('ab', { ... });
 * let MyFormat = encoder(1234, { ... });
 * let MyFormat = encoder(null, { ... });
 */
export function encoder<T extends EncoderDefinition, IdType extends string | number = number>(def: T): BinaryCoder<T, IdType>;
/**
 * Defines a format for encoding/decoding binary buffers.
 *
 * Optionally customize the identifier, either as a 2-byte string, an unsigned integer (0 -> 65,535), or as `null` to disable entirely.
 *
 * @example
 * let MyFormat = encoder({ ... });
 * let MyFormat = encoder('ab', { ... });
 * let MyFormat = encoder(1234, { ... });
 * let MyFormat = encoder(null, { ... });
 */
export function encoder<T extends EncoderDefinition, IdType extends string | number = number>(a?: IdType | T, b?: T): BinaryCoder<T, IdType> {
  return a !== null && typeof a === 'object'
    ? new BinaryCoder<T, IdType>(a as T)
    : new BinaryCoder<T, IdType>(b as T, a as IdType);
}
