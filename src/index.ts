import { bufferParser } from './core/BufferParser';
import { defineFormat, Decoded } from './core/BufferFormat';
import { Type, optional } from './core/Type';
import { SETTINGS } from './core/settings';


// Core API:
export {
  defineFormat,
  bufferParser,
  Type,
  optional,

  // Global settings:
  SETTINGS,
};

// Utilities:
export * from './core/lib/errors';
export * from './core/lib/float16';
export * from './core/lib/peek';
export * from './core/lib/scalar';

// Utility types:
export type {
  Decoded
};
