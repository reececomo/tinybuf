# 🔌 tinybuf &nbsp;[![NPM version](https://img.shields.io/npm/v/tinybuf.svg?style=flat-square)](https://www.npmjs.com/package/tinybuf) [![test](https://github.com/reececomo/tinybuf/actions/workflows/test.yml/badge.svg)](https://github.com/reececomo/tinybuf/actions/workflows/test.yml) [![test](https://github.com/reececomo/tinybuf/actions/workflows/lint.yml/badge.svg)](https://github.com/reececomo/tinybuf/actions/workflows/lint.yml)

<img align="right" src="docs/hero.png" alt="tinybuf icon showing binary peeking out from behind a square." height="80">

Compressed, static-typed binary buffers in HTML5 / Node.js

- 🚀 Designed for real-time HTML5 games (via [geckos.io](https://github.com/geckosio/geckos.io), [peer.js](https://github.com/peers/peerjs) or [socket.io](https://github.com/socketio/socket.io))
- 🗜️ Lossless and lossy compression, up to ~50% smaller than [FlatBuffers](https://github.com/google/flatbuffers) or [Protocol Buffers](https://protobuf.dev/)
- ✨ Out-of-the-box boolean packing, 16-bit floats, 8-bit scalars, and more
- 🚦 Compile-time safety & runtime validation

> **tinybuf** is safe for use with property mangling & code minification like [terser](https://terser.org/)

## Why?

**tinybuf** is small, fast and extensible. Unlike _FlatBuffers_ and _Protocol Buffers_ - which focus on cross-platform languages, limited encoding choices, and generated code - **tinybuf** is focused soley on fast, native serialization to compressed formats.  See [comparison table](#-comparison-table).

## Sample Usage
*Easily send and receive custom binary formats.*

**Define formats:**

```ts
import { encoder, Type } from 'tinybuf';

const GameWorldState = encoder({
  time: Type.UInt,
  players: [{ /* ... */ }]
});
```

**Sending:**

```ts
// Encode:
const bytes = GameWorldState.encode(myWorld);
```

**Receiving:**

```ts
// Decode:
const myWorldData = GameWorldState.decode(bytes);
```

**Receiving (many):**

```ts
import { decoder } from 'tinybuf';

// Create a decoder:
const myDecoder = decoder()
  .on(GameWorldState, (data) => myWorld.update(data))
  .on(ChatMessage, (data) => myHud.onChatMessage(data));

// Handle incoming:
myDecoder.processBuffer(bytes);
```

## Getting Started
*Everything you need to quickly encode and decode strongly-typed message formats.*

The only requirement for **tinybuf** is that encoding formats are known by clients, servers and/or peers. You should define encoding formats in some shared module.

Then all you need is:

1. **[encoder](#define-formats)** (+[types](#types)): _Define flexible, static-typed encoding formats_
2. **[decoder](#use-decoder)**: _Parse incoming binary in registered formats_
3. **[Compression/serialization](#%EF%B8%8F-compression-and-serialization)**: _Various tips &amp; techniques for making data small_

> For more information on additional pre/post-processing rules, check out [Validation and Transforms](#-validation--transforms).

## Installation

```sh
# npm
npm install tinybuf

# yarn
yarn add tinybuf
```

## Usage

### Define formats

Create an encoding format like so:

```ts
import { encoder, Type, Optional } from 'tinybuf';

// Define your format:
const GameWorldData = encoder({
  time: Type.UInt,
  players: [{
    id: Type.UInt,
    isJumping: Type.Boolean,
    position: Optional({
      x: Type.Float,
      y: Type.Float
    })
  }]
});
```

Then call `encode()` to turn it into binary (as `ArrayBuffer`).

```ts
// Encode:
const bytes = GameWorldData.encode({
  time: 123,
  players: [
    {
       id: 44,
       isJumping: true,  
       position: {
         x: 110.57345,
         y: -93.5366
       }
    }
  ]
});

bytes.byteLength
// 14
```

And you can also decode it directly from the encoding type.

```
// Decode:
const data = GameWorldData.decode(bytes);
```

### Inferred types

The encoder will automatically infer the types for `encode()` and `decode()` from the schema provided (see the `Types` section below).

For example, the return type of `GameWorldData.decode(...)` from the above example, is:
```ts
// data:
{
  time: number,
  players: Array<{
    id: string,
    health: number,
    isJumping: boolean,
    position?: { x: number, y: number } | undefined
  }>
}
```

#### Using 

You can also use the `Decoded<typeof T>` helper to add inferred types to any custom method/handler:

```ts
import { Decoded } from 'tinybuf';

function updateGameWorld(data: Decoded<typeof GameWorldData>) {
  // e.g. Access `data.players[0].position?.x`
}
```

## Types
*Serialize data as a number of lossless (and lossy!) data types*

| **Type** | **Inferred JavaScript Type** | **Bytes** | **About** |
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
| `Type.Float64` / `Type.Double` | `number` | 8 | Default JavaScript `number` type. A 64-bit "double" precision floating point number. |
| `Type.Float32` / `Type.Float` | `number` | 4 | A 32-bit "single" precision floating point number. |
| `Type.Float16` / `Type.Half` | `number` | 2 | A 16-bit "half" precision floating point number.<br/>**Important Note:** Low decimal precision. Max. large values ±65,500. |
| `Type.String` | `string` | 1<sup>†</sup>&nbsp;+&nbsp;n | A UTF-8 string. |
| `Type.Boolean` | `boolean` | 1 | A single boolean. |
| `Type.BooleanTuple` | `boolean[]` | 1<sup>¶</sup> | Variable-length array/tuple of boolean values packed into 1<sup>¶</sup> byte. |
| `Type.Bitmask8` | `boolean[]` | 1 | 8 booleans. |
| `Type.Bitmask16` | `boolean[]` | 2 | 16 booleans. |
| `Type.Bitmask32` | `boolean[]` | 4 | 32 booleans. |
| `Type.JSON` | `any` | 1<sup>†</sup>&nbsp;+&nbsp;n | Arbitrary [JSON](http://json.org/) data, encoded as a UTF-8 string. |
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

## 🗜️ Compression and Serialization
***tinybuf** comes with powerful encoding types & transforms to make data tiny*

It is [strongly advised](https://xkcd.com/1691/) that you don't start with optimizing compression right away. 80% of the win comes just from binary encoding in the first place. Consider revisiting as needed only.

> It is highly recommended to read the materials by Glenn Fiedler on [Serialization Strategies: Serializing Floating Point Values](https://gafferongames.com/post/serialization_strategies/#serializing_floating_point_values) and [State Synchronization: Quantize Both Sides](https://gafferongames.com/post/state_synchronization/#quantize_both_sides).

### Serializing Floats

In JavaScript, all numbers are stored as 64-bit (8-byte) floating-point numbers (or "floats"). These take up a whopping **8 bytes** each!

Most of the meaningful gains will come out of compressing floats, including those in 2D or 3D vectors and quaternions. You can compress all visual-only quantities without issue - i.e. if you are using [Snapshot Compression Netcode](https://gafferongames.com/post/snapshot_compression/), or updating elements of a [HUD](https://en.wikipedia.org/wiki/Head-up_display).

### Quantizing Physics

If you are running a deterministic physics simulation (i.e. [State Synchronization / Rollback Netcode](https://gafferongames.com/post/state_synchronization/)), you may need to apply the same quantization to your physics simulation to avoid desynchronization issues or rollback "pops".

Or as Glenn Fiedler suggests, apply the deserialized state on every phyiscs `update()` as if it had come over the network:

```ts
update() {
  // Do physics updates...

  // Quantize:
  const serialized = GameWorldFormat.encode(this.getState());
  const deserialized = GameWorldFormat.decode(serialized);
  this.setState(deserialized);
}
```

Or for simple cases, you can apply the rounding function to the physics simulation:

```ts
update() {
  // Do physics updates...

  // Quantize:
  quantize();
}

quantize() {
  for (const entity of this.worldEntities) {
    // Round everything to the nearest 32-bit representation:
    entity.position.set( Math.fround(player.position.x), Math.fround(player.position.y) );
    entity.velocity.set( Math.fround(player.velocity.x), Math.fround(player.velocity.y) );
  }
}
```

For reference here are the is a list of the various quantization (rounding) functions for each number type:

| **Type** | **Bytes** | **Quantization function** | **Use Cases** |
| --- | :-: | --- | --- |
| `Type.Float64` | **8** | _n/a_ | Physics values. |
| `Type.Float32` | **4** | `Math.fround(x)` | Visual values, physics values. |
| `Type.Float16` | **2** | `fround16(x)` | Limited visual values, limited physics values - i.e. safe for numbers in the range ±65,504, with the smallest precision ±0.00011839976. |
| `Type.Scalar` | **1** | `scalarRound(x)` | Player inputs - e.g. _analog player input (joystick)_. Values from -1.00 to 1.00. |
| `Type.UScalar` | **1** | `uScalarRound(x)` | Visual values - e.g. _a health bar_. Values from 0.00 to 1.00. |
| `Type.Int` | **1-2**<sup>\*</sup> | `Math.round(x)` | Visual values. \*Up to 4-8 bytes for larger values (see [Types](#types)). |

### Custom Transforms

You can combine the above built-ins with **[transforms (see Transforms)](#transforms)** to acheive really meaningful compression.

In the following example, we have a `myRotation` value which is given in absolute radians between 0 and 2π (~6.28319). If we tried to send this as a plain 16-bit float, we would lose a \*LOT\* of precision, and the rotation would come out visually jerky on the other end.

What we could do instead is set custom [transforms](#transforms) that utilize much more of the safe range for 16-bit floats (±65,504):

```ts
// Example transform functions that boosts precision by x20,000 by putting
// values into the range ±~62,832, prior to serializing as a 16-bit float.
const toSpecialRange = x => (x * 20_000) - 62_832;
const fromSpecialRange = x => (x + 62_832) / 20_000;

const MyState = encoder({
  myRotation: Type.Float16
})
  .setTransforms({ myRotation: [ toSpecialRange, fromSpecialRange ]});
```

## ✨ Parsing formats

By default, each encoder encodes a 2-byte identifier based on the shape of the data.

You can explicitly set `Id` in the `encoder(Id, definition)` to any 2-byte string or unsigned integer (or disable entirely by passing `null`).

### Use Decoder

Handle multiple binary formats at once using a `decoder`:

```ts
import { decoder } from 'tinybuf';

const myDecoder = decoder()
  .on(MyFormatA, data => onMessageA(data))
  .on(MyFormatB, data => onMessageB(data));

// Trigger handler (or throw UnhandledBinaryDecodeError)
myDecoder.processBuffer(binary);
```

> Note: Cannot be used with formats where `Id` was disabled.

### Manual handling

You can manually read message identifers from incoming buffers with the static function `BinaryCoder.peekIntId(...)` (or `BinaryCoder.peekStrId(...)`):

```ts
import { BinaryCoder } from 'tinybuf';

if (BinaryCoder.peekStrId(incomingBinary) === MyMessageFormat.Id) {
  // Do something special.
}
```

### 💥 Id Collisions

By default `Id` is based on a hash code of the encoding format. So the following two messages would have identical Ids:

```ts
const Person = encoder({
  firstName: Type.String,
  lastName: Type.String
});

const FavoriteColor = encoder({
  fullName: Type.String,
  color: Type.String
});

NameCoder.Id === ColorCoder.Id
  // true
```

If two identical formats with different handlers is a requirement, you can explicitly set unique identifiers.

```ts
const Person = encoder(1, {
  firstName: Type.String,
  lastName: Type.String
});

const FavoriteColor = encoder(2, {
  fullName: Type.String,
  color: Type.String
});
```

> Identifiers can either be a 2-byte string (e.g. `'AB'`), an unsigned integer (0 -> 65,535).

## ✨ Validation / Transforms

### Validation

The great thing about binary encoders is that data is implicitly type-validated, however, you can also add custom
validation rules using `setValidation()`:

```ts
const UserMessage = encoder({
  uuid: Type.String,
  name: Optional(Type.String),
  // ...
})
.setValidation({
  uuid: (x) => {
    if (!isValidUUIDv4(x)) {
      throw new Error('Invalid UUIDv4: ' + x);
    }
  }
});
```

### Transforms

You can also apply additional encode/decode transforms.

Here is an example where we're stripping out all whitespace:

```ts
const PositionMessage = encoder({ name: Type.String })
  .setTransforms({ name: a => a.replace(/\s+/g, '') });

let binary = PositionMessage.encode({ name: 'Hello  There' })
let data = PositionMessage.decode(binary);

data.name
  // "HelloThere"
```

Unlike validation, transforms are applied asymmetrically.

The transform function is only applied on **encode()**, but you can provide two transform functions.

Here is an example which cuts the number of bytes required from `10` to `5`:

```ts
const PercentMessage = encoder(null, { value: Type.String })
  .setTransforms({
    value: [
      (before) => before.replace(/\$|USD/g, '').trim(),
      (after) => '$' + after + ' USD'
    ]
  });

let binary = PercentMessage.encode({ value: ' $45.53 USD' })
let data = PercentMessage.decode(binary);

binary.byteLength
  // 5

data.value
  // "$45.53 USD"
```

## 🏓 Comparison Table

*Choosing for real-time HTML5 / Node.js applications and games.*

Here are some use cases stacked uup.

| | **tinybuf** | **FlatBuffers** | **Protocol&nbsp;Buffers** | **Raw&nbsp;JSON** |
| --------------------------------------------- | :------------------------: | :----------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------: | :----------------------------: |
| **Serialization format** | Binary | Binary | Binary | String |
| **Schema definition** | Native | [.fbs files](https://flatbuffers.dev/flatbuffers_guide_writing_schema.html) | [.proto files](https://protobuf.dev/programming-guides/proto3/) | Native |
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

**tinybuf**
```ts
const ExampleMessage = encoder({
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
// ExampleMessage.fbs

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

table ExampleMessage {
  players: [Player];
}

root_type ExampleMessage;
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

message ExampleMessage {
  repeated Player players = 1;
}
```

</details>

### Encoding guide

See [docs/ENCODING.md](docs/ENCODING.md) for an overview on how most formats are encoded (including the dynamically sized integer types).

## Credits

Developed from a hard-fork of Guilherme Souza's [js-binary](https://github.com/sitegui/js-binary).
