"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryFormatHandler = exports.UnhandledBinaryDecodeError = void 0;
const BinaryCodec_1 = __importDefault(require("./BinaryCodec"));
class UnhandledBinaryDecodeError extends Error {
}
exports.UnhandledBinaryDecodeError = UnhandledBinaryDecodeError;
/**
 * A utility that facilitates the management and handling of multiple binary formats.
 *
 * It provides a central handler for encoding, decoding and routing.
 */
class BinaryFormatHandler {
    constructor() {
        this.codecs = new Map();
    }
    /** All available codecs. */
    get available() {
        return new Set([...this.codecs.values()].map(v => v[0]));
    }
    /**
     * Register a binary codec for encoding and decoding.
     */
    on(codec, onDataHandler) {
        if (codec.Id === false) {
            throw new Error('Cannot register a BinaryCodec with Id=false.');
        }
        if (this.codecs.has(codec.Id)) {
            throw new Error(`Codec was already registered with matching Id: '0b${codec.Id.toString(2)}'`);
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
    processBuffer(buffer) {
        const id = BinaryCodec_1.default.peekId(buffer);
        const tuple = this.codecs.get(id);
        if (!tuple) {
            throw new UnhandledBinaryDecodeError(`No handler registered for: '0b${id.toString(2)}'`);
        }
        const [codec, onDataHandler] = tuple;
        const data = codec.decode(buffer);
        onDataHandler(data);
    }
}
exports.BinaryFormatHandler = BinaryFormatHandler;
//# sourceMappingURL=BinaryFormatHandler.js.map