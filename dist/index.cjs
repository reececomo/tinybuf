class TinybufError extends Error{}class EncodeError extends TinybufError{constructor(t,r){super(`failed to encode '${t}' (data: ${r})`)}}class DecodeError extends TinybufError{constructor(t,r){super(`${t}: ${r.message}`),this.cause=r,this.stack=r.stack}}function $hashCode(t){let r=5381;for(let e=0;e<t.length;e++)r=33*r^t.charCodeAt(e);return 65535&r}function $strToHashCode(t){return 2!==t.length?$hashCode(t):256*t.charCodeAt(0)+t.charCodeAt(1)}function $hashCodeToStr(t){return String.fromCharCode(Math.floor(t/256))+String.fromCharCode(t%256)}function peekHeader(t){return(ArrayBuffer.isView(t)?new DataView(t.buffer,t.byteOffset,2):new DataView(t,0,2)).getUint16(0,!1)}function peekHeaderStr(t){return $hashCodeToStr(peekHeader(t))}class BufferParser{constructor(){this.t=new Map}processBuffer(t){let r,e,i;try{const n=peekHeader(t);if(!this.t.has(n))throw new TinybufError(`Unknown format: ${n} '${$hashCodeToStr(n)}')`);[r,i]=this.t.get(n),e=r.decode(t)}catch(t){throw new DecodeError("Failed to decode",t)}i(e)}on(t,r,e=!1){if(null==t.header)throw new TinybufError("Format requires header");const i="string"==typeof t.header?$strToHashCode(t.header):t.header;if(this.t.has(i)&&!e)throw new TinybufError(`Format header collision: ${t.header}`);return this.t.set(i,[t,r]),this}ignore(...t){return t.forEach((t=>this.on(t,(()=>{}),!0))),this}clear(){this.t.clear()}}const t=Math.floor,r=Math.ceil,$clamp=(t,r,e)=>t>e?e:t<r?r:t,$roundTowardZero=e=>e<0?r(e):t(e),$roundAwayFromZero=e=>e<0?t(e):r(e);function $touscal8(t){return $clamp(127+$roundTowardZero(254*t-127),0,254)}function $toscal8(t){return $clamp($roundTowardZero(127*t),-127,127)+127}function $fromuscal8(t){return $clamp(.01*($roundAwayFromZero(.3937007874015748*(t-127))+50),0,1)}function $fromscal8(t){return $clamp(.01*$roundAwayFromZero(.787401574803149*(t-127)),-1,1)}const mask=t=>(t.length>30&&(t=t.slice(0,30)),t.reduce(((t,r)=>t<<1|r),1)),unmask=(t,r=31-Math.clz32(t))=>{const e=new Array(r);for(let i=0;i<r;i++)e[i]=!!(t&1<<r-1-i);return e},e=new TextEncoder,i=new TextDecoder("utf-8");const n=function(){const t=new Float32Array(1),r=new Int32Array(t.buffer);return function(e){t[0]=e;let i=r[0],n=i>>16&32768,s=4096+(2147483647&i)|0;return s>=1199570944?(2147483647&i)<1199570944?31743|n:s<2139095040?31744|n:31744|n|(8388607&i)>>13:s>=947912704?n|s-939524096>>13:s<855638016?n:(s=(2147483647&i)>>23,n|(8388607&i|8388608)+(8388608>>>s-102)>>126-s)}}(),s=function(){const t=Math.pow(2,-24),r=new Float32Array(1056);for(let t=0;t<32;t++)r[t]=Math.pow(2,t-15);for(let t=0;t<1024;t++)r[t+32]=1+t/1024;return function(e){const i=32768&~e?1:-1,n=31744&e,s=1023&e;return 0===n?0===s?0*i:i*t:31744===n?0===s?i*(1/0):NaN:r[n>>10]*r[s+32]*i}}(),o=268435456,a=4294967296,h={o:(r,e)=>{r<128?e.h(r):r<16384?e.u(r+32768):r<536870912?e.$(r+3221225472):(e.$(t(r/a)+3758096384),e.$(r>>>0))},l:t=>{const r=t.p();return 128&r?64&r?32&r?(t.m()-3758096384)*a+t.m():t.m()-3221225472:t.B()-32768:(t.T(),r)}},f={o:(t,r)=>r.h(t),l:t=>t.A()},u={o:(t,r)=>r.u(t),l:t=>t.B()},c={o:(t,r)=>r.$(t),l:t=>t.m()},d={o:(r,e)=>{if(r>=-64&&r<64)e.h(127&r);else if(r>=-8192&&r<8192)e.u(32768+(16383&r));else if(r>=-268435456&&r<o)e.$(3221225472+(536870911&r));else{const i=r;e.$(3758096384+(536870911&t(i/a))),e.$(i>>>0)}},l:t=>{let r,e=t.p();return 128&e?64&e?32&e?(r=t.m()-3758096384,r=268435456&r?3758096384|r:r,r*a+t.m()):(r=t.m()-3221225472,268435456&r?3758096384|r:r):(r=t.B()-32768,8192&r?4294950912|r:r):(t.T(),64&e?4294967168|e:e)}},$={o:(t,r)=>r.F(t),l:t=>t.v()},w={o:(t,r)=>r.U(t),l:t=>t.O()},l={o:(t,r)=>r.k(t),l:t=>t.H()},p={o:(t,r)=>r.u(n(t)),l:t=>s(t.B())},y={o:(t,r)=>r._(t),l:t=>t.j()},m={o:(t,r)=>r.D(t),l:t=>t.I()},b={o:(t,r)=>r.h($touscal8(t)),l:t=>$fromuscal8(t.A())},B={o:(t,r)=>r.h($toscal8(t)),l:t=>$fromscal8(t.A())},E={o:(t,r)=>d.o(t.getTime(),r),l:t=>new Date(d.l(t))},T={o:(t,r)=>{return A.o((i=t,e.encode(i)),r);var i},l:t=>{return r=A.l(t),i.decode(r);var r}},A={o:(t,r)=>{h.o(t.byteLength,r),r.S(t)},l:t=>t.M(h.l(t))},F={o:(t,r)=>r.h(t?1:0),l:t=>0!==t.A()},x={o:(t,r)=>h.o(mask(t),r),l:t=>unmask(h.l(t))},v={o:(t,r)=>T.o(JSON.stringify(t),r),l:t=>JSON.parse(T.l(t))},g={o:(t,r)=>{r.h(mask([t.global,t.ignoreCase,t.multiline])),T.o(t.source,r)},l:t=>{const[r,e,i]=unmask(t.A());return new RegExp(T.l(t),(r?"g":"")+(e?"i":"")+(i?"m":""))}},U=[h.o,f.o,u.o,c.o,d.o,$.o,w.o,l.o,m.o,y.o,p.o,B.o,b.o,F.o,x.o,T.o,A.o,v.o,g.o,E.o],O=[h.l,f.l,u.l,c.l,d.l,$.l,w.l,l.l,m.l,y.l,p.l,B.l,b.l,F.l,x.l,T.l,A.l,v.l,g.l,E.l];let k={safe:!1,useGlobalEncodingBuffer:!0,encodingBufferMaxSize:1500,encodingBufferInitialSize:256,encodingBufferIncrement:256};class BufferWriter{constructor(t){this.i=0,this.C="number"==typeof t?new DataView(new ArrayBuffer(t)):new DataView(t)}V(){return new Uint8Array(this.C.buffer,this.C.byteOffset,this.i)}R(){return new Uint8Array(this.C.buffer.slice(0,this.i))}F(t){this.C.setInt8(this.N(1),t)}U(t){this.C.setInt16(this.N(2),t,!0)}k(t){this.C.setInt32(this.N(4),t,!0)}h(t){this.C.setUint8(this.N(1),t)}u(t){this.C.setUint16(this.N(2),t,!1)}$(t){this.C.setUint32(this.N(4),t,!1)}_(t){this.C.setFloat32(this.N(4),t,!0)}D(t){this.C.setFloat64(this.N(8),t,!0)}S(t){const r=this.N(t.byteLength),e=ArrayBuffer.isView(t)?t instanceof Uint8Array?t:new Uint8Array(t.buffer,t.byteOffset,t.byteLength):new Uint8Array(t);new Uint8Array(this.C.buffer,r,t.byteLength).set(e)}N(t){if(this.i+t>this.C.byteLength){const r=this.i+t-this.C.byteLength,e=Math.ceil(r/k.encodingBufferIncrement)*k.encodingBufferIncrement;this.W(this.C.byteLength+e)}const r=this.i;return this.i+=t,r}W(t){if(t>k.encodingBufferMaxSize)throw new EncodeError(`exceeded max encoding buffer size: ${k.encodingBufferMaxSize}`);const r=new ArrayBuffer(t),e=new Uint8Array(this.C.buffer,this.C.byteOffset,this.C.byteLength);new Uint8Array(r).set(e),this.C=new DataView(r)}}class BufferReader{constructor(t,r){this.C=ArrayBuffer.isView(t)?new DataView(t.buffer,t.byteOffset,t.byteLength):new DataView(t),this.i=null!=r?r:0}p(){return this.C.getUint8(this.i)}T(){this.i++}A(){return this.C.getUint8(this.i++)}B(){const t=this.C.getUint16(this.i);return this.i+=2,t}m(){const t=this.C.getUint32(this.i);return this.i+=4,t}v(){return this.C.getInt8(this.i++)}O(){const t=this.C.getInt16(this.i,!0);return this.i+=2,t}H(){const t=this.C.getInt32(this.i,!0);return this.i+=4,t}j(){const t=this.C.getFloat32(this.i,!0);return this.i+=4,t}I(){const t=this.C.getFloat64(this.i,!0);return this.i+=8,t}M(t){if(this.i+t>this.C.byteLength)throw new RangeError;const r=new Uint8Array(this.C.buffer,this.i,t);return this.i+=t,r}}class OptionalType{constructor(t){this.type=t}}class BufferFormat{constructor(t,r){if(this.J=!1,"number"==typeof t)this.P=t;else{if(t instanceof OptionalType)throw new TypeError("Invalid encoding format: Root object cannot be optional.");if(!(t instanceof Object))throw new TypeError("Invalid encoding format: Must be an object, or a known coder type.");if(this.P=void 0,this.q=new Map,this.G=Object.keys(t).map((r=>{const e=new Field(r,t[r]);return this.q.set(r,e),e})),void 0===r)this.header=$hashCode(this.f),this.K=this.header;else if(null===r)this.header=void 0,this.K=void 0;else{if(!function isValidHeader(t){return"number"==typeof t?Number.isInteger(t)&&t>=0&&t<=65535:"string"==typeof t&&2===(new TextEncoder).encode(t).byteLength}(r))throw new TypeError(`Header should be an integer between 0 and 65535, a 2-byte string, or null. Received: ${r}`);this.header=r,this.K="number"==typeof r?r:$strToHashCode(r)}}}get f(){return void 0===this.L&&(this.L=void 0!==this.G?`{${this.G.map((t=>t.f)).join(",")}}`:`${this.P}`),this.L}static X(){return k.useGlobalEncodingBuffer?(BufferFormat.Y||(this.Y=new BufferWriter(k.encodingBufferInitialSize)),this.Y):new BufferWriter(k.encodingBufferInitialSize)}encode(t,r){return this.Z||(this.Z=BufferFormat.X()),this.Z.i=0,this.J&&(t=this.tt(t)),this.rt(t,this.Z),(null!=r?r:k.safe)?this.Z.R():this.Z.V()}decode(t){return this.et(new BufferReader(t,void 0===this.header?0:2))}setTransforms(t){if(this.J=!0,"function"==typeof t||Array.isArray(t)&&"function"==typeof t[0])this.it=t;else for(const r of Object.keys(t)){const e=this.q.get(r);if(!e)throw new TypeError(`Failed to set transforms for field '${r}'`);e.nt.setTransforms(t[r])}return this}setValidation(t){if(this.J=!0,"function"==typeof t)this.st=t;else for(const r of Object.keys(t)){const e=this.q.get(r);if(!e)throw new TypeError(`Failed to set validation function for field '${r}'`);e.nt.setValidation(t[r])}return this}rt(t,r){if(void 0!==this.K&&this.Z.u(this.K),void 0!==this.P){const e=this.st||this.it?this.tt(t):t;return U[this.P](e,r)}if(!t||"object"!=typeof t)throw new TypeError("expected object type");for(const e of this.G){const i=t[e.ot];if(e.ht){if(null==i){F.o(!1,r);continue}F.o(!0,r)}e.ft?this.ut(i,r,e.nt):e.nt.rt(i,r)}}tt(t){if(this.st&&!1===this.st(t))throw new Error("failed validation");return"function"==typeof this.it?this.it(t):Array.isArray(this.it)&&"function"==typeof this.it[0]?this.it[0](t):t}ct(t){return Array.isArray(this.it)&&"function"==typeof this.it[1]&&(t=this.it[1](t)),void 0!==this.st&&this.st(t),t}et(t){return this.et=this.dt(),this.et(t)}$t(){return`return{${this.G.map((({ot:t},r)=>`${t}:this.${this.wt.name}(${r},state)`)).join(",")}}`}wt(t,r){const e=this.G[t];if(!e.ht||this.lt(r))return e.ft?this.yt(e.nt,r):e.nt.et(r)}dt(){return void 0!==this.P?this.J?t=>this.ct(O[this.P](t)):O[this.P]:new Function("state",this.$t())}ut(t,r,e){if(!Array.isArray(t))throw new EncodeError(`Array<${e.P}>`,r);h.o(t.length,r);for(let i=0;i<t.length;i++)e.rt(t[i],r)}yt(t,r){const e=new Array(h.l(r));for(let i=0;i<e.length;i++)e[i]=t.et(r);return e}lt(t){return F.l(t)}}BufferFormat.peekHeader=peekHeader,BufferFormat.peekHeaderStr=peekHeaderStr;class Field{constructor(t,r){this.ht=r instanceof OptionalType;let e=r instanceof OptionalType?r.type:r;if(this.ot=t,Array.isArray(e)){if(1!==e.length)throw new TypeError("Invalid array definition, it must have exactly one element");e=e[0],this.ft=!0}else this.ft=!1;this.nt=new BufferFormat(e,null)}get f(){return void 0===this.bt&&(this.bt=`${this.nt.f}${this.ft?"[]":""}${this.ht?"?":""}`),this.bt}}exports.DecodeError=DecodeError,exports.TinybufError=TinybufError,exports.bufferParser=()=>new BufferParser,exports.defineFormat=function defineFormat(t,r){return null!==t&&"object"==typeof t?new BufferFormat(t):new BufferFormat(r,t)},exports.f16round=function f16round(t){return s(n(t))},exports.mask=mask,exports.optional=function optional(t){return new OptionalType(t)},exports.peekHeader=peekHeader,exports.peekHeaderStr=peekHeaderStr,exports.scalround=function scalround(t){return $fromscal8($toscal8(t))},exports.setTinybufConfig=t=>{k=Object.assign(Object.assign({},k),t)},exports.unmask=unmask,exports.uscalround=function uscalround(t){return $fromuscal8($touscal8(t))};
//# sourceMappingURL=index.cjs.map
