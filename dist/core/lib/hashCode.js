"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateObjectShapeHashCode = void 0;
/**
 * Generate a hashcode for an object.
 * @returns 16-bit unsigned integer
 */
function generateObjectShapeHashCode(obj) {
    return djb2HashUInt16(JSON.stringify(obj));
}
exports.generateObjectShapeHashCode = generateObjectShapeHashCode;
/**
 * DJB2 hash algorithm (modified for 16-bit uints).
 *
 * DJB2 is a simple and widely used non-cryptographic
 * hash function created by Daniel J. Bernstein.
 *
 * @returns 16-bit unsigned integer
 */
function djb2HashUInt16(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return hash & 0xFFFF; // Ensure the result is a Uint16
}
//# sourceMappingURL=hashCode.js.map