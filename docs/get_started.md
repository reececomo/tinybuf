## 🏃 Get started

**tinybuf** achieves much of its tiny size through its flat, schemaless encoding.

This means clients, servers (and/or peers) need to pre-share common formats. You might typically put these into some common, shared module.

> [!TIP]
> For additional validation and post-processing, see [Validation and Transforms](./validation_and_transforms.md)

### Inferred types

The encoder will automatically infer the types for `encode()` and `decode()` from the schema provided (see the `Types` section below).

For example, the decoded type of `GameWorldData` from the [README.md](../README.md) example would be:
```ts
// const data = GameWorldData.decode(data)
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
    velocity: {
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
