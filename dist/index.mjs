class TinybufError extends Error{}function $hashCode(t){let r=5381;for(let e=0;e<t.length;e++)r=33*r^t.charCodeAt(e);return 65535&r}function $strToHashCode(t){return 2!==t.length?$hashCode(t):256*t.charCodeAt(0)+t.charCodeAt(1)}function $hashCodeToStr(t){return String.fromCharCode(Math.floor(t/256))+String.fromCharCode(t%256)}function peekHeader(t){return(ArrayBuffer.isView(t)?new DataView(t.buffer,t.byteOffset,2):new DataView(t,0,2)).getUint16(0,!1)}function peekHeaderStr(t){return $hashCodeToStr(peekHeader(t))}const bufferParser=()=>new BufferParser;class BufferParser{constructor(){this.t=new Map,this.o=new Map}processBuffer(t){var r;let e,i,n,s;try{const o=peekHeader(t);if(!this.t.has(o))throw new TinybufError(`Unknown format: ${o} '${$hashCodeToStr(o)}')`);[e,n,s]=this.t.get(o),s&&(i=null!==(r=this.o.get(o))&&void 0!==r?r:{}),i=e.decode(t,i),s&&this.o.set(o,i)}catch(t){const r=new TinybufError(`Failed to decode: ${t}`);throw r.stack=t.stack,r}n(i)}on(t,r,{decodeInPlace:e=!1}={}){var i;if(null==t.header)throw new TinybufError("Format requires header");const n="string"==typeof t.header?$strToHashCode(t.header):t.header;if(this.t.has(n)&&(null===(i=this.t.get(n))||void 0===i?void 0:i[0])!==t)throw new TinybufError(`Format header collision: ${t.header}`);return this.t.set(n,[t,r,e]),this}ignore(...t){return t.forEach((t=>this.on(t,(()=>{})))),this}clear(){this.t.clear(),this.o.clear()}}const t=Math.floor,r=Math.ceil,$clamp=(t,r,e)=>t>e?e:t<r?r:t,$roundTowardZero=e=>e<0?r(e):t(e),$roundAwayFromZero=e=>e<0?t(e):r(e);function uscalround(t){return $fromuscal8($touscal8(t))}function scalround(t){return $fromscal8($toscal8(t))}function $touscal8(t){return $clamp(127+$roundTowardZero(254*t-127),0,254)}function $toscal8(t){return $clamp($roundTowardZero(127*t),-127,127)+127}function $fromuscal8(t){return $clamp(.01*($roundAwayFromZero(.3937007874015748*(t-127))+50),0,1)}function $fromscal8(t){return $clamp(.01*$roundAwayFromZero(.787401574803149*(t-127)),-1,1)}const e={UInt:"uint",UInt8:"u8",UInt16:"u16",UInt32:"u32",Int:"int",Int8:"i8",Int16:"i16",Int32:"i32",Float64:"f64",Float32:"f32",Float16:"f16",BFloat16:"b16",Scalar8:"sc",UScalar8:"usc",Bool:"bl",Bools:"bls",Buffer:"buf",String:"str",JSON:"jsn",RegExp:"re",Date:"dt"},i=Object.values(e);class MaybeType{constructor(t){this.type=t}}function optional(t){return new MaybeType(t)}const mask=(t,r=1)=>t.reduce(((t,r)=>t<<1|r),r),unmask=(t,r)=>{const e=void 0===r?31-Math.clz32(t):Array.isArray(r)?r.length:r,i=Array.isArray(r)&&r.length===e?r:new Array(e);for(let r=0;r<e;r++)i[r]=!!(t&1<<e-1-r);return i},n=function(){const t=new TextEncoder;return r=>t.encode(r)}(),s=function(){const t=new TextDecoder("utf-8");return r=>t.decode(r)}();function f16round(t){return h(o(t))}const o=function(){const t=new Float32Array(1),r=new Int32Array(t.buffer);return function(e){t[0]=e;let i=r[0],n=i>>16&32768,s=4096+(2147483647&i)|0;return s>=1199570944?(2147483647&i)<1199570944?31743|n:s<2139095040?31744|n:31744|n|(8388607&i)>>13:s>=947912704?n|s-939524096>>13:s<855638016?n:(s=(2147483647&i)>>23,n|(8388607&i|8388608)+(8388608>>>s-102)>>126-s)}}(),h=function(){const t=Math.pow(2,-24),r=new Float32Array(1056);for(let t=0;t<32;t++)r[t]=Math.pow(2,t-15);for(let t=0;t<1024;t++)r[t+32]=1+t/1024;return function(e){const i=32768&~e?1:-1,n=31744&e,s=1023&e;return 0===n?0===s?0*i:i*t:31744===n?0===s?i*(1/0):NaN:r[n>>10]*r[s+32]*i}}(),a=new Uint32Array(1),f=new Float32Array(a.buffer);function bf16round(t){return f[0]=t,a[0]=4294901760&a[0],f[0]}const u=536870912,c=268435456,d=4294967296,$={h:(r,e)=>{"number"!=typeof r&&(r=Number(r)),r<0&&(r=0),r<128?e.u(r):r<16384?e.$(r+32768):r<u?e.l(r+3221225472):r>=u?(e.l(t(r/d)+3758096384),e.l(r>>>0)):e.u(!0===r?1:0)},p:t=>{const r=t.m();return 128&r?64&r?32&r?(t.B()-3758096384)*d+t.B():t.B()-3221225472:t.F()-32768:(t.T(),r)}},l={h:(t,r)=>r.u(t),p:t=>t.A()},w={h:(t,r)=>r.$(t),p:t=>t.F()},y={h:(t,r)=>r.l(t),p:t=>t.B()},p={h:(r,e)=>{"number"!=typeof r&&(r=Number(r)),r>=-64&&r<64?e.u(127&r):r>=-8192&&r<8192?e.$(32768+(16383&r)):r>=-268435456&&r<c?e.l(3221225472+(536870911&r)):r<-268435456||r>=c?(e.l(3758096384+(536870911&t(r/d))),e.l(r>>>0)):e.u(!0===r?127:0)},p:t=>{let r,e=t.m();return 128&e?64&e?32&e?(r=t.B()-3758096384,r=268435456&r?3758096384|r:r,r*d+t.B()):(r=t.B()-3221225472,268435456&r?3758096384|r:r):(r=t.F()-32768,8192&r?4294950912|r:r):(t.T(),64&e?4294967168|e:e)}},b={h:(t,r)=>r.v(t),p:t=>t.U()},m={h:(t,r)=>r.I(t),p:t=>t.M()},B={h:(t,r)=>r.S(t),p:t=>t.j()},F={h:(t,r)=>r.$(function $tobf16(t){return f[0]=t,a[0]>>>16}(t)),p:t=>function $frombf16(t){return a[0]=t<<16,f[0]}(t.F())},T={h:(t,r)=>r.$(o(t)),p:t=>h(t.F())},A={h:(t,r)=>r.H(t),p:t=>t._()},v={h:(t,r)=>r.k(t),p:t=>t.O()},E={h:(t,r)=>r.u($touscal8(t)),p:t=>$fromuscal8(t.A())},g={h:(t,r)=>r.u($toscal8(t)),p:t=>$fromscal8(t.A())},U={h:(t,r)=>p.h(t.getTime(),r),p:t=>new Date(p.p(t))},I={h:(t,r)=>{$.h(t.byteLength,r),r.C(t)},p:t=>t.D($.p(t))},M={h:(t,r)=>I.h(n(t),r),p:t=>s(I.p(t))},S={h:(t,r)=>r.u(t?1:0),p:t=>0!==t.A()},x={h:(t,r)=>{t.length>28&&(t=t.slice(0,28)),$.h(mask(t),r)},p:(t,r)=>unmask($.p(t),r)},j={h:(t,r)=>M.h(JSON.stringify(t),r),p:t=>JSON.parse(M.p(t))},H={h:(t,r)=>{r.u(mask([t.global,t.ignoreCase,t.multiline])),M.h(t.source,r)},p:t=>{const[r,e,i]=unmask(t.A());return new RegExp(M.p(t),(r?"g":"")+(e?"i":"")+(i?"m":""))}},_={[e.UInt]:$.h,[e.UInt8]:l.h,[e.UInt16]:w.h,[e.UInt32]:y.h,[e.Int]:p.h,[e.Int8]:b.h,[e.Int16]:m.h,[e.Int32]:B.h,[e.Float64]:v.h,[e.Float32]:A.h,[e.Float16]:T.h,[e.BFloat16]:F.h,[e.Scalar8]:g.h,[e.UScalar8]:E.h,[e.Bool]:S.h,[e.Bools]:x.h,[e.Buffer]:I.h,[e.String]:M.h,[e.JSON]:j.h,[e.RegExp]:H.h,[e.Date]:U.h},k={[e.UInt]:$.p,[e.UInt8]:l.p,[e.UInt16]:w.p,[e.UInt32]:y.p,[e.Int]:p.p,[e.Int8]:b.p,[e.Int16]:m.p,[e.Int32]:B.p,[e.Float64]:v.p,[e.Float32]:A.p,[e.Float16]:T.p,[e.BFloat16]:F.p,[e.Scalar8]:g.p,[e.UScalar8]:E.p,[e.Bool]:S.p,[e.Bools]:x.p,[e.Buffer]:I.p,[e.String]:M.p,[e.JSON]:j.p,[e.RegExp]:H.p,[e.Date]:U.p},setTinybufConfig=t=>{O=Object.assign(Object.assign({},O),t)};let O={safe:!1,useGlobalEncodingBuffer:!0,encodingBufferMaxSize:1500,encodingBufferInitialSize:256,encodingBufferIncrement:256};class BufferWriter{constructor(t){this.V=0,this.N=0,this.R="number"==typeof t;let r=t instanceof Uint8Array?t:new Uint8Array(t);this.W=r,this.J=new DataView(r.buffer,r.byteOffset,r.byteLength)}P(){return this.W.subarray(this.W.byteOffset,this.W.byteOffset+this.V)}q(){const t=new Uint8Array(this.V);return t.set(this.P()),t}v(t){this.G(1).setInt8(this.N,t)}I(t){this.G(2).setInt16(this.N,t,!0)}S(t){this.G(4).setInt32(this.N,t,!0)}u(t){this.G(1).setUint8(this.N,t)}$(t){this.G(2).setUint16(this.N,t,!1)}l(t){this.G(4).setUint32(this.N,t,!1)}H(t){this.G(4).setFloat32(this.N,t,!0)}k(t){this.G(8).setFloat64(this.N,t,!0)}C(t){this.G(t.byteLength);let r=ArrayBuffer.isView(t)?t instanceof Uint8Array?t:new Uint8Array(t.buffer,t.byteOffset,t.byteLength):new Uint8Array(t);new Uint8Array(this.J.buffer,this.J.byteOffset+this.N,t.byteLength).set(r)}G(t){if(this.V+t>this.J.byteLength){const r=this.V+t-this.J.byteLength,e=Math.ceil(r/O.encodingBufferIncrement)*O.encodingBufferIncrement;if(!this.R)throw new TinybufError("exceeded buffer length: "+this.J.byteLength);this.K(this.J.byteLength+e)}return this.N=this.V,this.V+=t,this.J}K(t){if(t>O.encodingBufferMaxSize)throw new TinybufError(`exceeded encodingBufferMaxSize: ${O.encodingBufferMaxSize}`);const r=new Uint8Array(t);r.set(this.W),this.J=new DataView(r.buffer),this.W=r}}class BufferReader{constructor(t,r){this.J=ArrayBuffer.isView(t)?new DataView(t.buffer,t.byteOffset,t.byteLength):new DataView(t),this.i=null!=r?r:0}m(){return this.J.getUint8(this.i)}T(){this.i++}A(){return this.J.getUint8(this.i++)}F(){const t=this.J.getUint16(this.i);return this.i+=2,t}B(){const t=this.J.getUint32(this.i);return this.i+=4,t}U(){return this.J.getInt8(this.i++)}M(){const t=this.J.getInt16(this.i,!0);return this.i+=2,t}j(){const t=this.J.getInt32(this.i,!0);return this.i+=4,t}_(){const t=this.J.getFloat32(this.i,!0);return this.i+=4,t}O(){const t=this.J.getFloat64(this.i,!0);return this.i+=8,t}D(t){if(this.J.byteOffset+this.i+t>this.J.byteLength)throw new RangeError("exceeded bytes");const r=new Uint8Array(this.J.buffer,this.J.byteOffset+this.i,t);return this.i+=t,r}}function defineFormat(t,r){return null!==t&&"object"==typeof t?new BufferFormat(t):new BufferFormat(r,t)}class BufferFormat{constructor(t,r){if(this.L=!1,"string"==typeof t&&i.includes(t))this.X=t;else{if(t instanceof MaybeType)throw new TypeError("Format cannot be optional");if(!(t instanceof Object))throw new TypeError("Format must be object or Type");if(this.X=void 0,this.Y=new Map,this.Z=Object.keys(t).map((r=>{const e=new Field(r,t[r]);return this.Y.set(r,e),e})),void 0===r)this.header=$hashCode(this.f),this.tt=this.header;else if(null===r)this.header=void 0,this.tt=void 0;else{if(!function isValidHeader(t){return"number"==typeof t?Number.isInteger(t)&&t>=0&&t<=65535:"string"==typeof t&&2===(new TextEncoder).encode(t).byteLength}(r))throw new TypeError("Header must be 2-byte string, uint16, or null.");this.header=r,this.tt="number"==typeof r?r:$strToHashCode(r)}}}get f(){return void 0===this.rt&&(this.rt=void 0!==this.Z?`{${this.Z.map((t=>t.f)).join(",")}}`:`${this.X}`),this.rt}static et(){return O.useGlobalEncodingBuffer?(BufferFormat.it||(this.it=new BufferWriter(O.encodingBufferInitialSize)),this.it):new BufferWriter(O.encodingBufferInitialSize)}encodeInto(t,r){const e=new BufferWriter(r);return this.L&&(t=this.nt(t)),this.st(t,e),e.P()}encode(t,r){return this.ot||(this.ot=BufferFormat.et()),this.ot.V=0,this.L&&(t=this.nt(t)),this.st(t,this.ot),(null!=r?r:O.safe)?this.ot.q():this.ot.P()}decodeInto(t,r){return this.ht(new BufferReader(t,void 0===this.header?0:2),r)}decode(t,r){return this.ht(new BufferReader(t,void 0===this.header?0:2),r)}setTransforms(t){if(this.L=!0,"function"==typeof t||Array.isArray(t)&&"function"==typeof t[0])this.ft=t;else for(const r of Object.keys(t)){const e=this.Y.get(r);if(!e)throw new TypeError(`Failed to set transforms for field '${r}'`);e.ut.setTransforms(t[r])}return this}setValidation(t){if(this.L=!0,"function"==typeof t)this.ct=t;else for(const r of Object.keys(t)){const e=this.Y.get(r);if(!e)throw new TypeError(`Failed to set validation function for field '${r}'`);e.ut.setValidation(t[r])}return this}st(t,r){if(void 0!==this.tt&&r.$(this.tt),void 0!==this.X){const e=this.ct||this.ft?this.nt(t):t;return _[this.X](e,r)}if("object"!=typeof t||!t)throw new TypeError("expected object type");for(const e of this.Z){const i=t[e.dt];if(e.$t){if(null==i){S.h(!1,r);continue}S.h(!0,r)}else if(null==i)throw new Error(`missing required value: ${e.dt}`);e.lt?this.wt(i,r,e.ut):e.ut.st(i,r)}}nt(t){return this.ct&&this.yt(t),"function"==typeof this.ft?this.ft(t):Array.isArray(this.ft)&&"function"==typeof this.ft[0]?this.ft[0](t):t}bt(t){return Array.isArray(this.ft)&&"function"==typeof this.ft[1]&&(t=this.ft[1](t)),this.ct&&this.yt(t),t}yt(t){if(!this.ct)return;const r=this.ct(t);if(r instanceof Error)throw r;if(!1===r)throw new Error("failed validation")}ht(t,r){return this.ht=this.Bt(),this.ht(t,r)}Ft(){const t=this.Z.map((({dt:t},r)=>`v.${t}=this.${this.Tt.name}(${r},s,v.${t})`)).join(";");return`let v=o??{};${t};return v;`}Tt(t,r,e){const i=this.Z[t];if(!i.$t||S.p(r))return i.lt?this.At(i.ut,r,e):i.ut.ht(r,e)}Bt(){return void 0!==this.X?this.L?t=>this.bt(k[this.X](t)):k[this.X]:new Function("s","o",this.Ft())}wt(t,r,e){if(!Array.isArray(t))throw new TypeError(`expected array, instead got: ${t}`);$.h(t.length,r);for(let i=0;i<t.length;i++)e.st(t[i],r)}At(t,r,e){const i=$.p(r),n=(null==e?void 0:e.length)===i?e:new Array(i);for(let i=0;i<n.length;i++)n[i]=t.ht(r,null==e?void 0:e[i]);return n}}BufferFormat.peekHeader=peekHeader,BufferFormat.peekHeaderStr=peekHeaderStr;class Field{constructor(t,r){this.$t=r instanceof MaybeType;let e=r instanceof MaybeType?r.type:r;if(this.dt=t,Array.isArray(e)){if(1!==e.length)throw new TypeError("Array type must contain exactly one format");e=e[0],this.lt=!0}else this.lt=!1;this.ut=new BufferFormat(e,null)}get f(){return void 0===this.vt&&(this.vt=`${this.ut.f}${this.lt?"[]":""}${this.$t?"?":""}`),this.vt}}export{TinybufError,e as Type,bf16round,bufferParser,defineFormat,f16round,mask,optional,peekHeader,peekHeaderStr,scalround,setTinybufConfig,unmask,uscalround};
//# sourceMappingURL=index.mjs.map
