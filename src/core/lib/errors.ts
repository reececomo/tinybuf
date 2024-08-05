export class TinybufError extends Error {}

export class EncodeError extends TinybufError {
  public constructor(message: string)
  public constructor(expectedType: string, value: any, path: string)
  public constructor(a: string, b?: any, c?: string) {
    super(`Failed to encode ${b} as '${a}'${c ? ` (path: '${c}')` : ''}`);
  }
}

export class DecodeError extends TinybufError {
  public constructor(
    summary: string,
    public readonly cause: Error,
  ) {
    super(`${summary}: ${cause.message}`);
    this.stack = cause.stack;
  }
}
