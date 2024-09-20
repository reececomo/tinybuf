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

## 🕹 Example

```ts
import { defineFormat, Type } from 'tinybuf';

export const GameWorldData = defineFormat({
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
let bytes = GameWorldData.encode({
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
let bytes = GameWorldData.encode( obj );

bytes.byteLength
// 16
```

### Decode

Formats can be read in a number of ways:

1. Simple &ndash; decode to object
2. In-place &ndash; decode into an existing object
3. Parser &ndash; register / decode many formats

#### Simple

Decode as a strongly-typed object.

```ts
let obj = GameWorldData.decode( bytes );
// { frameNo: number; timeRemaining: number; … }
```

#### In-place

Use for memory effiency - extract fields directly into an existing object instance. This prevents allocating new memory.

```ts
let obj: Decoded<typeof GameWorldData> = {} as any;

GameWorldData.decode( bytes, obj );
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

## 📘 Documentation
| | |
| --- | :--- |
| 🏁 **Quick start:** | [Quick start guide](https://github.com/reececomo/tinybuf/blob/main/docs/get_started.md),<br/>[Types](https://github.com/reececomo/tinybuf/blob/main/docs/types.md) |
| 📑 **Advanced:** | [Async safety mode](https://github.com/reececomo/tinybuf/blob/main/docs/safe_encode.md),<br/>[Format header collisions](https://github.com/reececomo/tinybuf/blob/main/docs/format_headers.md),<br/>[Compression tips](https://github.com/reececomo/tinybuf/blob/main/docs/compression_tips.md),<br/>[Validation/transforms](https://github.com/reececomo/tinybuf/blob/main/docs/validation_and_transforms.md) |

## Credits

_**tinybuf** is based on Guilherme Souza's [js-binary](https://github.com/sitegui/js-binary)_
