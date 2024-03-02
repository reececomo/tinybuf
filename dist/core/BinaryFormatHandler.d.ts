import BinaryCoder from "./BinaryCoder";
import { EncoderDefinition, InferredDecodedType } from "./Type";
export declare class UnhandledBinaryDecodeError extends Error {
}
export declare class BinaryCoderIdCollisionError extends Error {
}
/**
 * A utility that facilitates the management and handling of multiple binary formats.
 *
 * It provides a central handler for encoding, decoding and routing.
 */
export declare class BinaryFormatHandler {
    private coders;
    /** All available coders. */
    get available(): Set<BinaryCoder<any>>;
    /**
     * Register a binary coder for encoding and decoding.
     */
    on<EncoderType extends EncoderDefinition, DecodedType = InferredDecodedType<EncoderType>>(coder: BinaryCoder<EncoderType>, onDataHandler: (data: DecodedType) => any): this;
    /**
     * Decode an array buffer and trigger the relevant data handler.
     *
     * When passed an ArrayBufferView, accesses the underlying 'buffer' instance directly.
     *
     * @throws {UnhandledBinaryDecodeError} If no matching coder handler is configured.
     * @throws {RangeError} If buffer has < 2 bytes.
     */
    processBuffer(buffer: ArrayBuffer | ArrayBufferView): void;
}
//# sourceMappingURL=BinaryFormatHandler.d.ts.map