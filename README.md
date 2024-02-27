# TypeScript Binary

Encode/decode powerful binary buffers in TypeScript, and much smaller and faster than JSON (or BSON).

This project is forked from the fantastic [sitegui/js-binary](https://github.com/sitegui/js-binary) library, written by [Guilherme Souza](https://github.com/sitegui). It works similarly to [Google's Protocol Buffers](https://protobuf.dev/), but with flexible support.

Compatible with [geckos.io](https://github.com/geckosio/geckos.io) (which is like [socket.io](https://github.com/socketio/socket.io) over WebRTC Data Channels).

## Install
`npm install typescript-binary`

`yarn add typescript-binary`


## Goal

This module encodes and decodes data to your own custom binary formats (using ArrayBuffers), and is analogous to `JSON.stringify(...)` and `JSON.parse(...)`. The format was designed to be very compact and give support for complex types (including `Array`, `Date` and `Buffer`).

To reduce overhead in the format, it carries no information about types. This implies that you must use a shared data schema to encode/decode properly. Huge plus: this automatically validates the data against the given schema (*input sanitization for free!*). This binary format is well suited for very well-defined data, such as data packets for an online game.

Note that, since it's a binary format, it is not meant to be easily viewed/edited by hand.

## Usage

1. Define a `BinaryCodec`
2. Use `encode(...)` to convert and object to binary
3. Use `decode(...)` to convert binary to an object

```js
import { BinaryCodec, Type, Optional } from 'typescript-binary';

// Define:
const UserEncoder = new BinaryCodec<MyUserModel>({
  name: {
    first: Type.String,
    last: Type.String
  },
  pass: Type.Binary,
  dateOfBirth: Optional(Type.Date),
  creationDate: Type.Date,
  active: Type.Boolean,
  achievements: [Type.UInt],
});

// Encode
const binary = UserEncoder.encode({
  name: {
    first: 'Guilherme',
    last: 'Souza'
  },
  pass: myPasswordHashUInt8ArrayView.buffer,
  creationDate: new Date(),
  active: true,
  achievements: [3, 14, 15, 92, 65, 35],
});

// Decode:
const myUser: MyUserModel = UserEncoder.decode(myUserBinary);
```

### Differentiating 

Each `BinaryCodec` is automatically assigned a 2-byte `UInt16` identifier (`Id`) upon creation,
which is encoded as the first two bytes of the binary format. This can be used with `BinaryCodec.peekId(...)`
to differentiate between multiple formats.

You can disable this by passing `false` as the `Id` argument in the `BinaryCodec` constructor.

You can also manually set the `Id`, in case of hashcode collision (or for any other reason).

### Multiple formats

Use a `BinaryCodecInterpreter` to handle multiple binary formats at once:

```ts
const binaryGroup = new BinaryCodecInterpreter()
  .register(MyRecvFormat1, (data) => handleData)
  .register(MyRecvFormat2, (data) => handleData)
  .register(MySendFormat1)
  .register(MySendFormat2);

// Handle incoming
binaryGroup.decode(incomingData); // Triggers the above data handlers.

// Send data
const buffer = binaryGroup.encode({ /* ... */ });
```

## Types

### Primitives
* `Type.Int`: Signed integer (between `-Number.MAX_SAFE_INTEGER` and `Number.MAX_SAFE_INTEGER`).
* `Type.UInt`: Unsigned integer (between 0 and `Number.MAX_SAFE_INTEGER`),
* `Type.Int8`, `Type.Int16`, `Type.Int32`: signed integers (1, 2 or 4 bytes).
* `Type.UInt8`, `Type.UInt16`, `Type.UInt32`: unsigned integers (1, 2 or 4 bytes).
* `Type.Double`: An 8 byte / 64-bit precision floating-point number (this is default for JavaScript's `number` type).
* `Type.Float`: A 4 byte / 32-bit precision floating-point number.
* `Type.Half`: A 2 byte / 16-bit precision floating-point number.
* `Type.String`: A UTF-8 encoded string.
* `Type.Boolean`: A boolean.

> `Type.UInt` and `Type.Int` will dynamically encode values as 1, 2, 4, or 8 bytes. See [Type.Int](https://github.com/reececomo/typescript-binary/blob/main/src/lib/Type.ts) for limits.

### Advanced
* `Type.BooleanTuple`: A tuple of booleans (any length), encoded together (you can pack many booleans into one byte).
* `Type.Binary`: Any `ArrayBuffer` or `ArrayBufferView` instance (.e.g `UInt8Array`).
* `Type.RegExp`: Any JavaScript `RegExp` object.
* `Type.Date`: Any JavaScript `Date` object.
* `Type.JSON`: Any data supported by [JSON format](http://json.org/). See below for more details.
* `Type.Bitmask8`, `Type.Bitmask16`, and `Type.Bitmask32`: A fixed-length array of booleans, encoded as a `uint8`, `uint16` or `uint32`.

### Objects
Nested data-types.

Examples:

```ts
profile: {
  name: Type.String,
  dateOfBirth: Type.Date
}
```

### Arrays
An array type in which every element has the same data schema.

Example:

```ts
names: [Type.String],
profiles: [{
  name: Type.String,
  dateOfBirth: Type.Date
}]
```

### Optionals
Define optional values with `Optional(...)`.

Example:

```ts
{
  a: Type.String,
  b: Optional([{ 'c?': Type.Int }]),
}
```

### JSON type
As stated before, `typescript-binary` requires the data to have a rather strict schema. But sometimes, part of the data may not fit this reality. In this case, you can fallback to JSON. You will lose the core benefits of binary, but you will gain flexibility.

## Spec
The binary format spec is documented in the [FORMAT.md](./FORMAT.md) file
