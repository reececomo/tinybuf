import BinaryCodec from "./BinaryCodec";

/**
 * A binary buffer encoder/decoder.
 */
export class BinaryCodecRegistry<PrefixType> {
  public constructor(
    private readonly codecs: Record<string: BinaryCodec<T>,
  ) {}
}