"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryCodecInterpreter = void 0;
const BinaryCodec_1 = __importDefault(require("./BinaryCodec"));
/**
 * Defines a collection of binary codecs and provides functionality
 * to encode or decode multiple formats at once.
 */
class BinaryCodecInterpreter {
    constructor() {
        this._codecs = new Map();
        this._onHandlers = new Map();
    }
    /**
     * Register binary codec.
     * @throws if a codec was already registered (or their Id's collide)
     */
    register(codec, onData) {
        if (codec.Id === false) {
            throw new Error('BinaryCodec requires an Id to be registered.');
        }
        if (this._codecs.has(codec.Id)) {
            throw new Error(`Codec was already registered with matching Id: '${codec.Id}'.`);
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
    encode(data) {
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
    decode(buffer) {
        const buf = buffer instanceof ArrayBuffer ? buffer : buffer.buffer;
        const codecId = BinaryCodec_1.default.peekId(buf);
        const codec = this._codecs.get(codecId);
        const onData = this._onHandlers.get(codecId);
        if (codec && onData) {
            let data;
            data = codec.decode(buffer);
            return onData(data);
        }
        throw new Error(`Received unhandled packet, no handler registered for '${codecId}'`);
    }
}
exports.BinaryCodecInterpreter = BinaryCodecInterpreter;
//# sourceMappingURL=BinaryCodecInterpreter.js.map