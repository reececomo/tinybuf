import BinaryCoder from "./BinaryCoder";
import { EncoderDefinition, InferredDecodedType } from "./Type";
import { hashCodeTo2CharStr, strToHashCode } from "./lib/hashCode";

type BinaryCoderId = number;
type BinaryCoderOnDataHandler = (data: InferredDecodedType<any>) => any;

export class UnhandledBinaryDecodeError extends Error {}
export class BinaryCoderIdCollisionError extends Error {}

/**
 * A utility that facilitates the management and handling of multiple binary formats.
 *
 * It provides a central handler for encoding, decoding and routing.
 */
export class BinaryFormatHandler {
  private coders = new Map<BinaryCoderId, [BinaryCoder<any, any>, BinaryCoderOnDataHandler]>();

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
    if (coder.Id === undefined) {
      throw new TypeError('Cannot register a BinaryCoder with Id disabled.');
    }

    const intId = typeof coder.Id === 'string' ? strToHashCode(coder.Id) : coder.Id;

    if (this.coders.has(intId)) {
      throw new BinaryCoderIdCollisionError(`Coder was already registered with matching Id: ${coder.Id}`);
    }

    this.coders.set(intId, [coder, onDataHandler]);

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
    const id: number = BinaryCoder.peekIntId(buffer);
    const tuple = this.coders.get(id);

    if (!tuple) {
      const strId = hashCodeTo2CharStr(id);
      throw new UnhandledBinaryDecodeError(`Failed to process buffer with Id ${id} ('${strId}').`);
    }

    const [coder, onDataHandler] = tuple;
    const data = coder.decode(buffer);

    onDataHandler(data);
  }
}
