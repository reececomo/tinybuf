# Types

## Value types

| **Tinybuf type** | **JavaScript** | **Bytes** | **Notes** |
| :--- | :--- | :--- | :--- |
| `Int` | `number` | 1-4<sup>\*</sup> | An integer between `-Number.MAX_SAFE_INTEGER` and `Number.MAX_SAFE_INTEGER`. |
| `Int8` | `number` | 1 | An integer between -128 and 127. |
| `Int16` | `number` | 2 | An integer between -32,768 and 32,767. |
| `Int32` | `number` | 4 | An integer between -2,147,483,648 and 2,147,483,647. |
| `UInt` | `number` | 1-4<sup>#</sup> | An unsigned integer between 0 and `Number.MAX_SAFE_INTEGER`. |
| `UInt8` | `number` | 1 | An unsigned integer between 0 and 255. |
| `UInt16` | `number` | 2 | An unsigned integer between 0 and 65,535. |
| `UInt32` | `number` | 4 | An unsigned integer between 0 and 4,294,967,295. |
| `Float64` | `number` | 8 | A 64-bit double-precision IEEE floating-point number (in standard IEEE format).<br/>**Note:** This is the default JavaScript `number`. |
| `Float32` | `number` | 4 | A 32-bit single-precision floating-point number (in standard IEEE format). |
| `Float16` | `number` | 2 | A 16-bit half-precision floating-point number (in standard IEEE format).<br/>**Note:** Low precision. Maximum effective range ±65,504. |
| `BFloat16` | `number` | 2 | A 16-bit half-precision floating-point number (in [bfloat16](https://en.wikipedia.org/wiki/Bfloat16_floating-point_format) format).<br/>**Note:** Low precision. |
| `UScalar` | `number` | 1 | A scalar between 0.00 and 1.00 with two decimal precision. |
| `Scalar` | `number` | 1 | A signed scalar between -1.00 and 1.00 with two decimal precision. |
| `Bool` | `boolean` | 1 | A boolean value. |
| `Bools` | `boolean[]` | 1<sup>¶</sup> | An array/tuple of boolean values (1 - 28) encoded as a single byte. |
| `Buffer` | `Uint8Array` | 1<sup>†</sup>&nbsp;+&nbsp;n | Raw buffer or buffer-like data. |
| `String` | `string` | 1<sup>†</sup>&nbsp;+&nbsp;n | A UTF-8 string. |
| `JSON` | `any` | 1<sup>†</sup>&nbsp;+&nbsp;n | Any JSON encodable value (encoded as UTF-8). |
| `RegExp` | `RegExp` | 2<sup>†</sup>&nbsp;+&nbsp;n | JavaScript `RegExp` object. |
| `Date` | `Date` | 8 | JavaScript `Date` object. |


## Structural types

**Syntax** | **JavaScript** | **Overhead** | **Notes** |
| :--- | :--- | :--- | :--- |
| `{}` | `Object` | _none_ | An object. |
| `[] ` | `T[]` | 1<sup>†</sup>+n | An array of values. Given as an array containing exactly one `Type` or object. |
| `optional()` | `T?` | 1 | Allows values to be `undefined` (or explicitly `null`). Decodes as `undefined`. |

> [!NOTE]
> Arrays **cannot** be declared as `optional()`. Use an empty array instead.

## Footnotes

<sup>\*</sup>`Int` is a variable-length integer ("varint") which encodes <±64 = 1 byte, <±8,192 = 2 bytes, <±268,435,456 = 4 bytes, otherwise = 8 bytes.

<sup>#</sup>`Int` and `UInt` are variable-length unsigned integer ("varuint") which encodes <128 = 1 byte, <16,384 = 2 bytes, <536,870,912 = 4 bytes, otherwise = 8 bytes.

<sup>†</sup>Length of payload bytes as a `UInt`. Typically 1 byte, but could be 2-8 bytes for very large payloads.

<sup>¶</sup>`Bools` converts 1 - 28 booleans to a single `UInt` and back.


## Encoding formats

### UInt

Unsigned integers are encoded in the following varuint format (big-endian):

| Value range | Bytes | Encoding format |
| :--- | :---: | :--- |
| 0 to 128 | 1 | `0xxxxxxx` |
| 129 to 16,384 | 2 | `10xxxxxx xxxxxxxx` |
| 16,385 to 536,870,912  | 4 | `110xxxxx xxxxxxxx xxxxxxxx xxxxxxxx` |
| 536,870,913 to `Number.MAX_SAFE_INTEGER`  | 8 | `111xxxxx xxxxxxxx xxxxxxxx xxxxxxxx`<br/>`xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx` |


### Int

Signed integers are encoded in the following varint format (big-endian):

| Value range | Bytes | Encoding format |
| :--- | :---: | :--- |
| 0 to ±64 | 1 | `0xxxxxxx` |
| ±65 to ±8,192 | 2 | `10xxxxxx xxxxxxxx` |
| ±8,193 to ±268,435,456  | 4 | `110xxxxx xxxxxxxx xxxxxxxx xxxxxxxx` |
| ±268,435,457 to ±`Number.MAX_SAFE_INTEGER`  | 8 | `111xxxxx xxxxxxxx xxxxxxxx xxxxxxxx`<br/>`xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx` |

### Scalar

Scalar floats encoded with a precision of two decimal places.

| Type | Range | Quantization function |
| :--- | :--- | :--- |
| **Scalar** | 0.00 to 1.00 | `scalround(x)` |
| **UScalar** | -1.00 to 1.00 | `uscalround(x)` |

Values outside of this range are clamped. `NaN`s become `0`.

### Bools (bitmask)

Encodes an array of booleans as a variable-length bitmask.

| Range | Bytes | Encoding format |
| :--- | :---: | :--- |
| 0 to 6 values | 1 | `bnxxxxxx` |
| 7 to 13 values | 2 | `10nxxxxx xxxxxxxx` |
| 14 to 28 values | 4 | `110nxxxx xxxxxxxx xxxxxxxx xxxxxxxx` |

### Bool

Encodes a single boolean as a byte.

| Value | Bytes | Encoding format |
| :--- | :---: | :--- |
| `false` | 1 | `00000000` |
| `true` | 1 | `00000001` |

### `Buffer`, `String`, `JSON`, `RegExp`

Each of these types is encoded as a raw byte payload:

| Type | Typical bytes overhead | Encoding format | Notes |
| :--- | :---: | :--- | :--- |
| `Buffer` | ~1 | `length,bytes` | - |
| `String` | ~1 | `length,bytes` | Encoded as UTF-8 |
| `JSON` | ~1 | `length,bytes` | Encoded as UTF-8 via `JSON.stringify()` |
| `RegExp` | ~2 | `length,bytes,flags` | Pattern encoded as UTF-8, [flags (g,i,m)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/flags) encoded at bitmask. |

### Date

A [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) value, encoded as UTC milliseconds from January 1, 1970 (see [`Date.getTime()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTime)).

### optional()

Optional values must be `undefined` or `null`, and are always decoded as `undefined`.
