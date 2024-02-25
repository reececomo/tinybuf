import { BinaryCodec } from './BinaryCodec';
import { TypeDefinition } from './Type';
/**
 * Parse and represent an object field. See example in Type.js
 */
export declare class Field {
    readonly name: string;
    readonly type: BinaryCodec;
    readonly isOptional: boolean;
    readonly isArray: boolean;
    constructor(name: string, rawType: TypeDefinition);
}
export default Field;
//# sourceMappingURL=Field.d.ts.map