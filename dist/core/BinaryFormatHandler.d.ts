import BinaryCodec from "./BinaryCodec";
import { EncoderDefinition, InferredDecodedType } from "./Type";
export declare class UnhandledBinaryDecodeError extends Error {
}
/**
 * A utility that facilitates the management and handling of multiple binary formats.
 *
 * It provides a central handler for encoding, decoding and routing.
 */
export declare class BinaryFormatHandler {
    private codecs;
    /** All available codecs. */
    get available(): Set<BinaryCodec<any>>;
    /**
     * Register a binary codec for encoding and decoding.
     */
    on<EncoderType extends EncoderDefinition, DecodedType = InferredDecodedType<EncoderType>>(codec: BinaryCodec<EncoderType>, onDataHandler: (data: DecodedType) => any): this;
    /**
     * Decode an array buffer and trigger the relevant data handler.
     *
     * When passed an ArrayBufferView, accesses the underlying 'buffer' instance directly.
     *
     * @throws {UnhandledBinaryDecodeError} If no matching codec handler is configured.
     * @throws {RangeError} If buffer has < 2 bytes.
     */
    processBuffer(buffer: ArrayBuffer | ArrayBufferView): void;
}
//# sourceMappingURL=BinaryFormatHandler.d.ts.map