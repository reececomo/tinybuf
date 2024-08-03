## ✨ Validation / Transforms

### Validation

The great thing about binary encoders is that data is implicitly type-validated, however, you can also add custom
validation rules using `setValidation()`:

```ts
const UserMessage = defineFormat({
  uuid: Type.String,
  name: Optional(Type.String),
  // …
})
.setValidation({
  uuid: (x) => {
    if (!isValidUUIDv4(x)) {
      throw new Error('Invalid UUIDv4: ' + x)
    }
  }
})
```

### Transforms

You can also apply additional encode/decode transforms.

Here is an example where we're stripping out all whitespace:

```ts
const PositionMessage = defineFormat({ name: Type.String })
  .setTransforms({ name: a => a.replace(/\s+/g, '') })

let binary = PositionMessage.encode({ name: 'Hello  There' })
let data = PositionMessage.decode(binary)

data.name
  // "HelloThere"
```

Unlike validation, transforms are applied asymmetrically.

The transform function is only applied on **encode()**, but you can provide two transform functions.

Here is an example which cuts the number of bytes required from `10` to `5`:

```ts
const PercentMessage = defineFormat(null, { value: Type.String })
  .setTransforms({
    value: [
      (before) => before.replace(/\$|USD/g, '').trim(),
      (after) => '$' + after + ' USD'
    ]
  })

let binary = PercentMessage.encode({ value: ' $45.53 USD' })
let data = PercentMessage.decode(binary)

binary.byteLength
  // 5

data.value
  // "$45.53 USD"
```
