import { BinaryCodec } from './BinaryCodec';
import { OptionalType, FieldDefinition } from './Type';

/**
 * Parse and represent an object field. See example in Type.js
 */
export class Field {
  readonly name: string
  readonly type: BinaryCodec<any>;
  readonly isOptional: boolean;
  readonly isArray: boolean;

  constructor(name: string, rawType: FieldDefinition) {
    this.isOptional = rawType instanceof OptionalType

    let type = rawType instanceof OptionalType ? rawType.type : rawType;

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

    this.type = new BinaryCodec<any>(type)
  }
}

export default Field;
