// Buffer parser errors:

export class TinyBufError extends Error {}

export class UnrecognizedFormatError extends TinyBufError {}
export class FormatHeaderCollisionError extends TinyBufError {}
export class BufferDecodingError extends TinyBufError {
  public constructor(
    summary: string,
    public readonly underlying: Error,
  ) {
    super(`${summary}: ${underlying.message}`);
    this.stack = underlying.stack;
  }
}

// Encoding errors:

export class WriteTypeError extends TinyBufError {
  public constructor(expectedType: string, value: any, path? : string) {
    super(`Expected '${expectedType}', instead received: ${value} (type: ${typeof value}) (at path: '${path || '<root>'}')`);
  }
}
export class BufferEncodingError extends TinyBufError {}
