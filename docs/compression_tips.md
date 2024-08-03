## 🗜️ Compression and Serialization
***tinybuf** comes with powerful encoding types & transforms to make data tiny*

You likely won't need to [optimize](https://xkcd.com/1691/) compression beyond the default types.

> It is highly recommended to read the materials by Glenn Fiedler on [Serialization Strategies: Serializing Floating Point Values](https://gafferongames.com/post/serialization_strategies/#serializing_floating_point_values) and [State Synchronization: Quantize Both Sides](https://gafferongames.com/post/state_synchronization/#quantize_both_sides).

### Serializing Floats

In JavaScript, all numbers are stored as 64-bit (8-byte) floating-point numbers (or "floats"). These take up a whopping **8 bytes** each!

Most of the meaningful gains will come out of compressing floats, including those in 2D or 3D vectors and quaternions. You can compress all visual-only quantities without issue - i.e. if you are using [Snapshot Compression Netcode](https://gafferongames.com/post/snapshot_compression/), or updating elements of a [HUD](https://en.wikipedia.org/wiki/Head-up_display).

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

For more manual approaches, here are the is a list of the various quantization (rounding) functions for each number type:

| **Type** | **Bytes** | **Quantization function** | **Use Cases** |
| --- | :-: | --- | --- |
| `Type.Float64` | **8** | _n/a_ | Physics values. |
| `Type.Float32` | **4** | `Math.fround(x)` (built-in) | Visual values, physics values. |
| `Type.Float16` | **2** | `fround16(x)` | Limited visual values, limited physics values - i.e. safe for numbers in the range ±65,504, with the smallest precision ±0.00011839976. |
| `Type.Scalar` | **1** | `scalarRound(x)` | Player inputs - e.g. _analog player input (joystick)_. Values from -1.00 to 1.00. |
| `Type.UScalar` | **1** | `uScalarRound(x)` | Visual values - e.g. _a health bar_. Values from 0.00 to 1.00. |
| `Type.Int` | **1-2**<sup>\*</sup> | `Math.round(x)` | Visual values. \*Up to 4-8 bytes for larger values (see [Types](#types)). |

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
