> [!WARNING]
> **Safe mode:** `encode(…)` optimizes performance and memory by encoding bytes
> into a shared buffer, and returning a `Uint8Array` pointer. Subsequent calls
> are destructive and unsuitable for asyncronous workflows (e.g. Promises, Web Workers).
>
> Enable safe encode to automatically copy bytes to a safe buffer instead:
> - `myFormat.encode({ /*…*/ }, true )`
> - `setTinybufConfig({ safe: true })`
