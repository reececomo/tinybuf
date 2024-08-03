## 🏃 Get started

**tinybuf** achieves much of its tiny size through its flat, schemaless encoding.

This means clients, servers (and/or peers) need to pre-share common formats. You might typically put these into some common, shared module.

> [!TIP]
> For additional validation and post-processing, see [Validation and Transforms](./validation_and_transforms.md)

### Inferred types

The encoder will automatically infer the types for `encode()` and `decode()` from the schema provided (see the `Types` section below).

For example, the decoded type of `GameWorldData` from the [README.md](../README.md) example would be:
```ts
// GameWorldData.decode(data)
{
  world: {
    seqNo: number,
    time: number
  },
  players: {
    id: number,
    position: {
      x: number,
      y: number
    },
    input: {
      move: number,
      buttons: boolean[]
    }
  }[]
}
```

#### Using inferred types

You can also use the `Decoded<T>` helper to add inferred types to any custom method/handler:

```ts
import { Decoded } from 'tinybuf'

function updateGameWorld(data: Decoded<typeof GameWorldData>) {
  // e.g. Access `data.players[0].position?.x`
}
```

or use `Decoded<T>` to define types:

```ts
import { defineFormat, Decoded } from 'tinybuf';

export type MyData1 = Decoded<typeof MyFormat1>;
export const MyFormat1 = defineFormat({ /*…*/ });

export type MyData2 = Decoded<typeof MyFormat2>;
export const MyFormat2 = defineFormat({ /*…*/ });
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
| `Type.Number` `Type.Float64` `Type.Double` | `number` | 8 | Default JavaScript `number` type. A 64-bit "double" precision floating point number. |
| `Type.Float32` `Type.Single` | `number` | 4 | A 32-bit "single" precision floating point number. |
| `Type.Float16` `Type.Half` | `number` | 2 | A 16-bit "half" precision floating point number.<br/>**Important Note:** Low decimal precision. Max. large values ±65,500. |
| `Type.Bool` | `boolean` | 1 | A single boolean. |
| `Type.Bools` | `boolean[]` | 1<sup>¶</sup> | Variable-length array of boolean values packed into 1<sup>¶</sup> byte. |
| `Type.Bools8` | `boolean[]` | 1 | Array of 1 - 8 booleans. |
| `Type.Bools16` | `boolean[]` | 2 | Array of 1 - 16 booleans. |
| `Type.Bools32` | `boolean[]` | 4 | Array of 1 - 32 booleans. |
| `Type.Buffer` | `Uint8Array \| ArrayBufferView \| ArrayBuffer` | 1<sup>†</sup>&nbsp;+&nbsp;n | Any buffer / binary data. |
| `Type.String` | `string` | 1<sup>†</sup>&nbsp;+&nbsp;n | A UTF-8 string. |
| `Type.JSON` | `any` | 1<sup>†</sup>&nbsp;+&nbsp;n | Arbitrary [JSON](http://json.org/) data, encoded as a UTF-8 string. |
| `Type.RegExp` | `RegExp` | 1<sup>†</sup>&nbsp;+&nbsp;n&nbsp;+&nbsp;1 | JavaScript `RegExp` object. |
| `Type.Date` | `Date` | 8 | JavaScript `Date` object. |
| `optional(T)` | `T \| undefined` | 1 | Any optional field. Use the `Optional(…)` helper. Array elements cannot be optional. |
| `[T]` | `Array<T>` | 1<sup>†</sup>&nbsp;+&nbsp;n | Use array syntax. Any array. |
| `{}` | `object` | _none_ | Use object syntax. No overhead to using object types. Buffers are ordered, flattened structures. |

<sup>\*</sup>`Int` is a variable-length integer ("varint") which encodes <±64 = 1 byte, <±8,192 = 2 bytes, <±268,435,456 = 4 bytes, otherwise = 8 bytes.

<sup>#</sup>`UInt` is a variable-length unsigned integer ("varuint") which encodes <128 = 1 byte, <16,384 = 2 bytes, <536,870,912 = 4 bytes, otherwise = 8 bytes.

<sup>†</sup>Length of payload bytes as a `UInt`. Typically 1 byte, but could be 2-8 bytes for very large payloads.

<sup>¶</sup>2-bit overhead: 6 booleans per byte (i.e. 9 booleans would require 2 bytes).

> {!TIP]
> Read more about the [encoding formats here](https://github.com/reececomo/tinybuf/blob/main/docs/encodings.md) (e.g. varint / varuint)
