class t extends Error{}class e extends t{constructor(t,e,r){super(`Failed to encode ${e} as '${t}'${r?` (path: '${r}')`:""}`)}}class r extends t{constructor(t,e){super(`${t}: ${e.message}`),this.cause=e,this.stack=e.stack}}function i(t){let e=5381;for(let r=0;r<t.length;r++)e=33*e^t.charCodeAt(r);return 65535&e}function n(t){return 2!==t.length?i(t):256*t.charCodeAt(0)+t.charCodeAt(1)}function s(t){return String.fromCharCode(Math.floor(t/256))+String.fromCharCode(t%256)}function o(t){return new DataView(t instanceof ArrayBuffer?t:t.buffer).getUint16(0,!1)}function h(t){return s(o(t))}const a=()=>new c;class c{constructor(){this.t=new Map}processBuffer(e){let i,n,h;try{const r=o(e);if(!this.t.has(r))throw new t(`Unknown format: ${r} '${s(r)}')`);[i,h]=this.t.get(r),n=i.decode(e)}catch(t){throw new r("Failed to decode",t)}h(n)}on(e,r,i=!1){if(null==e.header)throw new t("Format requires header");const s="string"==typeof e.header?n(e.header):e.header;if(this.t.has(s)&&!i)throw new t(`Format header collision: ${e.header}`);return this.t.set(s,[e,r]),this}ignore(...t){return t.forEach((t=>this.on(t,(()=>{}),!0))),this}clear(){this.t.clear()}}const u=Math.floor,f=Math.ceil,w=(t,e,r)=>t>r?r:t<e?e:t,$=t=>t<0?f(t):u(t),d=t=>t<0?u(t):f(t);function l(t){return F(p(t))}function y(t){return b(A(t))}function p(t){return w(127+$(254*t-127),0,254)}function A(t){return w($(127*t),-127,127)+127}function F(t){return w(.01*(d(.3937007874015748*(t-127))+50),0,1)}function b(t){return w(.01*d(.787401574803149*(t-127)),-1,1)}const g=(t,e=1)=>t.slice(0,30).reduce(((t,e)=>t<<1|e),e),v=(t,e=31-Math.clz32(t))=>Array.from({length:e},((r,i)=>1==(t>>e-1-i&1))),m=new TextEncoder,U=new TextDecoder("utf-8"),B=268435456,E=4294967296,I={o:(t,e)=>{t<128?e.h(t):t<16384?e.u(t+32768):t<536870912?e.$(t+3221225472):(e.$(u(t/E)+3758096384),e.$(t>>>0))},l:t=>{const e=t.p();return 128&e?64&e?32&e?(t.A()-3758096384)*E+t.A():t.A()-3221225472:t.F()-32768:(t.v(),e)}},x={o:(t,e)=>{if(t>=-64&&t<64)e.h(127&t);else if(t>=-8192&&t<8192)e.u(32768+(16383&t));else if(t>=-268435456&&t<B)e.$(3221225472+(536870911&t));else{const r=t;e.$(3758096384+(536870911&u(r/E))),e.$(r>>>0)}},l:t=>{let e,r=t.p();return 128&r?64&r?32&r?(e=t.A()-3758096384,e=268435456&e?3758096384|e:e,e*E+t.A()):(e=t.A()-3221225472,268435456&e?3758096384|e:e):(e=t.F()-32768,8192&e?4294950912|e:e):(t.v(),64&r?4294967168|r:r)}},j={o:(t,e,r)=>x.o(t.getTime(),e,r),l:t=>new Date(x.l(t))},_={o:(t,e,r)=>{var i;M.o((i=t,m.encode(i)),e,r)},l:t=>{return e=M.l(t),U.decode(e);var e}},M={o:(t,e,r)=>{I.o(t.byteLength,e,r),e.m(t)},l:t=>t.U(I.l(t))},T={o:(t,e)=>e.h(t?1:0),l:t=>0!==t.B()},O={o:(t,e)=>I.o(g(t),e),l:t=>v(I.l(t))},D={o:(t,e,r)=>_.o(JSON.stringify(t),e,r),l:t=>JSON.parse(_.l(t))},V={o:(t,e,r)=>{e.h(g([t.global,t.ignoreCase,t.multiline])),_.o(t.source,e,r)},l:t=>{const[e,r,i]=v(t.B());return new RegExp(_.l(t),(e?"g":"")+(r?"i":"")+(i?"m":""))}},R=[I,{o:(t,e,r)=>{e.h(t)},l:t=>t.B()},{o:(t,e)=>{e.u(t)},l:t=>t.F()},{o:(t,e)=>{e.$(t)},l:t=>t.A()},x,{o:(t,e,r)=>e.I(t),l:t=>t.j()},{o:(t,e,r)=>e._(t),l:t=>t.M()},{o:(t,e,r)=>e.T(t),l:t=>t.O()},{o:(t,e,r)=>e.D(t),l:t=>t.V()},{o:(t,e,r)=>e.R(t),l:t=>t.S()},{o:(t,e,r)=>e.k(t),l:t=>t.N()},{o:(t,e,r)=>e.h(A(t)),l:t=>b(t.B())},{o:(t,e,r)=>e.h(p(t)),l:t=>F(t.B())},T,O,_,M,D,V,j],S=t=>{k=Object.assign(Object.assign({},k),t)};let k={safe:!1,useGlobalEncodingBuffer:!0,encodingBufferMaxSize:1500,encodingBufferInitialSize:256,encodingBufferIncrement:256};function N(t){return J(z(t))}const z=function(){const t=new Float32Array(1),e=new Int32Array(t.buffer);return function(r){t[0]=r;let i=e[0],n=i>>16&32768,s=4096+(2147483647&i)|0;return s>=1199570944?(2147483647&i)<1199570944?31743|n:s<2139095040?31744|n:31744|n|(8388607&i)>>13:s>=947912704?n|s-939524096>>13:s<855638016?n:(s=(2147483647&i)>>23,n|(8388607&i|8388608)+(8388608>>>s-102)>>126-s)}}(),J=function(){const t=Float64Array.from({length:32},((t,e)=>Math.pow(2,e-15))),e=Float64Array.from({length:1024},((t,e)=>1+e/1024)),r=Math.pow(2,-24);return function(i){const n=32768&~i?1:-1,s=31744&i,o=1023&i;return 0===s?0===o?0*n:n*r:31744===s?0===o?n*(1/0):NaN:n*t[s>>10]*e[o]}}();class q{constructor(t){this.J=0,t instanceof ArrayBuffer?(this.q=t,this.C=!1):(this.q=new ArrayBuffer(t),this.C=!0),this.G=new DataView(this.q,0,this.q.byteLength)}H(){return new Uint8Array(this.G.buffer,0,this.J)}W(){return new Uint8Array(this.G.buffer.slice(0,this.J))}I(t){this.G.setInt8(this.K(1),t)}_(t){this.G.setInt16(this.K(2),t,!0)}T(t){this.G.setInt32(this.K(4),t,!0)}h(t){this.G.setUint8(this.K(1),t)}u(t){this.G.setUint16(this.K(2),t)}$(t){this.G.setUint32(this.K(4),t)}k(t){this.G.setUint16(this.K(2),z(t))}R(t){this.G.setFloat32(this.K(4),t,!0)}D(t){this.G.setFloat64(this.K(8),t,!0)}m(t){const e=this.K(t.byteLength),r=t instanceof Uint8Array?t:t instanceof ArrayBuffer?new Uint8Array(t):new Uint8Array(t.buffer,t.byteOffset,t.byteLength);new Uint8Array(this.G.buffer,e,t.byteLength).set(r)}K(t){if(this.J+t<=this.G.byteLength){const e=this.J;return this.J+=t,e}const r=this.G.byteLength,i=r+t;if(!this.C||i>k.encodingBufferMaxSize)throw new e(`exceeded max encoding buffer size: ${k.encodingBufferMaxSize}`);let n=this.G.byteLength;do{n=Math.min(n+k.encodingBufferIncrement,k.encodingBufferMaxSize)}while(n<this.J+t);const s=new ArrayBuffer(n),o=new Uint8Array(this.G.buffer,this.G.byteOffset,r);new Uint8Array(s).set(o),this.q=s,this.G=new DataView(s);const h=this.J;return this.J+=t,h}}class C{constructor(t,e){this.G=t instanceof ArrayBuffer?new DataView(t):new DataView(t.buffer,t.byteOffset,t.byteLength),this.i=null!=e?e:0}p(){return this.G.getUint8(this.i)}v(){this.i++}B(){return this.G.getUint8(this.i++)}F(){const t=this.G.getUint16(this.i);return this.i+=2,t}A(){const t=this.G.getUint32(this.i);return this.i+=4,t}j(){return this.G.getInt8(this.i++)}M(){const t=this.G.getInt16(this.i,!0);return this.i+=2,t}O(){const t=this.G.getInt32(this.i,!0);return this.i+=4,t}N(){const t=this.G.getUint16(this.i);return this.i+=2,J(t)}S(){const t=this.G.getFloat32(this.i,!0);return this.i+=4,t}V(){const t=this.G.getFloat64(this.i,!0);return this.i+=8,t}U(t){if(this.i+t>this.G.byteLength)throw new RangeError;const e=new Uint8Array(this.G.buffer,this.i,t);return this.i+=t,e}}class G{constructor(t){this.type=t}}function H(t){return new G(t)}function W(t,e){return null!==t&&"object"==typeof t?new K(t):new K(e,t)}class K{constructor(t,e){if(this.L=!1,t instanceof G)throw new TypeError("Invalid encoding format: Root object cannot be optional.");if(void 0!==t&&"number"==typeof t)this.P=t;else{if(!(t instanceof Object))throw new TypeError("Invalid encoding format: Must be an object, or a known coder type.");if(this.P=void 0,this.X=new Map,this.Y=Object.keys(t).map((e=>{const r=new L(e,t[e]);return this.X.set(e,r),r})),void 0===e)this.header=i(this.f),this.Z=this.header;else if(null===e)this.header=void 0,this.Z=void 0;else{if(!("number"==typeof(r=e)?Number.isInteger(r)&&r>=0&&r<=65535:"string"==typeof r&&2===(new TextEncoder).encode(r).byteLength))throw new TypeError(`Header should be an integer between 0 and 65535, a 2-byte string, or null. Received: ${e}`);this.header=e,this.Z="number"==typeof e?e:n(e)}}var r}get f(){return void 0===this.tt&&(this.tt=void 0!==this.Y?`{${this.Y.map((t=>t.f)).join(",")}}`:`${this.P}`),this.tt}static et(){return k.useGlobalEncodingBuffer?(K.rt||(K.rt=new ArrayBuffer(k.encodingBufferMaxSize)),new q(K.rt)):new q(k.encodingBufferInitialSize)}encode(t,e){return this.it||(this.it=K.et()),this.it.J=0,this.L&&(t=this.nt(t)),this.st(t,this.it,""),(null!=e?e:k.safe)?this.it.W():this.it.H()}decode(t){return this.ot(new C(t,void 0===this.header?0:2))}setTransforms(t){if(this.L=!0,t instanceof Function||Array.isArray(t)&&t[0]instanceof Function)this.ht=t;else for(const e of Object.keys(t)){const r=this.X.get(e);if(!r)throw new TypeError(`Failed to set transforms for field '${e}'`);r.ct.setTransforms(t[e])}return this}setValidation(t){if(this.L=!0,t instanceof Function)this.ut=t;else for(const e of Object.keys(t)){const r=this.X.get(e);if(!r)throw new TypeError(`Failed to set validation function for field '${e}'`);r.ct.setValidation(t[e])}return this}st(t,e,r){if(void 0!==this.Z&&this.it.u(this.Z),void 0!==this.P){const i=this.ut||this.ht?this.nt(t):t;return R[this.P].o(i,e,r)}if(!t||"object"!=typeof t)throw new TypeError(`Expected an object at ${r}`);for(const i of this.Y){const n=r?`${r}.${i.ft}`:i.ft,s=t[i.ft];if(i.wt){if(null==s){T.o(!1,e);continue}T.o(!0,e)}i.$t?this.dt(s,e,n,i.ct):i.ct.st(s,e,n)}}nt(t){if(this.ut&&!1===this.ut(t))throw new Error("failed validation");return this.ht instanceof Function?this.ht(t):Array.isArray(this.ht)&&this.ht[0]instanceof Function?this.ht[0](t):t}lt(t){return Array.isArray(this.ht)&&this.ht[1]instanceof Function&&(t=this.ht[1](t)),this.ut instanceof Function&&this.ut(t),t}ot(t){return this.ot=this.yt(),this.ot(t)}At(){return`return{${this.Y.map((({ft:t},e)=>`${t}:this.${this.Ft.name}(${e},state)`)).join(",")}}`}Ft(t,e){const r=this.Y[t];if(!r.wt||this.bt(e))return r.$t?this.gt(r.ct,e):r.ct.ot(e)}yt(){return void 0!==this.P?this.L?t=>this.lt(R[this.P].l(t)):R[this.P].l:new Function("state",this.At())}dt(t,r,i,n){if(!Array.isArray(t))throw new e(`Array<${n.P}>`,r,i);let s,o;for(o=t.length,I.o(o,r),s=0;s<o;s++)n.st(t[s],r,i+"."+s)}gt(t,e){const r=new Array(I.l(e));for(let i=0;i<r.length;i++)r[i]=t.ot(e);return r}bt(t){return T.l(t)}}K.peekHeader=o,K.peekHeaderStr=h;class L{constructor(t,e){this.wt=e instanceof G;let r=e instanceof G?e.type:e;if(this.ft=t,Array.isArray(r)){if(1!==r.length)throw new TypeError("Invalid array definition, it must have exactly one element");r=r[0],this.$t=!0}else this.$t=!1;this.ct=new K(r,null)}get f(){return void 0===this.vt&&(this.vt=`${this.ct.f}${this.$t?"[]":""}${this.wt?"?":""}`),this.vt}}export{r as DecodeError,t as TinybufError,a as bufferParser,W as defineFormat,N as f16round,g as mask,H as optional,o as peekHeader,h as peekHeaderStr,y as scalround,S as setTinybufConfig,v as unmask,l as uscalround};
//# sourceMappingURL=index.mjs.map
