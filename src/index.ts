import { bufferParser, BufferParser } from './core/BufferParser';
import { defineFormat, BufferFormat, Decoded } from './core/BufferFormat';
import { f16round } from './core/lib/float16';
import { peekHeader, peekHeaderStr } from './core/lib/peek';
import { scalround, uscalround } from './core/lib/scalar';
import { mask, unmask } from './core/lib/bitmask';
import { TinybufError, DecodeError } from './core/lib/errors';
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

  // utils:
  f16round,
  scalround,
  uscalround,
  mask,
  unmask,
};

export type {
  // types:
  Decoded,
  BufferFormat,
  BufferParser,
};
