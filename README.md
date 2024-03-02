<div align="center">

<img src="docs/hero.png" alt="TypeScript Binary Icon showing binary peeking out from behind a square." height="106">

# TypeScript Binary

Powerful, lightweight binary formats in TypeScript.

[![NPM version](https://img.shields.io/npm/v/typescript-binary.svg?style=flat-square)](https://www.npmjs.com/package/typescript-binary)
[![test](https://github.com/reececomo/typescript-binary/actions/workflows/test.yml/badge.svg)](https://github.com/reececomo/typescript-binary/actions/workflows/test.yml)
[![test](https://github.com/reececomo/typescript-binary/actions/workflows/lint.yml/badge.svg)](https://github.com/reececomo/typescript-binary/actions/workflows/lint.yml)

</div>

- Compatible with [geckos.io](https://github.com/geckosio/geckos.io), [socket.io](https://github.com/socketio/socket.io) and [peer.js](https://github.com/peers/peerjs).
- Similar to [FlatBuffers](https://github.com/google/flatbuffers) and [Protocol Buffers](https://protobuf.dev/), with zero dependencies.
- Hard-forked from the fantastic [sitegui/js-binary](https://github.com/sitegui/js-binary) library, written by [Guilherme Souza](https://github.com/sitegui).

## Install

`npm install typescript-binary`

`yarn add typescript-binary`

## Usage

Define a `BinaryCoder` like so:

```js
import { BinaryCoder, Type, Optional } from "typescript-binary";

// Define
const GameWorldData = new BinaryCoder({
  timeRemaining: Type.UInt,
  players: [
    {
      id: Type.String,
      health: Type.UInt8,
      position: Optional({
        x: Type.Float34,
        y: Type.Float34,
      }),
      isJumping: Type.Boolean,
    },
  ],
});

// Encode
const binary = GameWorldData.encode(gameWorld.getState());

binary.byteLength;
// 20

// Decode
const data = GameWorldData.decode(binary);
// {
//   timeRemaining: number,
//   players: {
//     id: string,
//     health: number,
//     position?: {
//       x: number,
//       y: number
//     },
//     isJumping: boolean
//   }[]
// }
```

### Handling multiple binary formats

By default, each `BinaryCoder` includes a 2-byte `UInt16` identifier. This can be disabled by setting `Id` as `false` in the `BinaryCoder` constructor. You can also provide your own fixed identifier instead (i.e. an `Enum`).

Read the identifer with the static function `BinaryCoder.peekId(...)`.

#### BinaryFormatHandler

Handle multiple binary formats at once with event listeners:

```ts
const binaryHandler = new BinaryFormatHandler()
  .on(MyFormatA, (data) => handleMyFormatA(data))
  .on(MyFormatB, (data) => handleMyFormatB(data));

// Trigger the relevant handler (or throw UnhandledBinaryDecodeError)
binaryHandler.processBuffer(binary);
```

## Types

Here are all the ready-to-use types:

|      **Type**       | **JavaScript Type** |                 **Bytes**                 | **About**                                                                                                           |
| :-----------------: | :-----------------: | :---------------------------------------: | ------------------------------------------------------------------------------------------------------------------- |
|     `Type.Int`      |      `number`       |             1-8<sup>\*</sup>              | Integer up to `±Number.MAX_SAFE_INTEGER`. Dynamically sized.                                                        |
|     `Type.Int8`     |      `number`       |                     1                     | Integer between -127 to 128.                                                                                        |
|    `Type.Int16`     |      `number`       |                     2                     | Integer between -32,767 to 32,767.                                                                                  |
|    `Type.Int32`     |      `number`       |                     4                     | Integer between -2,147,483,647 to 2,147,483,647.                                                                    |
|     `Type.UInt`     |      `number`       |              1-8<sup>#</sup>              | Unsigned integer up to `Number.MAX_SAFE_INTEGER`. Dynamically sized.                                                |
|    `Type.UInt8`     |      `number`       |                     1                     | Unsigned integer up to 255.                                                                                         |
|    `Type.UInt16`    |      `number`       |                     2                     | Unsigned integer up to 65,535.                                                                                      |
|    `Type.UInt32`    |      `number`       |                     4                     | Unsigned integer up to 4,294,967,295.                                                                               |
|   `Type.Float16`    |      `number`       |                     2                     | A 16-bit "half-precision" floating point.<br/>**Important Note:** Low decimal precision. Max. large values ±65,500. |
|   `Type.Float32`    |      `number`       |                     4                     | A 32-bit "single-precision" floating point.                                                                         |
|   `Type.Float64`    |      `number`       |                     8                     | Default JavaScript `number` type. A 64-bit "double-precision" floating point.                                       |
|    `Type.String`    |      `string`       |        1<sup>†</sup>&nbsp;+&nbsp;n        | A UTF-8 string.                                                                                                     |
|   `Type.Boolean`    |      `boolean`      |                     1                     | A single boolean.                                                                                                   |
| `Type.BooleanTuple` |     `boolean[]`     |               1<sup>¶</sup>               | An array of booleans. Dynamically sized.                                                                            |
|   `Type.Bitmask8`   |     `boolean[]`     |                     1                     | 1-8 booleans.                                                                                                       |
|  `Type.Bitmask16`   |     `boolean[]`     |                     2                     | 1-16 booleans.                                                                                                      |
|  `Type.Bitmask32`   |     `boolean[]`     |                     4                     | 1-32 booleans.                                                                                                      |
|     `Type.JSON`     |        `any`        |        1<sup>†</sup>&nbsp;+&nbsp;n        | [JSON format](http://json.org/) data, encoded as a UTF-8 string.                                                    |
|    `Type.Binary`    |    `ArrayBuffer`    |        1<sup>†</sup>&nbsp;+&nbsp;n        | JavaScript `ArrayBuffer` data.                                                                                      |
|    `Type.RegExp`    |      `RegExp`       | 1<sup>†</sup>&nbsp;+&nbsp;n&nbsp;+&nbsp;1 | JavaScript `RegExp` object.                                                                                         |
|     `Type.Date`     |       `Date`        |                     8                     | JavaScript `Date` object.                                                                                           |
|    `Optional(T)`    |  `T \| undefined`   |                     1                     | Any optional field. Use the `Optional(...)` helper. Array elements cannot be optional.                              |
|        `[T]`        |     `Array<T>`      |        1<sup>†</sup>&nbsp;+&nbsp;n        | Use array syntax. Any array.                                                                                        |
|        `{}`         |      `object`       |                  _none_                   | Use object syntax. No overhead to using object types. Buffers are ordered, flattened structures.                    |

<sup>\*</sup>`Int` encodes <±64 = 1 byte, <±8,192 = 2 bytes, <±268,435,456 = 4 bytes, otherwise = 8 bytes.

<sup>#</sup>`UInt` encodes <128 = 1 byte, <16,384 = 2 bytes, <536,870,912 = 4 bytes, otherwise = 8 bytes.

<sup>†</sup>Length of payload bytes as a `UInt`. Typical usage is 1 byte, but can be 2-8 bytes for larger payloads.

<sup>¶</sup>2-bit overhead: 6 booleans per byte (i.e. 9 booleans would require 2 bytes).

## Encoding guide

See [docs/ENCODING.md](docs/ENCODING.md) for encoding guide.
