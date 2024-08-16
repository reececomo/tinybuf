class TinybufError extends Error{}function $hashCode(t){let e=5381;for(let r=0;r<t.length;r++)e=33*e^t.charCodeAt(r);return 65535&e}function $strToHashCode(t){return 2!==t.length?$hashCode(t):256*t.charCodeAt(0)+t.charCodeAt(1)}function $hashCodeToStr(t){return String.fromCharCode(Math.floor(t/256))+String.fromCharCode(t%256)}function peekHeader(t){return(ArrayBuffer.isView(t)?new DataView(t.buffer,t.byteOffset,2):new DataView(t,0,2)).getUint16(0,!1)}function peekHeaderStr(t){return $hashCodeToStr(peekHeader(t))}class BufferParser{constructor(){this.t=new Map}processBuffer(t){let e,r,i;try{const s=peekHeader(t);if(!this.t.has(s))throw new TinybufError(`Unknown format: ${s} '${$hashCodeToStr(s)}')`);[e,i]=this.t.get(s),r=e.decode(t)}catch(t){const e=new TinybufError(`Failed to decode: ${t}`);throw e.stack=t.stack,e}i(r)}on(t,e,r=!1){if(null==t.header)throw new TinybufError("Format requires header");const i="string"==typeof t.header?$strToHashCode(t.header):t.header;if(this.t.has(i)&&!r)throw new TinybufError(`Format header collision: ${t.header}`);return this.t.set(i,[t,e]),this}ignore(...t){return t.forEach((t=>this.on(t,(()=>{}),!0))),this}clear(){this.t.clear()}}const t=Math.floor,e=Math.ceil,$clamp=(t,e,r)=>t>r?r:t<e?e:t,$roundTowardZero=r=>r<0?e(r):t(r),$roundAwayFromZero=r=>r<0?t(r):e(r);function $touscal8(t){return $clamp(127+$roundTowardZero(254*t-127),0,254)}function $toscal8(t){return $clamp($roundTowardZero(127*t),-127,127)+127}function $fromuscal8(t){return $clamp(.01*($roundAwayFromZero(.3937007874015748*(t-127))+50),0,1)}function $fromscal8(t){return $clamp(.01*$roundAwayFromZero(.787401574803149*(t-127)),-1,1)}const mask=(t,e=1)=>t.reduce(((t,e)=>t<<1|e),e),unmask=(t,e=31-Math.clz32(t))=>{const r=new Array(e);for(let i=0;i<e;i++)r[i]=!!(t&1<<e-1-i);return r},r=function(){const t=new TextEncoder;return e=>t.encode(e)}(),i=function(){const t=new TextDecoder("utf-8");return e=>t.decode(e)}();const s=function(){const t=new Float32Array(1),e=new Int32Array(t.buffer);return function(r){t[0]=r;let i=e[0],s=i>>16&32768,n=4096+(2147483647&i)|0;return n>=1199570944?(2147483647&i)<1199570944?31743|s:n<2139095040?31744|s:31744|s|(8388607&i)>>13:n>=947912704?s|n-939524096>>13:n<855638016?s:(n=(2147483647&i)>>23,s|(8388607&i|8388608)+(8388608>>>n-102)>>126-n)}}(),n=function(){const t=Math.pow(2,-24),e=new Float32Array(1056);for(let t=0;t<32;t++)e[t]=Math.pow(2,t-15);for(let t=0;t<1024;t++)e[t+32]=1+t/1024;return function(r){const i=32768&~r?1:-1,s=31744&r,n=1023&r;return 0===s?0===n?0*i:i*t:31744===s?0===n?i*(1/0):NaN:e[s>>10]*e[n+32]*i}}(),o=268435456,h=4294967296,a={o:(e,r)=>{e<128?r.h(e):e<16384?r.u(e+32768):e<536870912?r.$(e+3221225472):(r.$(t(e/h)+3758096384),r.$(e>>>0))},l:t=>{const e=t.p();return 128&e?64&e?32&e?(t.m()-3758096384)*h+t.m():t.m()-3221225472:t.B()-32768:(t.T(),e)}},f={o:(t,e)=>e.h(t),l:t=>t.F()},u={o:(t,e)=>e.u(t),l:t=>t.B()},c={o:(t,e)=>e.$(t),l:t=>t.m()},$={o:(e,r)=>{if(e>=-64&&e<64)r.h(127&e);else if(e>=-8192&&e<8192)r.u(32768+(16383&e));else if(e>=-268435456&&e<o)r.$(3221225472+(536870911&e));else{const i=e;r.$(3758096384+(536870911&t(i/h))),r.$(i>>>0)}},l:t=>{let e,r=t.p();return 128&r?64&r?32&r?(e=t.m()-3758096384,e=268435456&e?3758096384|e:e,e*h+t.m()):(e=t.m()-3221225472,268435456&e?3758096384|e:e):(e=t.B()-32768,8192&e?4294950912|e:e):(t.T(),64&r?4294967168|r:r)}},d={o:(t,e)=>e.A(t),l:t=>t.v()},w={o:(t,e)=>e.M(t),l:t=>t.U()},l={o:(t,e)=>e.H(t),l:t=>t.S()},y={o:(t,e)=>e.u(s(t)),l:t=>n(t.B())},p={o:(t,e)=>e._(t),l:t=>t.k()},m={o:(t,e)=>e.j(t),l:t=>t.C()},b={o:(t,e)=>e.h($touscal8(t)),l:t=>$fromuscal8(t.F())},B={o:(t,e)=>e.h($toscal8(t)),l:t=>$fromscal8(t.F())},T={o:(t,e)=>$.o(t.getTime(),e),l:t=>new Date($.l(t))},F={o:(t,e)=>{a.o(t.byteLength,e),e.I(t)},l:t=>t.O(a.l(t))},A={o:(t,e)=>F.o(r(t),e),l:t=>i(F.l(t))},x={o:(t,e)=>e.h(t?1:0),l:t=>0!==t.F()},E={o:(t,e)=>{t.length>28&&(t=t.slice(0,28)),a.o(mask(t),e)},l:t=>unmask(a.l(t))},g={o:(t,e)=>A.o(JSON.stringify(t),e),l:t=>JSON.parse(A.l(t))},v={o:(t,e)=>{e.h(mask([t.global,t.ignoreCase,t.multiline])),A.o(t.source,e)},l:t=>{const[e,r,i]=unmask(t.F());return new RegExp(A.l(t),(e?"g":"")+(r?"i":"")+(i?"m":""))}},M={0:a.o,1:f.o,2:u.o,3:c.o,4:$.o,5:d.o,6:w.o,7:l.o,8:m.o,9:p.o,10:y.o,11:B.o,12:b.o,13:x.o,14:E.o,15:F.o,16:A.o,17:g.o,18:v.o,19:T.o},U={0:a.l,1:f.l,2:u.l,3:c.l,4:$.l,5:d.l,6:w.l,7:l.l,8:m.l,9:p.l,10:y.l,11:B.l,12:b.l,13:x.l,14:E.l,15:F.l,16:A.l,17:g.l,18:v.l,19:T.l};let H={safe:!1,useGlobalEncodingBuffer:!0,encodingBufferMaxSize:1500,encodingBufferInitialSize:256,encodingBufferIncrement:256};class BufferWriter{constructor(t){this.i=0,this.V=new DataView(new ArrayBuffer(t))}D(){return new Uint8Array(this.V.buffer,this.V.byteOffset,this.i)}R(){return new Uint8Array(this.V.buffer.slice(0,this.i))}A(t){this.V.setInt8(this.N(1),t)}M(t){this.V.setInt16(this.N(2),t,!0)}H(t){this.V.setInt32(this.N(4),t,!0)}h(t){this.V.setUint8(this.N(1),t)}u(t){this.V.setUint16(this.N(2),t,!1)}$(t){this.V.setUint32(this.N(4),t,!1)}_(t){this.V.setFloat32(this.N(4),t,!0)}j(t){this.V.setFloat64(this.N(8),t,!0)}I(t){const e=this.N(t.byteLength);let r=ArrayBuffer.isView(t)?t instanceof Uint8Array?t:new Uint8Array(t.buffer,t.byteOffset,t.byteLength):new Uint8Array(t);new Uint8Array(this.V.buffer,this.V.byteOffset+e,t.byteLength).set(r)}N(t){if(this.i+t>this.V.byteLength){const e=this.i+t-this.V.byteLength,r=Math.ceil(e/H.encodingBufferIncrement)*H.encodingBufferIncrement;this.W(this.V.byteLength+r)}const e=this.i;return this.i+=t,e}W(t){if(t>H.encodingBufferMaxSize)throw new TinybufError(`exceeded encodingBufferMaxSize: ${H.encodingBufferMaxSize}`);const e=new ArrayBuffer(t),r=new Uint8Array(this.V.buffer,this.V.byteOffset,this.V.byteLength);new Uint8Array(e).set(r),this.V=new DataView(e)}}class BufferReader{constructor(t,e){this.V=ArrayBuffer.isView(t)?new DataView(t.buffer,t.byteOffset,t.byteLength):new DataView(t),this.i=null!=e?e:0}p(){return this.V.getUint8(this.i)}T(){this.i++}F(){return this.V.getUint8(this.i++)}B(){const t=this.V.getUint16(this.i);return this.i+=2,t}m(){const t=this.V.getUint32(this.i);return this.i+=4,t}v(){return this.V.getInt8(this.i++)}U(){const t=this.V.getInt16(this.i,!0);return this.i+=2,t}S(){const t=this.V.getInt32(this.i,!0);return this.i+=4,t}k(){const t=this.V.getFloat32(this.i,!0);return this.i+=4,t}C(){const t=this.V.getFloat64(this.i,!0);return this.i+=8,t}O(t){if(this.V.byteOffset+this.i+t>this.V.byteLength)throw new RangeError("exceeded bytes");const e=new Uint8Array(this.V.buffer,this.V.byteOffset+this.i,t);return this.i+=t,e}}class MaybeType{constructor(t){this.type=t}}class BufferFormat{get encodingBuffer(){var t;return null===(t=this.q)||void 0===t?void 0:t.V}constructor(t,e){if(this.J=!1,"number"==typeof t&&t>=0&&t<=19)this.P=t;else{if(t instanceof MaybeType)throw new TypeError("Format cannot be optional");if(!(t instanceof Object))throw new TypeError("Format must be object or Type");if(this.P=void 0,this.G=new Map,this.K=Object.keys(t).map((e=>{const r=new Field(e,t[e]);return this.G.set(e,r),r})),void 0===e)this.header=$hashCode(this.f),this.L=this.header;else if(null===e)this.header=void 0,this.L=void 0;else{if(!function isValidHeader(t){return"number"==typeof t?Number.isInteger(t)&&t>=0&&t<=65535:"string"==typeof t&&2===(new TextEncoder).encode(t).byteLength}(e))throw new TypeError(`Header must be uint16, 2 byte string, or null. Received: ${e}`);this.header=e,this.L="number"==typeof e?e:$strToHashCode(e)}}}get f(){return void 0===this.X&&(this.X=void 0!==this.K?`{${this.K.map((t=>t.f)).join(",")}}`:`${this.P}`),this.X}static Y(){return H.useGlobalEncodingBuffer?(BufferFormat.Z||(this.Z=new BufferWriter(H.encodingBufferInitialSize)),this.Z):new BufferWriter(H.encodingBufferInitialSize)}encode(t,e){return this.q||(this.q=BufferFormat.Y()),this.q.i=0,this.J&&(t=this.tt(t)),this.et(t,this.q),(null!=e?e:H.safe)?this.q.R():this.q.D()}decode(t){return this.rt(new BufferReader(t,void 0===this.header?0:2))}setTransforms(t){if(this.J=!0,"function"==typeof t||Array.isArray(t)&&"function"==typeof t[0])this.it=t;else for(const e of Object.keys(t)){const r=this.G.get(e);if(!r)throw new TypeError(`Failed to set transforms for field '${e}'`);r.st.setTransforms(t[e])}return this}setValidation(t){if(this.J=!0,"function"==typeof t)this.nt=t;else for(const e of Object.keys(t)){const r=this.G.get(e);if(!r)throw new TypeError(`Failed to set validation function for field '${e}'`);r.st.setValidation(t[e])}return this}et(t,e){if(void 0!==this.L&&e.u(this.L),void 0!==this.P){const r=this.nt||this.it?this.tt(t):t;return M[this.P](r,e)}if("object"!=typeof t||!t)throw new TypeError("expected object type");for(const r of this.K){const i=t[r.ot];if(r.ht){if(null==i){x.o(!1,e);continue}x.o(!0,e)}else if(null==i)throw new Error(`missing required value: ${r.ot}`);r.ft?this.ut(i,e,r.st):r.st.et(i,e)}}tt(t){return this.nt&&this.ct(t),"function"==typeof this.it?this.it(t):Array.isArray(this.it)&&"function"==typeof this.it[0]?this.it[0](t):t}$t(t){return Array.isArray(this.it)&&"function"==typeof this.it[1]&&(t=this.it[1](t)),this.nt&&this.ct(t),t}ct(t){if(!this.nt)return;const e=this.nt(t);if(e instanceof Error)throw e;if(!1===e)throw new Error("failed validation")}rt(t){return this.rt=this.dt(),this.rt(t)}wt(){return`return{${this.K.map((({ot:t},e)=>`${t}:this.${this.lt.name}(${e},state)`)).join(",")}}`}lt(t,e){const r=this.K[t];if(!r.ht||x.l(e))return r.ft?this.yt(r.st,e):r.st.rt(e)}dt(){return void 0!==this.P?this.J?t=>this.$t(U[this.P](t)):U[this.P]:new Function("state",this.wt())}ut(t,e,r){if(!Array.isArray(t))throw new TypeError(`expected array, instead got: ${t}`);a.o(t.length,e);for(let i=0;i<t.length;i++)r.et(t[i],e)}yt(t,e){const r=new Array(a.l(e));for(let i=0;i<r.length;i++)r[i]=t.rt(e);return r}}BufferFormat.peekHeader=peekHeader,BufferFormat.peekHeaderStr=peekHeaderStr;class Field{constructor(t,e){this.ht=e instanceof MaybeType;let r=e instanceof MaybeType?e.type:e;if(this.ot=t,Array.isArray(r)){if(1!==r.length)throw new TypeError("Array type must contain exactly one format");r=r[0],this.ft=!0}else this.ft=!1;this.st=new BufferFormat(r,null)}get f(){return void 0===this.bt&&(this.bt=`${this.st.f}${this.ft?"[]":""}${this.ht?"?":""}`),this.bt}}exports.TinybufError=TinybufError,exports.bufferParser=()=>new BufferParser,exports.defineFormat=function defineFormat(t,e){return null!==t&&"object"==typeof t?new BufferFormat(t):new BufferFormat(e,t)},exports.f16round=function f16round(t){return n(s(t))},exports.mask=mask,exports.optional=function optional(t){return new MaybeType(t)},exports.peekHeader=peekHeader,exports.peekHeaderStr=peekHeaderStr,exports.scalround=function scalround(t){return $fromscal8($toscal8(t))},exports.setTinybufConfig=t=>{H=Object.assign(Object.assign({},H),t)},exports.unmask=unmask,exports.uscalround=function uscalround(t){return $fromuscal8($touscal8(t))};
//# sourceMappingURL=index.cjs.map
