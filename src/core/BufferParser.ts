import { BufferFormat } from "./BufferFormat";
import { EncoderDefinition, InferredDecodedType } from "./Type";
import {
  BufferDecodingError,
  FormatHeaderCollisionError,
  UnrecognizedFormatError
} from "./lib/errors";
import { hashCodeToStr, strToHashCode } from "./lib/hashCode";
import { peekHeader } from "./lib/peek";

type AnyFormat = BufferFormat<any, any>;
type Uint16FormatHeader = number;

/**
 * Small utility for registering and processing format handlers.
 *
 * @example
 * const myHandler = bufferParser()
 *   .on(FormatA, aData => {})
 *   .on(FormatB, bData => {});
 *
 * myHandler.processBuffer(bytes);
 */
export const bufferParser = (): BufferParserInstance => new BufferParserInstance();

export class BufferParserInstance {
  private formats = new Map<Uint16FormatHeader, [AnyFormat, (data: any) => any]>();

  /** All available formats */
  public get availableFormats(): Set<AnyFormat> {
    return new Set([...this.formats.values()].map(v => v[0]));
  }

  /**
   * Decode an array buffer and trigger the relevant data handler.
   *
   * When passed an ArrayBufferView, accesses the underlying 'buffer' instance directly.
   *
   * @throws {BufferDecodingError} if the buffer failed to decode to the registered format, or header was bad
   * @throws {UnrecognizedFormatError} if no format is registered that can handle this data
   */
  public processBuffer(b: ArrayBuffer | ArrayBufferView): void {
    let header: number;

    try {
      header = peekHeader(b);
    }
    catch (e) {
      throw new BufferDecodingError(`Failed to process buffer`, e);
    }

    if (!this.formats.has(header)) {
      throw new UnrecognizedFormatError(`Unrecognized format (uint16: ${header}, str: '${hashCodeToStr(header)}')`);
    }

    const [f, onData] = this.formats.get(header);
    let data: any;

    try {
      data = f.decode(b);
    }
    catch (e) {
      throw new BufferDecodingError(`Failed to decode data to format '${f.header}'`, e);
    }

    onData(data);
  }

  /**
   * Register a format handler.
   */
  public on<EncoderType extends EncoderDefinition, DecodedType = InferredDecodedType<EncoderType>>(
    format: BufferFormat<EncoderType, string | number>,
    callback: (data: DecodedType) => any,
    overwritePrevious: boolean = false,
  ): this {
    if (format.header == null) {
      throw new TypeError('Cannot register a headerless encoding format.');
    }

    const header = typeof format.header === 'string' ? strToHashCode(format.header) : format.header;

    if (this.formats.has(header) && !overwritePrevious) {
      throw new FormatHeaderCollisionError(`Format with identical header was already registered: ${format.header}`);
    }

    this.formats.set(header, [format, callback]);

    return this;
  }

  /** Register a format (or formats) that are recognized. */
  public ignore(...format: AnyFormat[]): this {
    format.forEach(f => this.on(f, () => {}, true));
    return this;
  }

  /** Clears all registered formats and handlers. */
  public clear(): void {
    this.formats.clear();
  }
}
