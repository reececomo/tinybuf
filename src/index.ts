import { bufferParser, BufferParser } from './core/BufferParser';
import { defineFormat, BufferFormat, Decoded } from './core/BufferFormat';
import { f16round } from './core/lib/float16';
import { peekHeader, peekHeaderStr } from './core/lib/peek';
import { scalarRound, uScalarRound } from './core/lib/scalar';
import { TinybufError, DecodeError, EncodeError } from './core/lib/errors';
import { Type, optional } from './core/Type';


export { setTinybufConfig } from './core/config';

export {
  // core API:
  bufferParser,
  defineFormat,
  optional,
  peekHeader,
  peekHeaderStr,
  Type,

  // errors:
  TinybufError,
  DecodeError,
  EncodeError,

  // utils:
  f16round,
  scalarRound,
  uScalarRound,
};

export type {
  // types:
  Decoded,
  BufferFormat,
  BufferParser,
};

/** @deprecated renamed to @see {f16round} */
export const fround16 = f16round;
