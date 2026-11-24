var yt=globalThis,_t=yt.ShadowRoot&&(yt.ShadyCSS===void 0||yt.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Lt=Symbol(),ie=new WeakMap,ot=class{constructor(t,r,n){if(this._$cssResult$=!0,n!==Lt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=r}get styleSheet(){let t=this.o,r=this.t;if(_t&&t===void 0){let n=r!==void 0&&r.length===1;n&&(t=ie.get(r)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),n&&ie.set(r,t))}return t}toString(){return this.cssText}},se=e=>new ot(typeof e=="string"?e:e+"",void 0,Lt),R=(e,...t)=>{let r=e.length===1?e[0]:t.reduce((n,o,i)=>n+(s=>{if(s._$cssResult$===!0)return s.cssText;if(typeof s=="number")return s;throw Error("Value passed to 'css' function must be a 'css' function result: "+s+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+e[i+1],e[0]);return new ot(r,e,Lt)},ae=(e,t)=>{if(_t)e.adoptedStyleSheets=t.map(r=>r instanceof CSSStyleSheet?r:r.styleSheet);else for(let r of t){let n=document.createElement("style"),o=yt.litNonce;o!==void 0&&n.setAttribute("nonce",o),n.textContent=r.cssText,e.appendChild(n)}},Ot=_t?e=>e:e=>e instanceof CSSStyleSheet?(t=>{let r="";for(let n of t.cssRules)r+=n.cssText;return se(r)})(e):e;var{is:hn,defineProperty:mn,getOwnPropertyDescriptor:gn,getOwnPropertyNames:fn,getOwnPropertySymbols:xn,getPrototypeOf:bn}=Object,$t=globalThis,le=$t.trustedTypes,yn=le?le.emptyScript:"",_n=$t.reactiveElementPolyfillSupport,it=(e,t)=>e,Nt={toAttribute(e,t){switch(t){case Boolean:e=e?yn:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let r=e;switch(t){case Boolean:r=e!==null;break;case Number:r=e===null?null:Number(e);break;case Object:case Array:try{r=JSON.parse(e)}catch{r=null}}return r}},pe=(e,t)=>!hn(e,t),ce={attribute:!0,type:String,converter:Nt,reflect:!1,useDefault:!1,hasChanged:pe};Symbol.metadata??=Symbol("metadata"),$t.litPropertyMetadata??=new WeakMap;var I=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,r=ce){if(r.state&&(r.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((r=Object.create(r)).wrapped=!0),this.elementProperties.set(t,r),!r.noAccessor){let n=Symbol(),o=this.getPropertyDescriptor(t,n,r);o!==void 0&&mn(this.prototype,t,o)}}static getPropertyDescriptor(t,r,n){let{get:o,set:i}=gn(this.prototype,t)??{get(){return this[r]},set(s){this[r]=s}};return{get:o,set(s){let l=o?.call(this);i?.call(this,s),this.requestUpdate(t,l,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??ce}static _$Ei(){if(this.hasOwnProperty(it("elementProperties")))return;let t=bn(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(it("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(it("properties"))){let r=this.properties,n=[...fn(r),...xn(r)];for(let o of n)this.createProperty(o,r[o])}let t=this[Symbol.metadata];if(t!==null){let r=litPropertyMetadata.get(t);if(r!==void 0)for(let[n,o]of r)this.elementProperties.set(n,o)}this._$Eh=new Map;for(let[r,n]of this.elementProperties){let o=this._$Eu(r,n);o!==void 0&&this._$Eh.set(o,r)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let r=[];if(Array.isArray(t)){let n=new Set(t.flat(1/0).reverse());for(let o of n)r.unshift(Ot(o))}else t!==void 0&&r.push(Ot(t));return r}static _$Eu(t,r){let n=r.attribute;return n===!1?void 0:typeof n=="string"?n:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,r=this.constructor.elementProperties;for(let n of r.keys())this.hasOwnProperty(n)&&(t.set(n,this[n]),delete this[n]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ae(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,r,n){this._$AK(t,n)}_$ET(t,r){let n=this.constructor.elementProperties.get(t),o=this.constructor._$Eu(t,n);if(o!==void 0&&n.reflect===!0){let i=(n.converter?.toAttribute!==void 0?n.converter:Nt).toAttribute(r,n.type);this._$Em=t,i==null?this.removeAttribute(o):this.setAttribute(o,i),this._$Em=null}}_$AK(t,r){let n=this.constructor,o=n._$Eh.get(t);if(o!==void 0&&this._$Em!==o){let i=n.getPropertyOptions(o),s=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:Nt;this._$Em=o;let l=s.fromAttribute(r,i.type);this[o]=l??this._$Ej?.get(o)??l,this._$Em=null}}requestUpdate(t,r,n,o=!1,i){if(t!==void 0){let s=this.constructor;if(o===!1&&(i=this[t]),n??=s.getPropertyOptions(t),!((n.hasChanged??pe)(i,r)||n.useDefault&&n.reflect&&i===this._$Ej?.get(t)&&!this.hasAttribute(s._$Eu(t,n))))return;this.C(t,r,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,r,{useDefault:n,reflect:o,wrapped:i},s){n&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,s??r??this[t]),i!==!0||s!==void 0)||(this._$AL.has(t)||(this.hasUpdated||n||(r=void 0),this._$AL.set(t,r)),o===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(r){Promise.reject(r)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[o,i]of this._$Ep)this[o]=i;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[o,i]of n){let{wrapped:s}=i,l=this[o];s!==!0||this._$AL.has(o)||l===void 0||this.C(o,void 0,i,l)}}let t=!1,r=this._$AL;try{t=this.shouldUpdate(r),t?(this.willUpdate(r),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(r)):this._$EM()}catch(n){throw t=!1,this._$EM(),n}t&&this._$AE(r)}willUpdate(t){}_$AE(t){this._$EO?.forEach(r=>r.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(r=>this._$ET(r,this[r])),this._$EM()}updated(t){}firstUpdated(t){}};I.elementStyles=[],I.shadowRootOptions={mode:"open"},I[it("elementProperties")]=new Map,I[it("finalized")]=new Map,_n?.({ReactiveElement:I}),($t.reactiveElementVersions??=[]).push("2.1.2");var Ft=globalThis,ue=e=>e,wt=Ft.trustedTypes,de=wt?wt.createPolicy("lit-html",{createHTML:e=>e}):void 0,be="$lit$",j=`lit$${Math.random().toFixed(9).slice(2)}$`,ye="?"+j,$n=`<${ye}>`,G=document,at=()=>G.createComment(""),lt=e=>e===null||typeof e!="object"&&typeof e!="function",Vt=Array.isArray,wn=e=>Vt(e)||typeof e?.[Symbol.iterator]=="function",zt=`[ 	
\f\r]`,st=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,he=/-->/g,me=/>/g,q=RegExp(`>|${zt}(?:([^\\s"'>=/]+)(${zt}*=${zt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ge=/'/g,fe=/"/g,_e=/^(?:script|style|textarea|title)$/i,qt=e=>(t,...r)=>({_$litType$:e,strings:t,values:r}),b=qt(1),x=qt(2),Qn=qt(3),K=Symbol.for("lit-noChange"),g=Symbol.for("lit-nothing"),xe=new WeakMap,W=G.createTreeWalker(G,129);function $e(e,t){if(!Vt(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return de!==void 0?de.createHTML(t):t}var vn=(e,t)=>{let r=e.length-1,n=[],o,i=t===2?"<svg>":t===3?"<math>":"",s=st;for(let l=0;l<r;l++){let a=e[l],m,d,c=-1,h=0;for(;h<a.length&&(s.lastIndex=h,d=s.exec(a),d!==null);)h=s.lastIndex,s===st?d[1]==="!--"?s=he:d[1]!==void 0?s=me:d[2]!==void 0?(_e.test(d[2])&&(o=RegExp("</"+d[2],"g")),s=q):d[3]!==void 0&&(s=q):s===q?d[0]===">"?(s=o??st,c=-1):d[1]===void 0?c=-2:(c=s.lastIndex-d[2].length,m=d[1],s=d[3]===void 0?q:d[3]==='"'?fe:ge):s===fe||s===ge?s=q:s===he||s===me?s=st:(s=q,o=void 0);let p=s===q&&e[l+1].startsWith("/>")?" ":"";i+=s===st?a+$n:c>=0?(n.push(m),a.slice(0,c)+be+a.slice(c)+j+p):a+j+(c===-2?l:p)}return[$e(e,i+(e[r]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),n]},ct=class e{constructor({strings:t,_$litType$:r},n){let o;this.parts=[];let i=0,s=0,l=t.length-1,a=this.parts,[m,d]=vn(t,r);if(this.el=e.createElement(m,n),W.currentNode=this.el.content,r===2||r===3){let c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(o=W.nextNode())!==null&&a.length<l;){if(o.nodeType===1){if(o.hasAttributes())for(let c of o.getAttributeNames())if(c.endsWith(be)){let h=d[s++],p=o.getAttribute(c).split(j),k=/([.?@])?(.*)/.exec(h);a.push({type:1,index:i,name:k[2],strings:p,ctor:k[1]==="."?It:k[1]==="?"?Dt:k[1]==="@"?jt:X}),o.removeAttribute(c)}else c.startsWith(j)&&(a.push({type:6,index:i}),o.removeAttribute(c));if(_e.test(o.tagName)){let c=o.textContent.split(j),h=c.length-1;if(h>0){o.textContent=wt?wt.emptyScript:"";for(let p=0;p<h;p++)o.append(c[p],at()),W.nextNode(),a.push({type:2,index:++i});o.append(c[h],at())}}}else if(o.nodeType===8)if(o.data===ye)a.push({type:2,index:i});else{let c=-1;for(;(c=o.data.indexOf(j,c+1))!==-1;)a.push({type:7,index:i}),c+=j.length-1}i++}}static createElement(t,r){let n=G.createElement("template");return n.innerHTML=t,n}};function Z(e,t,r=e,n){if(t===K)return t;let o=n!==void 0?r._$Co?.[n]:r._$Cl,i=lt(t)?void 0:t._$litDirective$;return o?.constructor!==i&&(o?._$AO?.(!1),i===void 0?o=void 0:(o=new i(e),o._$AT(e,r,n)),n!==void 0?(r._$Co??=[])[n]=o:r._$Cl=o),o!==void 0&&(t=Z(e,o._$AS(e,t.values),o,n)),t}var Ut=class{constructor(t,r){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=r}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:r},parts:n}=this._$AD,o=(t?.creationScope??G).importNode(r,!0);W.currentNode=o;let i=W.nextNode(),s=0,l=0,a=n[0];for(;a!==void 0;){if(s===a.index){let m;a.type===2?m=new pt(i,i.nextSibling,this,t):a.type===1?m=new a.ctor(i,a.name,a.strings,this,t):a.type===6&&(m=new Bt(i,this,t)),this._$AV.push(m),a=n[++l]}s!==a?.index&&(i=W.nextNode(),s++)}return W.currentNode=G,o}p(t){let r=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(t,n,r),r+=n.strings.length-2):n._$AI(t[r])),r++}},pt=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,r,n,o){this.type=2,this._$AH=g,this._$AN=void 0,this._$AA=t,this._$AB=r,this._$AM=n,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,r=this._$AM;return r!==void 0&&t?.nodeType===11&&(t=r.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,r=this){t=Z(this,t,r),lt(t)?t===g||t==null||t===""?(this._$AH!==g&&this._$AR(),this._$AH=g):t!==this._$AH&&t!==K&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):wn(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==g&&lt(this._$AH)?this._$AA.nextSibling.data=t:this.T(G.createTextNode(t)),this._$AH=t}$(t){let{values:r,_$litType$:n}=t,o=typeof n=="number"?this._$AC(t):(n.el===void 0&&(n.el=ct.createElement($e(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===o)this._$AH.p(r);else{let i=new Ut(o,this),s=i.u(this.options);i.p(r),this.T(s),this._$AH=i}}_$AC(t){let r=xe.get(t.strings);return r===void 0&&xe.set(t.strings,r=new ct(t)),r}k(t){Vt(this._$AH)||(this._$AH=[],this._$AR());let r=this._$AH,n,o=0;for(let i of t)o===r.length?r.push(n=new e(this.O(at()),this.O(at()),this,this.options)):n=r[o],n._$AI(i),o++;o<r.length&&(this._$AR(n&&n._$AB.nextSibling,o),r.length=o)}_$AR(t=this._$AA.nextSibling,r){for(this._$AP?.(!1,!0,r);t!==this._$AB;){let n=ue(t).nextSibling;ue(t).remove(),t=n}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},X=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,r,n,o,i){this.type=1,this._$AH=g,this._$AN=void 0,this.element=t,this.name=r,this._$AM=o,this.options=i,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=g}_$AI(t,r=this,n,o){let i=this.strings,s=!1;if(i===void 0)t=Z(this,t,r,0),s=!lt(t)||t!==this._$AH&&t!==K,s&&(this._$AH=t);else{let l=t,a,m;for(t=i[0],a=0;a<i.length-1;a++)m=Z(this,l[n+a],r,a),m===K&&(m=this._$AH[a]),s||=!lt(m)||m!==this._$AH[a],m===g?t=g:t!==g&&(t+=(m??"")+i[a+1]),this._$AH[a]=m}s&&!o&&this.j(t)}j(t){t===g?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},It=class extends X{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===g?void 0:t}},Dt=class extends X{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==g)}},jt=class extends X{constructor(t,r,n,o,i){super(t,r,n,o,i),this.type=5}_$AI(t,r=this){if((t=Z(this,t,r,0)??g)===K)return;let n=this._$AH,o=t===g&&n!==g||t.capture!==n.capture||t.once!==n.once||t.passive!==n.passive,i=t!==g&&(n===g||o);o&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},Bt=class{constructor(t,r,n){this.element=t,this.type=6,this._$AN=void 0,this._$AM=r,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(t){Z(this,t)}};var kn=Ft.litHtmlPolyfillSupport;kn?.(ct,pt),(Ft.litHtmlVersions??=[]).push("3.3.3");var we=(e,t,r)=>{let n=r?.renderBefore??t,o=n._$litPart$;if(o===void 0){let i=r?.renderBefore??null;n._$litPart$=o=new pt(t.insertBefore(at(),i),i,void 0,r??{})}return o._$AI(e),o};var Wt=globalThis,C=class extends I{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=we(r,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return K}};C._$litElement$=!0,C.finalized=!0,Wt.litElementHydrateSupport?.({LitElement:C});var Mn=Wt.litElementPolyfillSupport;Mn?.({LitElement:C});(Wt.litElementVersions??=[]).push("4.2.2");var ut="pond_heatpump_price_planner",dt=["heat_pump","thermostat","plan","figures","switches","model"],ve=["water_in","water_out","air_in","air_out","power","liquid","gas","fan","flow","compressor","pump_speed","pump_power","pump_fault"],ke=["auto","en","nl"];function Me(e){let t=new Set;for(let r of Object.values(e.entities??{}))r.platform===ut&&r.device_id&&t.add(r.device_id);return[...t].sort((r,n)=>r.localeCompare(n))}function vt(e,t){let r={};if(!t)return r;for(let n of Object.values(e.entities??{}))n.platform===ut&&n.device_id===t&&n.translation_key&&(r[n.translation_key]=n.entity_id);return r}function N(e){let t=typeof e=="number"?e:Number.parseFloat(String(e));return Number.isFinite(t)?t:null}function w(e,t,r){return new Intl.NumberFormat(r,{minimumFractionDigits:t,maximumFractionDigits:t,useGrouping:!1}).format(e)}function Y(e,t,r="en"){return e===null?null:w(e,t,r)}function ht(e,t="en"){return e===null?null:Math.abs(e)>=1e3?`${w(e/1e3,2,t)} kW`:`${Math.round(e)} W`}function J(e,t="en"){return e===null?null:`${w(e,1,t)} \xB0C`}function B(e,t,r=0,n="en"){return e===null?null:t?`${w(e,r,n)} ${t}`:w(e,r,n)}function F(e,t){return new Date(e).toLocaleTimeString(t,{hour:"2-digit",minute:"2-digit",hourCycle:"h23"})}function mt(e,t="en"){if(!e)return null;let r=new Date(e);return Number.isNaN(r.getTime())?null:F(r.getTime(),t)}function Gt(e,t=180,r=180,n=118){return{cx:t,cy:r,r:n,lo:e-3,hi:e+3}}function tt(e,t){return 135+270*Math.min(Math.max((t-e.lo)/(e.hi-e.lo),0),1)}function z(e,t,r=e.r){let n=t*Math.PI/180;return[e.cx+r*Math.cos(n),e.cy+r*Math.sin(n)]}function kt(e,t,r,n=e.r){let[o,i]=z(e,t,n),[s,l]=z(e,r,n),a=r-t>180?1:0;return`M${o.toFixed(1)} ${i.toFixed(1)} A${n} ${n} 0 ${a} 1 ${s.toFixed(1)} ${l.toFixed(1)}`}function Ae(e,t,r,n){if(e.length<2)return null;let o=e.map(h=>h.temp),i=Math.min(...o,t-r),s=Math.max(...o,t+r);if(s-i<.5){let h=(s+i)/2;i=h-.25,s=h+.25}let l=e[0].t,a=e[e.length-1].t,m=h=>n.x+(h-l)/(a-l)*n.w,d=h=>n.y+(s-h)/(s-i)*n.h;return{line:e.map((h,p)=>`${p?"L":"M"}${m(h.t).toFixed(1)} ${d(h.temp).toFixed(1)}`).join(" "),bandTop:d(t+r),bandBottom:d(t-r),target:d(t),lo:i,hi:s}}function Ee(e,t,r,n,o,i){let s=Math.atan2(r-e.cy,t-e.cx)*180/Math.PI;s<90&&(s+=360);let l=Math.min(Math.max((s-135)/270,0),1),a=e.lo+l*(e.hi-e.lo);return Mt(a,n,o,i)}function Mt(e,t,r,n){let o=Math.round(e/t)*t;return Number(Math.min(Math.max(o,r),n).toFixed(2))}var En=1e3,Ce=.1,Pe=1,Kt=.05,Te={x:116,y:212,w:128,h:38},Q=class extends C{constructor(){super(...arguments);this.language="en";this._target=null;this._band=null;this._timers={};this._dragging=!1;this.onDown=r=>{this._dragging=!0,r.currentTarget.setPointerCapture?.(r.pointerId),this.setTarget(this.pointerTemp(r))};this.onMove=r=>{this._dragging&&this.setTarget(this.pointerTemp(r))};this.onUp=()=>{this._dragging=!1}}get target(){return this._target??this.model.target}get band(){return this._band??this.model.band}emit(r,n){clearTimeout(this._timers[r]),this._timers[r]=setTimeout(()=>{this.dispatchEvent(new CustomEvent(r,{detail:{value:n},bubbles:!0,composed:!0})),r==="set-target"?this._target=null:this._band=null},En)}setTarget(r){let n=this.model;this._target=Mt(r,n.step,n.min,n.max),this.emit("set-target",this._target)}setBand(r){this._band=Mt(r,Kt,Ce,Pe),this.emit("set-band",this._band)}pointerTemp(r){let o=r.currentTarget.closest("svg").getBoundingClientRect(),i=(r.clientX-o.left)/o.width*360,s=(r.clientY-o.top)/o.height*360;return Ee(Gt(this.model.target),i,s,this.model.step,this.model.min,this.model.max)}onKey(r,n){let o=r.key==="ArrowUp"||r.key==="ArrowRight"?1:r.key==="ArrowDown"||r.key==="ArrowLeft"?-1:0;o&&(r.preventDefault(),n==="target"?this.setTarget(this.target+o*this.model.step):this.setBand(this.band+o*Kt))}onSlider(r){this.setBand(Number(r.target.value))}disconnectedCallback(){super.disconnectedCallback(),Object.values(this._timers).forEach(r=>clearTimeout(r))}render(){let r=this.model,n=this.t,o=this.target,i=this.band,s=Gt(r.target),l=[];for(let $=Math.ceil(s.lo);$<=Math.floor(s.hi);$++){let T=tt(s,$),[L,O]=z(s,T,s.r+11),[V,D]=z(s,T,s.r+17),[f,u]=z(s,T,s.r+30);l.push(x`<line x1=${L} y1=${O} x2=${V} y2=${D} class="tick"/>
        <text x=${f} y=${u+4} class="tick-label" text-anchor="middle">${$}</text>`)}let[a,m]=z(s,tt(s,o)),d=x``;if(r.pond!==null){let $=tt(s,r.pond),T=z(s,$,s.r-12),L=z(s,$-4,s.r-26),O=z(s,$+4,s.r-26);d=x`<polygon class="pond-marker" points="${T.join(",")} ${L.join(",")} ${O.join(",")}"/>`}let c=[r.heating===null?null:n(r.heating?"heating":"idle"),r.mode?n(r.mode):null,r.position?n(r.position):null].filter(Boolean),h=Ae(r.history,o,i,Te),p=Te,k=h?x`<g class="spark" role="img" aria-label=${n("history_24h")}>
          <rect x=${p.x} y=${Math.max(h.bandTop,p.y)} width=${p.w}
            height=${Math.max(Math.min(h.bandBottom,p.y+p.h)-Math.max(h.bandTop,p.y),0)} class="spark-band"/>
          <line x1=${p.x} x2=${p.x+p.w} y1=${h.target} y2=${h.target} class="spark-target"/>
          <path d=${h.line} class="spark-line"/>
          <text x=${p.x} y=${p.y+p.h+11} class="spark-label">−24 h</text>
          <text x=${p.x+p.w} y=${p.y+p.h+11} class="spark-label" text-anchor="end">${n("now")}</text>
          <text x=${p.x-4} y=${p.y+4} class="spark-label" text-anchor="end">${w(h.hi,1,this.language)}</text>
          <text x=${p.x-4} y=${p.y+p.h} class="spark-label" text-anchor="end">${w(h.lo,1,this.language)}</text>
        </g>`:x``;return b`
      <div class="wrap">
        <svg viewBox="0 0 360 330" class="gauge">
          <path d=${kt(s,135,405)} class="ring"/>
          <path d=${kt(s,tt(s,o-i),tt(s,o+i))} class="band"/>
          ${l}
          ${d}
          <circle cx=${a} cy=${m} r="12" class="handle" tabindex="0" role="slider"
            aria-label=${n("target")} aria-valuemin=${r.min} aria-valuemax=${r.max} aria-valuenow=${o}
            @pointerdown=${this.onDown} @pointermove=${this.onMove} @pointerup=${this.onUp}
            @keydown=${$=>this.onKey($,"target")}/>
          <path d=${kt(s,135,405)} class="hit"
            @pointerdown=${this.onDown} @pointermove=${this.onMove} @pointerup=${this.onUp}/>
          <text x="180" y="140" class="caption" text-anchor="middle">${n("pond")}</text>
          <text x="180" y="178" class="pond" text-anchor="middle">${r.pond===null?"\u2013":`${w(r.pond,1,this.language)} \xB0C`}</text>
          <text x="180" y="200" class="status ${r.position??""}" text-anchor="middle">${c.join(" \xB7 ")}</text>
          ${k}
        </svg>
        <div class="stepper" style="--window:${3}">
          <span class="caption">${n("target")}</span>
          <button @click=${()=>this.setTarget(o-r.step)} aria-label="−">−</button>
          <span class="number">${w(o,1,this.language)} °C</span>
          <button @click=${()=>this.setTarget(o+r.step)} aria-label="+">+</button>
        </div>
        ${r.bandEntity===null?g:b`
          <div class="band-slider">
            <span class="caption">${n("band")}</span>
            <span class="number">± ${w(i,2,this.language)} °C</span>
            <input type="range" min=${Ce} max=${Pe} step=${Kt} .value=${String(i)}
              aria-label=${n("band")} @input=${this.onSlider} @keydown=${$=>this.onKey($,"band")}/>
          </div>`}
      </div>`}};Q.properties={model:{attribute:!1},t:{attribute:!1},language:{},_target:{state:!0},_band:{state:!0}},Q.styles=R`
    .wrap { display: grid; grid-template-columns: 1fr auto; grid-template-areas: "gauge band" "step band"; align-items: center; gap: 0 12px; }
    .gauge { grid-area: gauge; width: 100%; max-width: 340px; height: auto; justify-self: center; touch-action: none; }
    .ring { fill: none; stroke: var(--divider-color, #e0e0e0); stroke-width: 18; stroke-linecap: round; }
    .band { fill: none; stroke: var(--success-color, #66bb6a); stroke-width: 18; }
    .hit { fill: none; stroke: transparent; stroke-width: 40; cursor: pointer; }
    .tick { stroke: var(--secondary-text-color); stroke-width: 1.5; }
    .tick-label { font-size: 11px; fill: var(--secondary-text-color); }
    .handle { fill: var(--card-background-color, #fff); stroke: var(--primary-color, #1e88e5); stroke-width: 4; cursor: grab; }
    .handle:focus-visible { outline: none; stroke-width: 6; }
    .pond-marker { fill: var(--phpc-pond-color, #1e88e5); }
    .caption { font-size: 12px; fill: var(--secondary-text-color); color: var(--secondary-text-color); }
    .pond { font-size: 34px; font-weight: 700; fill: var(--phpc-pond-color, #1e88e5); }
    .spark-line { fill: none; stroke: var(--phpc-pond-color, #1e88e5); stroke-width: 1.5; }
    .spark-band { fill: var(--success-color, #66bb6a); opacity: 0.15; }
    .spark-target { stroke: var(--primary-text-color); stroke-dasharray: 3 3; opacity: 0.5; }
    .spark-label { font-size: 8px; fill: var(--secondary-text-color); }
    .status { font-size: 12px; fill: var(--success-color, #43a047); }
    .status.above_band { fill: var(--warning-color, #ef6c00); }
    .status.below_band { fill: var(--info-color, #1e88e5); }
    .stepper { grid-area: step; display: flex; align-items: center; justify-content: center; gap: 10px; }
    .stepper .caption { margin-right: 4px; }
    .number { font-size: 16px; font-weight: 600; color: var(--primary-text-color); min-width: 72px; text-align: center; }
    button { width: 32px; height: 32px; border-radius: 50%; border: none; background: var(--secondary-background-color, #eceff1); color: var(--primary-text-color); font-size: 18px; cursor: pointer; }
    .band-slider { grid-area: band; display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .band-slider input { writing-mode: vertical-lr; direction: rtl; height: 180px; accent-color: var(--success-color, #43a047); }
  `;var Sn=`M-98 394 q20 -7 40 0 ${"t40 0 ".repeat(19)}V458 H-98 Z`,Cn=`M-98 400 q20 5 40 0 ${"t40 0 ".repeat(19)}V458 H-98 Z`;function E(e,t,r,n="label",o="start",i=""){return r===null?g:x`<text x=${e} y=${t} class=${n} text-anchor=${o} style=${i}>${r}</text>`}function He(e,t){let r=n=>n?"on":"";return x`
  <svg viewBox="0 0 640 480" role="img" aria-label=${t("heat_pump")} class="illustration">
    <g class="air ${r(e.fan)}">
      <path d="M40 122 H160"/><path d="M40 142 H160"/><path d="M472 122 H600"/><path d="M472 142 H600"/>
    </g>
    <polygon points="160,116 172,132 160,148" class="arrow"/>
    <polygon points="600,116 612,132 600,148" class="arrow"/>
    ${E(40,104,e.airIn===null?null:t("air_in"))}
    ${E(40,170,e.airIn,"value")}
    ${E(520,104,e.airOut===null?null:t("air_out"))}
    ${E(520,170,e.airOut,"value")}

    <g class="legend" transform="translate(40 210)">
      <line x1="0" y1="0" x2="18" y2="0" class="hotgas-line"/><text x="24" y="4">${t("hot_gas")}</text>
      <line x1="0" y1="16" x2="18" y2="16" class="liquid-line"/><text x="24" y="20">${t("liquid")}</text>
      <line x1="0" y1="32" x2="18" y2="32" class="suction-line"/><text x="24" y="36">${t("suction_gas")}</text>
    </g>

    <rect class="housing" x="176" y="40" width="288" height="240" rx="14"/>
    <text x="192" y="58" class="label">${t("heat_pump")}</text>
    ${e.mode===null?g:x`
      <rect class="badge ${e.mode}" x="398" y="48" width="54" height="22" rx="11"/>
      <text x="425" y="64" class="badge-text" text-anchor="middle">${t(e.mode).toUpperCase()}</text>`}

    <rect class="hx" x="252" y="196" width="136" height="48" rx="8"/>
    <polyline class="coil" points="366,206 350,230 334,206 318,230 302,206 286,230 274,206"/>
    <text x="320" y="190" class="label" text-anchor="middle">${t("heat_exchanger")}</text>
    ${E(320,258,e.thermal===null?null:t("thermal"),"label","middle")}
    ${E(320,274,e.thermal,"small","middle")}

    <g class="refrigerant ${r(e.compressor)}">
      <path class="rpipe" d="M196 86 V74 H378 V86"/><path class="rflow suction" d="M196 86 V74 H378 V86"/>
      <path class="rpipe" d="M404 122 H420 V206 H366"/><path class="rflow hotgas" d="M404 122 H420 V206 H366"/>
      <path class="rpipe" d="M274 206 H262 V188 H196 V178"/><path class="rflow liquid" d="M274 206 H262 V188 H196 V178"/>
    </g>
    <g transform="translate(228 188)" class="valve">
      <polygon points="-9,-7 -9,7 0,0"/><polygon points="9,-7 9,7 0,0"/>
    </g>
    ${E(424,150,e.gas===null?null:t("gas"),"label hot")}
    ${E(424,166,e.gas,"tiny hot")}
    ${E(246,208,e.liquid===null?null:t("liquid"),"label warmtext","end")}
    ${E(246,223,e.liquid,"small warmtext","end")}

    <rect class="evaporator" x="188" y="86" width="16" height="92" rx="3"/>
    <path class="fins" d="M188 98 H204 M188 110 H204 M188 122 H204 M188 134 H204 M188 146 H204 M188 158 H204 M188 170 H204"/>
    <text transform="translate(214 132) rotate(-90)" class="tiny-label" text-anchor="middle">${t("evaporator")}</text>

    <circle class="fan-ring" cx="274" cy="132" r="48"/>
    <g class="fan ${r(e.fan)}">
      <path d="M274 132 C274 104 291 89 304 95 C298 112 285 123 274 132 Z"/>
      <path d="M274 132 C302 132 317 149 311 162 C294 156 283 143 274 132 Z"/>
      <path d="M274 132 C274 160 257 175 244 169 C250 152 263 141 274 132 Z"/>
      <path d="M274 132 C246 132 231 115 237 102 C254 108 265 121 274 132 Z"/>
      <circle cx="274" cy="132" r="7" class="hub"/>
    </g>

    <rect class="comp-body" x="352" y="86" width="52" height="72" rx="10"/>
    <rect class="cylinder" x="363" y="98" width="30" height="48" rx="3"/>
    <g class="piston ${r(e.compressor)}">
      <rect x="365" y="126" width="26" height="10" rx="2" class="piston-head"/>
      <rect x="375" y="136" width="6" height="12" class="piston-rod"/>
    </g>
    <text x="378" y="172" class="label" text-anchor="middle">${t("compressor")}</text>

    ${e.electrical===null?g:x`
      <path class="cord" d="M464 250 C496 250 512 272 548 270"/>
      <rect x="546" y="262" width="16" height="16" rx="3" class="plug"/>
      <rect x="562" y="266" width="6" height="2.5" class="pin"/><rect x="562" y="271.5" width="6" height="2.5" class="pin"/>
      <rect x="570" y="248" width="44" height="44" rx="8" class="socket"/>
      <circle cx="592" cy="270" r="13" class="socket-face"/>
      <circle cx="586" cy="270" r="2.5" class="hole"/><circle cx="598" cy="270" r="2.5" class="hole"/>
      <text x="592" y="308" class="label" text-anchor="middle">${t("electrical")}</text>
      <text x="592" y="324" class="value" text-anchor="middle">${e.electrical}</text>`}

    <g class="water ${r(e.flow)}">
      <path class="pipe" d="M100 380 V312 H230 V236 H252"/><path class="flow cold" d="M100 380 V312 H230 V236 H252"/>
      <path class="pipe" d="M388 236 H410 V312 H540 V380"/><path class="flow warm" d="M388 236 H410 V312 H540 V380"/>
    </g>
    <polygon points="533,366 547,366 540,380" class="warm-arrow"/>
    ${E(242,300,e.waterIn===null?null:t("water_in"))}
    ${E(242,318,e.waterIn,"value")}
    ${E(398,300,e.waterOut===null?null:t("water_out"),"label","end")}
    ${E(398,318,e.waterOut,"value","end")}

    <g class="pump ${e.pump}" transform="translate(160 312)">
      <circle class="pump-body" r="20"/><polygon class="pump-tri" points="-11,-15 -11,15 17,0"/>
    </g>
    <text x="160" y="348" class="label" text-anchor="middle">${t("pump")} · ${t(e.pump)}</text>
    ${E(160,364,e.pumpText,"small","middle")}

    <path d="M60 380 H580 V450 Q580 460 570 460 H70 Q60 460 60 450 Z" class="tub"/>
    <clipPath id="phpc-tub"><path d="M61 381 H579 V450 Q579 459 570 459 H70 Q61 459 61 450 Z"/></clipPath>
    <g clip-path="url(#phpc-tub)">
      <path class="wave" d=${Sn}/><path class="wave2" d=${Cn}/>
    </g>
    <text x="320" y="438" class="label" text-anchor="middle">${t("pond")}</text>
    ${E(320,422,e.pond,"pond-temp","middle")}
  </svg>`}var Re=R`
  .illustration { width: 100%; height: auto; display: block; font-family: var(--ha-font-family-body, Roboto, sans-serif); }
  .label { font-size: 11px; fill: var(--secondary-text-color); }
  .tiny-label { font-size: 10px; fill: var(--secondary-text-color); }
  .value { font-size: 15px; font-weight: 600; fill: var(--primary-text-color); }
  .small { font-size: 13px; font-weight: 600; fill: var(--primary-text-color); }
  .tiny { font-size: 12px; font-weight: 600; }
  .hot { fill: #c62828; }
  .warmtext { fill: #e65100; }
  .pond-temp { font-size: 22px; font-weight: 700; fill: #0d47a1; }
  .housing { fill: var(--secondary-background-color, #eceff1); stroke: #90a4ae; stroke-width: 2; }
  .badge { fill: #9e9e9e; } .badge.low { fill: #1e88e5; } .badge.high { fill: #ef6c00; } .badge.boost { fill: #c62828; }
  .badge-text { font-size: 12px; font-weight: 700; fill: #fff; }
  .arrow { fill: #b0bec5; } .warm-arrow { fill: #ff8a65; }
  .air path { fill: none; stroke: #b0bec5; stroke-width: 2; stroke-dasharray: 6 6; }
  .pipe { fill: none; stroke: #90a4ae; stroke-width: 9; stroke-linecap: round; stroke-linejoin: round; }
  .flow { fill: none; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 10 14; }
  .cold { stroke: #42a5f5; } .warm { stroke: #ff8a65; }
  .rpipe { fill: none; stroke: #cfd8dc; stroke-width: 6; stroke-linecap: round; stroke-linejoin: round; }
  .rflow { fill: none; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 6 8; }
  .hotgas, .hotgas-line { stroke: #e53935; } .liquid, .liquid-line { stroke: #fb8c00; } .suction, .suction-line { stroke: #7e57c2; }
  .legend line { stroke-width: 3; } .legend text { font-size: 10px; fill: var(--secondary-text-color); }
  .valve polygon { fill: #fb8c00; }
  .hx { fill: #fff3e0; stroke: #fb8c00; stroke-width: 2; }
  .coil { fill: none; stroke: #e53935; stroke-width: 3; stroke-linejoin: round; }
  .evaporator { fill: #ede7f6; stroke: #7e57c2; stroke-width: 2; } .fins { stroke: #b39ddb; stroke-width: 1.5; }
  .fan-ring { fill: var(--card-background-color, #fff); stroke: #90a4ae; stroke-width: 2; }
  .fan path { fill: #78909c; } .hub { fill: #546e7a; }
  .fan { transform-origin: 274px 132px; transform-box: view-box; }
  .comp-body { fill: var(--card-background-color, #fff); stroke: #90a4ae; stroke-width: 2; }
  .cylinder { fill: #ffe0b2; stroke: #fb8c00; stroke-width: 1.5; }
  .piston-head { fill: #fb8c00; } .piston-rod { fill: #ef6c00; }
  .cord { fill: none; stroke: var(--primary-text-color); stroke-width: 3; stroke-linecap: round; }
  .plug { fill: #616161; } .pin { fill: #9e9e9e; } .socket { fill: #fafafa; stroke: #9e9e9e; stroke-width: 2; }
  .socket-face { fill: #eee; stroke: #bdbdbd; stroke-width: 1.5; } .hole { fill: #616161; }
  .pump .pump-body { stroke-width: 2.5; }
  .pump.running .pump-body { fill: #e8f5e9; stroke: #43a047; } .pump.running .pump-tri { fill: #43a047; }
  .pump.fault .pump-body { fill: #ffebee; stroke: #e53935; } .pump.fault .pump-tri { fill: #e53935; }
  .pump.off .pump-body { fill: #f5f5f5; stroke: #9e9e9e; } .pump.off .pump-tri { fill: #9e9e9e; }
  .tub { fill: #e3f2fd; stroke: #64b5f6; stroke-width: 2; }
  .wave { fill: #90caf9; opacity: 0.8; } .wave2 { fill: #64b5f6; opacity: 0.25; }

  .air.on path, .water.on .flow, .refrigerant.on .rflow { animation: flow 1.2s linear infinite; }
  .refrigerant.on .rflow { animation-duration: 0.9s; }
  .fan.on { animation: spin 0.9s linear infinite; }
  .piston.on { animation: pump 0.6s ease-in-out infinite; }
  .wave { animation: wave 8s linear infinite reverse; }
  .wave2 { animation: wave 12s linear infinite; }
  @keyframes flow { to { stroke-dashoffset: -48; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pump { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
  @keyframes wave { from { transform: translateX(0); } to { transform: translateX(80px); } }
  @media (prefers-reduced-motion: reduce) {
    .air path, .flow, .rflow, .fan, .piston, .wave, .wave2 { animation: none !important; }
  }
`;function Le(e){return e>=900?"wide":e>=560?"medium":"narrow"}function Oe(e){return e==="wide"?3:e==="medium"?2:1}var Pn={narrow:{heat_pump:1,thermostat:1,plan:1,side:1,model:1},medium:{heat_pump:1,thermostat:1,plan:2,side:1,model:1},wide:{heat_pump:1,thermostat:1,plan:3,side:1,model:3}};function Ne(e,t){return Pn[e][t]}function ze(e){return e==="wide"?1200:e==="medium"?900:600}var Ue={columns:"full",min_columns:6,rows:"auto"};var Ie={pond:"pond",heat_pump:"HEAT PUMP",air_in:"air in",air_out:"air out",water_in:"water in",water_out:"water out",evaporator:"evaporator",compressor:"compressor",heat_exchanger:"heat exchanger",thermal:"thermal",electrical:"electrical",gas:"gas",liquid:"liquid",hot_gas:"hot gas",suction_gas:"suction gas",pump:"pump",running:"running",fault:"fault",off:"off",low:"low",high:"high",boost:"boost",target:"target",band:"band",heating:"heating",idle:"idle",in_band:"in band",above_band:"above band",below_band:"below band",next_start:"next start",next_stop:"next stop",controlling:"controlling",dry_run:"dry run",planned_cost:"planned cost 24 h",planned_energy:"planned electricity 24 h",expensive_share:"in expensive quarters",cop:"COP",heat_loss:"heat loss",thermal_power:"thermal power",insulation_cover:"insulation cover",control:"control the heat pump",model:"Model",cooling:"cooling",heating_low:"heating rate low",heating_high:"heating rate high",heating_boost:"heating rate boost",prediction_error:"prediction error",learned:"learned",cop_by_outdoor:"COP by outdoor temperature",plan:"Plan",price:"price",now:"now",known_prices:"known prices",legend_pond:"pond temperature (predicted)",legend_measured:"pond temperature (measured)",tip_measured:"measured",tip_predicted:"predicted",tip_mode:"mode",tip_forecast:"forecast",tip_expensive:"expensive quarter",tip_solar:"solar surplus",legend_expensive:"expensive quarters",legend_solar:"solar surplus",legend_forecast:"forecast prices from",no_plan_yet:"No plan yet",plan_title:"Plan:",history_24h:"pond temperature, last 24 hours",reason_no_pond_temperature:"waiting for the pond temperature",reason_no_plan:"the planner could not make a plan",reason_unavailable:"the planner is not available",reason_other:"waiting for the next planning cycle",no_device:"Choose a planner device in the card editor.",plan_summary:"Plan: {parts}.",device:"Planner device",hours:"Width of the plan chart (hours, ending at the last known price)",sections:"Sections",language:"Language",language_auto:"Follow the integration",language_en:"English",language_nl:"Nederlands"},Tn={pond:"vijver",heat_pump:"WARMTEPOMP",air_in:"lucht in",air_out:"lucht uit",water_in:"water in",water_out:"water uit",evaporator:"verdamper",compressor:"compressor",heat_exchanger:"warmtewisselaar",thermal:"thermisch",electrical:"elektrisch",gas:"gas",liquid:"vloeistof",hot_gas:"heet gas",suction_gas:"zuiggas",pump:"pomp",running:"in bedrijf",fault:"storing",off:"uit",low:"laag",high:"hoog",boost:"boost",target:"streefwaarde",band:"band",heating:"verwarmt",idle:"rust",in_band:"binnen band",above_band:"boven band",below_band:"onder band",next_start:"volgende start",next_stop:"volgende stop",controlling:"stuurt aan",dry_run:"alleen plannen",planned_cost:"geplande kosten 24 u",planned_energy:"gepland stroomverbruik 24 u",expensive_share:"in dure kwartieren",cop:"COP",heat_loss:"warmteverlies",thermal_power:"thermisch vermogen",insulation_cover:"isolatiekap",control:"warmtepomp aansturen",model:"Model",cooling:"afkoeling",heating_low:"opwarmsnelheid laag",heating_high:"opwarmsnelheid hoog",heating_boost:"opwarmsnelheid boost",prediction_error:"voorspelfout",learned:"geleerd",cop_by_outdoor:"COP per buitentemperatuur",plan:"Plan",price:"prijs",now:"nu",known_prices:"bekende prijzen",legend_pond:"vijvertemperatuur (voorspeld)",legend_measured:"vijvertemperatuur (gemeten)",tip_measured:"gemeten",tip_predicted:"voorspeld",tip_mode:"stand",tip_forecast:"verwacht",tip_expensive:"duur kwartier",tip_solar:"zonne-overschot",legend_expensive:"dure kwartieren",legend_solar:"zonne-overschot",legend_forecast:"verwachte prijzen vanaf",no_plan_yet:"Nog geen plan",plan_title:"Plan:",history_24h:"vijvertemperatuur, afgelopen 24 uur",reason_no_pond_temperature:"wacht op de vijvertemperatuur",reason_no_plan:"de planner kon geen plan maken",reason_unavailable:"de planner is niet beschikbaar",reason_other:"wacht op de volgende planningsronde",no_device:"Kies een planner-apparaat in de kaarteditor.",plan_summary:"Plan: {parts}.",device:"Planner-apparaat",hours:"Breedte van de plangrafiek (uren, tot de laatste bekende prijs)",sections:"Blokken",language:"Taal",language_auto:"Volg de integratie",language_en:"English",language_nl:"Nederlands"};function Et(e){let t=(e??"en").toLowerCase().startsWith("nl")?Tn:Ie;return(r,n)=>{let o=t[r]??Ie[r]??r;for(let[i,s]of Object.entries(n??{}))o=o.replace(`{${i}}`,String(s));return o}}var De=["en","nl"];function St(e,t,r){return e.language&&De.includes(e.language)?e.language:typeof t=="string"&&De.includes(t)?t:r??"en"}var y=15*60*1e3,Hn=30*60*1e3;function Rn(e,t,r){let n=r*36e5,o=Math.ceil(t/y)*y,i=Math.floor(e/y)*y;return o-n>i?{start:i,end:i+n}:{start:o-n,end:o}}function Ln(e,t){let r=e.history.filter(n=>n.t>=t&&n.t<=e.now);return e.pond!==null&&r.push({t:e.now,temp:e.pond}),r}function On(e,t){let r=e.quarters[0].t;return e.history.map(n=>({t:n.t-y,mode:n.mode??null,price:n.price??null})).filter(n=>n.t>=t&&n.t<r&&(n.mode!==null||n.price!==null))}function je(e,t){if(!e.length)return 0;let r=(e.length-1)*t,n=Math.floor(r),o=Math.ceil(r);return e[n]+(e[o]-e[n])*(r-n)}function Be(e,t,r=6){let n=new Date(e);n.setMinutes(0,0,0),n.getTime()<e&&n.setHours(n.getHours()+1);let o=[];for(;n.getTime()<t;n.setHours(n.getHours()+1))n.getHours()%r===0&&o.push({t:n.getTime(),midnight:n.getHours()===0});return o}function Ct(e,t,r,n=28){let o=e.quarters,{start:i,end:s}=Rn(e.now,o[o.length-1].t+y,e.hours),l=Ln(e,i),a=o.map(f=>f.temp).concat(l.map(f=>f.temp),[e.target-e.band,e.target+e.band]),m=Math.floor((Math.min(...a)-.1)*10)/10,d=Math.ceil((Math.max(...a)+.1)*10)/10,c=On(e,i),h=o.map(f=>f.price).concat(c.flatMap(f=>f.price===null?[]:[f.price])),p=Math.min(...h),k=Math.max(...h)===p?p+.01:Math.max(...h),$=o.map((f,u)=>{let M=o.slice(Math.floor(u/96)*96,Math.floor(u/96)*96+96).map(P=>P.price);return o[u].price>je([...M].sort((P,U)=>P-U),.75)}),T=96*y,L=f=>Math.floor((f-o[0].t)/T),O=c.map(f=>{if(f.price===null)return!1;let u=c.filter(M=>M.price!==null&&L(M.t)===L(f.t)).map(M=>M.price);return f.price>je(u.sort((M,P)=>M-P),.75)}),V=o.find(f=>!f.known),D=r-n*2;return{x:f=>n+(f-i)/(s-i)*(t-n*2),t:f=>i+(f-n)/(t-n*2)*(s-i),yTemp:f=>n+(1-(f-m)/(d-m))*D,yPrice:f=>n+(1-(f-p)/(k-p))*D,tempMin:m,tempMax:d,priceMin:p,priceMax:k,start:i,end:s,measured:l,expensive:$,past:c,pastExpensive:O,knownUntil:V?V.t:null}}function Fe(e,t){let r=[...t.past,...e.quarters].filter(o=>o.t>=t.start&&o.t<t.end),n=null;return r.flatMap(o=>{if(o.price===null)return[];let i=n===null||o.t!==n+y?"M":"L";return n=o.t,[`${i}${t.x(o.t).toFixed(1)} ${t.yPrice(o.price).toFixed(1)} H${t.x(o.t+y).toFixed(1)}`]}).join(" ")}function Ve(e){let t=null;return e.measured.map(r=>{let n=t===null||r.t-t>Hn?"M":"L";return t=r.t,`${n}${e.x(r.t).toFixed(1)} ${e.yTemp(r.temp).toFixed(1)}`}).join(" ")}function qe(e,t){let r=e.quarters.filter(n=>n.t+y>e.now&&n.t>=t.start).map(n=>[t.x(n.t+y),t.yTemp(n.temp)]);return e.pond!==null&&e.now>=t.start&&r.unshift([t.x(e.now),t.yTemp(e.pond)]),r.map(([n,o],i)=>`${i?"L":"M"}${n.toFixed(1)} ${o.toFixed(1)}`).join(" ")}function We(e,t){let r=Math.floor(e.t(t)/y)*y;return Math.min(Math.max(r,e.start),e.end-y)}function Ge(e,t,r){let n={t:r,temp:null,measured:!1,mode:null,price:null,known:!0,expensive:!1,surplus:null},o=e.quarters.findIndex(i=>i.t===r);if(o>=0){let i=e.quarters[o];return{...n,temp:i.temp,mode:i.mode,price:i.price,known:i.known,expensive:t.expensive[o],surplus:i.surplus}}if(r<e.now){let i=t.past.findIndex(m=>m.t===r),s=i>=0?{mode:t.past[i].mode,price:t.past[i].price,expensive:t.pastExpensive[i]}:{},l=r+y,a=t.measured.filter(m=>Math.abs(m.t-l)<=y/2);if(a.length){let m=a.reduce((d,c)=>Math.abs(c.t-l)<Math.abs(d.t-l)?c:d,a[0]);return{...n,...s,temp:m.temp,measured:!0}}return{...n,...s}}return n}function Nn(e){let t=[];for(let r of e){let n=t[t.length-1];n&&n.mode===r.mode?n.to=r.t+y:t.push({mode:r.mode,from:r.t,to:r.t+y})}return t}function Ke(e,t,r="en"){let n=Nn(e.quarters).map(o=>`${t(o.mode)} ${F(o.from,r)}\u2013${F(o.to,r)}`);return t("plan_summary",{parts:n.join(", ")})}var Qt=600,S=220,zn=70,Qe=(e,t)=>new Date(e).toLocaleDateString(t,{weekday:"short",day:"numeric",month:"short"});function Un(e,t,r){let n=[`${Qe(e.t,r)} ${F(e.t,r)}\u2013${F(e.t+y,r)}`];return e.temp!==null&&n.push(`${w(e.temp,2,r)} \xB0C ${t(e.measured?"tip_measured":"tip_predicted")}`),e.mode!==null&&n.push(`${t("tip_mode")}: ${t(e.mode)}`),e.price!==null&&n.push(`\u20AC ${w(e.price,3,r)}/kWh${e.known?"":` (${t("tip_forecast")})`}`),e.expensive&&n.push(t("tip_expensive")),e.surplus&&n.push(`${t("tip_solar")} ${w(e.surplus,1,r)} kW`),n}function In(e,t,r,n=Qt,o=null,i=Ct(e,n,S)){let s=e.quarters,l=i.x(s[0].t+y)-i.x(s[0].t),a={off:0,low:.5,high:1,boost:1},m=s.map((u,M)=>{if(u.t<i.start||u.t>=i.end)return x``;let P=18*a[u.mode],U=i.expensive[M]?x`<rect x=${i.x(u.t)} y="28" width=${l} height=${S-56} class="expensive"/>`:x``,bt=u.surplus?x`<rect x=${i.x(u.t)} y=${S-26} width=${l} height="4" class="sun"/>`:x``;return x`${U}${bt}<rect x=${i.x(u.t)} y=${S-28-P} width=${l} height=${P} class="bar ${u.mode}"/>`}),d=i.past.map((u,M)=>{let P=i.pastExpensive[M]?x`<rect x=${i.x(u.t)} y="28" width=${l} height=${S-56} class="expensive"/>`:x``;if(u.mode===null)return P;let U=18*a[u.mode];return x`${P}<rect x=${i.x(u.t)} y=${S-28-U} width=${l} height=${U} class="bar past ${u.mode}"/>`}),c=Fe(e,i),h=i.yTemp(e.target+e.band),p=i.yTemp(e.target-e.band),k=Math.min(Math.max(i.x(e.now),28),n-28),$=Be(i.start,i.end),T=$.map(u=>x`<line x1=${i.x(u.t)} x2=${i.x(u.t)} y1="28" y2=${S-28} class=${u.midnight?"day":"grid"}/>`),L=$.map(u=>x`<text x=${i.x(u.t)} y=${S-8} class="axis" text-anchor="middle">${F(u.t,r)}</text>`),O=$.find(u=>u.midnight),D=[...O&&i.x(O.t)-28<zn?[]:[{t:i.start,x:28}],...$.filter(u=>u.midnight).map(u=>({t:u.t,x:i.x(u.t)}))].map(u=>x`<text x=${u.x+4} y="40" class="day-label">${Qe(u.t,r)}</text>`),f=x``;if(o){let u=i.x(o.t+y/2),M=o.temp===null?x``:x`<circle cx=${i.x(o.t+y)} cy=${i.yTemp(o.temp)} r="4" class="hover-dot"/>`;f=x`<line x1=${u} x2=${u} y1="28" y2=${S-28} class="hair"/>${M}`}return x`
    <svg viewBox="0 0 ${n} ${S}" class="chart" role="img" aria-label=${Ke(e,t,r)}>
      ${T}
      <rect x="28" y=${h} width=${n-56} height=${p-h} class="band"/>
      ${d}
      ${m}
      <line x1="28" x2=${n-28} y1=${i.yTemp(e.target)} y2=${i.yTemp(e.target)} class="target"/>
      <path d=${c} class="price"/>
      <path d=${Ve(i)} class="measured"/>
      <path d=${qe(e,i)} class="temp"/>
      ${i.knownUntil===null?x``:x`<line x1=${i.x(i.knownUntil)} x2=${i.x(i.knownUntil)} y1="28" y2=${S-28} class="known"/>`}
      <line x1=${k} x2=${k} y1="20" y2=${S-28} class="now"/>
      <text x="4" y="20" class="axis">${w(i.tempMax,1,r)} °C</text>
      <text x="4" y=${S-30} class="axis">${w(i.tempMin,1,r)}</text>
      <text x=${n-4} y="20" class="axis" text-anchor="end">€ ${w(i.priceMax,2,r)}</text>
      <text x=${n-4} y=${S-30} class="axis" text-anchor="end">€ ${w(i.priceMin,2,r)}</text>
      ${L}
      ${D}
      ${f}
    </svg>`}var gt=class extends C{constructor(){super(...arguments);this.language="en";this.width=Qt;this._hover=null;this.onPointer=r=>{let n=r.currentTarget.getBoundingClientRect();n.width&&(this._hover=We(this.scales,(r.clientX-n.left)/n.width*this.width))};this.onLeave=r=>{r.pointerType==="mouse"&&(this._hover=null)};this.onOutside=r=>{this._hover!==null&&!r.composedPath().includes(this)&&(this._hover=null)};this.onKey=r=>{let n=this.scales,o=this._hover??Math.floor(this.model.now/y)*y,i={ArrowLeft:o-y,ArrowRight:o+y,Home:n.start,End:n.end-y,Escape:null};if(!(r.key in i))return;r.preventDefault();let s=i[r.key];this._hover=s===null?null:Math.min(Math.max(s,n.start),n.end-y)}}createRenderRoot(){return this}get scales(){return Ct(this.model,this.width,S)}connectedCallback(){super.connectedCallback(),window.addEventListener("pointerdown",this.onOutside)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("pointerdown",this.onOutside)}render(){if(!this.model)return g;let r=this.scales,n=this._hover===null?null:Ge(this.model,r,this._hover),o=n?Un(n,this.t,this.language):[],i=g;if(n){let s=r.x(n.t+y/2)/this.width*100,l=s>50?`right:${(100-s).toFixed(1)}%`:`left:${s.toFixed(1)}%`;i=b`<div class="tooltip ${s>50?"to-left":"to-right"}" style=${l}>
        ${o.map((a,m)=>b`<div class=${m?"":"tip-time"}>${a}</div>`)}
      </div>`}return b`<div class="plot" tabindex="0" @pointermove=${this.onPointer} @pointerdown=${this.onPointer}
        @pointerleave=${this.onLeave} @keydown=${this.onKey}>
        ${In(this.model,this.t,this.language,this.width,n,r)}${i}
        <span class="sr-only" aria-live="polite">${o.join(", ")}</span>
      </div>`}};gt.properties={model:{attribute:!1},t:{attribute:!1},language:{},width:{type:Number},_hover:{state:!0}};function Dn(e){let t=Ct(e,Qt,S),r=[...t.measured.length>1?[{key:"legend_measured",swatch:"line"}]:[],{key:"legend_pond",swatch:"predicted"},{key:"target",swatch:"dashed"},{key:"band",swatch:"area"},{key:"low",swatch:"low"},{key:"high",swatch:"high"},...e.quarters.some(n=>n.mode==="boost")||t.past.some(n=>n.mode==="boost")?[{key:"boost",swatch:"boost"}]:[],{key:"price",swatch:"step"}];return(t.expensive.some(Boolean)||t.pastExpensive.some(Boolean))&&r.push({key:"legend_expensive",swatch:"expensive"}),e.quarters.some(n=>n.surplus)&&r.push({key:"legend_solar",swatch:"solar"}),r.push({key:"now",swatch:"now"}),t.knownUntil!==null&&r.push({key:"legend_forecast",swatch:"dotted"}),r}function Ze(e,t){return b`<ul class="chart-legend">
    ${Dn(e).map(r=>b`<li><span class="sw ${r.swatch}"></span>${t(r.key)}</li>`)}
  </ul>`}var Xe=R`
  .chart-legend { list-style: none; display: flex; flex-wrap: wrap; gap: 4px 14px; margin: 6px 0 0; padding: 0; font-size: 11px; color: var(--secondary-text-color); }
  .chart-legend li { display: flex; align-items: center; gap: 5px; }
  .sw { display: inline-block; width: 18px; height: 10px; box-sizing: border-box; }
  .sw.line { border-top: 2.5px solid var(--phpc-pond-color, #1e88e5); height: 0; }
  .sw.predicted { border-top: 2.5px dashed var(--phpc-pond-color, #1e88e5); height: 0; }
  .sw.dashed { border-top: 1.5px dashed var(--primary-text-color); height: 0; opacity: 0.6; }
  .sw.area { background: var(--success-color, #66bb6a); opacity: 0.3; }
  .sw.low { background: #1e88e5; opacity: 0.55; } .sw.high { background: #ef6c00; opacity: 0.6; }
  .sw.boost { background: #c62828; opacity: 0.6; }
  .sw.step { border-top: 1.2px solid var(--secondary-text-color); height: 0; }
  .sw.expensive { background: var(--warning-color, #ff9800); opacity: 0.2; }
  .sw.solar { background: #fdd835; height: 4px; }
  .sw.now { border-left: 2px solid var(--error-color, #e53935); width: 2px; height: 12px; }
  .sw.dotted { border-left: 1.5px dotted var(--secondary-text-color); width: 2px; height: 12px; }
  .chart { width: 100%; height: auto; display: block; }
  .band { fill: var(--success-color, #66bb6a); opacity: 0.15; }
  .expensive { fill: var(--warning-color, #ff9800); opacity: 0.07; }
  .sun { fill: #fdd835; }
  .bar.low { fill: #1e88e5; opacity: 0.55; } .bar.high { fill: #ef6c00; opacity: 0.6; } .bar.off { fill: none; }
  .bar.boost { fill: #c62828; opacity: 0.6; }
  .bar.past.low { opacity: 0.3; } .bar.past.high, .bar.past.boost { opacity: 0.35; }
  .target { stroke: var(--primary-text-color); stroke-dasharray: 4 4; opacity: 0.6; }
  .temp { fill: none; stroke: var(--phpc-pond-color, #1e88e5); stroke-width: 2.5; stroke-dasharray: 7 4; }
  .measured { fill: none; stroke: var(--phpc-pond-color, #1e88e5); stroke-width: 2.5; }
  .plot { position: relative; touch-action: pan-y; outline: none; }
  .plot:focus-visible { box-shadow: 0 0 0 2px var(--primary-color, #1e88e5); border-radius: 4px; }
  .hair { stroke: var(--primary-text-color); stroke-width: 1; opacity: 0.7; }
  .hover-dot { fill: var(--phpc-pond-color, #1e88e5); stroke: var(--card-background-color, #fff); stroke-width: 2; }
  .tooltip { position: absolute; top: 8px; z-index: 1; pointer-events: none; white-space: nowrap; font-size: 12px; line-height: 1.45;
    padding: 6px 9px; border-radius: 6px; background: var(--card-background-color, #fff); color: var(--primary-text-color);
    border: 1px solid var(--divider-color, #e0e0e0); box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18); }
  .tooltip.to-right { margin-left: 10px; } .tooltip.to-left { margin-right: 10px; }
  .tip-time { font-weight: 600; }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  .price { fill: none; stroke: var(--secondary-text-color); stroke-width: 1.2; }
  .known { stroke: var(--secondary-text-color); stroke-dasharray: 2 3; }
  .now { stroke: var(--error-color, #e53935); stroke-width: 1.5; }
  .axis { font-size: 10px; fill: var(--secondary-text-color); }
  .grid { stroke: var(--divider-color, #e0e0e0); stroke-width: 1; }
  .day { stroke: var(--secondary-text-color); stroke-width: 1; opacity: 0.6; }
  .day-label { font-size: 11px; font-weight: 600; fill: var(--primary-text-color); opacity: 0.75; }
`;function et(e,t){return t===null?g:b`<div class="fig"><span class="v">${t}</span><span class="l">${e}</span></div>`}function Ye(e,t,r){let n=[e.nextStop?`${t("next_stop")} ${mt(e.nextStop,r)}`:null,e.nextStart?`${t("next_start")} ${mt(e.nextStart,r)}`:null,e.control===null?null:t(e.control?"controlling":"dry_run")].filter(Boolean);return b`<div class="next">${n.join(" \xB7 ")}</div>`}function Je(e,t){return b`<div class="figures">
    ${et(t("planned_cost"),e.cost)} ${et(t("planned_energy"),e.energy)}
    ${et(t("expensive_share"),e.expensive)}
    ${et(e.copMethod?`${t("cop")} (${e.copMethod})`:t("cop"),e.cop)}
    ${et(t("heat_loss"),e.heatLoss)} ${et(t("thermal_power"),e.thermal)}
  </div>`}function tn(e,t,r){let n=(o,i)=>o===null?g:b`<label class="switch"><input type="checkbox" .checked=${o.on} @change=${s=>r(o.entity,s.target.checked)}/>${t(i)}</label>`;return b`<div class="switches">${n(e.cover,"insulation_cover")} ${n(e.control,"control")}</div>`}function en(e,t){let r=[[t("cooling"),e.cooling],[t("heating_low"),e.heatingLow],[t("heating_high"),e.heatingHigh],[t("heating_boost"),e.heatingBoost],[t("prediction_error"),e.predictionError],[t("learned"),e.learned]];return b`<details class="model"><summary>${t("model")}</summary>
    <table>${r.filter(([,n])=>n!==null).map(([n,o])=>b`<tr><td>${n}</td><td>${o}</td></tr>`)}</table>
    ${e.copByOutdoor.length?b`<div class="l">${t("cop_by_outdoor")}</div>
          <table>${e.copByOutdoor.map(([n,o])=>b`<tr><td>${n} °C</td><td>${o??"\u2013"}</td></tr>`)}</table>`:g}
  </details>`}var nn=R`
  .next { text-align: center; font-size: 13px; color: var(--secondary-text-color); margin: 4px 0 8px; }
  .figures { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 8px; }
  .fig { display: flex; flex-direction: column; }
  .fig .v { font-size: 16px; font-weight: 600; color: var(--primary-text-color); }
  .fig .l, .l { font-size: 11px; color: var(--secondary-text-color); }
  .switches { display: flex; flex-wrap: wrap; gap: 16px; }
  .switch { display: flex; align-items: center; gap: 6px; color: var(--primary-text-color); }
  .model summary { cursor: pointer; color: var(--primary-text-color); }
  .model table { border-collapse: collapse; font-size: 13px; color: var(--primary-text-color); margin: 4px 0; }
  .model td { padding: 2px 12px 2px 0; }
`;var Tt=["off","low","high","boost"];function jn(e){return Array.isArray(e)?e.map(t=>({t:Date.parse(t?.time),temp:Number(t?.temp),mode:Tt.includes(t?.mode)?t.mode:null,price:t?.price===void 0||t?.price===null||!Number.isFinite(Number(t.price))?null:Number(t.price)})).filter(t=>Number.isFinite(t.t)&&Number.isFinite(t.temp)).sort((t,r)=>t.t-r.t):[]}function A(e,t){return t?e.states[t]:void 0}function H(e){return!!e&&e.state!=="unavailable"&&e.state!=="unknown"}function v(e,t){let r=A(e,t);return H(r)?N(r.state):null}function Pt(e,t){return A(e,t)?.state==="on"}function Bn(e,t,r){let n=A(e,r.model_status)?.attributes.links??{},o={water_in:n.inlet_temperature,water_out:n.outlet_temperature,air_in:n.air_inlet_temperature,power:n.power,flow:n.circulation},i={};for(let[s,l]of Object.entries({...o,...t.heat_pump??{}}))l&&(i[s]=l);return i}function rn(e,t,r=Date.now()){let n=vt(e,t.device_id),o=(t.sections?.length?t.sections:[...dt]).filter(_=>dt.includes(_)),i=Bn(e,t,n),l=[...Object.values(n),...Object.values(i)].map(_=>`${_}:${A(e,_)?.last_updated??"-"}`).join("|"),a=St(t,A(e,n.mode)?.attributes.language,e.locale?.language??e.language),m={sections:o,illustration:null,gauge:null,plan:null,planMissing:null,figures:null,switches:null,model:null,missingDevice:!t.device_id||Object.keys(n).length===0,language:a,signature:l};if(m.missingDevice)return m;let d=A(e,n.thermostat),c=A(e,n.mode),h=H(c)&&Tt.includes(c.state)?c.state:null,p=H(d)?N(d.attributes.current_temperature):null,k=H(d)?N(d.attributes.temperature)??15:15,$=v(e,n.band)??.25,T=v(e,n.thermal_power),L=A(e,i.pump_speed),O=v(e,i.pump_power),V=Pt(e,i.pump_fault),D=Tt.includes(c?.attributes.measured_mode)&&c?.attributes.measured_mode!=="off",f=_=>_?Pt(e,_):D,u=f(i.flow),M=[B(v(e,i.pump_speed),L?.attributes.unit_of_measurement,0,a),ht(O,a)].filter(Boolean),P={pond:J(p,a),waterIn:J(v(e,i.water_in),a),waterOut:J(v(e,i.water_out),a),airIn:J(v(e,i.air_in),a),airOut:J(v(e,i.air_out),a),electrical:ht(v(e,i.power),a),thermal:ht(T,a),liquid:Y(v(e,i.liquid),0,a)&&`${Y(v(e,i.liquid),0,a)} \xB0C`,gas:Y(v(e,i.gas),0,a)&&`${Y(v(e,i.gas),0,a)} \xB0C`,mode:h,fan:f(i.fan),flow:u,compressor:f(i.compressor),pump:V?"fault":u?"running":"off",pumpText:M.length?M.join(" \xB7 "):null},U=H(d)?d.attributes.hvac_action:null,bt=jn(c?.attributes.pond_history),an=n.thermostat?{pond:p,target:k,band:$,min:N(d?.attributes.min_temp)??5,max:N(d?.attributes.max_temp)??28,step:N(d?.attributes.target_temp_step)??.1,heating:U==="heating"?!0:U==="idle"?!1:null,mode:h,position:p===null?null:p>k+$?"above_band":p<k-$?"below_band":"in_band",thermostat:n.thermostat,bandEntity:n.band??null,nextStart:H(A(e,n.next_start))?A(e,n.next_start).state:null,nextStop:H(A(e,n.next_stop))?A(e,n.next_stop).state:null,control:n.control?Pt(e,n.control):null,history:bt.filter(_=>_.t>=r-24*36e5)}:null,ln=c?.attributes.plan??[],Xt=t.hours??36,Yt=ln.map(_=>({t:Date.parse(_.start),mode:Tt.includes(_.mode)?_.mode:"off",temp:Number(_.temp),price:Number(_.price),known:_.known!==!1,surplus:_.surplus===void 0?null:Number(_.surplus)})).filter(_=>Number.isFinite(_.t)&&Number.isFinite(_.temp)).slice(0,Xt*4),Jt=Yt.length?{quarters:Yt,target:k,band:$,now:r,hours:Xt,history:bt,pond:p}:null,rt=A(e,n.planned_cost),te=A(e,n.cop),ee=H(rt)?N(rt.attributes.expensive_share):null,ne=v(e,n.heat_loss),cn={cost:H(rt)&&N(rt.state)!==null?`\u20AC ${w(N(rt.state),2,a)}`:null,energy:B(v(e,n.planned_energy),"kWh",1,a),expensive:ee===null?null:`${Math.round(ee*100)} %`,cop:Y(v(e,n.cop),1,a),copMethod:H(te)?te.attributes.method??null:null,heatLoss:ne===null?null:`${Math.round(ne)} W/K`,thermal:ht(T,a)},re=_=>n[_]?{entity:n[_],on:Pt(e,n[_])}:null,pn=A(e,n.cop)?.attributes.by_outdoor??{},un={cooling:B(v(e,n.cooling_coefficient),"1/h",4,a),heatingLow:B(v(e,n.heating_rate_low),"K/h",3,a),heatingHigh:B(v(e,n.heating_rate_high),"K/h",3,a),heatingBoost:B(v(e,n.heating_rate_boost),"K/h",3,a),predictionError:B(v(e,n.prediction_error),"K",2,a),learned:H(A(e,n.model_status))?mt(A(e,n.model_status).state,a):null,copByOutdoor:Object.entries(pn).map(([_,oe])=>[_,oe===null?null:w(Number(oe),1,a)])},dn=Jt?null:H(c)?String(c.attributes.reason??"no_plan"):"unavailable";return{...m,illustration:P,gauge:an,plan:Jt,planMissing:dn,figures:cn,switches:{cover:re("insulation_cover"),control:re("control")},model:un}}var ft="pond-heatpump-planner-card",Zt="pond-heatpump-planner-card-editor",on="phpc-gauge",sn="phpc-plan-chart",nt=class extends C{constructor(){super(...arguments);this._layout="narrow"}static getConfigElement(){return document.createElement(Zt)}static getStubConfig(r){return{type:`custom:${ft}`,device_id:Me(r)[0]}}setConfig(r){if(!r)throw new Error("Invalid configuration");this._config={hours:36,...r},this.rebuild(!0)}set hass(r){this._hass=r,this.rebuild(!1)}get hass(){return this._hass}rebuild(r){if(!this._hass||!this._config)return;let n=rn(this._hass,this._config);(r||!this._vm||n.signature!==this._vm.signature)&&(this._vm=n)}getCardSize(){return 12}getGridOptions(){return{...Ue}}connectedCallback(){super.connectedCallback(),typeof ResizeObserver<"u"&&(this._observer=new ResizeObserver(r=>this.resized(r[0]?.contentRect.width??0)),this._observer.observe(this))}disconnectedCallback(){super.disconnectedCallback(),this._observer?.disconnect()}resized(r){let n=Le(r);n!==this._layout&&(this._layout=n)}get language(){return this._vm?.language??this._hass?.locale?.language??this._hass?.language??"en"}get t(){return Et(this.language)}call(r,n,o){this._hass?.callService(r,n,o).catch(i=>{console.error(`${r}.${n} failed`,i)})}content(r,n){let o=this.t,i=this.language;switch(r){case"heat_pump":return n.illustration?He(n.illustration,o):g;case"thermostat":return n.gauge?b`<phpc-gauge .model=${n.gauge} .t=${o} .language=${i}
                @set-target=${s=>this.call("climate","set_temperature",{entity_id:n.gauge.thermostat,temperature:s.detail.value})}
                @set-band=${s=>n.gauge.bandEntity&&this.call("number","set_value",{entity_id:n.gauge.bandEntity,value:s.detail.value})}
              ></phpc-gauge>
              ${Ye(n.gauge,o,i)}`:g;case"plan":return n.plan?b`<div class="title">${o("plan_title")}</div>
            <phpc-plan-chart .model=${n.plan} .t=${o} .language=${i} .width=${ze(this._layout)}></phpc-plan-chart>
            ${Ze(n.plan,o)}`:n.planMissing===null?g:b`<div class="no-plan"><strong>${o("no_plan_yet")}</strong> · ${this.reasonText(n.planMissing)}</div>`;case"figures":return n.figures?Je(n.figures,o):g;case"switches":return n.switches&&(n.switches.cover||n.switches.control)?tn(n.switches,o,(s,l)=>this.call("switch",l?"turn_on":"turn_off",{entity_id:s})):g;case"model":return n.model?en(n.model,o):g}}reasonText(r){let n=`reason_${r}`,o=this.t(n);return o===n?this.t("reason_other"):o}blocks(r){let n=[];for(let o of r.sections){let i=this.content(o,r);if(i===g)continue;let s=o==="figures"||o==="switches"?"side":o,l=s==="side"?n.find(a=>a.block==="side"):void 0;l?l.parts.push(i):n.push({block:s,parts:[i]})}return n}render(){let r=this._vm;if(!r)return g;if(r.missingDevice)return b`<ha-card><div class="section warning">${this.t("no_device")}</div></ha-card>`;let n=this._layout;return b`<ha-card class=${n} style="--phpc-columns:${Oe(n)}">
      ${this.blocks(r).map(o=>b`<div class="section ${o.block}" style="grid-column: span ${Ne(n,o.block)}">
          ${o.parts.map(i=>b`<div class="part">${i}</div>`)}
        </div>`)}
    </ha-card>`}};nt.properties={_vm:{state:!0},_layout:{state:!0}},nt.styles=[Re,Xe,nn,R`
      :host { display: block; } /* an inline host has no width, so the layout would never change */
      ha-card { padding: 8px 0; overflow: hidden; display: grid; grid-template-columns: repeat(var(--phpc-columns, 1), minmax(0, 1fr)); grid-auto-flow: row dense; }
      .section { padding: 8px 16px; min-width: 0; border-top: 1px solid var(--divider-color, #e0e0e0); }
      ha-card.narrow .section:first-child { border-top: none; }
      ha-card.medium .section, ha-card.wide .section { border-top: none; padding: 12px 16px; }
      ha-card.medium .section.plan, ha-card.wide .section.plan, ha-card.wide .section.model { border-top: 1px solid var(--divider-color, #e0e0e0); }
      .section.side .part + .part { margin-top: 12px; }
      ha-card.medium .section.side, ha-card.wide .section.side { display: flex; flex-direction: column; justify-content: center; }
      .warning { color: var(--warning-color, #ef6c00); }
      .title { font-size: 14px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 4px; }
      .no-plan { color: var(--secondary-text-color); font-size: 14px; padding: 12px 0; text-align: center; }
    `];var Fn=["water_in","water_out","air_in","air_out","power","liquid","gas","pump_speed","pump_power"];function Vn(e){return[{name:"device_id",selector:{device:{integration:ut}}},{name:"hours",selector:{select:{options:["24","36","48"],mode:"dropdown"}}},{name:"sections",selector:{select:{options:[...dt],multiple:!0,reorder:!0}}},{name:"language",selector:{select:{options:ke.map(t=>({value:t,label:e(`language_${t}`)})),mode:"dropdown"}}},{name:"heat_pump",type:"expandable",title:"Heat pump",schema:ve.map(t=>({name:t,selector:{entity:{domain:Fn.includes(t)?"sensor":"binary_sensor"}}}))}]}var xt=class extends C{setConfig(t){this._config=t}changed(t){let r={...t.detail.value};r.hours&&(r.hours=Number(r.hours)),r.language==="auto"&&delete r.language,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:r},bubbles:!0,composed:!0}))}render(){if(!this.hass||!this._config)return b``;let t=vt(this.hass,this._config.device_id),r=Et(St(this._config,this.hass.states[t.mode??""]?.attributes.language,this.hass.locale?.language)),n={...this._config,hours:String(this._config.hours??36),language:this._config.language??"auto"};return b`<ha-form
      .hass=${this.hass}
      .data=${n}
      .schema=${Vn(r)}
      .computeLabel=${o=>r(o.name)}
      @value-changed=${this.changed}
    ></ha-form>`}};xt.properties={hass:{attribute:!1},_config:{state:!0}};function Rt(e,t){customElements.get(e)||customElements.define(e,t)}Rt(on,Q);Rt(sn,gt);Rt(Zt,xt);Rt(ft,nt);var Ht=window;Ht.customCards=Ht.customCards??[];Ht.customCards.some(e=>e.type===ft)||Ht.customCards.push({type:ft,name:"Pond Heat Pump Planner",description:"Heat pump illustration, thermostat with band, plan and key figures of the pond heat pump planner.",preview:!0,documentationURL:"https://github.com/abroeders/pond-heatpump-price-planner/blob/main/docs/card.md"});
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/lit-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-element/lit-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
