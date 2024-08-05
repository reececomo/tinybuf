import { BufferFormat } from "./BufferFormat";
import { EncoderDefinition, InferredDecodedType } from "./Type";
import { DecodeError, TinybufError } from "./lib/errors";
import { $hashCodeToStr, $strToHashCode } from "./lib/hashCode";
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
  /** @internal */
  private _$formats = new Map<Uint16FormatHeader, [AnyFormat, (data: any) => any]>();

  /**
   * Decode an array buffer and trigger the relevant data handler.
   *
   * When passed an ArrayBufferView, accesses the underlying 'buffer' instance directly.
   *
   * @throws {TinybufError} if fails to decode, or no handler is registered
   */
  public processBuffer(b: ArrayBuffer | ArrayBufferView): void {
    let f: any, data: any, cb: (data: any) => any;

    try {
      const header = peekHeader(b);

      if (!this._$formats.has(header)) {
        throw new TinybufError(`Unknown format: ${header} '${$hashCodeToStr(header)}')`);
      }

      [f, cb] = this._$formats.get(header);
      data = f.decode(b);
    }
    catch (e) {
      throw new DecodeError('Failed to decode', e);
    }

    cb(data);
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
      throw new TinybufError('Format requires header');
    }

    const header = typeof format.header === 'string' ? $strToHashCode(format.header) : format.header;

    if (this._$formats.has(header) && !overwritePrevious) {
      throw new TinybufError(`Format header collision: ${format.header}`);
    }

    this._$formats.set(header, [format, callback]);

    return this;
  }

  /** Register a format (or formats) that are recognized. */
  public ignore(...format: AnyFormat[]): this {
    format.forEach(f => this.on(f, () => {}, true));
    return this;
  }

  /** Clears all registered formats and handlers. */
  public clear(): void {
    this._$formats.clear();
  }
}
