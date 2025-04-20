# 🔌 tinybuf &nbsp;[![NPM version](https://img.shields.io/npm/v/tinybuf.svg?style=flat-square)](https://www.npmjs.com/package/tinybuf) [![Minzipped](https://badgen.net/bundlephobia/minzip/tinybuf)](https://bundlephobia.com/package/tinybuf) [![Downloads](https://img.shields.io/npm/dt/tinybuf.svg)](https://www.npmjs.com/package/tinybuf) [![Tests](https://github.com/reececomo/tinybuf/actions/workflows/tests.yml/badge.svg)](https://github.com/reececomo/tinybuf/actions/workflows/tests.yml) [![License](https://badgen.net/npm/license/tinybuf)](https://github.com/reececomo/tinybuf/blob/main/LICENSE)

<img align="right" src="docs/hero.png" alt="tinybuf icon showing binary peeking out from behind a square." height="80">

⚡Fast, compressed binary serializers in Node.js and HTML5

| | |
| --------------------------------- | ---------------------------------------- |
| 🔮 Simple, declarative API | 🔥 Blazing fast serialization |
| 🗜️ Powerful [compression](https://github.com/reececomo/tinybuf/blob/main/docs/types.md) | 💾 ^50% smaller than [FlatBuffers](https://github.com/reececomo/tinybuf/blob/main/docs/comparison.md) |
| 🍃 Zero dependencies | 🙉 Strong, inferred types |
| 🌐 Node / browser | 🛡️ Built-in validation/transforms |
| 🤏 `~4.4kb` minzipped | ✅ Property mangling ([Terser](https://terser.org/)) |

## 💿 Install

```
npm install tinybuf
```

## Basic Usage

```ts
import { defineFormat, Type } from 'tinybuf';

export const GameWorldState = defineFormat({
  frameNo: Type.UInt,
  timeRemaining: Type.Float16,
  players: [
    {
      id: Type.UInt,
      position: {
        x: Type.Float32,
        y: Type.Float32
      },
      joystick: {
        x: Type.Scalar8,
        y: Type.Scalar8
      },
      actions: Type.Bools // [ jump, attack ]
    }
  ]
});
```

### Encode

Formats can be encoded directly:

```ts
let bytes = GameWorldState.encode({
  frameNo: 50,
  timeRemaining: 59.334,
  players: [
    {
      id: 1,
      position: { x: 123.5, y: 456.75 },
      joystick: { x: 0.75, y: -0.662 },
      actions: [ /* jump: */ true,
               /* attack: */ false ]
    }
  ]
});

bytes.byteLength
// 16
```

Or directly from objects:

```ts
let bytes = GameWorldState.encode( world );

bytes.byteLength
// 16
```

### Decode

#### To Object

Decode as a strongly-typed object.

```ts
let obj = GameWorldData.decode( bytes );
// { frameNo: number; timeRemaining: number; … }
```

#### In-place

Extract fields directly into an existing object (this minimizes memory footprint).

```ts
let obj: Decoded<typeof GameWorldData> = {} as any;

GameWorldData.decodeInPlace( bytes, obj );
```

#### Parser &ndash; Decoding registered formats

- Register formats with `.on(format, handler, options?)`
- Trigger format handlers with `.processBuffer(bytes)`

```ts
import { bufferParser } from 'tinybuf';

// register
const parser = bufferParser()
  .on(MyChatMessage, msg => myHud.showChat(msg))
  .on(GameWorldData, data => myWorld.update(data), {
    decodeInPlace: true, // `data` gets recycled
  });

// parse
parser.processBuffer( bytes );
```

## Types

| **Type** | **JavaScript Type** | **Bytes** | **Notes** |
| :--- | :--- | :--- | :--- |
| `Int` | `number` | 1-4<sup>\*</sup> | A signed integer from `-Number.MAX_SAFE_INTEGER` to `Number.MAX_SAFE_INTEGER`. |
| `Int8` | `number` | 1 | A signed integer from -128 to 127. |
| `Int16` | `number` | 2 | A signed integer from -32,768 to 32,767. |
| `Int32` | `number` | 4 | A signed integer from -2,147,483,648 to 2,147,483,647. |
| `UInt` | `number` | 1-4<sup>#</sup> | An unsigned integer from 0 to `Number.MAX_SAFE_INTEGER`. |
| `UInt8` | `number` | 1 | An unsigned integerfrom 0 to 255. |
| `UInt16` | `number` | 2 | An unsigned integer from 0 to 65,535. |
| `UInt32` | `number` | 4 | An unsigned integer from 0 to 4,294,967,295. |
| `Float64` | `number` | 8 | A 64-bit double-precision floating-point number. |
| `Float32` | `number` | 4 | A 32-bit single-precision floating-point number. |
| `Float16` | `number` | 2 | A 16-bit half-precision floating-point number.<br/>**Note:** Low precision. Maximum effective range ±65,504. |
| `BFloat16` | `number` | 2 | A [bfloat16](https://en.wikipedia.org/wiki/Bfloat16_floating-point_format) format 16-bit half-precision floating-point number.<br/>**Note:** Lowest precision. Same effective range as `Float32`. |
| `Scalar` | `number` | 1 | A signed scalar between -1.00 and 1.00 (two decimal precision). |
| `UScalar` | `number` | 1 | A scalar between 0.00 and 1.00 (two decimal precision). |
| `Bool` | `boolean` | 1 | A boolean value. |
| `Bools` | `boolean[]` | 1<sup>¶</sup> | An array/tuple of boolean values (1 - 28) encoded as a single byte. |
| `Buffer` | `Uint8Array` | 1<sup>†</sup>&nbsp;+&nbsp;n | An `ArrayBuffer` or `ArrayBufferLike`. |
| `String` | `string` | 1<sup>†</sup>&nbsp;+&nbsp;n | A string (UTF-8 encoded). |
| `JSON` | `any` | 1<sup>†</sup>&nbsp;+&nbsp;n | Any JSON encodable value (encoded as a string). |
| `RegExp` | `RegExp` | 2<sup>†</sup>&nbsp;+&nbsp;n | JavaScript `RegExp` object. |
| `Date` | `Date` | 8 | JavaScript `Date` object. |

## 📘 Documentation
| | |
| --- | :--- |
| 🏁 **Quick start:** | [Quick start guide](https://github.com/reececomo/tinybuf/blob/main/docs/get_started.md),<br/>[Types](https://github.com/reececomo/tinybuf/blob/main/docs/types.md) |
| 📑 **Advanced:** | [Async safety mode](https://github.com/reececomo/tinybuf/blob/main/docs/safe_encode.md),<br/>[Format header collisions](https://github.com/reececomo/tinybuf/blob/main/docs/format_headers.md),<br/>[Compression tips](https://github.com/reececomo/tinybuf/blob/main/docs/compression_tips.md),<br/>[Validation/transforms](https://github.com/reececomo/tinybuf/blob/main/docs/validation_and_transforms.md) |

## Credits

_**tinybuf** is based on Guilherme Souza's [js-binary](https://github.com/sitegui/js-binary)_
