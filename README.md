# 🔌 tinybuf &nbsp;[![NPM version](https://img.shields.io/npm/v/tinybuf.svg?style=flat-square)](https://www.npmjs.com/package/tinybuf) [![Minzipped](https://badgen.net/bundlephobia/minzip/tinybuf)](https://www.npmjs.com/package/bitecs) [![Downloads](https://img.shields.io/npm/dt/tinybuf.svg)](https://www.npmjs.com/package/tinybuf) [![Tests](https://github.com/reececomo/tinybuf/actions/workflows/tests.yml/badge.svg)](https://github.com/reececomo/tinybuf/actions/workflows/tests.yml) [![License](https://badgen.net/npm/license/tinybuf)](https://github.com/reececomo/tinybuf/blob/main/LICENSE)

<img align="right" src="docs/hero.png" alt="tinybuf icon showing binary peeking out from behind a square." height="80">

Zero-dependency binary serialization for Node.js and HTML5 &ndash; based on [js-binary](https://www.npmjs.com/package/js-binary)

| | |
| --------------------------------- | ---------------------------------------- |
| 🔮 Simple, declarative API | 🔥 Blazing fast serialization |
| 🗜️ Powerful & performant compression | ✨ 50% smaller vs. [FlatBuffers](#-comparison-table)  |
| 🍃 Zero dependencies | 🙉 Optional advanced features |
| 🤏 `~5kb` minzipped | 🚦 Supports property mangling (i.e. [Terser\](https://terser.org/)) |

## 💿 Install

```
npm install tinybuf
```

## 🕹 Example

```ts
import { defineFormat, Type } from 'tinybuf';


const Vector2 = {
  x: Type.Float32,
  y: Type.Float32
} as const;

export const GameWorldData = defineFormat({
  world: {
    seqNo: Type.UInt,
    time: Type.Float16
  },
  players: [
    {
      id: Type.UInt,
      position: Vector2,
      inputs: Type.Bools // e.g. [ up, left, down, right ]
    }
  ]
});
```

#### Encode

```ts
const bytes = GameWorldData.encode(myGameWorld);

bytes.byteLength
// 16

```

#### Decode

```ts
const data = GameWorldData.decode(bytes);
// {
//   world: { seqNo: number, time: number },
//   players: Array<{ id: number, inputs: boolean[], position?: { x: number, y: number } }>
// }
```

#### Parsing

```ts
import { bufferParser } from 'tinybuf'


// register formats
const parser = bufferParser()
  .on(GameWorldState, (data) => myWorld.update(data))
  .on(ChatMessage, (data) => myHud.onChatMessage(data))

// process data
parser.processBuffer(bytes)
```

## 📘 Documentation

**tinybuf** achieves its tiny size by serializing to a schemaless encoding format; This means both the client and server
(or peers) must share common encoding definitions. You might typically put these into some common, shared module.

See the following guides for more:

1. **[defineFormat](#define-formats)**: _Define flexible, static-typed encoding formats_
2. **[bufferParser](#bufferparser)**: _Parse incoming binary in registered formats_
3. **[Compression/serialization](#%EF%B8%8F-compression-and-serialization)**: _Various tips &amp techniques for making data small_

> [!TIP]
> For additional validation and post-processing, see [Validation and Transforms](#-validation--transforms)

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

#### Using inferred types

You can also use the `Decoded<typeof T>` helper to add inferred types to any custom method/handler:

```ts
import { Decoded } from 'tinybuf'

function updateGameWorld(data: Decoded<typeof GameWorldData>) {
  // e.g. Access `data.players[0].position?.x`
}
```

## Types
*Serialize data as a number of lossless (and lossy!) data types*

| **Type** | **Inferred JavaScript Type** | **Bytes** | **About** |
| :----------------- | :-----------------: | :---------------------------------------: | ------------------------------------------------------------------------------------------------------------------- |
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
| `Type.Bool` | `boolean` | 1 | A single boolean. |
| `Type.Bools` | `boolean[]` | 1<sup>¶</sup> | Variable-length array of boolean values packed into 1<sup>¶</sup> byte. |
| `Type.Bools8` | `boolean[]` | 1 | Array of 1 - 8 booleans. |
| `Type.Bools16` | `boolean[]` | 2 | Array of 1 - 16 booleans. |
| `Type.Bools32` | `boolean[]` | 4 | Array of 1 - 32 booleans. |
| `Type.Buffer` | `ArrayBuffer` | 1<sup>†</sup>&nbsp;+&nbsp;n | JavaScript `ArrayBuffer` data. |
| `Type.String` | `string` | 1<sup>†</sup>&nbsp;+&nbsp;n | A UTF-8 string. |
| `Type.JSON` | `any` | 1<sup>†</sup>&nbsp;+&nbsp;n | Arbitrary [JSON](http://json.org/) data, encoded as a UTF-8 string. |
| `Type.RegExp` | `RegExp` | 1<sup>†</sup>&nbsp;+&nbsp;n&nbsp;+&nbsp;1 | JavaScript `RegExp` object. |
| `Type.Date` | `Date` | 8 | JavaScript `Date` object. |
| `optional(T)` | `T \| undefined` | 1 | Any optional field. Use the `Optional(...)` helper. Array elements cannot be optional. |
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

#### Quantizing Physics

If you are running a deterministic physics simulation (e.g. [State Synchronization / Rollback Netcode](https://gafferongames.com/post/state_synchronization/)),
you may need to _quantize_ your floating-point numbers before comparing them.

As [Glenn Fiedler](https://gafferongames.com) suggests, you could simply apply the deserialized state on every phyiscs `update()` as if it had come over the network:

```ts
updateLoop() {
  // do physics here ...

  // quantize
  const encoded = GameWorldFormat.encode(world)
  world.update(GameWorldFormat.decode(encoded))
}
```

For more manual approaches, here are the is a list of the various quantization (rounding) functions for each number type:

| **Type** | **Bytes** | **Quantization function** | **Use Cases** |
| --- | :-: | --- | --- |
| `Type.Float64` | **8** | _n/a_ | Physics values. |
| `Type.Float32` | **4** | `Math.fround(x)` (built-in) | Visual values, physics values. |
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
const toSpecialRange = x => (x * 20_000) - 62_832
const fromSpecialRange = x => (x + 62_832) / 20_000

const MyState = defineFormat({
  myRotation: Type.Float16
})
  .setTransforms({ myRotation: [ toSpecialRange, fromSpecialRange ]})
```

## ✨ Parsing formats

By default, each encoding includes a 2-byte identifier based on the shape of the data which is used to decode the packet.

These identifiers are shape-based, so they will collide for identical-shaped encodings.

You can explicitly set the header to any 2-byte string or u16 integer in the `defineFormat({ header: 'Ab' }, definition)`.

### bufferParser()

Handle multiple binary formats at once using a `bufferParser`:

```ts
import { bufferParser } from 'tinybuf'

const myDecoder = bufferParser()
  .on(MyFormatA, data => onMessageA(data))
  .on(MyFormatB, data => onMessageB(data))

// Trigger handler (or throw UnhandledBinaryDecodeError)
myDecoder.processBuffer(binary)
```

> Note: Cannot be used with headerless formats.

### Manual handling

You can check headers on raw buffers using `peekHeader(): number` and `peekHeaderStr(): string`:

```ts
import { peekHeader } from 'tinybuf'

if (peekHeader(incomingBinary) === MyMessageFormat.header) {
  // Do something special.
}
```

### 💥 Header Collisions

The default `header` is based on the shape of the encoding format, so the following two formats would have identical headers:

```ts
const User = defineFormat({
  name: Type.String,
  age: Type.UInt
})

const Color = defineFormat({
  name: Type.String,
  hex: Type.UInt
})

User.header === Color.header
// true
```

You can explicitly set unique headers, as an integer 0 -> 65,535, or a 2-byte string (e.g. `'AB'`).

```ts
const User = defineFormat(123, {
  name: Type.String,
  age: Type.UInt
})

const Color = defineFormat('Co', {
  name: Type.String,
  hex: Type.UInt
})

User.header === Color.header
// false
```

e.g. using a `const enum`:

```ts
const enum Formats {
  User,
  Color,
}

const User = defineFormat(Formats.User, {
  name: Type.String,
  age: Type.UInt
})

const Color = defineFormat(Formats.Color, {
  name: Type.String,
  hex: Type.UInt
})
```

> 

## ✨ Validation / Transforms

### Validation

The great thing about binary encoders is that data is implicitly type-validated, however, you can also add custom
validation rules using `setValidation()`:

```ts
const UserMessage = defineFormat({
  uuid: Type.String,
  name: Optional(Type.String),
  // ...
})
.setValidation({
  uuid: (x) => {
    if (!isValidUUIDv4(x)) {
      throw new Error('Invalid UUIDv4: ' + x)
    }
  }
})
```

### Transforms

You can also apply additional encode/decode transforms.

Here is an example where we're stripping out all whitespace:

```ts
const PositionMessage = defineFormat({ name: Type.String })
  .setTransforms({ name: a => a.replace(/\s+/g, '') })

let binary = PositionMessage.encode({ name: 'Hello  There' })
let data = PositionMessage.decode(binary)

data.name
  // "HelloThere"
```

Unlike validation, transforms are applied asymmetrically.

The transform function is only applied on **encode()**, but you can provide two transform functions.

Here is an example which cuts the number of bytes required from `10` to `5`:

```ts
const PercentMessage = defineFormat(null, { value: Type.String })
  .setTransforms({
    value: [
      (before) => before.replace(/\$|USD/g, '').trim(),
      (after) => '$' + after + ' USD'
    ]
  })

let binary = PercentMessage.encode({ value: ' $45.53 USD' })
let data = PercentMessage.decode(binary)

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
| **Boolean arrays** | 🟢 | 🔴 | 🔴 | 🔴 |
| **Scalar types** | 🟢 | 🔴 | 🔴 | 🔴 |
| **Arbitrary JSON** | 🟢 | 🔴 | 🔴 | 🟢 |
| **Property mangling** | 🟢 | 🟡 | 🔴 | 🔴 |
| **Suitable for real-time data** | 🟢 | 🟢 | 🟡 | 🔴 |
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
const ExampleMessage = defineFormat({
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
})
```

**FlatBuffers**
```fbs
// ExampleMessage.fbs

namespace ExampleNamespace

table Vec3 {
  x: float
  y: float
  z: float
}

table Player {
  id: uint
  position: Vec3
  velocity: Vec3
  health: float
}

table ExampleMessage {
  players: [Player]
}

root_type ExampleMessage
```

**Protocol Buffers (Proto3)**
```proto
syntax = "proto3"

package example

message Vec3 {
  float x = 1
  float y = 2
  float z = 3
}

message Player {
  uint32 id = 1
  Vec3 position = 2
  Vec3 velocity = 3
  float health = 4
}

message ExampleMessage {
  repeated Player players = 1
}
```

</details>

### Encoding guide

See [docs/ENCODING.md](docs/ENCODING.md) for an overview on how most formats are encoded (including the dynamically sized integer types).

## Credits

Hard-forked from Guilherme Souza's [js-binary](https://github.com/sitegui/js-binary).
