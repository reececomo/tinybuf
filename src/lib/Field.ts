import { BinaryCodec } from './BinaryCodec';
import { TypeDefinition } from './Type';

/**
 * Parse and represent an object field. See example in Type.js
 */
export class Field {
  readonly name: string
  readonly type: BinaryCodec;
  readonly isOptional: boolean;
  readonly isArray: boolean;

  constructor(name: string, type: TypeDefinition) {
    this.isOptional = false

    if (name[name.length - 1] === '?') {
      this.isOptional = true
      name = name.substr(0, name.length - 1)
    }
    this.name = name

    if (Array.isArray(type)) {
      if (type.length !== 1) {
        throw new TypeError('Invalid array definition, it must have exactly one element')
      }
      type = type[0];
      this.isArray = true;
    } else {
      this.isArray = false;
    }

    this.type = new BinaryCodec(type)
  }
}

export default Field;
