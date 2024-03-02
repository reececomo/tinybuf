import BinaryCoder from "./BinaryCoder";
import { EncoderDefinition, InferredDecodedType } from "./Type";

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
  private coders = new Map<BinaryCoderId, [BinaryCoder<any>, BinaryCoderOnDataHandler]>();

  /** All available coders. */
  public get available(): Set<BinaryCoder<any>> {
    return new Set([...this.coders.values()].map(v => v[0]));
  }

  /**
   * Register a binary coder for encoding and decoding.
   */
  public on<EncoderType extends EncoderDefinition, DecodedType = InferredDecodedType<EncoderType>>(
    coder: BinaryCoder<EncoderType>,
    onDataHandler: (data: DecodedType) => any
  ): this {
    if (coder.Id === undefined) {
      throw new TypeError('Cannot register a BinaryCoder that has Id disabled.');
    }

    if (this.coders.has(coder.Id)) {
      throw new BinaryCoderIdCollisionError(`Coder was already registered with matching Id: ${coder.Id}`);
    }

    this.coders.set(coder.Id, [coder, onDataHandler]);

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
    const id: number = BinaryCoder.peekId(buffer);
    const tuple = this.coders.get(id);

    if (!tuple) {
      throw new UnhandledBinaryDecodeError(`No handler registered for: '0b${id.toString(2)}'`);
    }

    const [coder, onDataHandler] = tuple;
    const data = coder.decode(buffer);

    onDataHandler(data);
  }
}
