<div align="center">

<img src="docs/hero.png" alt="TypeScript Binary Icon showing binary peeking out from behind a square." height="106">

# TypeScript Binary

Lightweight, developer-friendly binary serializers in TypeScript.

[![NPM version](https://img.shields.io/npm/v/typescript-binary.svg?style=flat-square)](https://www.npmjs.com/package/typescript-binary)
[![test](https://github.com/reececomo/typescript-binary/actions/workflows/test.yml/badge.svg)](https://github.com/reececomo/typescript-binary/actions/workflows/test.yml)
[![test](https://github.com/reececomo/typescript-binary/actions/workflows/lint.yml/badge.svg)](https://github.com/reececomo/typescript-binary/actions/workflows/lint.yml)

</div>

- 🔌 Compatible with [geckos.io](https://github.com/geckosio/geckos.io), [socket.io](https://github.com/socketio/socket.io) and [peer.js](https://github.com/peers/peerjs).
- 🗜️ Easier than [FlatBuffers](https://github.com/google/flatbuffers) or [Protocol Buffers](https://protobuf.dev/) (and smaller too!)
- 🏋️‍♀️ Support for powerful features like **property mangling** and **16-bit floats**.
- ⚡️ Based on the lightning-fast [sitegui/js-binary](https://github.com/sitegui/js-binary) library, written by [Guilherme Souza](https://github.com/sitegui).

## 📣 When to use?

TypeScript Binary is an optimal choice for real-time HTML5 and Node.js applications and games.

| | **TypeScript&nbsp;Binary** | **FlatBuffers** | **Protocol&nbsp;Buffers** | **Raw&nbsp;JSON** |
| --------------------------------------------- | :------------------------: | :----------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------: | :----------------------------: |
| **Serialization format** | Binary | Binary | Binary | String |
| **Schema definition** | Native | [FlatBuffers Schema .fbs files](https://flatbuffers.dev/flatbuffers_guide_writing_schema.html) | [Proto3 Language .proto files](https://protobuf.dev/programming-guides/proto3/) | Native |
| **TypeScript Types** | Native | Code generation | Code generation | Native |
| **External tooling dependencies** | None | [cmake](https://cmake.org/download/) and [flatc](https://github.com/google/flatbuffers/releases) | None<sup>*</sup> | N/A |
| **Reference data size<sup>†</sup>** | 34 bytes | 68 bytes | 72 bytes | 175&nbsp;bytes&nbsp;(minified) |
| **Fast & efficient** | 🟢 | 🟢 | 🟢 | 🔴 |
| **16-bit floats** | 🟢 | 🔴 | 🔴 | 🔴 |
| **Boolean-packing** | 🟢 | 🔴 | 🔴 | 🔴 |
| **Arbitrary JSON** | 🟢 | 🔴 | 🔴 | 🟢 |
| **Property mangling** | 🟢 | 🔴 | 🔴 | 🔴 |
| **Suitable for real-time data** | 🟢 | 🟢 | 🔴 | 🔴 |
| **Suitable for web APIs** | 🔴 | 🔴 | 🟢 | 🟢 |
| **Supports HTML5 / Node.js** | 🟢 | 🟢 | 🟢 | 🟢 |
| **Cross-language (Java, C++, Python, etc.)** | 🔴 | 🟢 | 🟢 | 🟢 |

<sup>†</sup>Based on the <i>Reference data</i> formats and schemas

<sup>\*</sup>When using `protobufjs`

<details>
<summary>See <i>Reference data</i></summary>

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

### Define formats

Create a `BinaryCoder` like so:

```ts
import { BinaryCoder, Type } from "typescript-binary";

// Define your format:
const GameWorldData = new BinaryCoder({
  time: Type.UInt,
  players: [{
    id: Type.String,
    isJumping: Type.Boolean,
    position: {
      x: Type.Float,
      y: Type.Float
    }
  }]
});
```

> Note: Arrays are declared as `[Type]` or `[{ ... }]`

### Encoding

Data is encoded using the `encode(...)` method.

```ts
const binary = GameWorldData.encode({
  time: 123,
  players: [
    {
       id: 'player1',
       isJumping: 'yes',  
       position: {
         x: 110.57345,
         y: -93.5366
       }
    }
  ]
});
```

> Note: You can use any interface/type as long as the underlying types are compatible (e.g. TypeScript Enums).

### Decoding

Data is decoded to an object with the `decode(...)` method. Again, types are implied at compile-time (unless you explicitly override the interface).

```ts
const data = GameWorldData.decode(binary);
```

### About inferred types

`BinaryCoder` will automatically infer the types for `encode()` and `decode()` from the schema provided (see the `Types` section below).

For example, the type `T` for `GameWorldData.decode(...): T` would be inferred as:
```ts
{
  timeRemaining: number,
  players: {
    id: string,
    health: number,
    isJumping: boolean,
    position?: {
      x: number,
      y: number
    }
  }[]
}
```

You can also use the `Infer<T>` helper type to use inferred types in any custom method/handler:

```ts
import { Infer } from "typescript-binary";

function updateGameWorld(data: Infer<typeof GameWorldData>) {
  // e.g. Access `data.players[0].position?.x`
}
```

## ✨ Handling formats

By default, each format includes an unsigned 16-bit integer identifier (called `Id`). This is used to identify/decode data.

You can explicitly override `Id` in the `BinaryCoder` constructor, or even disable it entirely by passing in `false`.

### BinaryFormatHandler

Handle multiple binary formats at once using a `BinaryFormatHandler`:

```ts
import { BinaryFormatHandler } from "typescript-binary";

const binaryHandler = new BinaryFormatHandler()
  .on(MyFormatA, (data) => handleMyFormatA(data))
  .on(MyFormatB, (data) => handleMyFormatB(data));

// Trigger handler (or throw UnhandledBinaryDecodeError)
binaryHandler.processBuffer(binary);
```

> Note: Cannot be used with formats where `Id` is disabled.

### Manual handling

You can manually check the Id with the static helper `BinaryCoder.peekId(...)`, e.g. for use in a `switch` statement:

```ts
if (BinaryCoder.peekId(incomingBinary) === MyFormat.Id) {
  // Do something special.
}
```

### How is Id calculated?

By default `Id` is based on the hash code of the encoding shape. So the following two formats would have identical:

```ts
const PersonCoder = new BinaryCoder({
  firstName: Type.String,
  lastName: Type.String
});

const FavoriteColorCoder = new BinaryCoder({
  fullName: Type.String,
  color: Type.String
});

NameCoder.Id === ColorCoder.Id
  // true
```

If two identical formats with different handlers is a requirement, you can explicitly set unique identifiers:

```ts
const PersonCoder = new BinaryCoder({
  firstName: Type.String,
  lastName: Type.String
}, 1);

const FavoriteColorCoder = new BinaryCoder({
  fullName: Type.String,
  color: Type.String
}, 2);
```

## Types

Here are all the ready-to-use types:

| **Type** | **JavaScript Type** | **Bytes** | **About** |
| :-----------------: | :-----------------: | :---------------------------------------: | ------------------------------------------------------------------------------------------------------------------- |
| `Type.Int` | `number` | 1-8<sup>\*</sup> | Integer between `-Number.MAX_SAFE_INTEGER` and `Number.MAX_SAFE_INTEGER`. |
| `Type.Int8` | `number` | 1 | Integer between -127 to 128. |
| `Type.Int16` | `number` | 2 | Integer between -32,767 to 32,767. |
| `Type.Int32` | `number` | 4 | Integer between -2,147,483,647 to 2,147,483,647. |
| `Type.UInt` | `number` | 1-8<sup>#</sup> | Unsigned integer between 0 and `Number.MAX_SAFE_INTEGER`. |
| `Type.UInt8` | `number` | 1 | Unsigned integer between 0 and 255. |
| `Type.UInt16` | `number` | 2 | Unsigned integer between 0 and 65,535. |
| `Type.UInt32` | `number` | 4 | Unsigned integer between 0 and 4,294,967,295. |
| `Type.Scalar` | `number` | 1 | Signed scalar between -1.0 and 1.0. |
| `Type.UScalar` | `number` | 1 | Unsigned scalar between 0.0 and 1.0. |
| `Type.Float16` | `number` | 2 | A 16-bit "half-precision" floating point.<br/>**Important Note:** Low decimal precision. Max. large values ±65,500. |
| `Type.Float32` | `number` | 4 | A 32-bit "single-precision" floating point. |
| `Type.Float64` | `number` | 8 | Default JavaScript `number` type. A 64-bit "double-precision" floating point. |
| `Type.String` | `string` | 1<sup>†</sup>&nbsp;+&nbsp;n | A UTF-8 string. |
| `Type.Boolean` | `boolean` | 1 | A single boolean. |
| `Type.BooleanTuple` | `boolean[]` | 1<sup>¶</sup> | Variable-length array/tuple of boolean values packed into 1<sup>¶</sup> byte. |
| `Type.Bitmask8` | `boolean[]` | 1 | 8 booleans. |
| `Type.Bitmask16` | `boolean[]` | 2 | 16 booleans. |
| `Type.Bitmask32` | `boolean[]` | 4 | 32 booleans. |
| `Type.JSON` | `any` | 1<sup>†</sup>&nbsp;+&nbsp;n | [JSON format](http://json.org/) data, encoded as a UTF-8 string. |
| `Type.Binary` | `ArrayBuffer` | 1<sup>†</sup>&nbsp;+&nbsp;n | JavaScript `ArrayBuffer` data. |
| `Type.RegExp` | `RegExp` | 1<sup>†</sup>&nbsp;+&nbsp;n&nbsp;+&nbsp;1 | JavaScript `RegExp` object. |
| `Type.Date` | `Date` | 8 | JavaScript `Date` object. |
| `Optional(T)` | `T \| undefined` | 1 | Any optional field. Use the `Optional(...)` helper. Array elements cannot be optional. |
| `[T]` | `Array<T>` | 1<sup>†</sup>&nbsp;+&nbsp;n | Use array syntax. Any array. |
| `{}` | `object` | _none_ | Use object syntax. No overhead to using object types. Buffers are ordered, flattened structures. |

<sup>\*</sup>`Int` is a variable-length integer ("varint") which encodes <±64 = 1 byte, <±8,192 = 2 bytes, <±268,435,456 = 4 bytes, otherwise = 8 bytes.

<sup>#</sup>`UInt` is a variable-length unsigned integer ("varuint") which encodes <128 = 1 byte, <16,384 = 2 bytes, <536,870,912 = 4 bytes, otherwise = 8 bytes.

<sup>†</sup>Length of payload bytes as a `UInt`. Typically 1 byte, but could be 2-8 bytes for very large payloads.

<sup>¶</sup>2-bit overhead: 6 booleans per byte (i.e. 9 booleans would require 2 bytes).

### Encoding guide

See [docs/ENCODING.md](docs/ENCODING.md) for an overview on how most formats are encoded (including the dynamically sized integer types).
