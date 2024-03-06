import { BinaryCoder } from './BinaryCoder';
import { OptionalType, FieldDefinition } from './Type';

/**
 * Parse and represent an object field. See example in Type.js
 */
export class Field {
  public readonly name: string;
  public readonly coder: BinaryCoder<any>;
  public readonly isOptional: boolean;
  public readonly isArray: boolean;

  protected _format?: string;

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

    this.coder = new BinaryCoder<any>(type);
  }

  /**
   * @returns A string identifying the encoding format.
   * @example "{str,uint16,bool}[]?"
   */
  public get format(): string {
    if (this._format === undefined) {
      this._format = `${this.coder.format}${this.isArray ? '[]' : ''}${this.isOptional ? '?' : ''}`;
    }

    return this._format;
  }
}

export default Field;
