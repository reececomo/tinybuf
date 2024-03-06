<div align="center">

<img src="docs/hero.png" alt="TypeScript Binary Icon showing binary peeking out from behind a square." height="106">

# TypeScript Binary

Powerful, lightweight binary formats in TypeScript.

[![NPM version](https://img.shields.io/npm/v/typescript-binary.svg?style=flat-square)](https://www.npmjs.com/package/typescript-binary)
[![test](https://github.com/reececomo/typescript-binary/actions/workflows/test.yml/badge.svg)](https://github.com/reececomo/typescript-binary/actions/workflows/test.yml)
[![test](https://github.com/reececomo/typescript-binary/actions/workflows/lint.yml/badge.svg)](https://github.com/reececomo/typescript-binary/actions/workflows/lint.yml)

</div>

- Compatible with [geckos.io](https://github.com/geckosio/geckos.io), [socket.io](https://github.com/socketio/socket.io) and [peer.js](https://github.com/peers/peerjs).
- Similar to [FlatBuffers](https://github.com/google/flatbuffers) and [Protocol Buffers](https://protobuf.dev/), but developer friendly (and with zero dependencies).
- Hard-forked from the fantastic [sitegui/js-binary](https://github.com/sitegui/js-binary) library, written by [Guilherme Souza](https://github.com/sitegui).

## 📣 When to use?

TypeScript Binary is designed to be minimal, fast &amp; developer-friendly.

You don't need to learn any other schemas, or set up any C++ compilers or external schema generators.

|                                               | **TypeScript&nbsp;Binary** |                                         **FlatBuffers**                                          |                            **Protocol&nbsp;Buffers**                            |       **Raw&nbsp;JSON**        |
| --------------------------------------------- | :------------------------: | :----------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------: | :----------------------------: |
| **Serialization format**                      |           Binary           |                                              Binary                                              |                                     Binary                                      |             String             |
| **Fast & efficient**                          |             🟢              |                                                🟢                                                 |                                        🟢                                        |               🔴                |
| **Reference data size<sup>†</sup>**           |          34 bytes          |                                             68 bytes                                             |                                    72 bytes                                     | 175&nbsp;bytes&nbsp;(minified) |
| **Schema definition**                         |           Native           |  [FlatBuffers Schema .fbs files](https://flatbuffers.dev/flatbuffers_guide_writing_schema.html)  | [Proto3 Language .proto files](https://protobuf.dev/programming-guides/proto3/) |             Native             |
| **TypeScript Types**                          |           Native           |                                         Code generation                                          |                                 Code generation                                 |             Native             |
| **External tooling dependencies**             |            None            | [cmake](https://cmake.org/download/) and [flatc](https://github.com/google/flatbuffers/releases) |                                None<sup>*</sup>                                 |              N/A               |
| **16-bit floats**                             |             🟢              |                                                🔴                                                 |                                        🔴                                        |               🔴                |
| **Boolean-packing**                           |             🟢              |                                                🔴                                                 |                                        🔴                                        |               🔴                |
| **Arbitrary JSON**                            |             🟢              |                                                🔴                                                 |                                        🔴                                        |               🟢                |
| **Suitable for real-time data**               |             🟢              |                                                🟢                                                 |                                        🟡                                        |               🔴                |
| **Suitable for web APIs**                     |             🟡              |                                                🟡                                                 |                                        🟢                                        |               🟢                |
| **Supports HTML5 / Node.js**                  |             🟢              |                                                🟢                                                 |                                        🟢                                        |               🟢                |
| **Supports other languages (Java, C#, etc.)** |             🔴              |                                                🟢                                                 |                                        🟢                                        |               🟢                |

<i><b>*</b>: if using `protobufjs`</i>
<details>
<summary><i><b>†</b>: Based on this reference data, formats and schemas</i></summary>

**Sample data (Minified JSON):**
```json
{
  "players": [
    {
      "id": 123,
      "position": {
        "x": 1.0,
        "y": 2.0,
        "z": 3.0
      },
      "velocity": {
        "x": 1.0,
        "y": 2.0,
        "z": 3.0
      },
      "health": 1.00
    },
    {
      "id": 456,
      "position": {
        "x": 1.0,
        "y": 2.0,
        "z": 3.0
      },
      "velocity": {
        "x": 1.0,
        "y": 2.0,
        "y": 3.0
      },
      "health": 0.50
    }
  ]
}
```

**TypeScript Binary**
```ts
const ExamplePacket = new BinaryCoder({
  players: [
    {
      id: Type.UInt,
      position: {
        x: Type.Float16,
        y: Type.Float16,
        z: Type.Float16
      },
      velocity: {
        x: Type.Float16,
        y: Type.Float16,
        y: Type.Float16
      },
      health: Type.UScalar
    },
  ],
});
```

**FlatBuffers**
```fbs
// ExamplePacket.fbs

namespace ExampleNamespace;

table Vec3 {
  x: float;
  y: float;
  z: float;
}

table Player {
  id: uint;
  position: Vec3;
  velocity: Vec3;
  health: float;
}

table ExamplePacket {
  players: [Player];
}

root_type ExamplePacket;
```

**Protocol Buffers (Proto3)**
```proto
syntax = "proto3";

package example;

message Vec3 {
  float x = 1;
  float y = 2;
  float z = 3;
}

message Player {
  uint32 id = 1;
  Vec3 position = 2;
  Vec3 velocity = 3;
  float health = 4;
}

message ExamplePacket {
  repeated Player players = 1;
}
```

</details>

## Install

`npm install typescript-binary`

`yarn add typescript-binary`

## Usage

Define a `BinaryCoder`:

```js
import { BinaryCoder, Type, Optional } from "typescript-binary";

// Defines a strongly-typed coder:
const GameWorldData = new BinaryCoder({
  timeRemaining: Type.UInt,
  players: [
    {
      id: Type.String,
      position: Optional({
        x: Type.Float,
        y: Type.Float
      }),
      health: Type.UInt8,
      isJumping: Type.Boolean
    }
  ]
});
```

Encode to binary buffer:
```ts
const binary = GameWorldData.encode(gameWorld.getState());

binary.byteLength;
// 20
```

Decode back into JavaScript:
```ts
const data = GameWorldData.decode(binary);

// {
//   timeRemaining: number,
//   players: {
//     id: string,
//     health: number,
//     isJumping: boolean,
//     position?: {
//       x: number,
//       y: number
//     }
//   }[]
// }
```

### Handle multiple formats

#### 2-byte header

By default, each `BinaryCoder` includes a 2-byte `UInt16` identifier. This can be disabled by setting `Id` as `false` in the `BinaryCoder` constructor. You can also provide your own fixed identifier instead (i.e. an `Enum`).

Read the identifer with the static function `BinaryCoder.peekId(...)`.

#### BinaryFormatHandler

Handle multiple binary formats at once with event listeners:

```ts
import { BinaryFormatHandler } from "typescript-binary";

// Register formats
const binaryHandler = new BinaryFormatHandler()
  .on(MyFormatA, (data) => handleMyFormatA(data))
  .on(MyFormatB, (data) => handleMyFormatB(data));

// Trigger the relevant handler (or throw UnhandledBinaryDecodeError)
binaryHandler.processBuffer(binary);
```

#### Inferring decoded types

- `BinaryCoder` will automatically infer the types for `encode()` and `decode()` from the schema provided, as will handlers set in `BinaryFormatHandler.on<T>(any, (T) => any`.

You can explicitly use own interfaces/types for `encode()` as long as the underlying type is compatible (e.g. TypeScript Enums).

You can also use the `Infer<T>` helper type to retrieve the schema-inferred types in any custom method/handler you define:

```ts
import { Infer } from "typescript-binary";

function handleMyFormat(data: Infer<typeof GameWorldData>) {
  // Access `data.players[0].position?.x` as `number`
}
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
|    `Type.Scalar`    |      `number`       |                     1                     | Signed scalar between -1.0 and 1.0.                                                                                 |
|   `Type.UScalar`    |      `number`       |                     1                     | Unsigned scalar between 0.0 and 1.0.                                                                                |
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
