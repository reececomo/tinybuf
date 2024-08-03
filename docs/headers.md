## ✨ Parsing formats

By default, a 2-byte header is serialized with the payload, which is used to identify the format.


#### Reading headers

You can check headers on raw buffers using `peekHeader(buf)` or `peekHeaderStr(buf)`:

```ts
import { peekHeader, peekHeaderStr } from 'tinybuf'

if (peekHeader(incomingBinary) === MyMessageFormat.header) {
  // Do something special.
}

if (peekHeaderStr(incomingBinary) === 'AB') {
  // Do something special.
}
```

#### 💥 Header Collisions

```ts
const User = defineFormat({
  name: Type.String,
  age: Type.UInt
})

const Color = defineFormat({
  name: Type.String,
  hex: Type.UInt
})

User.header === Color.header
// true
```

You can explicitly set unique headers, as an integer 0 -> 65,535, or a 2-byte string (e.g. `'AB'`).

```ts
// integer
const User = defineFormat(123, {
  name: Type.String,
  age: Type.UInt
})

// 2-byte string
const Color = defineFormat('Co', {
  name: Type.String,
  hex: Type.UInt
})

User.header === Color.header
// false
```

e.g. using a `const enum`:

```ts
const enum Formats {
  User,
  Color,
}

const User = defineFormat(Formats.User, {
  name: Type.String,
  age: Type.UInt
})

const Color = defineFormat(Formats.Color, {
  name: Type.String,
  hex: Type.UInt
})
```

### Headerless

You can explicitly disable the header by passing `null`:

```ts
const Color = defineFormat(null, {
  name: Type.String,
  hex: Type.UInt
})
```

> [!CAUTION]
> Headerless formats cannot be used with `bufferParser()` &mdash; there's nothing to parse
