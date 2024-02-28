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

const GameWorldBinaryCodec = new BinaryCodec<GameState>({
  time: Type.Date,
  players: [{
    id: Type.String,
    health: Type.UInt8,
    position: {
      x: Type.Float,
      y: Type.Float
    },
    velocity: {
      x: Type.Float,
      y: Type.Float
    },
    ability: Optional(Type.String),
  }],
});

// Encode
const binary = GameWorldBinaryCodec.encode(gameWorld.getState());

binary.byteLength;
// 34

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

| Type | **JavaScript Type** | **Bytes** | **About** |
|:---|:---:|:---:|---|
| `Type.Double` | `number` | 8 | A 64-bit "double-precision" floating point number.<br/>**The default JavaScript `number` type.** |
| `Type.Float` | `number` | 4 | A 32-bit "single-precision" floating point number. |
| `Type.Half` | `number` | 2 | A 16-bit "half-precision" floating point number. **Important Note:** Low decimal precision, and max large values are between -65,500 and 65,500. |
| `Type.Int` | `number` | 1-8 | Any integer between `-Number.MAX_SAFE_INTEGER` and `Number.MAX_SAFE_INTEGER`.|
| `Type.Int8` | `number` | 1 | Integer between -127 and 127 |
| `Type.Int16` | `number` | 2 | Integer between -32,767 and 32,767 |
| `Type.Int32` | `number` | 4 | Integer between -2,147,483,647 and 2,147,483,647 |
| `Type.UInt` | `number` | 1-8 | Any unsigned integer between 0 and `Number.MAX_SAFE_INTEGER`. Alias for `Type.Int`, but validates that values are positive/unsigned. |
| `Type.UInt8` | `number` | 1 | Unsigned integer between 0 and 255 |
| `Type.UInt16` | `number` | 2 | Unsigned integer between 0 and 65,535 |
| `Type.UInt32` | `number` | 4 | Unsigned integer between 0 and 4,294,967,295 |
| `Type.String` | `string` | 1<sup>*</sup> + string byte length | Any string, encoded as UTF-8.<br/><sup>*</sup>There is a small overhead of `Type.UInt` to mark the length of the string, which for small strings is 1 byte. Strings longer than 64 bytes will have a 2 byte header. Strings longer than 8,192 bytes will have a 4 byte header. Strings longer than 268,435,456 bytes will have an 8 byte header, but will also have bigger problems to deal with. |
| `Type.Boolean` | `boolean` | 1 | A single boolean. |
| `Type.BooleanTuple` | `boolean[]` | 1 (for every 6 values) | Multiple booleans (variable length) packed into a single byte. 1-6 booleans = 1 byte, 7-12 = 2 bytes, etc. |
| `Type.Bitmask8` | `boolean[]` | 1 | Up to 8 booleans (padded with `false` below 8) |
| `Type.Bitmask16` | `boolean[]` | 2 | Up to 16 booleans (padded with `false` below 16) |
| `Type.Bitmask32` | `boolean[]` | 4 | Up to 32 booleans (padded with `false` below 32) |
| `Type.Binary` | `ArrayBuffer \| ArrayBufferView` | `UInt` (~1) + buffer byte length | Any JavaScript ArrayBuffer or ArrayBufferView (e.g. UInt8Array) |
| `Type.Date` | `Date` | 8 | JavaScript `Date` object as a UTC timestamp in milliseconds from Unix Epoch date (Jan 1, 1970). |
| `Type.RegExp` | `RegExp` | `UInt` (~1) + byte length | JavaScript `RegExp` object. |
| `Type.JSON` | `object \| JSON` | 1<sup>*</sup> + string byte length | Any [JSON format](http://json.org/) data, encoded as a string. |
| `Type.Array` | `Array` | 1<sup>*</sup> overhead | Any array. Use array syntax instead. |
| `Type.Object` | `object` | NONE | Any serializable object. Buffers are ordered, flattened structures, so there is no overhead to using object types. |
| `Optional(T)` | `undefined \| T` | 1 | Any optional field. Use the `Optional(...)` helper. |

<sup>*</sup>: Encoded as a `UInt`, can be 1-8 bytes depending on the size of the associated data.

> **About `Type.Int`/`Type.UInt`:** Dynamically uses either 1, 2, 4 or 8 bytes. <ul><li>Between -64 -> 64: 1 byte.</li><li>Between -8,192 -> 8,192: 2 bytes.</li><li>Between -268,435,456 -> 268,435,456: 4 bytes.</li><li>Larger values: 8 bytes.</li></ul>
