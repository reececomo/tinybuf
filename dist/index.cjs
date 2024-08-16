class TinybufError extends Error{}function $hashCode(t){let r=5381;for(let e=0;e<t.length;e++)r=33*r^t.charCodeAt(e);return 65535&r}function $strToHashCode(t){return 2!==t.length?$hashCode(t):256*t.charCodeAt(0)+t.charCodeAt(1)}function $hashCodeToStr(t){return String.fromCharCode(Math.floor(t/256))+String.fromCharCode(t%256)}function peekHeader(t){return(ArrayBuffer.isView(t)?new DataView(t.buffer,t.byteOffset,2):new DataView(t,0,2)).getUint16(0,!1)}function peekHeaderStr(t){return $hashCodeToStr(peekHeader(t))}class BufferParser{constructor(){this.t=new Map}processBuffer(t){let r,e,i;try{const n=peekHeader(t);if(!this.t.has(n))throw new TinybufError(`Unknown format: ${n} '${$hashCodeToStr(n)}')`);[r,i]=this.t.get(n),e=r.decode(t)}catch(t){const r=new TinybufError(`Failed to decode: ${t}`);throw r.stack=t.stack,r}i(e)}on(t,r,e=!1){if(null==t.header)throw new TinybufError("Format requires header");const i="string"==typeof t.header?$strToHashCode(t.header):t.header;if(this.t.has(i)&&!e)throw new TinybufError(`Format header collision: ${t.header}`);return this.t.set(i,[t,r]),this}ignore(...t){return t.forEach((t=>this.on(t,(()=>{}),!0))),this}clear(){this.t.clear()}}const t=Math.floor,r=Math.ceil,$clamp=(t,r,e)=>t>e?e:t<r?r:t,$roundTowardZero=e=>e<0?r(e):t(e),$roundAwayFromZero=e=>e<0?t(e):r(e);function $touscal8(t){return $clamp(127+$roundTowardZero(254*t-127),0,254)}function $toscal8(t){return $clamp($roundTowardZero(127*t),-127,127)+127}function $fromuscal8(t){return $clamp(.01*($roundAwayFromZero(.3937007874015748*(t-127))+50),0,1)}function $fromscal8(t){return $clamp(.01*$roundAwayFromZero(.787401574803149*(t-127)),-1,1)}const mask=(t,r=1)=>t.reduce(((t,r)=>t<<1|r),r),unmask=(t,r=31-Math.clz32(t))=>{const e=new Array(r);for(let i=0;i<r;i++)e[i]=!!(t&1<<r-1-i);return e},e=function(){const t=new TextEncoder;return r=>t.encode(r)}(),i=function(){const t=new TextDecoder("utf-8");return r=>t.decode(r)}();const n=function(){const t=new Float32Array(1),r=new Int32Array(t.buffer);return function(e){t[0]=e;let i=r[0],n=i>>16&32768,s=4096+(2147483647&i)|0;return s>=1199570944?(2147483647&i)<1199570944?31743|n:s<2139095040?31744|n:31744|n|(8388607&i)>>13:s>=947912704?n|s-939524096>>13:s<855638016?n:(s=(2147483647&i)>>23,n|(8388607&i|8388608)+(8388608>>>s-102)>>126-s)}}(),s=function(){const t=Math.pow(2,-24),r=new Float32Array(1056);for(let t=0;t<32;t++)r[t]=Math.pow(2,t-15);for(let t=0;t<1024;t++)r[t+32]=1+t/1024;return function(e){const i=32768&~e?1:-1,n=31744&e,s=1023&e;return 0===n?0===s?0*i:i*t:31744===n?0===s?i*(1/0):NaN:r[n>>10]*r[s+32]*i}}(),o=268435456,a=4294967296,h={o:(r,e)=>{r<128?e.h(r):r<16384?e.u(r+32768):r<536870912?e.$(r+3221225472):(e.$(t(r/a)+3758096384),e.$(r>>>0))},l:t=>{const r=t.p();return 128&r?64&r?32&r?(t.m()-3758096384)*a+t.m():t.m()-3221225472:t.B()-32768:(t.F(),r)}},f={o:(t,r)=>r.h(t),l:t=>t.T()},u={o:(t,r)=>r.u(t),l:t=>t.B()},c={o:(t,r)=>r.$(t),l:t=>t.m()},$={o:(r,e)=>{if(r>=-64&&r<64)e.h(127&r);else if(r>=-8192&&r<8192)e.u(32768+(16383&r));else if(r>=-268435456&&r<o)e.$(3221225472+(536870911&r));else{const i=r;e.$(3758096384+(536870911&t(i/a))),e.$(i>>>0)}},l:t=>{let r,e=t.p();return 128&e?64&e?32&e?(r=t.m()-3758096384,r=268435456&r?3758096384|r:r,r*a+t.m()):(r=t.m()-3221225472,268435456&r?3758096384|r:r):(r=t.B()-32768,8192&r?4294950912|r:r):(t.F(),64&e?4294967168|e:e)}},l={o:(t,r)=>r.A(t),l:t=>t.v()},w={o:(t,r)=>r.U(t),l:t=>t.S()},d={o:(t,r)=>r.I(t),l:t=>t.M()},y={o:(t,r)=>r.u(n(t)),l:t=>s(t.B())},p={o:(t,r)=>r.H(t),l:t=>t._()},b={o:(t,r)=>r.k(t),l:t=>t.j()},m={o:(t,r)=>r.h($touscal8(t)),l:t=>$fromuscal8(t.T())},B={o:(t,r)=>r.h($toscal8(t)),l:t=>$fromscal8(t.T())},F={o:(t,r)=>$.o(t.getTime(),r),l:t=>new Date($.l(t))},T={o:(t,r)=>{const i=e(null!=t?t:"");A.o(i,r)},l:t=>{const r=A.l(t);return i(r)}},A={o:(t,r)=>{h.o(t.byteLength,r),r.O(t)},l:t=>{const r=h.l(t);return t.C(r)}},E={o:(t,r)=>r.h(t?1:0),l:t=>0!==t.T()},g={o:(t,r)=>{t.length>28&&(t=t.slice(0,28)),h.o(mask(t),r)},l:t=>unmask(h.l(t))},x={o:(t,r)=>T.o(JSON.stringify(t),r),l:t=>JSON.parse(T.l(t))},v={o:(t,r)=>{r.h(mask([t.global,t.ignoreCase,t.multiline])),T.o(t.source,r)},l:t=>{const[r,e,i]=unmask(t.T());return new RegExp(T.l(t),(r?"g":"")+(e?"i":"")+(i?"m":""))}},U=[h.o,f.o,u.o,c.o,$.o,l.o,w.o,d.o,b.o,p.o,y.o,B.o,m.o,E.o,g.o,A.o,T.o,x.o,v.o,F.o],S=[h.l,f.l,u.l,c.l,$.l,l.l,w.l,d.l,b.l,p.l,y.l,B.l,m.l,E.l,g.l,A.l,T.l,x.l,v.l,F.l];let I={safe:!1,useGlobalEncodingBuffer:!0,encodingBufferMaxSize:1500,encodingBufferInitialSize:256,encodingBufferIncrement:256};class BufferWriter{constructor(t){this.i=0,this.D=new DataView(new ArrayBuffer(t))}V(){return new Uint8Array(this.D.buffer,this.D.byteOffset,this.i)}R(){return new Uint8Array(this.D.buffer.slice(0,this.i))}A(t){this.D.setInt8(this.N(1),t)}U(t){this.D.setInt16(this.N(2),t,!0)}I(t){this.D.setInt32(this.N(4),t,!0)}h(t){this.D.setUint8(this.N(1),t)}u(t){this.D.setUint16(this.N(2),t,!1)}$(t){this.D.setUint32(this.N(4),t,!1)}H(t){this.D.setFloat32(this.N(4),t,!0)}k(t){this.D.setFloat64(this.N(8),t,!0)}O(t){if(null==t.byteLength)throw new Error(`buffer had null byteLength: ${t.byteLength} - (buffer is null: ${null==t}) (stringified: ${JSON.stringify(t)}) (b instanceof string: ${"string"==typeof t} (ab: ${t instanceof ArrayBuffer}) (abv: ${ArrayBuffer.isView(t)})`);const r=this.i,e=this.N(t.byteLength);let i,n;console.log(`buffer: allocating ${e} for a total of ${this.D.byteLength}`);try{i=ArrayBuffer.isView(t)?t instanceof Uint8Array?t:new Uint8Array(t.buffer,t.byteOffset,t.byteLength):new Uint8Array(t)}catch(t){throw new Error("failed to copy bytes reason 11")}try{n=new Uint8Array(this.D.buffer,this.D.byteOffset+e,t.byteLength)}catch(i){throw new Error(`failed to copy bytes reason 61 - from ${r} for ${t.byteLength} we're allocating ${e} for a total of ${this.D.byteLength}`)}try{n.set(i)}catch(t){throw new Error("failed to copy bytes reason 33")}}N(t){if(this.i+t>this.D.byteLength){const r=this.i+t-this.D.byteLength,e=Math.ceil(r/I.encodingBufferIncrement)*I.encodingBufferIncrement;this.J(this.D.byteLength+e)}const r=this.i;return this.i+=t,r}J(t){if(t>I.encodingBufferMaxSize)throw new TinybufError(`exceeded encodingBufferMaxSize: ${I.encodingBufferMaxSize}`);const r=new ArrayBuffer(t),e=new Uint8Array(this.D.buffer,this.D.byteOffset,this.D.byteLength);new Uint8Array(r).set(e),this.D=new DataView(r)}}class BufferReader{constructor(t,r){this.D=ArrayBuffer.isView(t)?new DataView(t.buffer,t.byteOffset,t.byteLength):new DataView(t),this.i=null!=r?r:0}p(){return this.D.getUint8(this.i)}F(){this.i++}T(){return this.D.getUint8(this.i++)}B(){const t=this.D.getUint16(this.i);return this.i+=2,t}m(){const t=this.D.getUint32(this.i);return this.i+=4,t}v(){return this.D.getInt8(this.i++)}S(){const t=this.D.getInt16(this.i,!0);return this.i+=2,t}M(){const t=this.D.getInt32(this.i,!0);return this.i+=4,t}_(){const t=this.D.getFloat32(this.i,!0);return this.i+=4,t}j(){const t=this.D.getFloat64(this.i,!0);return this.i+=8,t}C(t){if(this.D.byteOffset+this.i+t>this.D.byteLength)throw new RangeError("exceeded bytes");const r=new Uint8Array(this.D.buffer,this.D.byteOffset+this.i,t);return this.i+=t,r}}var M;exports.Type=void 0,(M=exports.Type||(exports.Type={}))[M.UInt=0]="UInt",M[M.UInt8=1]="UInt8",M[M.UInt16=2]="UInt16",M[M.UInt32=3]="UInt32",M[M.Int=4]="Int",M[M.Int8=5]="Int8",M[M.Int16=6]="Int16",M[M.Int32=7]="Int32",M[M.Float64=8]="Float64",M[M.Float32=9]="Float32",M[M.Float16=10]="Float16",M[M.Scalar8=11]="Scalar8",M[M.UScalar8=12]="UScalar8",M[M.Bool=13]="Bool",M[M.Bools=14]="Bools",M[M.Buffer=15]="Buffer",M[M.String=16]="String",M[M.JSON=17]="JSON",M[M.RegExp=18]="RegExp",M[M.Date=19]="Date";class MaybeType{constructor(t){this.type=t}}class BufferFormat{get encodingBuffer(){var t;return null===(t=this.W)||void 0===t?void 0:t.D}constructor(t,r){if(this.q=!1,"number"==typeof t)this.P=t;else{if(t instanceof MaybeType)throw new TypeError("Format cannot be optional");if(!(t instanceof Object))throw new TypeError("Format must be object or Type");if(this.P=void 0,this.G=new Map,this.L=Object.keys(t).map((r=>{const e=new Field(r,t[r]);return this.G.set(r,e),e})),void 0===r)this.header=$hashCode(this.f),this.K=this.header;else if(null===r)this.header=void 0,this.K=void 0;else{if(!function isValidHeader(t){return"number"==typeof t?Number.isInteger(t)&&t>=0&&t<=65535:"string"==typeof t&&2===(new TextEncoder).encode(t).byteLength}(r))throw new TypeError(`Header must be uint16, 2 byte string, or null. Received: ${r}`);this.header=r,this.K="number"==typeof r?r:$strToHashCode(r)}}}get f(){return void 0===this.X&&(this.X=void 0!==this.L?`{${this.L.map((t=>t.f)).join(",")}}`:`${this.P}`),this.X}static Y(){return I.useGlobalEncodingBuffer?(BufferFormat.Z||(this.Z=new BufferWriter(I.encodingBufferInitialSize)),this.Z):new BufferWriter(I.encodingBufferInitialSize)}encode(t,r){return this.W||(this.W=BufferFormat.Y()),this.W.i=0,this.q&&(t=this.tt(t)),this.rt(t,this.W),(null!=r?r:I.safe)?this.W.R():this.W.V()}decode(t){return this.et(new BufferReader(t,void 0===this.header?0:2))}setTransforms(t){if(this.q=!0,"function"==typeof t||Array.isArray(t)&&"function"==typeof t[0])this.it=t;else for(const r of Object.keys(t)){const e=this.G.get(r);if(!e)throw new TypeError(`Failed to set transforms for field '${r}'`);e.nt.setTransforms(t[r])}return this}setValidation(t){if(this.q=!0,"function"==typeof t)this.st=t;else for(const r of Object.keys(t)){const e=this.G.get(r);if(!e)throw new TypeError(`Failed to set validation function for field '${r}'`);e.nt.setValidation(t[r])}return this}rt(t,r){if(void 0!==this.K&&r.u(this.K),void 0!==this.P){const e=this.st||this.it?this.tt(t):t;return U[this.P](e,r)}if("object"!=typeof t||!t)throw new TypeError("expected object type");for(const e of this.L){const i=t[e.ot];if(e.ht){if(null==i){E.o(!1,r);continue}E.o(!0,r)}else if(null==i)throw new Error(`missing required value: ${e.ot}`);e.ft?this.ut(i,r,e.nt):e.nt.rt(i,r)}}tt(t){return this.st&&this.ct(t),"function"==typeof this.it?this.it(t):Array.isArray(this.it)&&"function"==typeof this.it[0]?this.it[0](t):t}$t(t){return Array.isArray(this.it)&&"function"==typeof this.it[1]&&(t=this.it[1](t)),this.st&&this.ct(t),t}ct(t){if(!this.st)return;const r=this.st(t);if(r instanceof Error)throw r;if(!1===r)throw new Error("failed validation")}et(t){return this.et=this.lt(),this.et(t)}wt(){return`return{${this.L.map((({ot:t},r)=>`${t}:this.${this.dt.name}(${r},state)`)).join(",")}}`}dt(t,r){const e=this.L[t];if(!e.ht||E.l(r))return e.ft?this.yt(e.nt,r):e.nt.et(r)}lt(){return void 0!==this.P?this.q?t=>this.$t(S[this.P](t)):S[this.P]:new Function("state",this.wt())}ut(t,r,e){if(!Array.isArray(t))throw new TypeError(`expected array, instead got: ${t}`);h.o(t.length,r);for(let i=0;i<t.length;i++)e.rt(t[i],r)}yt(t,r){const e=new Array(h.l(r));for(let i=0;i<e.length;i++)e[i]=t.et(r);return e}}BufferFormat.peekHeader=peekHeader,BufferFormat.peekHeaderStr=peekHeaderStr;class Field{constructor(t,r){this.ht=r instanceof MaybeType;let e=r instanceof MaybeType?r.type:r;if(this.ot=t,Array.isArray(e)){if(1!==e.length)throw new TypeError("Array type must contain exactly one format");e=e[0],this.ft=!0}else this.ft=!1;this.nt=new BufferFormat(e,null)}get f(){return void 0===this.bt&&(this.bt=`${this.nt.f}${this.ft?"[]":""}${this.ht?"?":""}`),this.bt}}exports.TinybufError=TinybufError,exports.bufferParser=()=>new BufferParser,exports.defineFormat=function defineFormat(t,r){return null!==t&&"object"==typeof t?new BufferFormat(t):new BufferFormat(r,t)},exports.f16round=function f16round(t){return s(n(t))},exports.mask=mask,exports.optional=function optional(t){return new MaybeType(t)},exports.peekHeader=peekHeader,exports.peekHeaderStr=peekHeaderStr,exports.scalround=function scalround(t){return $fromscal8($toscal8(t))},exports.setTinybufConfig=t=>{I=Object.assign(Object.assign({},I),t)},exports.unmask=unmask,exports.uscalround=function uscalround(t){return $fromuscal8($touscal8(t))};
//# sourceMappingURL=index.cjs.map
