# 🔌 tinybuf &nbsp;[![NPM version](https://img.shields.io/npm/v/tinybuf.svg?style=flat-square)](https://www.npmjs.com/package/tinybuf) [![Minzipped](https://badgen.net/bundlephobia/minzip/tinybuf)](https://bundlephobia.com/package/tinybuf) [![Downloads](https://img.shields.io/npm/dt/tinybuf.svg)](https://www.npmjs.com/package/tinybuf) [![Tests](https://github.com/reececomo/tinybuf/actions/workflows/tests.yml/badge.svg)](https://github.com/reececomo/tinybuf/actions/workflows/tests.yml) [![License](https://badgen.net/npm/license/tinybuf)](https://github.com/reececomo/tinybuf/blob/main/LICENSE)

<img align="right" src="docs/hero.png" alt="tinybuf icon showing binary peeking out from behind a square." height="80">

⚡Fast, compressed binary serializers in Node.js and HTML5

| | |
| --------------------------------- | ---------------------------------------- |
| 🔮 Simple, declarative API | 🔥 Blazing fast serialization |
| 🍃 Zero dependencies | 🙉 Strong, inferred types |
| 🗜️ Powerful & performant compression | 💾 50% smaller vs [FlatBuffers](https://github.com/reececomo/tinybuf/blob/main/docs/comparison.md) |
| 🌐 Node / browser | 🛡️ Built-in validation / transforms |
| 🤏 `~5kb` minzipped | ✅ Property mangling ([Terser](https://terser.org/)) |

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
  players: [
    {
      id: Type.UInt,
      position: {
        x: Type.Float32,
        y: Type.Float32
      },
      input: {
        move: Type.Scalar,
        buttons: Type.Bools // [ jump, crouch ]
      }
    }
  ]
});
```

#### Encode

```ts
const bytes = GameWorldData.encode({ /*…*/ });

bytes.byteLength
// 17
```

> [!CAUTION]
> By default `BufferFormat.encode(…)` optimizes performance and memory by
> encoding data to a shared buffer, and returning a `Uint8Array` pointer
> to the encoded bytes.
>
> Subsequent calls to `encode(…)` are destructive, so this would be
> unsuitable for asyncronous usage (e.g. Promises, Web Workers).
> `encode(…)` returns an unsafe `Uint8Array` view of the shared encoding buffer.
>
> Call `encode({ … }, true)` to copy bytes to a safe buffer on encode, or set
> `setTinybufConfig({ safe: true })` (but be mindful of memory fragmentation).

#### Decode

```ts
import { bufferParser } from 'tinybuf'

// register formats
const parser = bufferParser()
  .on(GameWorldData, (data) => myWorld.update(data))
  .on(MyChatMessage, (chat) => myHud.showChat(chat));

// process data
parser.processBuffer(bytes)
```

Or individual:

```ts
const data = GameWorldData.decode(bytes);
```

## 📘 Documentation
|                  |
| ---------------- |
| 🏁  [Quick start](https://github.com/reececomo/tinybuf/blob/main/docs/get_started.md) |
| 🤔  [Types table](https://github.com/reececomo/tinybuf/blob/main/docs/get_started.md#types) |
| 📑  [Custom headers](https://github.com/reececomo/tinybuf/blob/main/docs/format_headers.md) |
| 🗜️  [Compression tips](https://github.com/reececomo/tinybuf/blob/main/docs/compression_tips.md) |
| ✨  [Validation & transforms](https://github.com/reececomo/tinybuf/blob/main/docs/validation_and_transforms.md) |

## Credits

_**tinybuf** is based on Guilherme Souza's [js-binary](https://github.com/sitegui/js-binary)_
