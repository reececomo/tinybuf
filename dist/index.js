"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.coders = exports.quantizeToHalfFloat16 = exports.Optional = exports.BinaryCodecInterpreter = exports.BinaryCodec = exports.ReadState = exports.Field = exports.MutableArrayBuffer = void 0;
var MutableArrayBuffer_1 = require("./lib/MutableArrayBuffer");
Object.defineProperty(exports, "MutableArrayBuffer", { enumerable: true, get: function () { return MutableArrayBuffer_1.MutableArrayBuffer; } });
var Field_1 = require("./lib/Field");
Object.defineProperty(exports, "Field", { enumerable: true, get: function () { return Field_1.Field; } });
var ReadState_1 = require("./lib/ReadState");
Object.defineProperty(exports, "ReadState", { enumerable: true, get: function () { return ReadState_1.ReadState; } });
var BinaryCodec_1 = require("./lib/BinaryCodec");
Object.defineProperty(exports, "BinaryCodec", { enumerable: true, get: function () { return BinaryCodec_1.BinaryCodec; } });
var BinaryCodecInterpreter_1 = require("./lib/BinaryCodecInterpreter");
Object.defineProperty(exports, "BinaryCodecInterpreter", { enumerable: true, get: function () { return BinaryCodecInterpreter_1.BinaryCodecInterpreter; } });
var Type_1 = require("./lib/Type");
Object.defineProperty(exports, "Optional", { enumerable: true, get: function () { return Type_1.Optional; } });
var HalfFloat_1 = require("./lib/HalfFloat");
Object.defineProperty(exports, "quantizeToHalfFloat16", { enumerable: true, get: function () { return HalfFloat_1.quantizeToHalfFloat16; } });
exports.coders = __importStar(require("./lib/coders"));
//# sourceMappingURL=index.js.map