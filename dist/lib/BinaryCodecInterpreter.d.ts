import BinaryCodec from "./BinaryCodec";
/**
 * Defines a collection of binary codecs and provides functionality
 * to encode or decode multiple formats at once.
 */
export declare class BinaryCodecInterpreter {
    private _codecs;
    private _onHandlers;
    /**
     * Register binary codec.
     * @throws if a codec was already registered (or their Id's collide)
     */
    register<T>(codec: BinaryCodec<T>, onData?: (data: T) => void): this;
    /**
     * Encode the data using one of the registered formats.
     * @throws If no codec is able to encode this data.
     */
    encode<T>(data: T): ArrayBuffer;
    /**
     * Handle new data coming in.
     * @throws If fails to decode, or no
     */
    decode(buffer: ArrayBuffer | ArrayBufferView): void;
}
//# sourceMappingURL=BinaryCodecInterpreter.d.ts.map