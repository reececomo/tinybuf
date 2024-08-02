import BinaryCoder from "./BinaryCoder";
import { EncoderDefinition, InferredDecodedType } from "./Type";
import { hashCodeToStr, strToHashCode } from "./lib/hashCode";
import { peekHeader } from "./lib/peek";

type BCHeader = number;
type BinaryCoderOnDataHandler = (data: InferredDecodedType<any>) => any;

export class UnhandledBinaryDecodeError extends Error {}
export class FormatHeaderCollisionError extends Error {}

/**
 * A utility that facilitates the management and handling of multiple binary formats.
 *
 * It provides a central handler for encoding, decoding and routing.
 */
export class BinaryFormatHandler {
  private coders = new Map<BCHeader, [BinaryCoder<any, any>, BinaryCoderOnDataHandler]>();

  /** All available coders. */
  public get available(): Set<BinaryCoder<any, any>> {
    return new Set([...this.coders.values()].map(v => v[0]));
  }

  /**
   * Register a binary coder for encoding and decoding.
   */
  public on<EncoderType extends EncoderDefinition, DecodedType = InferredDecodedType<EncoderType>>(
    coder: BinaryCoder<EncoderType, string | number>,
    onDataHandler: (data: DecodedType) => any
  ): this {
    if (coder.header === undefined) {
      throw new TypeError('Cannot register a headerless encoding format.');
    }

    const intHeader = typeof coder.header === 'string' ? strToHashCode(coder.header) : coder.header;

    if (this.coders.has(intHeader)) {
      throw new FormatHeaderCollisionError(`Format with identical header was already registered: ${coder.header}`);
    }

    this.coders.set(intHeader, [coder, onDataHandler]);

    return this;
  }

  /**
   * Decode an array buffer and trigger the relevant data handler.
   *
   * When passed an ArrayBufferView, accesses the underlying 'buffer' instance directly.
   *
   * @throws {UnhandledBinaryDecodeError} If no matching coder handler is configured.
   * @throws {RangeError} If buffer has < 2 bytes.
   */
  public processBuffer(buffer: ArrayBuffer | ArrayBufferView): void {
    const header: number = peekHeader(buffer);

    if (!this.coders.has(header)) {
      throw new UnhandledBinaryDecodeError(`Failed to process buffer. Header: ${header} ('${hashCodeToStr(header)}').`);
    }

    const [coder, onDataHandler] = this.coders.get(header);
    const data = coder.decode(buffer);

    onDataHandler(data);
  }
}
