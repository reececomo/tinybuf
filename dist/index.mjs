class TinybufError extends Error{}function $hashCode(t){let r=5381;for(let e=0;e<t.length;e++)r=33*r^t.charCodeAt(e);return 65535&r}function $strToHashCode(t){return 2!==t.length?$hashCode(t):256*t.charCodeAt(0)+t.charCodeAt(1)}function $hashCodeToStr(t){return String.fromCharCode(Math.floor(t/256))+String.fromCharCode(t%256)}function peekHeader(t){return(ArrayBuffer.isView(t)?new DataView(t.buffer,t.byteOffset,2):new DataView(t,0,2)).getUint16(0,!1)}function peekHeaderStr(t){return $hashCodeToStr(peekHeader(t))}const bufferParser=()=>new BufferParser;class BufferParser{constructor(){this.t=new Map}processBuffer(t){let r,e,i;try{const n=peekHeader(t);if(!this.t.has(n))throw new TinybufError(`Unknown format: ${n} '${$hashCodeToStr(n)}')`);[r,i]=this.t.get(n),e=r.decode(t)}catch(t){const r=new TinybufError(`Failed to decode: ${t}`);throw r.stack=t.stack,r}i(e)}on(t,r,e=!1){if(null==t.header)throw new TinybufError("Format requires header");const i="string"==typeof t.header?$strToHashCode(t.header):t.header;if(this.t.has(i)&&!e)throw new TinybufError(`Format header collision: ${t.header}`);return this.t.set(i,[t,r]),this}ignore(...t){return t.forEach((t=>this.on(t,(()=>{}),!0))),this}clear(){this.t.clear()}}const t=Math.floor,r=Math.ceil,$clamp=(t,r,e)=>t>e?e:t<r?r:t,$roundTowardZero=e=>e<0?r(e):t(e),$roundAwayFromZero=e=>e<0?t(e):r(e);function uscalround(t){return $fromuscal8($touscal8(t))}function scalround(t){return $fromscal8($toscal8(t))}function $touscal8(t){return $clamp(127+$roundTowardZero(254*t-127),0,254)}function $toscal8(t){return $clamp($roundTowardZero(127*t),-127,127)+127}function $fromuscal8(t){return $clamp(.01*($roundAwayFromZero(.3937007874015748*(t-127))+50),0,1)}function $fromscal8(t){return $clamp(.01*$roundAwayFromZero(.787401574803149*(t-127)),-1,1)}const mask=(t,r=1)=>t.reduce(((t,r)=>t<<1|r),r),unmask=(t,r=31-Math.clz32(t))=>{const e=new Array(r);for(let i=0;i<r;i++)e[i]=!!(t&1<<r-1-i);return e},e=function(){const t=new TextEncoder;return r=>t.encode(r)}(),i=function(){const t=new TextDecoder("utf-8");return r=>t.decode(r)}();function f16round(t){return s(n(t))}const n=function(){const t=new Float32Array(1),r=new Int32Array(t.buffer);return function(e){t[0]=e;let i=r[0],n=i>>16&32768,s=4096+(2147483647&i)|0;return s>=1199570944?(2147483647&i)<1199570944?31743|n:s<2139095040?31744|n:31744|n|(8388607&i)>>13:s>=947912704?n|s-939524096>>13:s<855638016?n:(s=(2147483647&i)>>23,n|(8388607&i|8388608)+(8388608>>>s-102)>>126-s)}}(),s=function(){const t=Math.pow(2,-24),r=new Float32Array(1056);for(let t=0;t<32;t++)r[t]=Math.pow(2,t-15);for(let t=0;t<1024;t++)r[t+32]=1+t/1024;return function(e){const i=32768&~e?1:-1,n=31744&e,s=1023&e;return 0===n?0===s?0*i:i*t:31744===n?0===s?i*(1/0):NaN:r[n>>10]*r[s+32]*i}}(),o=268435456,h=4294967296,a={o:(r,e)=>{r<128?e.h(r):r<16384?e.u(r+32768):r<536870912?e.$(r+3221225472):(e.$(t(r/h)+3758096384),e.$(r>>>0))},l:t=>{const r=t.p();return 128&r?64&r?32&r?(t.m()-3758096384)*h+t.m():t.m()-3221225472:t.B()-32768:(t.T(),r)}},f={o:(t,r)=>r.h(t),l:t=>t.F()},u={o:(t,r)=>r.u(t),l:t=>t.B()},c={o:(t,r)=>r.$(t),l:t=>t.m()},d={o:(r,e)=>{if(r>=-64&&r<64)e.h(127&r);else if(r>=-8192&&r<8192)e.u(32768+(16383&r));else if(r>=-268435456&&r<o)e.$(3221225472+(536870911&r));else{const i=r;e.$(3758096384+(536870911&t(i/h))),e.$(i>>>0)}},l:t=>{let r,e=t.p();return 128&e?64&e?32&e?(r=t.m()-3758096384,r=268435456&r?3758096384|r:r,r*h+t.m()):(r=t.m()-3221225472,268435456&r?3758096384|r:r):(r=t.B()-32768,8192&r?4294950912|r:r):(t.T(),64&e?4294967168|e:e)}},$={o:(t,r)=>r.A(t),l:t=>t.v()},w={o:(t,r)=>r.M(t),l:t=>t.U()},l={o:(t,r)=>r.H(t),l:t=>t.S()},y={o:(t,r)=>r.u(n(t)),l:t=>s(t.B())},p={o:(t,r)=>r._(t),l:t=>t.k()},m={o:(t,r)=>r.j(t),l:t=>t.C()},b={o:(t,r)=>r.h($touscal8(t)),l:t=>$fromuscal8(t.F())},B={o:(t,r)=>r.h($toscal8(t)),l:t=>$fromscal8(t.F())},T={o:(t,r)=>d.o(t.getTime(),r),l:t=>new Date(d.l(t))},F={o:(t,r)=>{a.o(t.byteLength,r),r.I(t)},l:t=>t.O(a.l(t))},A={o:(t,r)=>F.o(e(t),r),l:t=>i(F.l(t))},E={o:(t,r)=>r.h(t?1:0),l:t=>0!==t.F()},g={o:(t,r)=>{t.length>28&&(t=t.slice(0,28)),a.o(mask(t),r)},l:t=>unmask(a.l(t))},v={o:(t,r)=>A.o(JSON.stringify(t),r),l:t=>JSON.parse(A.l(t))},M={o:(t,r)=>{r.h(mask([t.global,t.ignoreCase,t.multiline])),A.o(t.source,r)},l:t=>{const[r,e,i]=unmask(t.F());return new RegExp(A.l(t),(r?"g":"")+(e?"i":"")+(i?"m":""))}},U={0:a.o,1:f.o,2:u.o,3:c.o,4:d.o,5:$.o,6:w.o,7:l.o,8:m.o,9:p.o,10:y.o,11:B.o,12:b.o,13:E.o,14:g.o,15:F.o,16:A.o,17:v.o,18:M.o,19:T.o},x={0:a.l,1:f.l,2:u.l,3:c.l,4:d.l,5:$.l,6:w.l,7:l.l,8:m.l,9:p.l,10:y.l,11:B.l,12:b.l,13:E.l,14:g.l,15:F.l,16:A.l,17:v.l,18:M.l,19:T.l},setTinybufConfig=t=>{H=Object.assign(Object.assign({},H),t)};let H={safe:!1,useGlobalEncodingBuffer:!0,encodingBufferMaxSize:1500,encodingBufferInitialSize:256,encodingBufferIncrement:256};class BufferWriter{constructor(t){this.i=0,this.V=new DataView(new ArrayBuffer(t))}D(){return new Uint8Array(this.V.buffer,this.V.byteOffset,this.i)}R(){return new Uint8Array(this.V.buffer.slice(0,this.i))}A(t){this.V.setInt8(this.N(1),t)}M(t){this.V.setInt16(this.N(2),t,!0)}H(t){this.V.setInt32(this.N(4),t,!0)}h(t){this.V.setUint8(this.N(1),t)}u(t){this.V.setUint16(this.N(2),t,!1)}$(t){this.V.setUint32(this.N(4),t,!1)}_(t){this.V.setFloat32(this.N(4),t,!0)}j(t){this.V.setFloat64(this.N(8),t,!0)}I(t){const r=this.N(t.byteLength);let e=ArrayBuffer.isView(t)?t instanceof Uint8Array?t:new Uint8Array(t.buffer,t.byteOffset,t.byteLength):new Uint8Array(t);new Uint8Array(this.V.buffer,this.V.byteOffset+r,t.byteLength).set(e)}N(t){if(this.i+t>this.V.byteLength){const r=this.i+t-this.V.byteLength,e=Math.ceil(r/H.encodingBufferIncrement)*H.encodingBufferIncrement;this.W(this.V.byteLength+e)}const r=this.i;return this.i+=t,r}W(t){if(t>H.encodingBufferMaxSize)throw new TinybufError(`exceeded encodingBufferMaxSize: ${H.encodingBufferMaxSize}`);const r=new ArrayBuffer(t),e=new Uint8Array(this.V.buffer,this.V.byteOffset,this.V.byteLength);new Uint8Array(r).set(e),this.V=new DataView(r)}}class BufferReader{constructor(t,r){this.V=ArrayBuffer.isView(t)?new DataView(t.buffer,t.byteOffset,t.byteLength):new DataView(t),this.i=null!=r?r:0}p(){return this.V.getUint8(this.i)}T(){this.i++}F(){return this.V.getUint8(this.i++)}B(){const t=this.V.getUint16(this.i);return this.i+=2,t}m(){const t=this.V.getUint32(this.i);return this.i+=4,t}v(){return this.V.getInt8(this.i++)}U(){const t=this.V.getInt16(this.i,!0);return this.i+=2,t}S(){const t=this.V.getInt32(this.i,!0);return this.i+=4,t}k(){const t=this.V.getFloat32(this.i,!0);return this.i+=4,t}C(){const t=this.V.getFloat64(this.i,!0);return this.i+=8,t}O(t){if(this.V.byteOffset+this.i+t>this.V.byteLength)throw new RangeError("exceeded bytes");const r=new Uint8Array(this.V.buffer,this.V.byteOffset+this.i,t);return this.i+=t,r}}class MaybeType{constructor(t){this.type=t}}function optional(t){return new MaybeType(t)}function defineFormat(t,r){return null!==t&&"object"==typeof t?new BufferFormat(t):new BufferFormat(r,t)}class BufferFormat{get encodingBuffer(){var t;return null===(t=this.q)||void 0===t?void 0:t.V}constructor(t,r){if(this.J=!1,"number"==typeof t&&t>=0&&t<=19)this.P=t;else{if(t instanceof MaybeType)throw new TypeError("Format cannot be optional");if(!(t instanceof Object))throw new TypeError("Format must be object or Type");if(this.P=void 0,this.G=new Map,this.K=Object.keys(t).map((r=>{const e=new Field(r,t[r]);return this.G.set(r,e),e})),void 0===r)this.header=$hashCode(this.f),this.L=this.header;else if(null===r)this.header=void 0,this.L=void 0;else{if(!function isValidHeader(t){return"number"==typeof t?Number.isInteger(t)&&t>=0&&t<=65535:"string"==typeof t&&2===(new TextEncoder).encode(t).byteLength}(r))throw new TypeError(`Header must be uint16, 2 byte string, or null. Received: ${r}`);this.header=r,this.L="number"==typeof r?r:$strToHashCode(r)}}}get f(){return void 0===this.X&&(this.X=void 0!==this.K?`{${this.K.map((t=>t.f)).join(",")}}`:`${this.P}`),this.X}static Y(){return H.useGlobalEncodingBuffer?(BufferFormat.Z||(this.Z=new BufferWriter(H.encodingBufferInitialSize)),this.Z):new BufferWriter(H.encodingBufferInitialSize)}encode(t,r){return this.q||(this.q=BufferFormat.Y()),this.q.i=0,this.J&&(t=this.tt(t)),this.rt(t,this.q),(null!=r?r:H.safe)?this.q.R():this.q.D()}decode(t){return this.et(new BufferReader(t,void 0===this.header?0:2))}setTransforms(t){if(this.J=!0,"function"==typeof t||Array.isArray(t)&&"function"==typeof t[0])this.it=t;else for(const r of Object.keys(t)){const e=this.G.get(r);if(!e)throw new TypeError(`Failed to set transforms for field '${r}'`);e.nt.setTransforms(t[r])}return this}setValidation(t){if(this.J=!0,"function"==typeof t)this.st=t;else for(const r of Object.keys(t)){const e=this.G.get(r);if(!e)throw new TypeError(`Failed to set validation function for field '${r}'`);e.nt.setValidation(t[r])}return this}rt(t,r){if(void 0!==this.L&&r.u(this.L),void 0!==this.P){const e=this.st||this.it?this.tt(t):t;return U[this.P](e,r)}if("object"!=typeof t||!t)throw new TypeError("expected object type");for(const e of this.K){const i=t[e.ot];if(e.ht){if(null==i){E.o(!1,r);continue}E.o(!0,r)}else if(null==i)throw new Error(`missing required value: ${e.ot}`);e.ft?this.ut(i,r,e.nt):e.nt.rt(i,r)}}tt(t){return this.st&&this.ct(t),"function"==typeof this.it?this.it(t):Array.isArray(this.it)&&"function"==typeof this.it[0]?this.it[0](t):t}dt(t){return Array.isArray(this.it)&&"function"==typeof this.it[1]&&(t=this.it[1](t)),this.st&&this.ct(t),t}ct(t){if(!this.st)return;const r=this.st(t);if(r instanceof Error)throw r;if(!1===r)throw new Error("failed validation")}et(t){return this.et=this.$t(),this.et(t)}wt(){return`return{${this.K.map((({ot:t},r)=>`${t}:this.${this.lt.name}(${r},state)`)).join(",")}}`}lt(t,r){const e=this.K[t];if(!e.ht||E.l(r))return e.ft?this.yt(e.nt,r):e.nt.et(r)}$t(){return void 0!==this.P?this.J?t=>this.dt(x[this.P](t)):x[this.P]:new Function("state",this.wt())}ut(t,r,e){if(!Array.isArray(t))throw new TypeError(`expected array, instead got: ${t}`);a.o(t.length,r);for(let i=0;i<t.length;i++)e.rt(t[i],r)}yt(t,r){const e=new Array(a.l(r));for(let i=0;i<e.length;i++)e[i]=t.et(r);return e}}BufferFormat.peekHeader=peekHeader,BufferFormat.peekHeaderStr=peekHeaderStr;class Field{constructor(t,r){this.ht=r instanceof MaybeType;let e=r instanceof MaybeType?r.type:r;if(this.ot=t,Array.isArray(e)){if(1!==e.length)throw new TypeError("Array type must contain exactly one format");e=e[0],this.ft=!0}else this.ft=!1;this.nt=new BufferFormat(e,null)}get f(){return void 0===this.bt&&(this.bt=`${this.nt.f}${this.ft?"[]":""}${this.ht?"?":""}`),this.bt}}export{TinybufError,bufferParser,defineFormat,f16round,mask,optional,peekHeader,peekHeaderStr,scalround,setTinybufConfig,unmask,uscalround};
//# sourceMappingURL=index.mjs.map
