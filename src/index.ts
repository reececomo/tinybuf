import { bufferParser, BufferParserInstance } from './core/BufferParser';
import { defineFormat, BufferFormat, Decoded } from './core/BufferFormat';
import { Type, optional } from './core/Type';
import { setTinybufConfig } from './core/settings';


// Core API:
export {
  defineFormat,
  bufferParser,
  Type,
  optional,

  // settings:
  setTinybufConfig,
};

// Utilities:
export * from './core/lib/errors';
export * from './core/lib/float16';
export * from './core/lib/peek';
export * from './core/lib/scalar';

// Utility types:
export type {
  Decoded,
  BufferFormat,
  BufferParserInstance,
};
