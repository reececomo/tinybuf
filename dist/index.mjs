class TinybufError extends Error{}function $hashCode(t){let e=5381;for(let r=0;r<t.length;r++)e=33*e^t.charCodeAt(r);return 65535&e}function $strToHashCode(t){return 2!==t.length?$hashCode(t):256*t.charCodeAt(0)+t.charCodeAt(1)}function $hashCodeToStr(t){return String.fromCharCode(Math.floor(t/256))+String.fromCharCode(t%256)}function peekHeader(t){return(ArrayBuffer.isView(t)?new DataView(t.buffer,t.byteOffset,2):new DataView(t,0,2)).getUint16(0,!1)}function peekHeaderStr(t){return $hashCodeToStr(peekHeader(t))}const bufferParser=()=>new BufferParser;class BufferParser{constructor(){this._$formats=new Map}processBuffer(t){let e,r,i;try{const a=peekHeader(t);if(!this._$formats.has(a))throw new TinybufError(`Unknown format: ${a} '${$hashCodeToStr(a)}')`);[e,i]=this._$formats.get(a),r=e.decode(t)}catch(t){const e=new TinybufError(`Failed to decode: ${t}`);throw e.stack=t.stack,e}i(r)}on(t,e,r=!1){if(null==t.header)throw new TinybufError("Format requires header");const i="string"==typeof t.header?$strToHashCode(t.header):t.header;if(this._$formats.has(i)&&!r)throw new TinybufError(`Format header collision: ${t.header}`);return this._$formats.set(i,[t,e]),this}ignore(...t){return t.forEach((t=>this.on(t,(()=>{}),!0))),this}clear(){this._$formats.clear()}}const t=Math.floor,e=Math.ceil,$clamp=(t,e,r)=>t>r?r:t<e?e:t,$roundTowardZero=r=>r<0?e(r):t(r),$roundAwayFromZero=r=>r<0?t(r):e(r);function uscalround(t){return $fromuscal8($touscal8(t))}function scalround(t){return $fromscal8($toscal8(t))}function $touscal8(t){return $clamp(127+$roundTowardZero(254*t-127),0,254)}function $toscal8(t){return $clamp($roundTowardZero(127*t),-127,127)+127}function $fromuscal8(t){return $clamp(.01*($roundAwayFromZero(.3937007874015748*(t-127))+50),0,1)}function $fromscal8(t){return $clamp(.01*$roundAwayFromZero(.787401574803149*(t-127)),-1,1)}const mask=(t,e=1)=>t.reduce(((t,e)=>t<<1|e),e),unmask=(t,e=31-Math.clz32(t))=>{const r=new Array(e);for(let i=0;i<e;i++)r[i]=!!(t&1<<e-1-i);return r},r=function(){const t=new TextEncoder;return e=>t.encode(e)}(),i=function(){const t=new TextDecoder("utf-8");return e=>t.decode(e)}();function f16round(t){return n(a(t))}const a=function(){const t=new Float32Array(1),e=new Int32Array(t.buffer);return function(r){t[0]=r;let i=e[0],a=i>>16&32768,n=4096+(2147483647&i)|0;return n>=1199570944?(2147483647&i)<1199570944?31743|a:n<2139095040?31744|a:31744|a|(8388607&i)>>13:n>=947912704?a|n-939524096>>13:n<855638016?a:(n=(2147483647&i)>>23,a|(8388607&i|8388608)+(8388608>>>n-102)>>126-n)}}(),n=function(){const t=Math.pow(2,-24),e=new Float32Array(1056);for(let t=0;t<32;t++)e[t]=Math.pow(2,t-15);for(let t=0;t<1024;t++)e[t+32]=1+t/1024;return function(r){const i=32768&~r?1:-1,a=31744&r,n=1023&r;return 0===a?0===n?0*i:i*t:31744===a?0===n?i*(1/0):NaN:e[a>>10]*e[n+32]*i}}(),s=268435456,o=4294967296,$={$write:(e,r)=>{e<128?r.$writeUint8(e):e<16384?r.$writeUint16(e+32768):e<536870912?r.$writeUint32(e+3221225472):(r.$writeUint32(t(e/o)+3758096384),r.$writeUint32(e>>>0))},$read:t=>{const e=t.$peek();return 128&e?64&e?32&e?(t.$readUint32()-3758096384)*o+t.$readUint32():t.$readUint32()-3221225472:t.$readUint16()-32768:(t.$skip(),e)}},f={$write:(t,e)=>e.$writeUint8(t),$read:t=>t.$readUint8()},d={$write:(t,e)=>e.$writeUint16(t),$read:t=>t.$readUint16()},h={$write:(t,e)=>e.$writeUint32(t),$read:t=>t.$readUint32()},c={$write:(e,r)=>{if(e>=-64&&e<64)r.$writeUint8(127&e);else if(e>=-8192&&e<8192)r.$writeUint16(32768+(16383&e));else if(e>=-268435456&&e<s)r.$writeUint32(3221225472+(536870911&e));else{const i=e;r.$writeUint32(3758096384+(536870911&t(i/o))),r.$writeUint32(i>>>0)}},$read:t=>{let e,r=t.$peek();return 128&r?64&r?32&r?(e=t.$readUint32()-3758096384,e=268435456&e?3758096384|e:e,e*o+t.$readUint32()):(e=t.$readUint32()-3221225472,268435456&e?3758096384|e:e):(e=t.$readUint16()-32768,8192&e?4294950912|e:e):(t.$skip(),64&r?4294967168|r:r)}},w={$write:(t,e)=>e.$writeInt8(t),$read:t=>t.$readInt8()},l={$write:(t,e)=>e.$writeInt16(t),$read:t=>t.$readInt16()},u={$write:(t,e)=>e.$writeInt32(t),$read:t=>t.$readInt32()},_={$write:(t,e)=>e.$writeUint16(a(t)),$read:t=>n(t.$readUint16())},y={$write:(t,e)=>e.$writeFloat32(t),$read:t=>t.$readFloat32()},p={$write:(t,e)=>e.$writeFloat64(t),$read:t=>t.$readFloat64()},m={$write:(t,e)=>e.$writeUint8($touscal8(t)),$read:t=>$fromuscal8(t.$readUint8())},g={$write:(t,e)=>e.$writeUint8($toscal8(t)),$read:t=>$fromscal8(t.$readUint8())},b={$write:(t,e)=>c.$write(t.getTime(),e),$read:t=>new Date(c.$read(t))},U={$write:(t,e)=>{const i=r(null!=t?t:"");V.$write(i,e)},$read:t=>{const e=V.$read(t);return i(e)}},V={$write:(t,e)=>{$.$write(t.byteLength,e),e.$writeBytes(t)},$read:t=>{const e=$.$read(t);return t.$readBytes(e)}},B={$write:(t,e)=>e.$writeUint8(t?1:0),$read:t=>0!==t.$readUint8()},F={$write:(t,e)=>{t.length>28&&(t=t.slice(0,28)),$.$write(mask(t),e)},$read:t=>unmask($.$read(t))},A={$write:(t,e)=>U.$write(JSON.stringify(t),e),$read:t=>JSON.parse(U.$read(t))},I={$write:(t,e)=>{e.$writeUint8(mask([t.global,t.ignoreCase,t.multiline])),U.$write(t.source,e)},$read:t=>{const[e,r,i]=unmask(t.$readUint8());return new RegExp(U.$read(t),(e?"g":"")+(r?"i":"")+(i?"m":""))}},T=[$.$write,f.$write,d.$write,h.$write,c.$write,w.$write,l.$write,u.$write,p.$write,y.$write,_.$write,g.$write,m.$write,B.$write,F.$write,V.$write,U.$write,A.$write,I.$write,b.$write],E=[$.$read,f.$read,d.$read,h.$read,c.$read,w.$read,l.$read,u.$read,p.$read,y.$read,_.$read,g.$read,m.$read,B.$read,F.$read,V.$read,U.$read,A.$read,I.$read,b.$read],setTinybufConfig=t=>{O=Object.assign(Object.assign({},O),t)};let O={safe:!1,useGlobalEncodingBuffer:!0,encodingBufferMaxSize:1500,encodingBufferInitialSize:256,encodingBufferIncrement:256};class BufferWriter{constructor(t){this.i=0,this._$dataView=new DataView(new ArrayBuffer(t))}$viewBytes(){return new Uint8Array(this._$dataView.buffer,this._$dataView.byteOffset,this.i)}$copyBytes(){return new Uint8Array(this._$dataView.buffer.slice(0,this.i))}$writeInt8(t){this._$dataView.setInt8(this._$alloc(1),t)}$writeInt16(t){this._$dataView.setInt16(this._$alloc(2),t,!0)}$writeInt32(t){this._$dataView.setInt32(this._$alloc(4),t,!0)}$writeUint8(t){this._$dataView.setUint8(this._$alloc(1),t)}$writeUint16(t){this._$dataView.setUint16(this._$alloc(2),t,!1)}$writeUint32(t){this._$dataView.setUint32(this._$alloc(4),t,!1)}$writeFloat32(t){this._$dataView.setFloat32(this._$alloc(4),t,!0)}$writeFloat64(t){this._$dataView.setFloat64(this._$alloc(8),t,!0)}$writeBytes(t){const e=this._$alloc(t.byteLength);let r,i;console.log(`buffer: allocating ${e} for a total of ${this._$dataView.byteLength}`);try{r=ArrayBuffer.isView(t)?t instanceof Uint8Array?t:new Uint8Array(t.buffer,t.byteOffset,t.byteLength):new Uint8Array(t)}catch(t){throw new Error("failed to copy bytes reason 11")}try{i=new Uint8Array(this._$dataView.buffer,this._$dataView.byteOffset+e,t.byteLength)}catch(t){throw new Error("failed to copy bytes reason 61")}try{i.set(r)}catch(t){throw new Error("failed to copy bytes reason 33")}}_$alloc(t){if(this.i+t>this._$dataView.byteLength){const e=this.i+t-this._$dataView.byteLength,r=Math.ceil(e/O.encodingBufferIncrement)*O.encodingBufferIncrement;this._$resizeBuffer(this._$dataView.byteLength+r)}const e=this.i;return this.i+=t,e}_$resizeBuffer(t){if(t>O.encodingBufferMaxSize)throw new TinybufError(`exceeded encodingBufferMaxSize: ${O.encodingBufferMaxSize}`);const e=new ArrayBuffer(t),r=new Uint8Array(this._$dataView.buffer,this._$dataView.byteOffset,this._$dataView.byteLength);new Uint8Array(e).set(r),this._$dataView=new DataView(e)}}class BufferReader{constructor(t,e){this._$dataView=ArrayBuffer.isView(t)?new DataView(t.buffer,t.byteOffset,t.byteLength):new DataView(t),this.i=null!=e?e:0}$peek(){return this._$dataView.getUint8(this.i)}$skip(){this.i++}$readUint8(){return this._$dataView.getUint8(this.i++)}$readUint16(){const t=this._$dataView.getUint16(this.i);return this.i+=2,t}$readUint32(){const t=this._$dataView.getUint32(this.i);return this.i+=4,t}$readInt8(){return this._$dataView.getInt8(this.i++)}$readInt16(){const t=this._$dataView.getInt16(this.i,!0);return this.i+=2,t}$readInt32(){const t=this._$dataView.getInt32(this.i,!0);return this.i+=4,t}$readFloat32(){const t=this._$dataView.getFloat32(this.i,!0);return this.i+=4,t}$readFloat64(){const t=this._$dataView.getFloat64(this.i,!0);return this.i+=8,t}$readBytes(t){if(this._$dataView.byteOffset+this.i+t>this._$dataView.byteLength)throw new RangeError("exceeded bytes");const e=new Uint8Array(this._$dataView.buffer,this._$dataView.byteOffset+this.i,t);return this.i+=t,e}}var S;!function(t){t[t.UInt=0]="UInt",t[t.UInt8=1]="UInt8",t[t.UInt16=2]="UInt16",t[t.UInt32=3]="UInt32",t[t.Int=4]="Int",t[t.Int8=5]="Int8",t[t.Int16=6]="Int16",t[t.Int32=7]="Int32",t[t.Float64=8]="Float64",t[t.Float32=9]="Float32",t[t.Float16=10]="Float16",t[t.Scalar8=11]="Scalar8",t[t.UScalar8=12]="UScalar8",t[t.Bool=13]="Bool",t[t.Bools=14]="Bools",t[t.Buffer=15]="Buffer",t[t.String=16]="String",t[t.JSON=17]="JSON",t[t.RegExp=18]="RegExp",t[t.Date=19]="Date"}(S||(S={}));class MaybeType{constructor(t){this.type=t}}function optional(t){return new MaybeType(t)}function defineFormat(t,e){return null!==t&&"object"==typeof t?new BufferFormat(t):new BufferFormat(e,t)}class BufferFormat{get encodingBuffer(){var t;return null===(t=this._$writer)||void 0===t?void 0:t._$dataView}constructor(t,e){if(this._$hasValidationOrTransforms=!1,"number"==typeof t)this._$type=t;else{if(t instanceof MaybeType)throw new TypeError("Format cannot be optional");if(!(t instanceof Object))throw new TypeError("Format must be object or Type");if(this._$type=void 0,this._$fieldsMap=new Map,this._$fields=Object.keys(t).map((e=>{const r=new Field(e,t[e]);return this._$fieldsMap.set(e,r),r})),void 0===e)this.header=$hashCode(this.f),this._$header=this.header;else if(null===e)this.header=void 0,this._$header=void 0;else{if(!function isValidHeader(t){return"number"==typeof t?Number.isInteger(t)&&t>=0&&t<=65535:"string"==typeof t&&2===(new TextEncoder).encode(t).byteLength}(e))throw new TypeError(`Header must be uint16, 2 byte string, or null. Received: ${e}`);this.header=e,this._$header="number"==typeof e?e:$strToHashCode(e)}}}get f(){return void 0===this._$format&&(this._$format=void 0!==this._$fields?`{${this._$fields.map((t=>t.f)).join(",")}}`:`${this._$type}`),this._$format}static _$initWriter(){return O.useGlobalEncodingBuffer?(BufferFormat._$globalWriter||(this._$globalWriter=new BufferWriter(O.encodingBufferInitialSize)),this._$globalWriter):new BufferWriter(O.encodingBufferInitialSize)}encode(t,e){return this._$writer||(this._$writer=BufferFormat._$initWriter()),this._$writer.i=0,this._$hasValidationOrTransforms&&(t=this._$preprocess(t)),this._$write(t,this._$writer),(null!=e?e:O.safe)?this._$writer.$copyBytes():this._$writer.$viewBytes()}decode(t){return this._$read(new BufferReader(t,void 0===this.header?0:2))}setTransforms(t){if(this._$hasValidationOrTransforms=!0,"function"==typeof t||Array.isArray(t)&&"function"==typeof t[0])this._$transforms=t;else for(const e of Object.keys(t)){const r=this._$fieldsMap.get(e);if(!r)throw new TypeError(`Failed to set transforms for field '${e}'`);r.$coder.setTransforms(t[e])}return this}setValidation(t){if(this._$hasValidationOrTransforms=!0,"function"==typeof t)this._$validate=t;else for(const e of Object.keys(t)){const r=this._$fieldsMap.get(e);if(!r)throw new TypeError(`Failed to set validation function for field '${e}'`);r.$coder.setValidation(t[e])}return this}_$write(t,e){if(void 0!==this._$header&&e.$writeUint16(this._$header),void 0!==this._$type){const r=this._$validate||this._$transforms?this._$preprocess(t):t;return T[this._$type](r,e)}if("object"!=typeof t||!t)throw new TypeError("expected object type");for(const r of this._$fields){const i=t[r.$name];if(r.$isOptional){if(null==i){B.$write(!1,e);continue}B.$write(!0,e)}else if(null==i)throw new Error(`missing required value: ${r.$name}`);r.$isArray?this._$writeArray(i,e,r.$coder):r.$coder._$write(i,e)}}_$preprocess(t){return this._$validate&&this._$processValidation(t),"function"==typeof this._$transforms?this._$transforms(t):Array.isArray(this._$transforms)&&"function"==typeof this._$transforms[0]?this._$transforms[0](t):t}_$postprocess(t){return Array.isArray(this._$transforms)&&"function"==typeof this._$transforms[1]&&(t=this._$transforms[1](t)),this._$validate&&this._$processValidation(t),t}_$processValidation(t){if(!this._$validate)return;const e=this._$validate(t);if(e instanceof Error)throw e;if(!1===e)throw new Error("failed validation")}_$read(t){return this._$read=this._$compileFormatReadFn(),this._$read(t)}_$makeObjectReader(){return`return{${this._$fields.map((({$name:t},e)=>`${t}:this.${this._$readField.name}(${e},state)`)).join(",")}}`}_$readField(t,e){const r=this._$fields[t];if(!r.$isOptional||B.$read(e))return r.$isArray?this._$readArray(r.$coder,e):r.$coder._$read(e)}_$compileFormatReadFn(){return void 0!==this._$type?this._$hasValidationOrTransforms?t=>this._$postprocess(E[this._$type](t)):E[this._$type]:new Function("state",this._$makeObjectReader())}_$writeArray(t,e,r){if(!Array.isArray(t))throw new TypeError(`expected array, instead got: ${t}`);$.$write(t.length,e);for(let i=0;i<t.length;i++)r._$write(t[i],e)}_$readArray(t,e){const r=new Array($.$read(e));for(let i=0;i<r.length;i++)r[i]=t._$read(e);return r}}BufferFormat.peekHeader=peekHeader,BufferFormat.peekHeaderStr=peekHeaderStr;class Field{constructor(t,e){this.$isOptional=e instanceof MaybeType;let r=e instanceof MaybeType?e.type:e;if(this.$name=t,Array.isArray(r)){if(1!==r.length)throw new TypeError("Array type must contain exactly one format");r=r[0],this.$isArray=!0}else this.$isArray=!1;this.$coder=new BufferFormat(r,null)}get f(){return void 0===this._$formatString&&(this._$formatString=`${this.$coder.f}${this.$isArray?"[]":""}${this.$isOptional?"?":""}`),this._$formatString}}export{TinybufError,S as Type,bufferParser,defineFormat,f16round,mask,optional,peekHeader,peekHeaderStr,scalround,setTinybufConfig,unmask,uscalround};
//# sourceMappingURL=index.mjs.map
