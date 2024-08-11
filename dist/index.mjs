class TinybufError extends Error{}class EncodeError extends TinybufError{constructor(t,r){super(`failed to encode '${t}' (data: ${r})`)}}class DecodeError extends TinybufError{constructor(t,r){super(`${t}: ${r.message}`),this.cause=r,this.stack=r.stack}}function $hashCode(t){let r=5381;for(let e=0;e<t.length;e++)r=33*r^t.charCodeAt(e);return 65535&r}function $strToHashCode(t){return 2!==t.length?$hashCode(t):256*t.charCodeAt(0)+t.charCodeAt(1)}function $hashCodeToStr(t){return String.fromCharCode(Math.floor(t/256))+String.fromCharCode(t%256)}function peekHeader(t){return new DataView(t instanceof ArrayBuffer?t:t.buffer).getUint16(0,!1)}function peekHeaderStr(t){return $hashCodeToStr(peekHeader(t))}const bufferParser=()=>new BufferParser;class BufferParser{constructor(){this.t=new Map}processBuffer(t){let r,e,i;try{const n=peekHeader(t);if(!this.t.has(n))throw new TinybufError(`Unknown format: ${n} '${$hashCodeToStr(n)}')`);[r,i]=this.t.get(n),e=r.decode(t)}catch(t){throw new DecodeError("Failed to decode",t)}i(e)}on(t,r,e=!1){if(null==t.header)throw new TinybufError("Format requires header");const i="string"==typeof t.header?$strToHashCode(t.header):t.header;if(this.t.has(i)&&!e)throw new TinybufError(`Format header collision: ${t.header}`);return this.t.set(i,[t,r]),this}ignore(...t){return t.forEach((t=>this.on(t,(()=>{}),!0))),this}clear(){this.t.clear()}}const t=Math.floor,r=Math.ceil,$clamp=(t,r,e)=>t>e?e:t<r?r:t,$roundTowardZero=e=>e<0?r(e):t(e),$roundAwayFromZero=e=>e<0?t(e):r(e);function uscalround(t){return $fromuscal8($touscal8(t))}function scalround(t){return $fromscal8($toscal8(t))}function $touscal8(t){return $clamp(127+$roundTowardZero(254*t-127),0,254)}function $toscal8(t){return $clamp($roundTowardZero(127*t),-127,127)+127}function $fromuscal8(t){return $clamp(.01*($roundAwayFromZero(.3937007874015748*(t-127))+50),0,1)}function $fromscal8(t){return $clamp(.01*$roundAwayFromZero(.787401574803149*(t-127)),-1,1)}const mask=(t,r=1)=>t.slice(0,30).reduce(((t,r)=>t<<1|r),r),unmask=(t,r=31-Math.clz32(t))=>{const e=new Array(r);for(let i=0;i<r;i++)e[i]=!!(t&1<<r-1-i);return e},e=new TextEncoder,i=new TextDecoder("utf-8"),n=268435456,s=4294967296,o={o:function(t,r){t<128?r.h(t):t<16384?r.u(t+32768):t<536870912?r.$(t+3221225472):(r.$(Math.floor(t/s)+3758096384),r.$(t>>>0))},l:t=>{const r=t.p();return 128&r?64&r?32&r?(t.F()-3758096384)*s+t.F():t.F()-3221225472:t.m()-32768:(t.B(),r)}},a={o:function(t,r){if(t>=-64&&t<64)r.h(127&t);else if(t>=-8192&&t<8192)r.u(32768+(16383&t));else if(t>=-268435456&&t<n)r.$(3221225472+(536870911&t));else{const e=t;r.$(3758096384+(536870911&Math.floor(e/s))),r.$(e>>>0)}},l:t=>{let r,e=t.p();return 128&e?64&e?32&e?(r=t.F()-3758096384,r=268435456&r?3758096384|r:r,r*s+t.F()):(r=t.F()-3221225472,268435456&r?3758096384|r:r):(r=t.m()-32768,8192&r?4294950912|r:r):(t.B(),64&e?4294967168|e:e)}},h={o:(t,r)=>a.o(t.getTime(),r),l:t=>new Date(a.l(t))},f={o:function(t,r){var i;c.o((i=t,e.encode(i)),r)},l:t=>{return r=c.l(t),i.decode(r);var r}},c={o:function(t,r){o.o(t.byteLength,r),r.A(t)},l:t=>t.T(o.l(t))},u={o:(t,r)=>r.h(t?1:0),l:t=>0!==t.v()},d={o:(t,r)=>o.o(mask(t),r),l:t=>unmask(o.l(t))},$={o:(t,r)=>f.o(JSON.stringify(t),r),l:t=>JSON.parse(f.l(t))},l={o:function(t,r){r.h(mask([t.global,t.ignoreCase,t.multiline])),f.o(t.source,r)},l:t=>{const[r,e,i]=unmask(t.v());return new RegExp(f.l(t),(r?"g":"")+(e?"i":"")+(i?"m":""))}},w=[o,{o:(t,r)=>r.h(t),l:t=>t.v()},{o:(t,r)=>r.u(t),l:t=>t.m()},{o:(t,r)=>r.$(t),l:t=>t.F()},a,{o:(t,r)=>r.U(t),l:t=>t.I()},{o:(t,r)=>r.O(t),l:t=>t.k()},{o:(t,r)=>r.H(t),l:t=>t.M()},{o:(t,r)=>r.j(t),l:t=>t.S()},{o:(t,r)=>r._(t),l:t=>t.C()},{o:(t,r)=>r.D(t),l:t=>t.R()},{o:(t,r)=>r.h($toscal8(t)),l:t=>$fromscal8(t.v())},{o:(t,r)=>r.h($touscal8(t)),l:t=>$fromuscal8(t.v())},u,d,f,c,$,l,h],setTinybufConfig=t=>{y=Object.assign(Object.assign({},y),t)};let y={safe:!1,useGlobalEncodingBuffer:!0,encodingBufferMaxSize:1500,encodingBufferInitialSize:256,encodingBufferIncrement:256};function f16round(t){return F(p(t))}const p=function(){const t=new Float32Array(1),r=new Int32Array(t.buffer);return function(e){t[0]=e;let i=r[0],n=i>>16&32768,s=4096+(2147483647&i)|0;return s>=1199570944?(2147483647&i)<1199570944?31743|n:s<2139095040?31744|n:31744|n|(8388607&i)>>13:s>=947912704?n|s-939524096>>13:s<855638016?n:(s=(2147483647&i)>>23,n|(8388607&i|8388608)+(8388608>>>s-102)>>126-s)}}(),F=function(){const t=Float64Array.from({length:32},((t,r)=>Math.pow(2,r-15))),r=Float64Array.from({length:1024},((t,r)=>1+r/1024)),e=Math.pow(2,-24);return function(i){const n=32768&~i?1:-1,s=31744&i,o=1023&i;return 0===s?0===o?0*n:n*e:31744===s?0===o?n*(1/0):NaN:n*t[s>>10]*r[o]}}();class BufferWriter{constructor(t){this.V=0,t instanceof ArrayBuffer?(this.N=t,this.W=!1):(this.N=new ArrayBuffer(t),this.W=!0),this.J=new DataView(this.N,0,this.N.byteLength)}P(){return new Uint8Array(this.J.buffer,0,this.V)}q(){return new Uint8Array(this.J.buffer.slice(0,this.V))}U(t){this.J.setInt8(this.G(1),t)}O(t){this.J.setInt16(this.G(2),t,!0)}H(t){this.J.setInt32(this.G(4),t,!0)}h(t){this.J.setUint8(this.G(1),t)}u(t){this.J.setUint16(this.G(2),t,!1)}$(t){this.J.setUint32(this.G(4),t,!1)}D(t){this.J.setUint16(this.G(2),p(t),!0)}_(t){this.J.setFloat32(this.G(4),t,!0)}j(t){this.J.setFloat64(this.G(8),t,!0)}A(t){const r=this.G(t.byteLength),e=t instanceof Uint8Array?t:t instanceof ArrayBuffer?new Uint8Array(t):new Uint8Array(t.buffer,t.byteOffset,t.byteLength);new Uint8Array(this.J.buffer,r,t.byteLength).set(e)}G(t){if(this.V+t<=this.J.byteLength){const r=this.V;return this.V+=t,r}const r=this.J.byteLength,e=r+t;if(!this.W||e>y.encodingBufferMaxSize)throw new EncodeError(`exceeded max encoding buffer size: ${y.encodingBufferMaxSize}`);let i=this.J.byteLength;do{i=Math.min(i+y.encodingBufferIncrement,y.encodingBufferMaxSize)}while(i<this.V+t);const n=new ArrayBuffer(i),s=new Uint8Array(this.J.buffer,this.J.byteOffset,r);new Uint8Array(n).set(s),this.N=n,this.J=new DataView(n);const o=this.V;return this.V+=t,o}}class BufferReader{constructor(t,r){this.J=t instanceof ArrayBuffer?new DataView(t):new DataView(t.buffer,t.byteOffset,t.byteLength),this.i=null!=r?r:0}p(){return this.J.getUint8(this.i)}B(){this.i++}v(){return this.J.getUint8(this.i++)}m(){const t=this.J.getUint16(this.i);return this.i+=2,t}F(){const t=this.J.getUint32(this.i);return this.i+=4,t}I(){return this.J.getInt8(this.i++)}k(){const t=this.J.getInt16(this.i,!0);return this.i+=2,t}M(){const t=this.J.getInt32(this.i,!0);return this.i+=4,t}R(){const t=this.J.getUint16(this.i,!0);return this.i+=2,F(t)}C(){const t=this.J.getFloat32(this.i,!0);return this.i+=4,t}S(){const t=this.J.getFloat64(this.i,!0);return this.i+=8,t}T(t){if(this.i+t>this.J.byteLength)throw new RangeError;const r=new Uint8Array(this.J.buffer,this.i,t);return this.i+=t,r}}class OptionalType{constructor(t){this.type=t}}function optional(t){return new OptionalType(t)}function defineFormat(t,r){return null!==t&&"object"==typeof t?new BufferFormat(t):new BufferFormat(r,t)}class BufferFormat{constructor(t,r){if(this.K=!1,t instanceof OptionalType)throw new TypeError("Invalid encoding format: Root object cannot be optional.");if(void 0!==t&&"number"==typeof t)this.L=t;else{if(!(t instanceof Object))throw new TypeError("Invalid encoding format: Must be an object, or a known coder type.");if(this.L=void 0,this.X=new Map,this.Y=Object.keys(t).map((r=>{const e=new Field(r,t[r]);return this.X.set(r,e),e})),void 0===r)this.header=$hashCode(this.f),this.Z=this.header;else if(null===r)this.header=void 0,this.Z=void 0;else{if(!function isValidHeader(t){return"number"==typeof t?Number.isInteger(t)&&t>=0&&t<=65535:"string"==typeof t&&2===(new TextEncoder).encode(t).byteLength}(r))throw new TypeError(`Header should be an integer between 0 and 65535, a 2-byte string, or null. Received: ${r}`);this.header=r,this.Z="number"==typeof r?r:$strToHashCode(r)}}}get f(){return void 0===this.tt&&(this.tt=void 0!==this.Y?`{${this.Y.map((t=>t.f)).join(",")}}`:`${this.L}`),this.tt}static rt(){return y.useGlobalEncodingBuffer?(BufferFormat.et||(BufferFormat.et=new ArrayBuffer(y.encodingBufferMaxSize)),new BufferWriter(BufferFormat.et)):new BufferWriter(y.encodingBufferInitialSize)}encode(t,r){return this.it||(this.it=BufferFormat.rt()),this.it.V=0,this.K&&(t=this.nt(t)),this.st(t,this.it),(null!=r?r:y.safe)?this.it.q():this.it.P()}decode(t){return this.ot(new BufferReader(t,void 0===this.header?0:2))}setTransforms(t){if(this.K=!0,t instanceof Function||Array.isArray(t)&&t[0]instanceof Function)this.ht=t;else for(const r of Object.keys(t)){const e=this.X.get(r);if(!e)throw new TypeError(`Failed to set transforms for field '${r}'`);e.ft.setTransforms(t[r])}return this}setValidation(t){if(this.K=!0,t instanceof Function)this.ct=t;else for(const r of Object.keys(t)){const e=this.X.get(r);if(!e)throw new TypeError(`Failed to set validation function for field '${r}'`);e.ft.setValidation(t[r])}return this}st(t,r){if(void 0!==this.Z&&this.it.u(this.Z),void 0!==this.L){const e=this.ct||this.ht?this.nt(t):t;return w[this.L].o(e,r)}if(!t||"object"!=typeof t)throw new TypeError("expected object type");for(const e of this.Y){const i=t[e.ut];if(e.dt){if(null==i){u.o(!1,r);continue}u.o(!0,r)}e.$t?this.lt(i,r,e.ft):e.ft.st(i,r)}}nt(t){if(this.ct&&!1===this.ct(t))throw new Error("failed validation");return this.ht instanceof Function?this.ht(t):Array.isArray(this.ht)&&this.ht[0]instanceof Function?this.ht[0](t):t}wt(t){return Array.isArray(this.ht)&&this.ht[1]instanceof Function&&(t=this.ht[1](t)),this.ct instanceof Function&&this.ct(t),t}ot(t){return this.ot=this.yt(),this.ot(t)}Ft(){return`return{${this.Y.map((({ut:t},r)=>`${t}:this.${this.Bt.name}(${r},state)`)).join(",")}}`}Bt(t,r){const e=this.Y[t];if(!e.dt||this.bt(r))return e.$t?this.At(e.ft,r):e.ft.ot(r)}yt(){return void 0!==this.L?this.K?t=>this.wt(w[this.L].l(t)):w[this.L].l:new Function("state",this.Ft())}lt(t,r,e){if(!Array.isArray(t))throw new EncodeError(`Array<${e.L}>`,r);let i,n;for(n=t.length,o.o(n,r),i=0;i<n;i++)e.st(t[i],r)}At(t,r){const e=new Array(o.l(r));for(let i=0;i<e.length;i++)e[i]=t.ot(r);return e}bt(t){return u.l(t)}}BufferFormat.peekHeader=peekHeader,BufferFormat.peekHeaderStr=peekHeaderStr;class Field{constructor(t,r){this.dt=r instanceof OptionalType;let e=r instanceof OptionalType?r.type:r;if(this.ut=t,Array.isArray(e)){if(1!==e.length)throw new TypeError("Invalid array definition, it must have exactly one element");e=e[0],this.$t=!0}else this.$t=!1;this.ft=new BufferFormat(e,null)}get f(){return void 0===this.Et&&(this.Et=`${this.ft.f}${this.$t?"[]":""}${this.dt?"?":""}`),this.Et}}export{DecodeError,TinybufError,bufferParser,defineFormat,f16round,mask,optional,peekHeader,peekHeaderStr,scalround,setTinybufConfig,unmask,uscalround};
//# sourceMappingURL=index.mjs.map
