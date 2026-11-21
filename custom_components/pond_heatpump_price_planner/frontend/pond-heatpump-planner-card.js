var ye=globalThis,_e=ye.ShadowRoot&&(ye.ShadyCSS===void 0||ye.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Le=Symbol(),it=new WeakMap,oe=class{constructor(e,n,r){if(this._$cssResult$=!0,r!==Le)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=n}get styleSheet(){let e=this.o,n=this.t;if(_e&&e===void 0){let r=n!==void 0&&n.length===1;r&&(e=it.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),r&&it.set(n,e))}return e}toString(){return this.cssText}},st=t=>new oe(typeof t=="string"?t:t+"",void 0,Le),R=(t,...e)=>{let n=t.length===1?t[0]:e.reduce((r,o,i)=>r+(s=>{if(s._$cssResult$===!0)return s.cssText;if(typeof s=="number")return s;throw Error("Value passed to 'css' function must be a 'css' function result: "+s+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+t[i+1],t[0]);return new oe(n,t,Le)},at=(t,e)=>{if(_e)t.adoptedStyleSheets=e.map(n=>n instanceof CSSStyleSheet?n:n.styleSheet);else for(let n of e){let r=document.createElement("style"),o=ye.litNonce;o!==void 0&&r.setAttribute("nonce",o),r.textContent=n.cssText,t.appendChild(r)}},Oe=_e?t=>t:t=>t instanceof CSSStyleSheet?(e=>{let n="";for(let r of e.cssRules)n+=r.cssText;return st(n)})(t):t;var{is:hn,defineProperty:mn,getOwnPropertyDescriptor:gn,getOwnPropertyNames:fn,getOwnPropertySymbols:xn,getPrototypeOf:bn}=Object,$e=globalThis,lt=$e.trustedTypes,yn=lt?lt.emptyScript:"",_n=$e.reactiveElementPolyfillSupport,ie=(t,e)=>t,Ne={toAttribute(t,e){switch(e){case Boolean:t=t?yn:null;break;case Object:case Array:t=t==null?t:JSON.stringify(t)}return t},fromAttribute(t,e){let n=t;switch(e){case Boolean:n=t!==null;break;case Number:n=t===null?null:Number(t);break;case Object:case Array:try{n=JSON.parse(t)}catch{n=null}}return n}},pt=(t,e)=>!hn(t,e),ct={attribute:!0,type:String,converter:Ne,reflect:!1,useDefault:!1,hasChanged:pt};Symbol.metadata??=Symbol("metadata"),$e.litPropertyMetadata??=new WeakMap;var I=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,n=ct){if(n.state&&(n.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((n=Object.create(n)).wrapped=!0),this.elementProperties.set(e,n),!n.noAccessor){let r=Symbol(),o=this.getPropertyDescriptor(e,r,n);o!==void 0&&mn(this.prototype,e,o)}}static getPropertyDescriptor(e,n,r){let{get:o,set:i}=gn(this.prototype,e)??{get(){return this[n]},set(s){this[n]=s}};return{get:o,set(s){let l=o?.call(this);i?.call(this,s),this.requestUpdate(e,l,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ct}static _$Ei(){if(this.hasOwnProperty(ie("elementProperties")))return;let e=bn(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(ie("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(ie("properties"))){let n=this.properties,r=[...fn(n),...xn(n)];for(let o of r)this.createProperty(o,n[o])}let e=this[Symbol.metadata];if(e!==null){let n=litPropertyMetadata.get(e);if(n!==void 0)for(let[r,o]of n)this.elementProperties.set(r,o)}this._$Eh=new Map;for(let[n,r]of this.elementProperties){let o=this._$Eu(n,r);o!==void 0&&this._$Eh.set(o,n)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let n=[];if(Array.isArray(e)){let r=new Set(e.flat(1/0).reverse());for(let o of r)n.unshift(Oe(o))}else e!==void 0&&n.push(Oe(e));return n}static _$Eu(e,n){let r=n.attribute;return r===!1?void 0:typeof r=="string"?r:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,n=this.constructor.elementProperties;for(let r of n.keys())this.hasOwnProperty(r)&&(e.set(r,this[r]),delete this[r]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return at(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,n,r){this._$AK(e,r)}_$ET(e,n){let r=this.constructor.elementProperties.get(e),o=this.constructor._$Eu(e,r);if(o!==void 0&&r.reflect===!0){let i=(r.converter?.toAttribute!==void 0?r.converter:Ne).toAttribute(n,r.type);this._$Em=e,i==null?this.removeAttribute(o):this.setAttribute(o,i),this._$Em=null}}_$AK(e,n){let r=this.constructor,o=r._$Eh.get(e);if(o!==void 0&&this._$Em!==o){let i=r.getPropertyOptions(o),s=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:Ne;this._$Em=o;let l=s.fromAttribute(n,i.type);this[o]=l??this._$Ej?.get(o)??l,this._$Em=null}}requestUpdate(e,n,r,o=!1,i){if(e!==void 0){let s=this.constructor;if(o===!1&&(i=this[e]),r??=s.getPropertyOptions(e),!((r.hasChanged??pt)(i,n)||r.useDefault&&r.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(s._$Eu(e,r))))return;this.C(e,n,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,n,{useDefault:r,reflect:o,wrapped:i},s){r&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,s??n??this[e]),i!==!0||s!==void 0)||(this._$AL.has(e)||(this.hasUpdated||r||(n=void 0),this._$AL.set(e,n)),o===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(n){Promise.reject(n)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[o,i]of this._$Ep)this[o]=i;this._$Ep=void 0}let r=this.constructor.elementProperties;if(r.size>0)for(let[o,i]of r){let{wrapped:s}=i,l=this[o];s!==!0||this._$AL.has(o)||l===void 0||this.C(o,void 0,i,l)}}let e=!1,n=this._$AL;try{e=this.shouldUpdate(n),e?(this.willUpdate(n),this._$EO?.forEach(r=>r.hostUpdate?.()),this.update(n)):this._$EM()}catch(r){throw e=!1,this._$EM(),r}e&&this._$AE(n)}willUpdate(e){}_$AE(e){this._$EO?.forEach(n=>n.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(n=>this._$ET(n,this[n])),this._$EM()}updated(e){}firstUpdated(e){}};I.elementStyles=[],I.shadowRootOptions={mode:"open"},I[ie("elementProperties")]=new Map,I[ie("finalized")]=new Map,_n?.({ReactiveElement:I}),($e.reactiveElementVersions??=[]).push("2.1.2");var Fe=globalThis,ut=t=>t,we=Fe.trustedTypes,dt=we?we.createPolicy("lit-html",{createHTML:t=>t}):void 0,bt="$lit$",j=`lit$${Math.random().toFixed(9).slice(2)}$`,yt="?"+j,$n=`<${yt}>`,W=document,ae=()=>W.createComment(""),le=t=>t===null||typeof t!="object"&&typeof t!="function",Ve=Array.isArray,wn=t=>Ve(t)||typeof t?.[Symbol.iterator]=="function",ze=`[ 	
\f\r]`,se=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ht=/-->/g,mt=/>/g,V=RegExp(`>|${ze}(?:([^\\s"'>=/]+)(${ze}*=${ze}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),gt=/'/g,ft=/"/g,_t=/^(?:script|style|textarea|title)$/i,qe=t=>(e,...n)=>({_$litType$:t,strings:e,values:n}),b=qe(1),x=qe(2),Qn=qe(3),G=Symbol.for("lit-noChange"),g=Symbol.for("lit-nothing"),xt=new WeakMap,q=W.createTreeWalker(W,129);function $t(t,e){if(!Ve(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return dt!==void 0?dt.createHTML(e):e}var vn=(t,e)=>{let n=t.length-1,r=[],o,i=e===2?"<svg>":e===3?"<math>":"",s=se;for(let l=0;l<n;l++){let a=t[l],m,d,c=-1,h=0;for(;h<a.length&&(s.lastIndex=h,d=s.exec(a),d!==null);)h=s.lastIndex,s===se?d[1]==="!--"?s=ht:d[1]!==void 0?s=mt:d[2]!==void 0?(_t.test(d[2])&&(o=RegExp("</"+d[2],"g")),s=V):d[3]!==void 0&&(s=V):s===V?d[0]===">"?(s=o??se,c=-1):d[1]===void 0?c=-2:(c=s.lastIndex-d[2].length,m=d[1],s=d[3]===void 0?V:d[3]==='"'?ft:gt):s===ft||s===gt?s=V:s===ht||s===mt?s=se:(s=V,o=void 0);let p=s===V&&t[l+1].startsWith("/>")?" ":"";i+=s===se?a+$n:c>=0?(r.push(m),a.slice(0,c)+bt+a.slice(c)+j+p):a+j+(c===-2?l:p)}return[$t(t,i+(t[n]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),r]},ce=class t{constructor({strings:e,_$litType$:n},r){let o;this.parts=[];let i=0,s=0,l=e.length-1,a=this.parts,[m,d]=vn(e,n);if(this.el=t.createElement(m,r),q.currentNode=this.el.content,n===2||n===3){let c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(o=q.nextNode())!==null&&a.length<l;){if(o.nodeType===1){if(o.hasAttributes())for(let c of o.getAttributeNames())if(c.endsWith(bt)){let h=d[s++],p=o.getAttribute(c).split(j),k=/([.?@])?(.*)/.exec(h);a.push({type:1,index:i,name:k[2],strings:p,ctor:k[1]==="."?Ie:k[1]==="?"?De:k[1]==="@"?je:X}),o.removeAttribute(c)}else c.startsWith(j)&&(a.push({type:6,index:i}),o.removeAttribute(c));if(_t.test(o.tagName)){let c=o.textContent.split(j),h=c.length-1;if(h>0){o.textContent=we?we.emptyScript:"";for(let p=0;p<h;p++)o.append(c[p],ae()),q.nextNode(),a.push({type:2,index:++i});o.append(c[h],ae())}}}else if(o.nodeType===8)if(o.data===yt)a.push({type:2,index:i});else{let c=-1;for(;(c=o.data.indexOf(j,c+1))!==-1;)a.push({type:7,index:i}),c+=j.length-1}i++}}static createElement(e,n){let r=W.createElement("template");return r.innerHTML=e,r}};function Z(t,e,n=t,r){if(e===G)return e;let o=r!==void 0?n._$Co?.[r]:n._$Cl,i=le(e)?void 0:e._$litDirective$;return o?.constructor!==i&&(o?._$AO?.(!1),i===void 0?o=void 0:(o=new i(t),o._$AT(t,n,r)),r!==void 0?(n._$Co??=[])[r]=o:n._$Cl=o),o!==void 0&&(e=Z(t,o._$AS(t,e.values),o,r)),e}var Ue=class{constructor(e,n){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=n}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:n},parts:r}=this._$AD,o=(e?.creationScope??W).importNode(n,!0);q.currentNode=o;let i=q.nextNode(),s=0,l=0,a=r[0];for(;a!==void 0;){if(s===a.index){let m;a.type===2?m=new pe(i,i.nextSibling,this,e):a.type===1?m=new a.ctor(i,a.name,a.strings,this,e):a.type===6&&(m=new Be(i,this,e)),this._$AV.push(m),a=r[++l]}s!==a?.index&&(i=q.nextNode(),s++)}return q.currentNode=W,o}p(e){let n=0;for(let r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(e,r,n),n+=r.strings.length-2):r._$AI(e[n])),n++}},pe=class t{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,n,r,o){this.type=2,this._$AH=g,this._$AN=void 0,this._$AA=e,this._$AB=n,this._$AM=r,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,n=this._$AM;return n!==void 0&&e?.nodeType===11&&(e=n.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,n=this){e=Z(this,e,n),le(e)?e===g||e==null||e===""?(this._$AH!==g&&this._$AR(),this._$AH=g):e!==this._$AH&&e!==G&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):wn(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==g&&le(this._$AH)?this._$AA.nextSibling.data=e:this.T(W.createTextNode(e)),this._$AH=e}$(e){let{values:n,_$litType$:r}=e,o=typeof r=="number"?this._$AC(e):(r.el===void 0&&(r.el=ce.createElement($t(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===o)this._$AH.p(n);else{let i=new Ue(o,this),s=i.u(this.options);i.p(n),this.T(s),this._$AH=i}}_$AC(e){let n=xt.get(e.strings);return n===void 0&&xt.set(e.strings,n=new ce(e)),n}k(e){Ve(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,o=0;for(let i of e)o===n.length?n.push(r=new t(this.O(ae()),this.O(ae()),this,this.options)):r=n[o],r._$AI(i),o++;o<n.length&&(this._$AR(r&&r._$AB.nextSibling,o),n.length=o)}_$AR(e=this._$AA.nextSibling,n){for(this._$AP?.(!1,!0,n);e!==this._$AB;){let r=ut(e).nextSibling;ut(e).remove(),e=r}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},X=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,n,r,o,i){this.type=1,this._$AH=g,this._$AN=void 0,this.element=e,this.name=n,this._$AM=o,this.options=i,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=g}_$AI(e,n=this,r,o){let i=this.strings,s=!1;if(i===void 0)e=Z(this,e,n,0),s=!le(e)||e!==this._$AH&&e!==G,s&&(this._$AH=e);else{let l=e,a,m;for(e=i[0],a=0;a<i.length-1;a++)m=Z(this,l[r+a],n,a),m===G&&(m=this._$AH[a]),s||=!le(m)||m!==this._$AH[a],m===g?e=g:e!==g&&(e+=(m??"")+i[a+1]),this._$AH[a]=m}s&&!o&&this.j(e)}j(e){e===g?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},Ie=class extends X{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===g?void 0:e}},De=class extends X{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==g)}},je=class extends X{constructor(e,n,r,o,i){super(e,n,r,o,i),this.type=5}_$AI(e,n=this){if((e=Z(this,e,n,0)??g)===G)return;let r=this._$AH,o=e===g&&r!==g||e.capture!==r.capture||e.once!==r.once||e.passive!==r.passive,i=e!==g&&(r===g||o);o&&this.element.removeEventListener(this.name,this,r),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Be=class{constructor(e,n,r){this.element=e,this.type=6,this._$AN=void 0,this._$AM=n,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(e){Z(this,e)}};var kn=Fe.litHtmlPolyfillSupport;kn?.(ce,pe),(Fe.litHtmlVersions??=[]).push("3.3.3");var wt=(t,e,n)=>{let r=n?.renderBefore??e,o=r._$litPart$;if(o===void 0){let i=n?.renderBefore??null;r._$litPart$=o=new pe(e.insertBefore(ae(),i),i,void 0,n??{})}return o._$AI(t),o};var We=globalThis,C=class extends I{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let n=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=wt(n,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return G}};C._$litElement$=!0,C.finalized=!0,We.litElementHydrateSupport?.({LitElement:C});var Mn=We.litElementPolyfillSupport;Mn?.({LitElement:C});(We.litElementVersions??=[]).push("4.2.2");var ue="pond_heatpump_price_planner",de=["heat_pump","thermostat","plan","figures","switches","model"],vt=["water_in","water_out","air_in","air_out","power","liquid","gas","fan","flow","compressor","pump_speed","pump_power","pump_fault"],kt=["auto","en","nl"];function Mt(t){let e=new Set;for(let n of Object.values(t.entities??{}))n.platform===ue&&n.device_id&&e.add(n.device_id);return[...e].sort()}function ve(t,e){let n={};if(!e)return n;for(let r of Object.values(t.entities??{}))r.platform===ue&&r.device_id===e&&r.translation_key&&(n[r.translation_key]=r.entity_id);return n}function N(t){let e=typeof t=="number"?t:Number.parseFloat(String(t));return Number.isFinite(e)?e:null}function w(t,e,n){return new Intl.NumberFormat(n,{minimumFractionDigits:e,maximumFractionDigits:e,useGrouping:!1}).format(t)}function Y(t,e,n="en"){return t===null?null:w(t,e,n)}function he(t,e="en"){return t===null?null:Math.abs(t)>=1e3?`${w(t/1e3,2,e)} kW`:`${Math.round(t)} W`}function J(t,e="en"){return t===null?null:`${w(t,1,e)} \xB0C`}function K(t,e,n=0,r="en"){return t===null?null:e?`${w(t,n,r)} ${e}`:w(t,n,r)}function B(t,e){return new Date(t).toLocaleTimeString(e,{hour:"2-digit",minute:"2-digit",hourCycle:"h23"})}function me(t,e="en"){if(!t)return null;let n=new Date(t);return Number.isNaN(n.getTime())?null:B(n.getTime(),e)}function Ge(t,e=180,n=180,r=118){return{cx:e,cy:n,r,lo:t-3,hi:t+3}}function ee(t,e){return 135+270*Math.min(Math.max((e-t.lo)/(t.hi-t.lo),0),1)}function z(t,e,n=t.r){let r=e*Math.PI/180;return[t.cx+n*Math.cos(r),t.cy+n*Math.sin(r)]}function ke(t,e,n,r=t.r){let[o,i]=z(t,e,r),[s,l]=z(t,n,r),a=n-e>180?1:0;return`M${o.toFixed(1)} ${i.toFixed(1)} A${r} ${r} 0 ${a} 1 ${s.toFixed(1)} ${l.toFixed(1)}`}function At(t,e,n,r){if(t.length<2)return null;let o=t.map(h=>h.temp),i=Math.min(...o,e-n),s=Math.max(...o,e+n);if(s-i<.5){let h=(s+i)/2;i=h-.25,s=h+.25}let l=t[0].t,a=t[t.length-1].t,m=h=>r.x+(h-l)/(a-l)*r.w,d=h=>r.y+(s-h)/(s-i)*r.h;return{line:t.map((h,p)=>`${p?"L":"M"}${m(h.t).toFixed(1)} ${d(h.temp).toFixed(1)}`).join(" "),bandTop:d(e+n),bandBottom:d(e-n),target:d(e),lo:i,hi:s}}function Et(t,e,n,r,o,i){let s=Math.atan2(n-t.cy,e-t.cx)*180/Math.PI;s<90&&(s+=360);let l=Math.min(Math.max((s-135)/270,0),1),a=t.lo+l*(t.hi-t.lo);return Me(a,r,o,i)}function Me(t,e,n,r){let o=Math.round(t/e)*e;return Number(Math.min(Math.max(o,n),r).toFixed(2))}var En=1e3,Ct=.1,Pt=1,Ke=.05,Tt={x:116,y:212,w:128,h:38},Q=class extends C{constructor(){super(...arguments);this.language="en";this._target=null;this._band=null;this._timers={};this._dragging=!1;this.onDown=n=>{this._dragging=!0,n.currentTarget.setPointerCapture?.(n.pointerId),this.setTarget(this.pointerTemp(n))};this.onMove=n=>{this._dragging&&this.setTarget(this.pointerTemp(n))};this.onUp=()=>{this._dragging=!1}}get target(){return this._target??this.model.target}get band(){return this._band??this.model.band}emit(n,r){clearTimeout(this._timers[n]),this._timers[n]=setTimeout(()=>{this.dispatchEvent(new CustomEvent(n,{detail:{value:r},bubbles:!0,composed:!0})),n==="set-target"?this._target=null:this._band=null},En)}setTarget(n){let r=this.model;this._target=Me(n,r.step,r.min,r.max),this.emit("set-target",this._target)}setBand(n){this._band=Me(n,Ke,Ct,Pt),this.emit("set-band",this._band)}pointerTemp(n){let o=n.currentTarget.closest("svg").getBoundingClientRect(),i=(n.clientX-o.left)/o.width*360,s=(n.clientY-o.top)/o.height*360;return Et(Ge(this.model.target),i,s,this.model.step,this.model.min,this.model.max)}onKey(n,r){let o=n.key==="ArrowUp"||n.key==="ArrowRight"?1:n.key==="ArrowDown"||n.key==="ArrowLeft"?-1:0;o&&(n.preventDefault(),r==="target"?this.setTarget(this.target+o*this.model.step):this.setBand(this.band+o*Ke))}onSlider(n){this.setBand(Number(n.target.value))}disconnectedCallback(){super.disconnectedCallback(),Object.values(this._timers).forEach(n=>clearTimeout(n))}render(){let n=this.model,r=this.t,o=this.target,i=this.band,s=Ge(n.target),l=[];for(let $=Math.ceil(s.lo);$<=Math.floor(s.hi);$++){let T=ee(s,$),[L,O]=z(s,T,s.r+11),[F,D]=z(s,T,s.r+17),[f,u]=z(s,T,s.r+30);l.push(x`<line x1=${L} y1=${O} x2=${F} y2=${D} class="tick"/>
        <text x=${f} y=${u+4} class="tick-label" text-anchor="middle">${$}</text>`)}let[a,m]=z(s,ee(s,o)),d=x``;if(n.pond!==null){let $=ee(s,n.pond),T=z(s,$,s.r-12),L=z(s,$-4,s.r-26),O=z(s,$+4,s.r-26);d=x`<polygon class="pond-marker" points="${T.join(",")} ${L.join(",")} ${O.join(",")}"/>`}let c=[n.heating===null?null:r(n.heating?"heating":"idle"),n.mode?r(n.mode):null,n.position?r(n.position):null].filter(Boolean),h=At(n.history,o,i,Tt),p=Tt,k=h?x`<g class="spark" role="img" aria-label=${r("history_24h")}>
          <rect x=${p.x} y=${Math.max(h.bandTop,p.y)} width=${p.w}
            height=${Math.max(Math.min(h.bandBottom,p.y+p.h)-Math.max(h.bandTop,p.y),0)} class="spark-band"/>
          <line x1=${p.x} x2=${p.x+p.w} y1=${h.target} y2=${h.target} class="spark-target"/>
          <path d=${h.line} class="spark-line"/>
          <text x=${p.x} y=${p.y+p.h+11} class="spark-label">−24 h</text>
          <text x=${p.x+p.w} y=${p.y+p.h+11} class="spark-label" text-anchor="end">${r("now")}</text>
          <text x=${p.x-4} y=${p.y+4} class="spark-label" text-anchor="end">${w(h.hi,1,this.language)}</text>
          <text x=${p.x-4} y=${p.y+p.h} class="spark-label" text-anchor="end">${w(h.lo,1,this.language)}</text>
        </g>`:x``;return b`
      <div class="wrap">
        <svg viewBox="0 0 360 330" class="gauge">
          <path d=${ke(s,135,405)} class="ring"/>
          <path d=${ke(s,ee(s,o-i),ee(s,o+i))} class="band"/>
          ${l}
          ${d}
          <circle cx=${a} cy=${m} r="12" class="handle" tabindex="0" role="slider"
            aria-label=${r("target")} aria-valuemin=${n.min} aria-valuemax=${n.max} aria-valuenow=${o}
            @pointerdown=${this.onDown} @pointermove=${this.onMove} @pointerup=${this.onUp}
            @keydown=${$=>this.onKey($,"target")}/>
          <path d=${ke(s,135,405)} class="hit"
            @pointerdown=${this.onDown} @pointermove=${this.onMove} @pointerup=${this.onUp}/>
          <text x="180" y="140" class="caption" text-anchor="middle">${r("pond")}</text>
          <text x="180" y="178" class="pond" text-anchor="middle">${n.pond===null?"\u2013":`${w(n.pond,1,this.language)} \xB0C`}</text>
          <text x="180" y="200" class="status ${n.position??""}" text-anchor="middle">${c.join(" \xB7 ")}</text>
          ${k}
        </svg>
        <div class="stepper" style="--window:${3}">
          <span class="caption">${r("target")}</span>
          <button @click=${()=>this.setTarget(o-n.step)} aria-label="−">−</button>
          <span class="number">${w(o,1,this.language)} °C</span>
          <button @click=${()=>this.setTarget(o+n.step)} aria-label="+">+</button>
        </div>
        ${n.bandEntity===null?g:b`
          <div class="band-slider">
            <span class="caption">${r("band")}</span>
            <span class="number">± ${w(i,2,this.language)} °C</span>
            <input type="range" min=${Ct} max=${Pt} step=${Ke} .value=${String(i)}
              aria-label=${r("band")} @input=${this.onSlider} @keydown=${$=>this.onKey($,"band")}/>
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
  `;var Sn=`M-98 394 q20 -7 40 0 ${"t40 0 ".repeat(19)}V458 H-98 Z`,Cn=`M-98 400 q20 5 40 0 ${"t40 0 ".repeat(19)}V458 H-98 Z`;function E(t,e,n,r="label",o="start",i=""){return n===null?g:x`<text x=${t} y=${e} class=${r} text-anchor=${o} style=${i}>${n}</text>`}function Ht(t,e){let n=r=>r?"on":"";return x`
  <svg viewBox="0 0 640 480" role="img" aria-label=${e("heat_pump")} class="illustration">
    <g class="air ${n(t.fan)}">
      <path d="M40 122 H160"/><path d="M40 142 H160"/><path d="M472 122 H600"/><path d="M472 142 H600"/>
    </g>
    <polygon points="160,116 172,132 160,148" class="arrow"/>
    <polygon points="600,116 612,132 600,148" class="arrow"/>
    ${E(40,104,t.airIn===null?null:e("air_in"))}
    ${E(40,170,t.airIn,"value")}
    ${E(520,104,t.airOut===null?null:e("air_out"))}
    ${E(520,170,t.airOut,"value")}

    <g class="legend" transform="translate(40 210)">
      <line x1="0" y1="0" x2="18" y2="0" class="hotgas-line"/><text x="24" y="4">${e("hot_gas")}</text>
      <line x1="0" y1="16" x2="18" y2="16" class="liquid-line"/><text x="24" y="20">${e("liquid")}</text>
      <line x1="0" y1="32" x2="18" y2="32" class="suction-line"/><text x="24" y="36">${e("suction_gas")}</text>
    </g>

    <rect class="housing" x="176" y="40" width="288" height="240" rx="14"/>
    <text x="192" y="58" class="label">${e("heat_pump")}</text>
    ${t.mode===null?g:x`
      <rect class="badge ${t.mode}" x="398" y="48" width="54" height="22" rx="11"/>
      <text x="425" y="64" class="badge-text" text-anchor="middle">${e(t.mode).toUpperCase()}</text>`}

    <rect class="hx" x="252" y="196" width="136" height="48" rx="8"/>
    <polyline class="coil" points="366,206 350,230 334,206 318,230 302,206 286,230 274,206"/>
    <text x="320" y="190" class="label" text-anchor="middle">${e("heat_exchanger")}</text>
    ${E(320,258,t.thermal===null?null:e("thermal"),"label","middle")}
    ${E(320,274,t.thermal,"small","middle")}

    <g class="refrigerant ${n(t.compressor)}">
      <path class="rpipe" d="M196 86 V74 H378 V86"/><path class="rflow suction" d="M196 86 V74 H378 V86"/>
      <path class="rpipe" d="M404 122 H420 V206 H366"/><path class="rflow hotgas" d="M404 122 H420 V206 H366"/>
      <path class="rpipe" d="M274 206 H262 V188 H196 V178"/><path class="rflow liquid" d="M274 206 H262 V188 H196 V178"/>
    </g>
    <g transform="translate(228 188)" class="valve">
      <polygon points="-9,-7 -9,7 0,0"/><polygon points="9,-7 9,7 0,0"/>
    </g>
    ${E(424,150,t.gas===null?null:e("gas"),"label hot")}
    ${E(424,166,t.gas,"tiny hot")}
    ${E(246,208,t.liquid===null?null:e("liquid"),"label warmtext","end")}
    ${E(246,223,t.liquid,"small warmtext","end")}

    <rect class="evaporator" x="188" y="86" width="16" height="92" rx="3"/>
    <path class="fins" d="M188 98 H204 M188 110 H204 M188 122 H204 M188 134 H204 M188 146 H204 M188 158 H204 M188 170 H204"/>
    <text transform="translate(214 132) rotate(-90)" class="tiny-label" text-anchor="middle">${e("evaporator")}</text>

    <circle class="fan-ring" cx="274" cy="132" r="48"/>
    <g class="fan ${n(t.fan)}">
      <path d="M274 132 C274 104 291 89 304 95 C298 112 285 123 274 132 Z"/>
      <path d="M274 132 C302 132 317 149 311 162 C294 156 283 143 274 132 Z"/>
      <path d="M274 132 C274 160 257 175 244 169 C250 152 263 141 274 132 Z"/>
      <path d="M274 132 C246 132 231 115 237 102 C254 108 265 121 274 132 Z"/>
      <circle cx="274" cy="132" r="7" class="hub"/>
    </g>

    <rect class="comp-body" x="352" y="86" width="52" height="72" rx="10"/>
    <rect class="cylinder" x="363" y="98" width="30" height="48" rx="3"/>
    <g class="piston ${n(t.compressor)}">
      <rect x="365" y="126" width="26" height="10" rx="2" class="piston-head"/>
      <rect x="375" y="136" width="6" height="12" class="piston-rod"/>
    </g>
    <text x="378" y="172" class="label" text-anchor="middle">${e("compressor")}</text>

    ${t.electrical===null?g:x`
      <path class="cord" d="M464 250 C496 250 512 272 548 270"/>
      <rect x="546" y="262" width="16" height="16" rx="3" class="plug"/>
      <rect x="562" y="266" width="6" height="2.5" class="pin"/><rect x="562" y="271.5" width="6" height="2.5" class="pin"/>
      <rect x="570" y="248" width="44" height="44" rx="8" class="socket"/>
      <circle cx="592" cy="270" r="13" class="socket-face"/>
      <circle cx="586" cy="270" r="2.5" class="hole"/><circle cx="598" cy="270" r="2.5" class="hole"/>
      <text x="592" y="308" class="label" text-anchor="middle">${e("electrical")}</text>
      <text x="592" y="324" class="value" text-anchor="middle">${t.electrical}</text>`}

    <g class="water ${n(t.flow)}">
      <path class="pipe" d="M100 380 V312 H230 V236 H252"/><path class="flow cold" d="M100 380 V312 H230 V236 H252"/>
      <path class="pipe" d="M388 236 H410 V312 H540 V380"/><path class="flow warm" d="M388 236 H410 V312 H540 V380"/>
    </g>
    <polygon points="533,366 547,366 540,380" class="warm-arrow"/>
    ${E(242,300,t.waterIn===null?null:e("water_in"))}
    ${E(242,318,t.waterIn,"value")}
    ${E(398,300,t.waterOut===null?null:e("water_out"),"label","end")}
    ${E(398,318,t.waterOut,"value","end")}

    <g class="pump ${t.pump}" transform="translate(160 312)">
      <circle class="pump-body" r="20"/><polygon class="pump-tri" points="-11,-15 -11,15 17,0"/>
    </g>
    <text x="160" y="348" class="label" text-anchor="middle">${e("pump")} · ${e(t.pump)}</text>
    ${E(160,364,t.pumpText,"small","middle")}

    <path d="M60 380 H580 V450 Q580 460 570 460 H70 Q60 460 60 450 Z" class="tub"/>
    <clipPath id="phpc-tub"><path d="M61 381 H579 V450 Q579 459 570 459 H70 Q61 459 61 450 Z"/></clipPath>
    <g clip-path="url(#phpc-tub)">
      <path class="wave" d=${Sn}/><path class="wave2" d=${Cn}/>
    </g>
    <text x="320" y="438" class="label" text-anchor="middle">${e("pond")}</text>
    ${E(320,422,t.pond,"pond-temp","middle")}
  </svg>`}var Rt=R`
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
  .badge { fill: #9e9e9e; } .badge.low { fill: #1e88e5; } .badge.high { fill: #ef6c00; }
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
`;function Lt(t){return t>=900?"wide":t>=560?"medium":"narrow"}function Ot(t){return t==="wide"?3:t==="medium"?2:1}var Pn={narrow:{heat_pump:1,thermostat:1,plan:1,side:1,model:1},medium:{heat_pump:1,thermostat:1,plan:2,side:1,model:1},wide:{heat_pump:1,thermostat:1,plan:3,side:1,model:3}};function Nt(t,e){return Pn[t][e]}function zt(t){return t==="wide"?1200:t==="medium"?900:600}var Ut={columns:"full",min_columns:6,rows:"auto"};var It={pond:"pond",heat_pump:"HEAT PUMP",air_in:"air in",air_out:"air out",water_in:"water in",water_out:"water out",evaporator:"evaporator",compressor:"compressor",heat_exchanger:"heat exchanger",thermal:"thermal",electrical:"electrical",gas:"gas",liquid:"liquid",hot_gas:"hot gas",suction_gas:"suction gas",pump:"pump",running:"running",fault:"fault",off:"off",low:"low",high:"high",target:"target",band:"band",heating:"heating",idle:"idle",in_band:"in band",above_band:"above band",below_band:"below band",next_start:"next start",next_stop:"next stop",controlling:"controlling",dry_run:"dry run",planned_cost:"planned cost 24 h",planned_energy:"planned electricity 24 h",expensive_share:"in expensive quarters",cop:"COP",heat_loss:"heat loss",thermal_power:"thermal power",insulation_cover:"insulation cover",control:"control the heat pump",model:"Model",cooling:"cooling",heating_low:"heating rate low",heating_high:"heating rate high",prediction_error:"prediction error",learned:"learned",cop_by_outdoor:"COP by outdoor temperature",plan:"Plan",price:"price",now:"now",known_prices:"known prices",legend_pond:"pond temperature (predicted)",legend_measured:"pond temperature (measured)",tip_measured:"measured",tip_predicted:"predicted",tip_mode:"mode",tip_forecast:"forecast",tip_expensive:"expensive quarter",tip_solar:"solar surplus",legend_expensive:"expensive quarters",legend_solar:"solar surplus",legend_forecast:"forecast prices from",no_plan_yet:"No plan yet",plan_title:"Plan:",history_24h:"pond temperature, last 24 hours",reason_no_pond_temperature:"waiting for the pond temperature",reason_no_plan:"the planner could not make a plan",reason_unavailable:"the planner is not available",reason_other:"waiting for the next planning cycle",no_device:"Choose a planner device in the card editor.",plan_summary:"Plan: {parts}.",device:"Planner device",hours:"Width of the plan chart (hours, ending at the last known price)",sections:"Sections",language:"Language",language_auto:"Follow the integration",language_en:"English",language_nl:"Nederlands"},Tn={pond:"vijver",heat_pump:"WARMTEPOMP",air_in:"lucht in",air_out:"lucht uit",water_in:"water in",water_out:"water uit",evaporator:"verdamper",compressor:"compressor",heat_exchanger:"warmtewisselaar",thermal:"thermisch",electrical:"elektrisch",gas:"gas",liquid:"vloeistof",hot_gas:"heet gas",suction_gas:"zuiggas",pump:"pomp",running:"in bedrijf",fault:"storing",off:"uit",low:"laag",high:"hoog",target:"streefwaarde",band:"band",heating:"verwarmt",idle:"rust",in_band:"binnen band",above_band:"boven band",below_band:"onder band",next_start:"volgende start",next_stop:"volgende stop",controlling:"stuurt aan",dry_run:"alleen plannen",planned_cost:"geplande kosten 24 u",planned_energy:"gepland stroomverbruik 24 u",expensive_share:"in dure kwartieren",cop:"COP",heat_loss:"warmteverlies",thermal_power:"thermisch vermogen",insulation_cover:"isolatiekap",control:"warmtepomp aansturen",model:"Model",cooling:"afkoeling",heating_low:"opwarmsnelheid laag",heating_high:"opwarmsnelheid hoog",prediction_error:"voorspelfout",learned:"geleerd",cop_by_outdoor:"COP per buitentemperatuur",plan:"Plan",price:"prijs",now:"nu",known_prices:"bekende prijzen",legend_pond:"vijvertemperatuur (voorspeld)",legend_measured:"vijvertemperatuur (gemeten)",tip_measured:"gemeten",tip_predicted:"voorspeld",tip_mode:"stand",tip_forecast:"verwacht",tip_expensive:"duur kwartier",tip_solar:"zonne-overschot",legend_expensive:"dure kwartieren",legend_solar:"zonne-overschot",legend_forecast:"verwachte prijzen vanaf",no_plan_yet:"Nog geen plan",plan_title:"Plan:",history_24h:"vijvertemperatuur, afgelopen 24 uur",reason_no_pond_temperature:"wacht op de vijvertemperatuur",reason_no_plan:"de planner kon geen plan maken",reason_unavailable:"de planner is niet beschikbaar",reason_other:"wacht op de volgende planningsronde",no_device:"Kies een planner-apparaat in de kaarteditor.",plan_summary:"Plan: {parts}.",device:"Planner-apparaat",hours:"Breedte van de plangrafiek (uren, tot de laatste bekende prijs)",sections:"Blokken",language:"Taal",language_auto:"Volg de integratie",language_en:"English",language_nl:"Nederlands"};function Ee(t){let e=(t??"en").toLowerCase().startsWith("nl")?Tn:It;return(n,r)=>{let o=e[n]??It[n]??n;for(let[i,s]of Object.entries(r??{}))o=o.replace(`{${i}}`,String(s));return o}}var Dt=["en","nl"];function Se(t,e,n){return t.language&&Dt.includes(t.language)?t.language:typeof e=="string"&&Dt.includes(e)?e:n??"en"}var y=15*60*1e3,Hn=30*60*1e3;function Rn(t,e,n){let r=n*36e5,o=Math.ceil(e/y)*y,i=Math.floor(t/y)*y;return o-r>i?{start:i,end:i+r}:{start:o-r,end:o}}function Ln(t,e){let n=t.history.filter(r=>r.t>=e&&r.t<=t.now);return t.pond!==null&&n.push({t:t.now,temp:t.pond}),n}function On(t,e){let n=t.quarters[0].t;return t.history.map(r=>({t:r.t-y,mode:r.mode??null,price:r.price??null})).filter(r=>r.t>=e&&r.t<n&&(r.mode!==null||r.price!==null))}function jt(t,e){if(!t.length)return 0;let n=(t.length-1)*e,r=Math.floor(n),o=Math.ceil(n);return t[r]+(t[o]-t[r])*(n-r)}function Bt(t,e,n=6){let r=new Date(t);r.setMinutes(0,0,0),r.getTime()<t&&r.setHours(r.getHours()+1);let o=[];for(;r.getTime()<e;r.setHours(r.getHours()+1))r.getHours()%n===0&&o.push({t:r.getTime(),midnight:r.getHours()===0});return o}function Ce(t,e,n,r=28){let o=t.quarters,{start:i,end:s}=Rn(t.now,o[o.length-1].t+y,t.hours),l=Ln(t,i),a=o.map(f=>f.temp).concat(l.map(f=>f.temp),[t.target-t.band,t.target+t.band]),m=Math.floor((Math.min(...a)-.1)*10)/10,d=Math.ceil((Math.max(...a)+.1)*10)/10,c=On(t,i),h=o.map(f=>f.price).concat(c.flatMap(f=>f.price===null?[]:[f.price])),p=Math.min(...h),k=Math.max(...h)===p?p+.01:Math.max(...h),$=o.map((f,u)=>{let M=o.slice(Math.floor(u/96)*96,Math.floor(u/96)*96+96).map(P=>P.price);return o[u].price>jt([...M].sort((P,U)=>P-U),.75)}),T=96*y,L=f=>Math.floor((f-o[0].t)/T),O=c.map(f=>{if(f.price===null)return!1;let u=c.filter(M=>M.price!==null&&L(M.t)===L(f.t)).map(M=>M.price);return f.price>jt(u.sort((M,P)=>M-P),.75)}),F=o.find(f=>!f.known),D=n-r*2;return{x:f=>r+(f-i)/(s-i)*(e-r*2),t:f=>i+(f-r)/(e-r*2)*(s-i),yTemp:f=>r+(1-(f-m)/(d-m))*D,yPrice:f=>r+(1-(f-p)/(k-p))*D,tempMin:m,tempMax:d,priceMin:p,priceMax:k,start:i,end:s,measured:l,expensive:$,past:c,pastExpensive:O,knownUntil:F?F.t:null}}function Ft(t,e){let n=[...e.past,...t.quarters].filter(o=>o.t>=e.start&&o.t<e.end),r=null;return n.flatMap(o=>{if(o.price===null)return[];let i=r===null||o.t!==r+y?"M":"L";return r=o.t,[`${i}${e.x(o.t).toFixed(1)} ${e.yPrice(o.price).toFixed(1)} H${e.x(o.t+y).toFixed(1)}`]}).join(" ")}function Vt(t){let e=null;return t.measured.map(n=>{let r=e===null||n.t-e>Hn?"M":"L";return e=n.t,`${r}${t.x(n.t).toFixed(1)} ${t.yTemp(n.temp).toFixed(1)}`}).join(" ")}function qt(t,e){let n=t.quarters.filter(r=>r.t+y>t.now&&r.t>=e.start).map(r=>[e.x(r.t+y),e.yTemp(r.temp)]);return t.pond!==null&&t.now>=e.start&&n.unshift([e.x(t.now),e.yTemp(t.pond)]),n.map(([r,o],i)=>`${i?"L":"M"}${r.toFixed(1)} ${o.toFixed(1)}`).join(" ")}function Wt(t,e){let n=Math.floor(t.t(e)/y)*y;return Math.min(Math.max(n,t.start),t.end-y)}function Gt(t,e,n){let r={t:n,temp:null,measured:!1,mode:null,price:null,known:!0,expensive:!1,surplus:null},o=t.quarters.findIndex(i=>i.t===n);if(o>=0){let i=t.quarters[o];return{...r,temp:i.temp,mode:i.mode,price:i.price,known:i.known,expensive:e.expensive[o],surplus:i.surplus}}if(n<t.now){let i=e.past.findIndex(m=>m.t===n),s=i>=0?{mode:e.past[i].mode,price:e.past[i].price,expensive:e.pastExpensive[i]}:{},l=n+y,a=e.measured.filter(m=>Math.abs(m.t-l)<=y/2);if(a.length){let m=a.reduce((d,c)=>Math.abs(c.t-l)<Math.abs(d.t-l)?c:d);return{...r,...s,temp:m.temp,measured:!0}}return{...r,...s}}return r}function Nn(t){let e=[];for(let n of t){let r=e[e.length-1];r&&r.mode===n.mode?r.to=n.t+y:e.push({mode:n.mode,from:n.t,to:n.t+y})}return e}function Kt(t,e,n="en"){let r=Nn(t.quarters).map(o=>`${e(o.mode)} ${B(o.from,n)}\u2013${B(o.to,n)}`);return e("plan_summary",{parts:r.join(", ")})}var Qe=600,S=220,zn=70,Qt=(t,e)=>new Date(t).toLocaleDateString(e,{weekday:"short",day:"numeric",month:"short"});function Un(t,e,n){let r=[`${Qt(t.t,n)} ${B(t.t,n)}\u2013${B(t.t+y,n)}`];return t.temp!==null&&r.push(`${w(t.temp,2,n)} \xB0C ${e(t.measured?"tip_measured":"tip_predicted")}`),t.mode!==null&&r.push(`${e("tip_mode")}: ${e(t.mode)}`),t.price!==null&&r.push(`\u20AC ${w(t.price,3,n)}/kWh${t.known?"":` (${e("tip_forecast")})`}`),t.expensive&&r.push(e("tip_expensive")),t.surplus&&r.push(`${e("tip_solar")} ${w(t.surplus,1,n)} kW`),r}function In(t,e,n,r=Qe,o=null,i=Ce(t,r,S)){let s=t.quarters,l=i.x(s[0].t+y)-i.x(s[0].t),a={off:0,low:.5,high:1},m=s.map((u,M)=>{if(u.t<i.start||u.t>=i.end)return x``;let P=18*a[u.mode],U=i.expensive[M]?x`<rect x=${i.x(u.t)} y="28" width=${l} height=${S-56} class="expensive"/>`:x``,be=u.surplus?x`<rect x=${i.x(u.t)} y=${S-26} width=${l} height="4" class="sun"/>`:x``;return x`${U}${be}<rect x=${i.x(u.t)} y=${S-28-P} width=${l} height=${P} class="bar ${u.mode}"/>`}),d=i.past.map((u,M)=>{let P=i.pastExpensive[M]?x`<rect x=${i.x(u.t)} y="28" width=${l} height=${S-56} class="expensive"/>`:x``;if(u.mode===null)return P;let U=18*a[u.mode];return x`${P}<rect x=${i.x(u.t)} y=${S-28-U} width=${l} height=${U} class="bar past ${u.mode}"/>`}),c=Ft(t,i),h=i.yTemp(t.target+t.band),p=i.yTemp(t.target-t.band),k=Math.min(Math.max(i.x(t.now),28),r-28),$=Bt(i.start,i.end),T=$.map(u=>x`<line x1=${i.x(u.t)} x2=${i.x(u.t)} y1="28" y2=${S-28} class=${u.midnight?"day":"grid"}/>`),L=$.map(u=>x`<text x=${i.x(u.t)} y=${S-8} class="axis" text-anchor="middle">${B(u.t,n)}</text>`),O=$.find(u=>u.midnight),D=[...O&&i.x(O.t)-28<zn?[]:[{t:i.start,x:28}],...$.filter(u=>u.midnight).map(u=>({t:u.t,x:i.x(u.t)}))].map(u=>x`<text x=${u.x+4} y="40" class="day-label">${Qt(u.t,n)}</text>`),f=x``;if(o){let u=i.x(o.t+y/2),M=o.temp===null?x``:x`<circle cx=${i.x(o.t+y)} cy=${i.yTemp(o.temp)} r="4" class="hover-dot"/>`;f=x`<line x1=${u} x2=${u} y1="28" y2=${S-28} class="hair"/>${M}`}return x`
    <svg viewBox="0 0 ${r} ${S}" class="chart" role="img" aria-label=${Kt(t,e,n)}>
      ${T}
      <rect x="28" y=${h} width=${r-56} height=${p-h} class="band"/>
      ${d}
      ${m}
      <line x1="28" x2=${r-28} y1=${i.yTemp(t.target)} y2=${i.yTemp(t.target)} class="target"/>
      <path d=${c} class="price"/>
      <path d=${Vt(i)} class="measured"/>
      <path d=${qt(t,i)} class="temp"/>
      ${i.knownUntil===null?x``:x`<line x1=${i.x(i.knownUntil)} x2=${i.x(i.knownUntil)} y1="28" y2=${S-28} class="known"/>`}
      <line x1=${k} x2=${k} y1="20" y2=${S-28} class="now"/>
      <text x="4" y="20" class="axis">${w(i.tempMax,1,n)} °C</text>
      <text x="4" y=${S-30} class="axis">${w(i.tempMin,1,n)}</text>
      <text x=${r-4} y="20" class="axis" text-anchor="end">€ ${w(i.priceMax,2,n)}</text>
      <text x=${r-4} y=${S-30} class="axis" text-anchor="end">€ ${w(i.priceMin,2,n)}</text>
      ${L}
      ${D}
      ${f}
    </svg>`}var ge=class extends C{constructor(){super(...arguments);this.language="en";this.width=Qe;this._hover=null;this.onPointer=n=>{let r=n.currentTarget.getBoundingClientRect();r.width&&(this._hover=Wt(this.scales,(n.clientX-r.left)/r.width*this.width))};this.onLeave=n=>{n.pointerType==="mouse"&&(this._hover=null)};this.onOutside=n=>{this._hover!==null&&!n.composedPath().includes(this)&&(this._hover=null)};this.onKey=n=>{let r=this.scales,o=this._hover??Math.floor(this.model.now/y)*y,i={ArrowLeft:o-y,ArrowRight:o+y,Home:r.start,End:r.end-y,Escape:null};if(!(n.key in i))return;n.preventDefault();let s=i[n.key];this._hover=s===null?null:Math.min(Math.max(s,r.start),r.end-y)}}createRenderRoot(){return this}get scales(){return Ce(this.model,this.width,S)}connectedCallback(){super.connectedCallback(),window.addEventListener("pointerdown",this.onOutside)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("pointerdown",this.onOutside)}render(){if(!this.model)return g;let n=this.scales,r=this._hover===null?null:Gt(this.model,n,this._hover),o=r?Un(r,this.t,this.language):[],i=g;if(r){let s=n.x(r.t+y/2)/this.width*100,l=s>50?`right:${(100-s).toFixed(1)}%`:`left:${s.toFixed(1)}%`;i=b`<div class="tooltip ${s>50?"to-left":"to-right"}" style=${l}>
        ${o.map((a,m)=>b`<div class=${m?"":"tip-time"}>${a}</div>`)}
      </div>`}return b`<div class="plot" tabindex="0" @pointermove=${this.onPointer} @pointerdown=${this.onPointer}
        @pointerleave=${this.onLeave} @keydown=${this.onKey}>
        ${In(this.model,this.t,this.language,this.width,r,n)}${i}
        <span class="sr-only" aria-live="polite">${o.join(", ")}</span>
      </div>`}};ge.properties={model:{attribute:!1},t:{attribute:!1},language:{},width:{type:Number},_hover:{state:!0}};function Dn(t){let e=Ce(t,Qe,S),n=[...e.measured.length>1?[{key:"legend_measured",swatch:"line"}]:[],{key:"legend_pond",swatch:"predicted"},{key:"target",swatch:"dashed"},{key:"band",swatch:"area"},{key:"low",swatch:"low"},{key:"high",swatch:"high"},{key:"price",swatch:"step"}];return(e.expensive.some(Boolean)||e.pastExpensive.some(Boolean))&&n.push({key:"legend_expensive",swatch:"expensive"}),t.quarters.some(r=>r.surplus)&&n.push({key:"legend_solar",swatch:"solar"}),n.push({key:"now",swatch:"now"}),e.knownUntil!==null&&n.push({key:"legend_forecast",swatch:"dotted"}),n}function Zt(t,e){return b`<ul class="chart-legend">
    ${Dn(t).map(n=>b`<li><span class="sw ${n.swatch}"></span>${e(n.key)}</li>`)}
  </ul>`}var Xt=R`
  .chart-legend { list-style: none; display: flex; flex-wrap: wrap; gap: 4px 14px; margin: 6px 0 0; padding: 0; font-size: 11px; color: var(--secondary-text-color); }
  .chart-legend li { display: flex; align-items: center; gap: 5px; }
  .sw { display: inline-block; width: 18px; height: 10px; box-sizing: border-box; }
  .sw.line { border-top: 2.5px solid var(--phpc-pond-color, #1e88e5); height: 0; }
  .sw.predicted { border-top: 2.5px dashed var(--phpc-pond-color, #1e88e5); height: 0; }
  .sw.dashed { border-top: 1.5px dashed var(--primary-text-color); height: 0; opacity: 0.6; }
  .sw.area { background: var(--success-color, #66bb6a); opacity: 0.3; }
  .sw.low { background: #1e88e5; opacity: 0.55; } .sw.high { background: #ef6c00; opacity: 0.6; }
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
  .bar.past.low { opacity: 0.3; } .bar.past.high { opacity: 0.35; }
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
`;function te(t,e){return e===null?g:b`<div class="fig"><span class="v">${e}</span><span class="l">${t}</span></div>`}function Yt(t,e,n){let r=[t.nextStop?`${e("next_stop")} ${me(t.nextStop,n)}`:null,t.nextStart?`${e("next_start")} ${me(t.nextStart,n)}`:null,t.control===null?null:e(t.control?"controlling":"dry_run")].filter(Boolean);return b`<div class="next">${r.join(" \xB7 ")}</div>`}function Jt(t,e){return b`<div class="figures">
    ${te(e("planned_cost"),t.cost)} ${te(e("planned_energy"),t.energy)}
    ${te(e("expensive_share"),t.expensive)}
    ${te(t.copMethod?`${e("cop")} (${t.copMethod})`:e("cop"),t.cop)}
    ${te(e("heat_loss"),t.heatLoss)} ${te(e("thermal_power"),t.thermal)}
  </div>`}function en(t,e,n){let r=(o,i)=>o===null?g:b`<label class="switch"><input type="checkbox" .checked=${o.on} @change=${s=>n(o.entity,s.target.checked)}/>${e(i)}</label>`;return b`<div class="switches">${r(t.cover,"insulation_cover")} ${r(t.control,"control")}</div>`}function tn(t,e){let n=[[e("cooling"),t.cooling],[e("heating_low"),t.heatingLow],[e("heating_high"),t.heatingHigh],[e("prediction_error"),t.predictionError],[e("learned"),t.learned]];return b`<details class="model"><summary>${e("model")}</summary>
    <table>${n.filter(([,r])=>r!==null).map(([r,o])=>b`<tr><td>${r}</td><td>${o}</td></tr>`)}</table>
    ${t.copByOutdoor.length?b`<div class="l">${e("cop_by_outdoor")}</div>
          <table>${t.copByOutdoor.map(([r,o])=>b`<tr><td>${r} °C</td><td>${o??"\u2013"}</td></tr>`)}</table>`:g}
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
`;var Te=["off","low","high"];function jn(t){return Array.isArray(t)?t.map(e=>({t:Date.parse(e?.time),temp:Number(e?.temp),mode:Te.includes(e?.mode)?e.mode:null,price:e?.price===void 0||e?.price===null||!Number.isFinite(Number(e.price))?null:Number(e.price)})).filter(e=>Number.isFinite(e.t)&&Number.isFinite(e.temp)).sort((e,n)=>e.t-n.t):[]}function A(t,e){return e?t.states[e]:void 0}function H(t){return!!t&&t.state!=="unavailable"&&t.state!=="unknown"}function v(t,e){let n=A(t,e);return H(n)?N(n.state):null}function Pe(t,e){return A(t,e)?.state==="on"}function Bn(t,e,n){let r=A(t,n.model_status)?.attributes.links??{},o={water_in:r.inlet_temperature,water_out:r.outlet_temperature,air_in:r.air_inlet_temperature,power:r.power,flow:r.circulation},i={};for(let[s,l]of Object.entries({...o,...e.heat_pump??{}}))l&&(i[s]=l);return i}function rn(t,e,n=Date.now()){let r=ve(t,e.device_id),o=(e.sections?.length?e.sections:[...de]).filter(_=>de.includes(_)),i=Bn(t,e,r),l=[...Object.values(r),...Object.values(i)].map(_=>`${_}:${A(t,_)?.last_updated??"-"}`).join("|"),a=Se(e,A(t,r.mode)?.attributes.language,t.locale?.language??t.language),m={sections:o,illustration:null,gauge:null,plan:null,planMissing:null,figures:null,switches:null,model:null,missingDevice:!e.device_id||Object.keys(r).length===0,language:a,signature:l};if(m.missingDevice)return m;let d=A(t,r.thermostat),c=A(t,r.mode),h=H(c)&&Te.includes(c.state)?c.state:null,p=H(d)?N(d.attributes.current_temperature):null,k=H(d)?N(d.attributes.temperature)??15:15,$=v(t,r.band)??.25,T=v(t,r.thermal_power),L=A(t,i.pump_speed),O=v(t,i.pump_power),F=Pe(t,i.pump_fault),D=Te.includes(c?.attributes.measured_mode)&&c?.attributes.measured_mode!=="off",f=_=>_?Pe(t,_):D,u=f(i.flow),M=[K(v(t,i.pump_speed),L?.attributes.unit_of_measurement,0,a),he(O,a)].filter(Boolean),P={pond:J(p,a),waterIn:J(v(t,i.water_in),a),waterOut:J(v(t,i.water_out),a),airIn:J(v(t,i.air_in),a),airOut:J(v(t,i.air_out),a),electrical:he(v(t,i.power),a),thermal:he(T,a),liquid:Y(v(t,i.liquid),0,a)&&`${Y(v(t,i.liquid),0,a)} \xB0C`,gas:Y(v(t,i.gas),0,a)&&`${Y(v(t,i.gas),0,a)} \xB0C`,mode:h,fan:f(i.fan),flow:u,compressor:f(i.compressor),pump:F?"fault":u?"running":"off",pumpText:M.length?M.join(" \xB7 "):null},U=H(d)?d.attributes.hvac_action:null,be=jn(c?.attributes.pond_history),an=r.thermostat?{pond:p,target:k,band:$,min:N(d?.attributes.min_temp)??5,max:N(d?.attributes.max_temp)??28,step:N(d?.attributes.target_temp_step)??.1,heating:U==="heating"?!0:U==="idle"?!1:null,mode:h,position:p===null?null:p>k+$?"above_band":p<k-$?"below_band":"in_band",thermostat:r.thermostat,bandEntity:r.band??null,nextStart:H(A(t,r.next_start))?A(t,r.next_start).state:null,nextStop:H(A(t,r.next_stop))?A(t,r.next_stop).state:null,control:r.control?Pe(t,r.control):null,history:be.filter(_=>_.t>=n-24*36e5)}:null,ln=c?.attributes.plan??[],Xe=e.hours??36,Ye=ln.map(_=>({t:Date.parse(_.start),mode:Te.includes(_.mode)?_.mode:"off",temp:Number(_.temp),price:Number(_.price),known:_.known!==!1,surplus:_.surplus===void 0?null:Number(_.surplus)})).filter(_=>Number.isFinite(_.t)&&Number.isFinite(_.temp)).slice(0,Xe*4),Je=Ye.length?{quarters:Ye,target:k,band:$,now:n,hours:Xe,history:be,pond:p}:null,re=A(t,r.planned_cost),et=A(t,r.cop),tt=H(re)?N(re.attributes.expensive_share):null,nt=v(t,r.heat_loss),cn={cost:H(re)&&N(re.state)!==null?`\u20AC ${w(N(re.state),2,a)}`:null,energy:K(v(t,r.planned_energy),"kWh",1,a),expensive:tt===null?null:`${Math.round(tt*100)} %`,cop:Y(v(t,r.cop),1,a),copMethod:H(et)?et.attributes.method??null:null,heatLoss:nt===null?null:`${Math.round(nt)} W/K`,thermal:he(T,a)},rt=_=>r[_]?{entity:r[_],on:Pe(t,r[_])}:null,pn=A(t,r.cop)?.attributes.by_outdoor??{},un={cooling:K(v(t,r.cooling_coefficient),"1/h",4,a),heatingLow:K(v(t,r.heating_rate_low),"K/h",3,a),heatingHigh:K(v(t,r.heating_rate_high),"K/h",3,a),predictionError:K(v(t,r.prediction_error),"K",2,a),learned:H(A(t,r.model_status))?me(A(t,r.model_status).state,a):null,copByOutdoor:Object.entries(pn).map(([_,ot])=>[_,ot===null?null:w(Number(ot),1,a)])},dn=Je?null:H(c)?String(c.attributes.reason??"no_plan"):"unavailable";return{...m,illustration:P,gauge:an,plan:Je,planMissing:dn,figures:cn,switches:{cover:rt("insulation_cover"),control:rt("control")},model:un}}var fe="pond-heatpump-planner-card",Ze="pond-heatpump-planner-card-editor",on="phpc-gauge",sn="phpc-plan-chart",ne=class extends C{constructor(){super(...arguments);this._layout="narrow"}static getConfigElement(){return document.createElement(Ze)}static getStubConfig(n){return{type:`custom:${fe}`,device_id:Mt(n)[0]}}setConfig(n){if(!n)throw new Error("Invalid configuration");this._config={hours:36,...n},this.rebuild(!0)}set hass(n){this._hass=n,this.rebuild(!1)}get hass(){return this._hass}rebuild(n){if(!this._hass||!this._config)return;let r=rn(this._hass,this._config);(n||!this._vm||r.signature!==this._vm.signature)&&(this._vm=r)}getCardSize(){return 12}getGridOptions(){return{...Ut}}connectedCallback(){super.connectedCallback(),typeof ResizeObserver<"u"&&(this._observer=new ResizeObserver(n=>this.resized(n[0]?.contentRect.width??0)),this._observer.observe(this))}disconnectedCallback(){super.disconnectedCallback(),this._observer?.disconnect()}resized(n){let r=Lt(n);r!==this._layout&&(this._layout=r)}get language(){return this._vm?.language??this._hass?.locale?.language??this._hass?.language??"en"}get t(){return Ee(this.language)}call(n,r,o){this._hass?.callService(n,r,o)}content(n,r){let o=this.t,i=this.language;switch(n){case"heat_pump":return r.illustration?Ht(r.illustration,o):g;case"thermostat":return r.gauge?b`<phpc-gauge .model=${r.gauge} .t=${o} .language=${i}
                @set-target=${s=>this.call("climate","set_temperature",{entity_id:r.gauge.thermostat,temperature:s.detail.value})}
                @set-band=${s=>r.gauge.bandEntity&&this.call("number","set_value",{entity_id:r.gauge.bandEntity,value:s.detail.value})}
              ></phpc-gauge>
              ${Yt(r.gauge,o,i)}`:g;case"plan":return r.plan?b`<div class="title">${o("plan_title")}</div>
            <phpc-plan-chart .model=${r.plan} .t=${o} .language=${i} .width=${zt(this._layout)}></phpc-plan-chart>
            ${Zt(r.plan,o)}`:r.planMissing===null?g:b`<div class="no-plan"><strong>${o("no_plan_yet")}</strong> · ${this.reasonText(r.planMissing)}</div>`;case"figures":return r.figures?Jt(r.figures,o):g;case"switches":return r.switches&&(r.switches.cover||r.switches.control)?en(r.switches,o,(s,l)=>this.call("switch",l?"turn_on":"turn_off",{entity_id:s})):g;case"model":return r.model?tn(r.model,o):g}}reasonText(n){let r=`reason_${n}`,o=this.t(r);return o===r?this.t("reason_other"):o}blocks(n){let r=[];for(let o of n.sections){let i=this.content(o,n);if(i===g)continue;let s=o==="figures"||o==="switches"?"side":o,l=s==="side"?r.find(a=>a.block==="side"):void 0;l?l.parts.push(i):r.push({block:s,parts:[i]})}return r}render(){let n=this._vm;if(!n)return g;if(n.missingDevice)return b`<ha-card><div class="section warning">${this.t("no_device")}</div></ha-card>`;let r=this._layout;return b`<ha-card class=${r} style="--phpc-columns:${Ot(r)}">
      ${this.blocks(n).map(o=>b`<div class="section ${o.block}" style="grid-column: span ${Nt(r,o.block)}">
          ${o.parts.map(i=>b`<div class="part">${i}</div>`)}
        </div>`)}
    </ha-card>`}};ne.properties={_vm:{state:!0},_layout:{state:!0}},ne.styles=[Rt,Xt,nn,R`
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
    `];var Fn=["water_in","water_out","air_in","air_out","power","liquid","gas","pump_speed","pump_power"];function Vn(t){return[{name:"device_id",selector:{device:{integration:ue}}},{name:"hours",selector:{select:{options:["24","36","48"],mode:"dropdown"}}},{name:"sections",selector:{select:{options:[...de],multiple:!0,reorder:!0}}},{name:"language",selector:{select:{options:kt.map(e=>({value:e,label:t(`language_${e}`)})),mode:"dropdown"}}},{name:"heat_pump",type:"expandable",title:"Heat pump",schema:vt.map(e=>({name:e,selector:{entity:{domain:Fn.includes(e)?"sensor":"binary_sensor"}}}))}]}var xe=class extends C{setConfig(e){this._config=e}changed(e){let n={...e.detail.value};n.hours&&(n.hours=Number(n.hours)),n.language==="auto"&&delete n.language,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:n},bubbles:!0,composed:!0}))}render(){if(!this.hass||!this._config)return b``;let e=ve(this.hass,this._config.device_id),n=Ee(Se(this._config,this.hass.states[e.mode??""]?.attributes.language,this.hass.locale?.language)),r={...this._config,hours:String(this._config.hours??36),language:this._config.language??"auto"};return b`<ha-form
      .hass=${this.hass}
      .data=${r}
      .schema=${Vn(n)}
      .computeLabel=${o=>n(o.name)}
      @value-changed=${this.changed}
    ></ha-form>`}};xe.properties={hass:{attribute:!1},_config:{state:!0}};function Re(t,e){customElements.get(t)||customElements.define(t,e)}Re(on,Q);Re(sn,ge);Re(Ze,xe);Re(fe,ne);var He=window;He.customCards=He.customCards??[];He.customCards.some(t=>t.type===fe)||He.customCards.push({type:fe,name:"Pond Heat Pump Planner",description:"Heat pump illustration, thermostat with band, plan and key figures of the pond heat pump planner.",preview:!0,documentationURL:"https://github.com/abroeders/pond-heatpump-price-planner/blob/main/docs/card.md"});
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
