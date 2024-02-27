import BinaryCodec from "./BinaryCodec";

/**
 * Defines a collection of binary codecs and provides functionality
 * to encode or decode multiple formats at once.
 */
export class BinaryCodecInterpreter {
  private _codecs = new Map<string | number, BinaryCodec>();
  private _onHandlers = new Map<string | number, (data: any) => any>();

  /**
   * Register binary codec.
   * @throws if a codec was already registered (or their Id's collide)
   */
  public register<T>(codec: BinaryCodec<T>, onData?: (data: T) => void): this {
    if (codec.Id === false) {
      throw new Error('BinaryCodec requires an Id to be registered.');
    }

    if (this._codecs.has(codec.Id)) {
      throw new Error(`Codec was already registered with matching Id: '${codec.Id}'.`)
    }
    else {
      this._codecs.set(codec.Id, codec);

      if (onData !== undefined) {
        this._onHandlers.set(codec.Id, onData);
      }
    }
    
    return this;
  }

  /**
   * Encode the data using one of the registered formats.
   * @throws If no codec is able to encode this data.
   */
  public encode<T>(data: T): ArrayBuffer {
    for (const codec of this._codecs.values()) {
      try {
        return codec.encode(data);
      }
      catch (error) {
      }
    }

    throw new Error('Unable to encode, no matching codec found.');
  }

  /**
   * Handle new data coming in.
   * @throws If fails to decode, or no
   */
  public decode(buffer: ArrayBuffer | ArrayBufferView): void {
    const buf = buffer instanceof ArrayBuffer ? buffer : buffer.buffer;
    const codecId: number = BinaryCodec.peekId(buf);
    const codec = this._codecs.get(codecId);
    const onData = this._onHandlers.get(codecId);

    if (codec && onData) {
      let data: any;
      data = codec.decode(buffer);

      return onData(data);
    }

    throw new Error(`Received unhandled packet, no handler registered for '${codecId}'`);
  }
}
