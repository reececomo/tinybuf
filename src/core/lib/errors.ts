/* eslint-disable @typescript-eslint/unified-signatures */

export class TinybufError extends Error {}

export class EncodeError extends TinybufError {
  public constructor(message: string)
  public constructor(expectedType: string, value: any)
  public constructor(a: string, b?: any) {
    super(`failed to encode '${a}' (data: ${b})`);
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
