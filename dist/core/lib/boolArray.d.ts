/**
 * Whether the given value is a boolean array.
 */
export declare function isBooleanArray(value: any): value is boolean[];
/**
 * Encode a boolean array as an integer.
 * Modified version of: https://github.com/geckosio/typed-array-buffer-schema/blob/d1e2330c8910e29280ab59e92619e5019b6405d4/src/serialize.ts#L29
 */
export declare function fixedLengthBooleanArrayToBitmask(booleanArray: boolean[], length: 8 | 16 | 32): number;
/**
 * Encode a boolean array as an integer.
 * Modified version of: https://github.com/geckosio/typed-array-buffer-schema/blob/d1e2330c8910e29280ab59e92619e5019b6405d4/src/serialize.ts#L29
 */
export declare function booleanArrayToBitmask(booleanArray: boolean[]): number;
/**
 * Decode a boolean array as an integer.
 * Modified version of: https://github.com/geckosio/typed-array-buffer-schema/blob/d1e2330c8910e29280ab59e92619e5019b6405d4/src/serialize.ts#L39
 */
export declare function bitmaskToFixedLengthBooleanArray(int: number, length: 8 | 16 | 32): boolean[];
/**
 * Decode a boolean array as an integer.
 * Modified version of: https://github.com/geckosio/typed-array-buffer-schema/blob/d1e2330c8910e29280ab59e92619e5019b6405d4/src/serialize.ts#L39
 */
export declare function uInt8ToBooleanArray(int: number): boolean[];
//# sourceMappingURL=boolArray.d.ts.map