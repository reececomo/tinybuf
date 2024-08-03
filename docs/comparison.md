## 🏓 Comparison Table

> {!TIP]
> Looking for [Types?](https://github.com/reececomo/tinybuf/blob/main/docs/get_started.md#types)


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
