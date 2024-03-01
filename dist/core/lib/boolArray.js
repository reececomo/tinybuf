"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uInt8ToBooleanArray = exports.bitmaskToFixedLengthBooleanArray = exports.booleanArrayToBitmask = exports.fixedLengthBooleanArrayToBitmask = exports.isBooleanArray = void 0;
/**
 * Whether the given value is a boolean array.
 */
function isBooleanArray(value) {
    return Array.isArray(value) && value.every(entry => typeof entry === 'boolean');
}
exports.isBooleanArray = isBooleanArray;
/**
 * Encode a boolean array as an integer.
 * Modified version of: https://github.com/geckosio/typed-array-buffer-schema/blob/d1e2330c8910e29280ab59e92619e5019b6405d4/src/serialize.ts#L29
 */
function fixedLengthBooleanArrayToBitmask(booleanArray, length) {
    let str = '';
    for (let i = 0; i < length; i++) {
        str += +!!booleanArray[i];
    }
    return parseInt(str, 2);
}
exports.fixedLengthBooleanArrayToBitmask = fixedLengthBooleanArrayToBitmask;
/**
 * Encode a boolean array as an integer.
 * Modified version of: https://github.com/geckosio/typed-array-buffer-schema/blob/d1e2330c8910e29280ab59e92619e5019b6405d4/src/serialize.ts#L29
 */
function booleanArrayToBitmask(booleanArray) {
    let str = '';
    for (let i = 0; i < booleanArray.length; i++) {
        str += +!!booleanArray[i];
    }
    return parseInt(str, 2);
}
exports.booleanArrayToBitmask = booleanArrayToBitmask;
/**
 * Decode a boolean array as an integer.
 * Modified version of: https://github.com/geckosio/typed-array-buffer-schema/blob/d1e2330c8910e29280ab59e92619e5019b6405d4/src/serialize.ts#L39
 */
function bitmaskToFixedLengthBooleanArray(int, length) {
    return [...(int >>> 0).toString(2).padStart(length, '0')].map(e => (e == '0' ? false : true));
}
exports.bitmaskToFixedLengthBooleanArray = bitmaskToFixedLengthBooleanArray;
/**
 * Decode a boolean array as an integer.
 * Modified version of: https://github.com/geckosio/typed-array-buffer-schema/blob/d1e2330c8910e29280ab59e92619e5019b6405d4/src/serialize.ts#L39
 */
function uInt8ToBooleanArray(int) {
    return [...(int >>> 0).toString(2)].map(e => (e == '0' ? false : true));
}
exports.uInt8ToBooleanArray = uInt8ToBooleanArray;
//# sourceMappingURL=boolArray.js.map