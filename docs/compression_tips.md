## 🗜️ Compression and Serialization
***tinybuf** comes with powerful encoding types & transforms to compress network data*

For most cases [you won't want to optimize too soon](https://xkcd.com/1691/), but in a number of cases you can use smart types to reduce the amount 

> [!TIP]
> For game serialization strategies, check out Glenn Fiedler's materials on [Serialization Strategies: Serializing Floating Point Values](https://gafferongames.com/post/serialization_strategies/#serializing_floating_point_values) and [State Synchronization: Quantize Both Sides](https://gafferongames.com/post/state_synchronization/#quantize_both_sides).

### Serializing Floats

The default `number` type in JavaScript is an IEEE double-precision floating-point number (AKA "float64" or "double"). Encoded in full, every one of these values is **8 bytes**, which can stack up quickly when serializing a large number of attributes and objects.

| **Type** | **Bytes** | **Quantization function** | **Usage** |
| --- | :-: | --- | --- |
| `Type.Float64` | **8** | - | Physics quantities. |
| `Type.Float32` | **4** | `Math.fround(x)`| Visual quantities, physics quantities. |
| `Type.Float16` | **2** | `fround16(x)` | Visual quantities, limited physics quantities - i.e. safe for numbers in the range ±65,504, with the smallest precision ±0.00011839976. |
| `Type.BFloat16` | **2** | `bfround16(x)` | Visual quantities. Same range as float32, but much lower precision, particularly for larger numbers. |
| `Type.Scalar` | **1** | `scalround(x)` | Visual quantities, vector normals, analog player inputs - e.g. _joystick axis_. Values from -1.00 to 1.00. |
| `Type.UScalar` | **1** | `uscalround(x)` | Visual quantities - e.g. _healthbar_. Values from 0.00 to 1.00. |
| `Type.Int` | **1-2**<sup>\*</sup> | `x \| 0` | Visual quantities. \*Up to 4-8 bytes for very large values (see [Types](https://github.com/reececomo/tinybuf/blob/main/docs/types.md)). |

#### Quantizing Physics

If you are running a deterministic physics simulation (e.g. [State Synchronization / Rollback Netcode](https://gafferongames.com/post/state_synchronization/)),
you may need to _quantize_ your floating-point numbers before comparing them.

As [Glenn Fiedler](https://gafferongames.com) suggests, you could simply apply the deserialized state on every phyiscs `update()` as if it had come over the network:

```ts
updateLoop() {
  // do physics here …

  // quantize
  const encoded = GameWorldFormat.encode(world)
  world.update(GameWorldFormat.decode(encoded))
}
```

### Custom Transforms

You can combine the above built-ins with **[transforms (see Transforms)](./validation_and_transforms.md#transforms)** to acheive really meaningful compression.

In the following example, we have a `myRotation` value which is given in absolute radians between 0 and 2π (~6.28319). If we tried to send this as a plain 16-bit float, we would lose a \*LOT\* of precision, and the rotation would come out visually jerky on the other end.

What we could do instead is set custom [transforms](./validation_and_transforms.md#transforms) that utilize much more of the safe range for 16-bit floats (±65,504):

```ts
// Example transform functions that boosts precision by x20,000 by putting
// values into the range ±~62,832, prior to serializing as a 16-bit float.
const toSpecialRange = x => (x * 20_000) - 62_832
const fromSpecialRange = x => (x + 62_832) / 20_000

const MyState = defineFormat({
  myRotation: Type.Float16
})
  .setTransforms({ myRotation: [ toSpecialRange, fromSpecialRange ]})
```
