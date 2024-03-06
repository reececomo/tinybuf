import { BinaryCoder } from './BinaryCoder';
import { FieldDefinition } from './Type';
/**
 * Parse and represent an object field. See example in Type.js
 */
export declare class Field {
    readonly name: string;
    readonly coder: BinaryCoder<any>;
    readonly isOptional: boolean;
    readonly isArray: boolean;
    protected _format?: string;
    constructor(name: string, rawType: FieldDefinition);
    /**
     * @returns A string identifying the encoding format.
     * @example "{str,uint16,bool}[]?"
     */
    get format(): string;
}
export default Field;
//# sourceMappingURL=Field.d.ts.map