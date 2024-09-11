## 🏓 Comparison Table

> [!TIP]
> Looking for [Types](https://github.com/reececomo/tinybuf/blob/main/docs/types.md)?


Here are some use cases stacked up.

| | **tinybuf** | **FlatBuffers** | **Protocol&nbsp;Buffers** | **Raw&nbsp;JSON** |
| --------------------------------------------- | :------------------------: | :----------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------: | :----------------------------: |
| **Serialization format** | `Uint8Array` | `Uint8Array` | `Uint8Array \| JSON` | `JSON` |
| **Schema definition** | inline | [.fbs](https://flatbuffers.dev/flatbuffers_guide_writing_schema.html) | [.proto](https://protobuf.dev/programming-guides/proto3/) | manual |
| **External compiler deps** | none | [cmake](https://cmake.org/download/) and [flatc](https://github.com/google/flatbuffers/releases) | none<sup>*</sup> | none |
| **TypeScript types** | automatic | generated | generated | manual |
| **Reference data size<sup>†</sup>** | 34 bytes | 68 bytes | 72 bytes | 175&nbsp;bytes |
| **Ease-of-use** | 🟢 | 🔴 |🟢 | 🟢 |
| **Serialization speed** | 🟢 | 🟢 | 🟡 | 🔴 |
| **Memory use** | 🟢<sup>#</sup> | 🟢 | 🔴 | 🔴 |
| **Property mangling support** | 🟢 | 🟡 | 🔴 | 🔴 |
| **Suitability for web APIs** | 🔴 | 🔴 | 🟢 | 🟢 |
| **Suitability for games<br/>/ real-time applications** | 🟢 | 🟢 | 🟡 | 🔴 |
| **Supports HTML5 / Node.js** | 🟢 | 🟢 | 🟢 | 🟢 |
| **Supports other languages<br/>(e.g. C, C++, Java, Python)** | 🔴 | 🟢 | 🟢 | 🟢 |
| **float16 / bfloat16 encoding** | 🟢 | 🔴 | 🔴 | 🔴 |
| **scalar encoding** | 🟢 | 🔴 | 🔴 | 🔴 |
| **boolarray encoding** | 🟢 | 🔴 | 🔴 | 🔴 |
| **Arbitrary JSON** | 🟢 | 🔴 | 🔴 | 🟢 |
| **Arbitrary buffer-like data** | 🟢 | 🔴 | 🔴 | 🟢 |

<sup>†</sup>Based on the <i>Reference data</i> formats and schemas

<sup>\*</sup>When using `protobufjs`

<sup>\#</sup>When decoding in-place, and encoding with shared buffer.

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
