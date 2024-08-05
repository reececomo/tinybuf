import { bufferParser, BufferParser } from './core/BufferParser';
import { defineFormat, BufferFormat, Decoded } from './core/BufferFormat';
import { Type, optional } from './core/Type';


// core API:
export {
  defineFormat,
  bufferParser,
  Type,
  optional,
};

// utilities:
export { setTinybufConfig } from './core/settings';
export { TinybufError, DecodeError, EncodeError } from './core/lib/errors';
export { peekHeader, peekHeaderStr } from './core/lib/peek';
export { scalarRound, uScalarRound} from './core/lib/scalar';
export { fround16 } from './core/lib/float16';

// types:
export type {
  Decoded,
  BufferFormat,
  BufferParser,
};
