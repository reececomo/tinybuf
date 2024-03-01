import BinaryCodec from "./BinaryCodec";
import { EncoderDefinition, InferredDecodedType } from "./Type";

type BinaryCodecId = number;
type BinaryCodecOnDataHandler = (data: InferredDecodedType<any>) => any;

export class UnhandledBinaryDecodeError extends Error {}

/**
 * A utility that facilitates the management and handling of multiple binary formats.
 * 
 * It provides a central handler for encoding, decoding and routing.
 */
export class BinaryFormatHandler {
  private codecs = new Map<BinaryCodecId, [BinaryCodec<any>, BinaryCodecOnDataHandler]>();

  /** All available codecs. */
  public get available(): Set<BinaryCodec<any>> {
    return new Set([...this.codecs.values()].map(v => v[0]));
  }

  /**
   * Register a binary codec for encoding and decoding.
   */
  public on<EncoderType extends EncoderDefinition, DecodedType = InferredDecodedType<EncoderType>>(
    codec: BinaryCodec<EncoderType>,
    onDataHandler: (data: DecodedType) => any
  ): this {
    if (codec.Id === false) {
      throw new Error('Cannot register a BinaryCodec with Id=false.');
    }

    if (this.codecs.has(codec.Id)) {
      throw new Error(`Codec was already registered with matching Id: '0b${codec.Id.toString(2)}'`)
    }
  
    this.codecs.set(codec.Id, [codec, onDataHandler]);
    
    return this;
  }

  /**
   * Decode an array buffer and trigger the relevant data handler.
   *
   * When passed an ArrayBufferView, accesses the underlying 'buffer' instance directly.
   *
   * @throws {UnhandledBinaryDecodeError} If no matching codec handler is configured.
   * @throws {RangeError} If buffer has < 2 bytes.
   */
  public processBuffer(buffer: ArrayBuffer | ArrayBufferView): void {
    const id: number = BinaryCodec.peekId(buffer);
    const tuple = this.codecs.get(id);

    if (!tuple) {
      throw new UnhandledBinaryDecodeError(`No handler registered for: '0b${id.toString(2)}'`);
    }
  
    const [codec, onDataHandler] = tuple;
    const data = codec.decode(buffer);

    onDataHandler(data);
  }
}
