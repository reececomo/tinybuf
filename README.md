# TypeScript Binary

Encode/decode powerful binary buffers in TypeScript.

* Compatible with [geckos.io](https://github.com/geckosio/geckos.io), [socket.io](https://github.com/socketio/socket.io) and [peer.js](https://github.com/peers/peerjs).
* Similar to [FlatBuffers](https://github.com/google/flatbuffers) and [Protocol Buffers](https://protobuf.dev/), with zero dependencies.
* Hard-forked from the fantastic [sitegui/js-binary](https://github.com/sitegui/js-binary) library, written by [Guilherme Souza](https://github.com/sitegui). 

## Install

`npm install typescript-binary`

`yarn add typescript-binary`

## Usage

1. Define a `BinaryCodec<T>`.
2. Use `encode(...)` and `decode(...)` to convert an object to a binary buffer (and back).

```js
import { BinaryCodec, Type, Optional } from 'typescript-binary';

const GameWorldBinaryCodec = new BinaryCodec({
  time: Type.UInt16,
  players: [{
    id: Type.String,
    health: Type.UInt8,
    position: Optional({
      x: Type.Float,
      y: Type.Float
    }),
    jump: Type.Boolean
  }],
});

// Encode
const binary: ArrayBuffer = GameWorldBinaryCodec.encode(gameWorld.getState());

binary.byteLength;
// 21

// Decode:
const data: GameState = GameWorldBinaryCodec.decode(binary);
```

### Handling multiple binary formats

By default, each `BinaryCodec` includes a 2-byte `UInt16` identifier (`Id`). This can be disabled by passing `false` as the second argument to the `BinaryCodec` constructor, or you can optionally provide your own manual identifier.

These Ids can be read by `BinaryCodec.peekId(...)` to differentiate between multiple formats.

#### BinaryCodecInterpreter - Auto-decode multiple formats

Use a `BinaryCodecInterpreter` to handle multiple binary formats at once:

```ts
const group = new BinaryCodecInterpreter()
  .register(MyRecvFormat1, (data) => handleData)
  .register(MyRecvFormat2, (data) => handleData)
  .register(MySendFormat1);

// Triggers the above data handlers.
// Efficient! Runs in O(1) time.
group.decode(incomingData);

// Send data
// Less efficient, runs in O(n)!
const buffer = group.encode({ /* ... */ });
```

## Types

Here are all the ready-to-use types:

| **Type** | **JavaScript Type** | **Bytes** | **About** |
|:---:|:---:|:---:|---|
| `Type.Float64` | `number` | 8 | A 64-bit "double-precision" floating point number. Default JavaScript `number` type. |
| `Type.Float32` | `number` | 4 | A 32-bit "single-precision" floating point number. |
| `Type.Float16` | `number` | 2 | A 16-bit "half-precision" floating point number.<br/>**Important Note:** Low decimal precision, and max large values are between -65,500 and 65,500. |
| `Type.Int` | `number` | 1-8<sup>#</sup> | Integer between `-Number.MAX_SAFE_INTEGER` and `Number.MAX_SAFE_INTEGER`. Dynamically sized.|
| `Type.Int8` | `number` | 1 | Integer between -127 and 127. Fixed size. |
| `Type.Int16` | `number` | 2 | Integer between -32,767 and 32,767. Fixed size. |
| `Type.Int32` | `number` | 4 | Integer between -2,147,483,647 and 2,147,483,647. Fixed size. |
| `Type.UInt` | `number` | 1-8<sup>#</sup> | Any unsigned integer between 0 and `Number.MAX_SAFE_INTEGER`. Alias for `Type.Int`, but validates that values are positive/unsigned. Dynamically sized. |
| `Type.UInt8` | `number` | 1 | Unsigned integer between 0 and 255. Fixed size. |
| `Type.UInt16` | `number` | 2 | Unsigned integer between 0 and 65,535. Fixed size. |
| `Type.UInt32` | `number` | 4 | Unsigned integer between 0 and 4,294,967,295. Fixed size. |
| `Type.String` | `string` | 1<sup>†</sup> | A string encoded as UTF-8. |
| `Type.Boolean` | `boolean` | 1 | A single boolean. |
| `Type.BooleanTuple` | `boolean[]` | 1<sup>¶</sup> | An array of booleans. Dynamically sized. |
| `Type.Bitmask8` | `boolean[]` | 1 | 1-8 booleans. Fixed size. |
| `Type.Bitmask16` | `boolean[]` | 2 | 1-16 booleans. Fixed size. |
| `Type.Bitmask32` | `boolean[]` | 4 | 1-32 booleans. Fixed size. |
| `Type.Date` | `Date` | 8 | JavaScript `Date` object as a UTC timestamp in milliseconds from Unix Epoch date (Jan 1, 1970). |
| `Type.RegExp` | `RegExp` | 1<sup>†</sup> | JavaScript `RegExp` object. |
| `Type.JSON` | `object \| JSON` | 1<sup>†</sup> | Any [JSON format](http://json.org/) data, encoded as a string. |
| `Type.Binary` | `ArrayBuffer \| ArrayBufferView` | 1<sup>†</sup> | JavaScript `ArrayBuffer` or `ArrayBufferView` (i.e. `UInt8Array`) |
| `Optional(T)` | `T \| undefined` | 1 | Any optional field. Use the `Optional(...)` helper. |
| `Type.Array` | `Array` | 1<sup>†</sup> | (Use array syntax.) Any array. |
| `Type.Object` | `object` | _none_ | (Use object syntax.) No overhead to using object types. Buffers are ordered, flattened structures. |

<sup>#</sup>`Type.Int`/`Type.UInt`: 1, 2, 4 or 8 bytes. Values between -64 and 64 are encoded as 1 byte, between -8,192 and 8,192 as 2 bytes, between -268,435,456 and 268,435,456 as 4 bytes, and larger as 8 bytes (up to the JavaScript limit).

<sup>†</sup>Encoded as `[length][payload]` where `length` is a `Type.UInt` representing the number of bytes in the payload.

<sup>¶</sup>1 byte for up to 6 booleans. i.e. 9 booleans would require 2 bytes.

## Encoding guide

See [ENCODING.md](/ENCODING.md) for encoding guide.
