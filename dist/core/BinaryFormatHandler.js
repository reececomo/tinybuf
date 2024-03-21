"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryFormatHandler = exports.BinaryCoderIdCollisionError = exports.UnhandledBinaryDecodeError = void 0;
const BinaryCoder_1 = __importDefault(require("./BinaryCoder"));
const hashCode_1 = require("./lib/hashCode");
class UnhandledBinaryDecodeError extends Error {
}
exports.UnhandledBinaryDecodeError = UnhandledBinaryDecodeError;
class BinaryCoderIdCollisionError extends Error {
}
exports.BinaryCoderIdCollisionError = BinaryCoderIdCollisionError;
/**
 * A utility that facilitates the management and handling of multiple binary formats.
 *
 * It provides a central handler for encoding, decoding and routing.
 */
class BinaryFormatHandler {
    constructor() {
        this.coders = new Map();
    }
    /** All available coders. */
    get available() {
        return new Set([...this.coders.values()].map(v => v[0]));
    }
    /**
     * Register a binary coder for encoding and decoding.
     */
    on(coder, onDataHandler) {
        if (coder.Id === undefined) {
            throw new TypeError('Cannot register a BinaryCoder with Id disabled.');
        }
        const intId = typeof coder.Id === 'string' ? (0, hashCode_1.strToHashCode)(coder.Id) : coder.Id;
        if (this.coders.has(intId)) {
            throw new BinaryCoderIdCollisionError(`Coder was already registered with matching Id: ${coder.Id}`);
        }
        this.coders.set(intId, [coder, onDataHandler]);
        return this;
    }
    /**
     * Decode an array buffer and trigger the relevant data handler.
     *
     * When passed an ArrayBufferView, accesses the underlying 'buffer' instance directly.
     *
     * @throws {UnhandledBinaryDecodeError} If no matching coder handler is configured.
     * @throws {RangeError} If buffer has < 2 bytes.
     */
    processBuffer(buffer) {
        const id = BinaryCoder_1.default.peekIntId(buffer);
        const tuple = this.coders.get(id);
        if (!tuple) {
            const strId = (0, hashCode_1.hashCodeTo2CharStr)(id);
            throw new UnhandledBinaryDecodeError(`Failed to process buffer with Id ${id} ('${strId}').`);
        }
        const [coder, onDataHandler] = tuple;
        const data = coder.decode(buffer);
        onDataHandler(data);
    }
}
exports.BinaryFormatHandler = BinaryFormatHandler;
//# sourceMappingURL=BinaryFormatHandler.js.map