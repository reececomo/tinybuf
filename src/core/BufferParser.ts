import { BufferFormat } from "./BufferFormat";
import { EncoderDefinition, InferredDecodedType } from "./Type";
import { TinybufError } from "./lib/errors";
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
export const bufferParser = (): BufferParser => new BufferParser();

export class BufferParser {
  /** @internal */
  private _$formats = new Map<Uint16FormatHeader, [format: AnyFormat, handler: (data: any) => any, decodeInPlace: boolean]>();
  private _$data = new Map<Uint16FormatHeader, any>(); // used when decoding in-place

  /**
   * Decode an array buffer and trigger the relevant data handler.
   *
   * When passed an ArrayBufferView, accesses the underlying 'buffer' instance directly.
   *
   * @throws {TinybufError} if fails to decode, or no handler is registered
   */
  public processBuffer(b: ArrayBuffer | ArrayBufferView): void {
    let f: any, data: any, cb: (data: any) => any, r: boolean;

    try {
      const header = peekHeader(b);

      if (!this._$formats.has(header)) {
        throw new TinybufError(`Unknown format: ${header} '${$hashCodeToStr(header)}')`);
      }

      [f, cb, r] = this._$formats.get(header);
      if (r) data = this._$data.get(header) ?? {};
      data = f.decode(b, data);
      if (r) this._$data.set(header, data);
    }
    catch (e) {
      const err = new TinybufError(`Failed to decode: ${e}`);
      err.stack = e.stack;

      throw err;
    }

    cb(data);
  }

  /**
   * Register a format handler.
   */
  public on<EncoderType extends EncoderDefinition, DecodedType = InferredDecodedType<EncoderType>>(
    format: BufferFormat<EncoderType, string | number>,
    callback: (data: DecodedType) => any,
    {
      decodeInPlace = false,
    } = {},
  ): this {
    if (format.header == null) {
      throw new TinybufError("Format requires header");
    }

    const header = typeof format.header === "string" ? $strToHashCode(format.header) : format.header;

    if (this._$formats.has(header) && this._$formats.get(header)?.[0] !== format) {
      throw new TinybufError(`Format header collision: ${format.header}`);
    }

    this._$formats.set(header, [format, callback, decodeInPlace]);

    return this;
  }

  /** Register a format (or formats) that are recognized. */
  public ignore(...format: AnyFormat[]): this {
    format.forEach(f => this.on(f, () => {}));
    return this;
  }

  /** Clears all registered formats and handlers. */
  public clear(): void {
    this._$formats.clear();
    this._$data.clear();
  }
}
