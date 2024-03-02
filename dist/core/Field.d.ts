import { BinaryCoder } from './BinaryCoder';
import { FieldDefinition } from './Type';
/**
 * Parse and represent an object field. See example in Type.js
 */
export declare class Field {
    readonly name: string;
    readonly type: BinaryCoder<any>;
    readonly isOptional: boolean;
    readonly isArray: boolean;
    constructor(name: string, rawType: FieldDefinition);
}
export default Field;
//# sourceMappingURL=Field.d.ts.map