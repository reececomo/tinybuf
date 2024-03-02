"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.raz = exports.r2z = exports.clamp = void 0;
/** Clamp a number to a range. */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
exports.clamp = clamp;
/** Round toward zero */
function r2z(x) {
    return x < 0 ? Math.ceil(x) : Math.floor(x);
}
exports.r2z = r2z;
/** Round away zero */
function raz(x) {
    return x < 0 ? Math.floor(x) : Math.ceil(x);
}
exports.raz = raz;
//# sourceMappingURL=math.js.map