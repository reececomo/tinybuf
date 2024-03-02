import { BinaryCoder } from './BinaryCoder';
import { OptionalType, FieldDefinition } from './Type';

/**
 * Parse and represent an object field. See example in Type.js
 */
export class Field {
  public readonly name: string;
  public readonly type: BinaryCoder<any>;
  public readonly isOptional: boolean;
  public readonly isArray: boolean;

  public constructor(name: string, rawType: FieldDefinition) {
    this.isOptional = rawType instanceof OptionalType;

    let type = rawType instanceof OptionalType ? rawType.type : rawType;

    this.name = name;

    if (Array.isArray(type)) {
      if (type.length !== 1) {
        throw new TypeError('Invalid array definition, it must have exactly one element');
      }

      type = type[0];
      this.isArray = true;
    }
    else {
      this.isArray = false;
    }

    this.type = new BinaryCoder<any>(type);
  }
}

export default Field;
