# 🔌 tinybuf &nbsp;[![NPM version](https://img.shields.io/npm/v/tinybuf.svg?style=flat-square)](https://www.npmjs.com/package/tinybuf) [![Minzipped](https://badgen.net/bundlephobia/minzip/tinybuf)](https://bundlephobia.com/package/tinybuf) [![Downloads](https://img.shields.io/npm/dt/tinybuf.svg)](https://www.npmjs.com/package/tinybuf) [![Tests](https://github.com/reececomo/tinybuf/actions/workflows/tests.yml/badge.svg)](https://github.com/reececomo/tinybuf/actions/workflows/tests.yml) [![License](https://badgen.net/npm/license/tinybuf)](https://github.com/reececomo/tinybuf/blob/main/LICENSE)

<img align="right" src="docs/hero.png" alt="tinybuf icon showing binary peeking out from behind a square." height="80">

⚡Fast, compressed binary serializers in Node.js and HTML5

| | |
| --------------------------------- | ---------------------------------------- |
| 🔮 Simple, declarative API | 🔥 Blazing fast serialization |
| 🗜️ Powerful [compression](https://github.com/reececomo/tinybuf/blob/main/docs/types.md) | 💾 >50% smaller than [FlatBuffers](https://github.com/reececomo/tinybuf/blob/main/docs/comparison.md) |
| 🍃 Zero dependencies | 🙉 Strong, inferred types |
| 🌐 Node / browser | 🛡️ Built-in validation/transforms |
| 🤏 `~4.5kb` minzipped | ✅ Property mangling ([Terser](https://terser.org/)) |

## 💿 Install

```
npm install tinybuf
```

## 🕹 Example

```ts
import { defineFormat, Type } from 'tinybuf';

export const GameWorldData = defineFormat({
  world: {
    seqNo: Type.UInt,
    time: Type.Float16
  },
  players: [{
    id: Type.UInt,
    position: {
      x: Type.Float32,
      y: Type.Float32
    },
    input: {
      xAnalog: Type.Scalar8,
      buttons: Type.Bools,  // e.g. [jump, attack]
    }
  }]
});
```

#### Encode

```ts
const bytes = GameWorldData.encode({ /*…*/ });

bytes.byteLength
// 15
```

#### Decode

```ts
import { bufferParser } from 'tinybuf'

// register format handlers
const parser = bufferParser()
  .on(MyChatMessage, (chat) => myHud.showChat(chat))
  .on(GameWorldData, (data) => myWorld.update(data), {
    decodeInPlace: true, // recycle memory
  })

// process data
parser.processBuffer(bytes)
```

Or manually:

```ts
// simple:
let data = GameWorldData.decode(bytes);

// in-place:
let data = {};
GameWorldData.decode(bytes, data);
```

## 📘 Documentation
|                  | |
| ---------------- | :--- |
| 🏁 **Quick start:** | [Quick start guide](https://github.com/reececomo/tinybuf/blob/main/docs/get_started.md),<br/>[Types](https://github.com/reececomo/tinybuf/blob/main/docs/types.md) |
| 📑 **Advanced:** | [Async safety mode](https://github.com/reececomo/tinybuf/blob/main/docs/safe_encode.md),<br/>[Format header collisions](https://github.com/reececomo/tinybuf/blob/main/docs/format_headers.md),<br/>[Compression tips](https://github.com/reececomo/tinybuf/blob/main/docs/compression_tips.md),<br/>[Validation/transforms](https://github.com/reececomo/tinybuf/blob/main/docs/validation_and_transforms.md) |

## Credits

_**tinybuf** is based on Guilherme Souza's [js-binary](https://github.com/sitegui/js-binary)_
