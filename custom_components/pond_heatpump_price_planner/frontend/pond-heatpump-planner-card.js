var gt=globalThis,ft=gt.ShadowRoot&&(gt.ShadyCSS===void 0||gt.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,St=Symbol(),te=new WeakMap,et=class{constructor(t,n,r){if(this._$cssResult$=!0,r!==St)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=n}get styleSheet(){let t=this.o,n=this.t;if(ft&&t===void 0){let r=n!==void 0&&n.length===1;r&&(t=te.get(n)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),r&&te.set(n,t))}return t}toString(){return this.cssText}},ee=e=>new et(typeof e=="string"?e:e+"",void 0,St),P=(e,...t)=>{let n=e.length===1?e[0]:t.reduce((r,o,i)=>r+(s=>{if(s._$cssResult$===!0)return s.cssText;if(typeof s=="number")return s;throw Error("Value passed to 'css' function must be a 'css' function result: "+s+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+e[i+1],e[0]);return new et(n,e,St)},ne=(e,t)=>{if(ft)e.adoptedStyleSheets=t.map(n=>n instanceof CSSStyleSheet?n:n.styleSheet);else for(let n of t){let r=document.createElement("style"),o=gt.litNonce;o!==void 0&&r.setAttribute("nonce",o),r.textContent=n.cssText,e.appendChild(r)}},Ct=ft?e=>e:e=>e instanceof CSSStyleSheet?(t=>{let n="";for(let r of t.cssRules)n+=r.cssText;return ee(n)})(e):e;var{is:rn,defineProperty:on,getOwnPropertyDescriptor:sn,getOwnPropertyNames:an,getOwnPropertySymbols:ln,getPrototypeOf:cn}=Object,xt=globalThis,re=xt.trustedTypes,pn=re?re.emptyScript:"",dn=xt.reactiveElementPolyfillSupport,nt=(e,t)=>e,Tt={toAttribute(e,t){switch(t){case Boolean:e=e?pn:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},ie=(e,t)=>!rn(e,t),oe={attribute:!0,type:String,converter:Tt,reflect:!1,useDefault:!1,hasChanged:ie};Symbol.metadata??=Symbol("metadata"),xt.litPropertyMetadata??=new WeakMap;var U=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,n=oe){if(n.state&&(n.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((n=Object.create(n)).wrapped=!0),this.elementProperties.set(t,n),!n.noAccessor){let r=Symbol(),o=this.getPropertyDescriptor(t,r,n);o!==void 0&&on(this.prototype,t,o)}}static getPropertyDescriptor(t,n,r){let{get:o,set:i}=sn(this.prototype,t)??{get(){return this[n]},set(s){this[n]=s}};return{get:o,set(s){let l=o?.call(this);i?.call(this,s),this.requestUpdate(t,l,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??oe}static _$Ei(){if(this.hasOwnProperty(nt("elementProperties")))return;let t=cn(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(nt("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(nt("properties"))){let n=this.properties,r=[...an(n),...ln(n)];for(let o of r)this.createProperty(o,n[o])}let t=this[Symbol.metadata];if(t!==null){let n=litPropertyMetadata.get(t);if(n!==void 0)for(let[r,o]of n)this.elementProperties.set(r,o)}this._$Eh=new Map;for(let[n,r]of this.elementProperties){let o=this._$Eu(n,r);o!==void 0&&this._$Eh.set(o,n)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let n=[];if(Array.isArray(t)){let r=new Set(t.flat(1/0).reverse());for(let o of r)n.unshift(Ct(o))}else t!==void 0&&n.push(Ct(t));return n}static _$Eu(t,n){let r=n.attribute;return r===!1?void 0:typeof r=="string"?r:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,n=this.constructor.elementProperties;for(let r of n.keys())this.hasOwnProperty(r)&&(t.set(r,this[r]),delete this[r]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ne(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,n,r){this._$AK(t,r)}_$ET(t,n){let r=this.constructor.elementProperties.get(t),o=this.constructor._$Eu(t,r);if(o!==void 0&&r.reflect===!0){let i=(r.converter?.toAttribute!==void 0?r.converter:Tt).toAttribute(n,r.type);this._$Em=t,i==null?this.removeAttribute(o):this.setAttribute(o,i),this._$Em=null}}_$AK(t,n){let r=this.constructor,o=r._$Eh.get(t);if(o!==void 0&&this._$Em!==o){let i=r.getPropertyOptions(o),s=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:Tt;this._$Em=o;let l=s.fromAttribute(n,i.type);this[o]=l??this._$Ej?.get(o)??l,this._$Em=null}}requestUpdate(t,n,r,o=!1,i){if(t!==void 0){let s=this.constructor;if(o===!1&&(i=this[t]),r??=s.getPropertyOptions(t),!((r.hasChanged??ie)(i,n)||r.useDefault&&r.reflect&&i===this._$Ej?.get(t)&&!this.hasAttribute(s._$Eu(t,r))))return;this.C(t,n,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,n,{useDefault:r,reflect:o,wrapped:i},s){r&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,s??n??this[t]),i!==!0||s!==void 0)||(this._$AL.has(t)||(this.hasUpdated||r||(n=void 0),this._$AL.set(t,n)),o===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(n){Promise.reject(n)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[o,i]of this._$Ep)this[o]=i;this._$Ep=void 0}let r=this.constructor.elementProperties;if(r.size>0)for(let[o,i]of r){let{wrapped:s}=i,l=this[o];s!==!0||this._$AL.has(o)||l===void 0||this.C(o,void 0,i,l)}}let t=!1,n=this._$AL;try{t=this.shouldUpdate(n),t?(this.willUpdate(n),this._$EO?.forEach(r=>r.hostUpdate?.()),this.update(n)):this._$EM()}catch(r){throw t=!1,this._$EM(),r}t&&this._$AE(n)}willUpdate(t){}_$AE(t){this._$EO?.forEach(n=>n.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(n=>this._$ET(n,this[n])),this._$EM()}updated(t){}firstUpdated(t){}};U.elementStyles=[],U.shadowRootOptions={mode:"open"},U[nt("elementProperties")]=new Map,U[nt("finalized")]=new Map,dn?.({ReactiveElement:U}),(xt.reactiveElementVersions??=[]).push("2.1.2");var zt=globalThis,se=e=>e,bt=zt.trustedTypes,ae=bt?bt.createPolicy("lit-html",{createHTML:e=>e}):void 0,he="$lit$",N=`lit$${Math.random().toFixed(9).slice(2)}$`,me="?"+N,un=`<${me}>`,j=document,ot=()=>j.createComment(""),it=e=>e===null||typeof e!="object"&&typeof e!="function",Nt=Array.isArray,hn=e=>Nt(e)||typeof e?.[Symbol.iterator]=="function",Pt=`[ 	
\f\r]`,rt=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,le=/-->/g,ce=/>/g,I=RegExp(`>|${Pt}(?:([^\\s"'>=/]+)(${Pt}*=${Pt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),pe=/'/g,de=/"/g,ge=/^(?:script|style|textarea|title)$/i,It=e=>(t,...n)=>({_$litType$:e,strings:t,values:n}),f=It(1),x=It(2),In=It(3),D=Symbol.for("lit-noChange"),h=Symbol.for("lit-nothing"),ue=new WeakMap,F=j.createTreeWalker(j,129);function fe(e,t){if(!Nt(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return ae!==void 0?ae.createHTML(t):t}var mn=(e,t)=>{let n=e.length-1,r=[],o,i=t===2?"<svg>":t===3?"<math>":"",s=rt;for(let l=0;l<n;l++){let a=e[l],p,m,g=-1,c=0;for(;c<a.length&&(s.lastIndex=c,m=s.exec(a),m!==null);)c=s.lastIndex,s===rt?m[1]==="!--"?s=le:m[1]!==void 0?s=ce:m[2]!==void 0?(ge.test(m[2])&&(o=RegExp("</"+m[2],"g")),s=I):m[3]!==void 0&&(s=I):s===I?m[0]===">"?(s=o??rt,g=-1):m[1]===void 0?g=-2:(g=s.lastIndex-m[2].length,p=m[1],s=m[3]===void 0?I:m[3]==='"'?de:pe):s===de||s===pe?s=I:s===le||s===ce?s=rt:(s=I,o=void 0);let d=s===I&&e[l+1].startsWith("/>")?" ":"";i+=s===rt?a+un:g>=0?(r.push(p),a.slice(0,g)+he+a.slice(g)+N+d):a+N+(g===-2?l:d)}return[fe(e,i+(e[n]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),r]},st=class e{constructor({strings:t,_$litType$:n},r){let o;this.parts=[];let i=0,s=0,l=t.length-1,a=this.parts,[p,m]=mn(t,n);if(this.el=e.createElement(p,r),F.currentNode=this.el.content,n===2||n===3){let g=this.el.content.firstChild;g.replaceWith(...g.childNodes)}for(;(o=F.nextNode())!==null&&a.length<l;){if(o.nodeType===1){if(o.hasAttributes())for(let g of o.getAttributeNames())if(g.endsWith(he)){let c=m[s++],d=o.getAttribute(g).split(N),w=/([.?@])?(.*)/.exec(c);a.push({type:1,index:i,name:w[2],strings:d,ctor:w[1]==="."?Ht:w[1]==="?"?Ot:w[1]==="@"?Lt:W}),o.removeAttribute(g)}else g.startsWith(N)&&(a.push({type:6,index:i}),o.removeAttribute(g));if(ge.test(o.tagName)){let g=o.textContent.split(N),c=g.length-1;if(c>0){o.textContent=bt?bt.emptyScript:"";for(let d=0;d<c;d++)o.append(g[d],ot()),F.nextNode(),a.push({type:2,index:++i});o.append(g[c],ot())}}}else if(o.nodeType===8)if(o.data===me)a.push({type:2,index:i});else{let g=-1;for(;(g=o.data.indexOf(N,g+1))!==-1;)a.push({type:7,index:i}),g+=N.length-1}i++}}static createElement(t,n){let r=j.createElement("template");return r.innerHTML=t,r}};function q(e,t,n=e,r){if(t===D)return t;let o=r!==void 0?n._$Co?.[r]:n._$Cl,i=it(t)?void 0:t._$litDirective$;return o?.constructor!==i&&(o?._$AO?.(!1),i===void 0?o=void 0:(o=new i(e),o._$AT(e,n,r)),r!==void 0?(n._$Co??=[])[r]=o:n._$Cl=o),o!==void 0&&(t=q(e,o._$AS(e,t.values),o,r)),t}var Rt=class{constructor(t,n){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=n}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:n},parts:r}=this._$AD,o=(t?.creationScope??j).importNode(n,!0);F.currentNode=o;let i=F.nextNode(),s=0,l=0,a=r[0];for(;a!==void 0;){if(s===a.index){let p;a.type===2?p=new at(i,i.nextSibling,this,t):a.type===1?p=new a.ctor(i,a.name,a.strings,this,t):a.type===6&&(p=new Ut(i,this,t)),this._$AV.push(p),a=r[++l]}s!==a?.index&&(i=F.nextNode(),s++)}return F.currentNode=j,o}p(t){let n=0;for(let r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(t,r,n),n+=r.strings.length-2):r._$AI(t[n])),n++}},at=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,n,r,o){this.type=2,this._$AH=h,this._$AN=void 0,this._$AA=t,this._$AB=n,this._$AM=r,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,n=this._$AM;return n!==void 0&&t?.nodeType===11&&(t=n.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,n=this){t=q(this,t,n),it(t)?t===h||t==null||t===""?(this._$AH!==h&&this._$AR(),this._$AH=h):t!==this._$AH&&t!==D&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):hn(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==h&&it(this._$AH)?this._$AA.nextSibling.data=t:this.T(j.createTextNode(t)),this._$AH=t}$(t){let{values:n,_$litType$:r}=t,o=typeof r=="number"?this._$AC(t):(r.el===void 0&&(r.el=st.createElement(fe(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===o)this._$AH.p(n);else{let i=new Rt(o,this),s=i.u(this.options);i.p(n),this.T(s),this._$AH=i}}_$AC(t){let n=ue.get(t.strings);return n===void 0&&ue.set(t.strings,n=new st(t)),n}k(t){Nt(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,o=0;for(let i of t)o===n.length?n.push(r=new e(this.O(ot()),this.O(ot()),this,this.options)):r=n[o],r._$AI(i),o++;o<n.length&&(this._$AR(r&&r._$AB.nextSibling,o),n.length=o)}_$AR(t=this._$AA.nextSibling,n){for(this._$AP?.(!1,!0,n);t!==this._$AB;){let r=se(t).nextSibling;se(t).remove(),t=r}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},W=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,n,r,o,i){this.type=1,this._$AH=h,this._$AN=void 0,this.element=t,this.name=n,this._$AM=o,this.options=i,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=h}_$AI(t,n=this,r,o){let i=this.strings,s=!1;if(i===void 0)t=q(this,t,n,0),s=!it(t)||t!==this._$AH&&t!==D,s&&(this._$AH=t);else{let l=t,a,p;for(t=i[0],a=0;a<i.length-1;a++)p=q(this,l[r+a],n,a),p===D&&(p=this._$AH[a]),s||=!it(p)||p!==this._$AH[a],p===h?t=h:t!==h&&(t+=(p??"")+i[a+1]),this._$AH[a]=p}s&&!o&&this.j(t)}j(t){t===h?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},Ht=class extends W{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===h?void 0:t}},Ot=class extends W{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==h)}},Lt=class extends W{constructor(t,n,r,o,i){super(t,n,r,o,i),this.type=5}_$AI(t,n=this){if((t=q(this,t,n,0)??h)===D)return;let r=this._$AH,o=t===h&&r!==h||t.capture!==r.capture||t.once!==r.once||t.passive!==r.passive,i=t!==h&&(r===h||o);o&&this.element.removeEventListener(this.name,this,r),i&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},Ut=class{constructor(t,n,r){this.element=t,this.type=6,this._$AN=void 0,this._$AM=n,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(t){q(this,t)}};var gn=zt.litHtmlPolyfillSupport;gn?.(st,at),(zt.litHtmlVersions??=[]).push("3.3.3");var xe=(e,t,n)=>{let r=n?.renderBefore??t,o=r._$litPart$;if(o===void 0){let i=n?.renderBefore??null;r._$litPart$=o=new at(t.insertBefore(ot(),i),i,void 0,n??{})}return o._$AI(e),o};var Ft=globalThis,M=class extends U{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let n=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=xe(n,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return D}};M._$litElement$=!0,M.finalized=!0,Ft.litElementHydrateSupport?.({LitElement:M});var fn=Ft.litElementPolyfillSupport;fn?.({LitElement:M});(Ft.litElementVersions??=[]).push("4.2.2");var lt="pond_heatpump_price_planner",ct=["heat_pump","thermostat","plan","figures","switches","model"],be=["water_in","water_out","air_in","air_out","power","liquid","gas","fan","flow","compressor","pump_speed","pump_power","pump_fault"];function ye(e){let t=new Set;for(let n of Object.values(e.entities??{}))n.platform===lt&&n.device_id&&t.add(n.device_id);return[...t].sort()}function _e(e,t){let n={};if(!t)return n;for(let r of Object.values(e.entities??{}))r.platform===lt&&r.device_id===t&&r.translation_key&&(n[r.translation_key]=r.entity_id);return n}function jt(e,t=180,n=180,r=118){return{cx:t,cy:n,r,lo:e-3,hi:e+3}}function K(e,t){return 135+270*Math.min(Math.max((t-e.lo)/(e.hi-e.lo),0),1)}function O(e,t,n=e.r){let r=t*Math.PI/180;return[e.cx+n*Math.cos(r),e.cy+n*Math.sin(r)]}function yt(e,t,n,r=e.r){let[o,i]=O(e,t,r),[s,l]=O(e,n,r),a=n-t>180?1:0;return`M${o.toFixed(1)} ${i.toFixed(1)} A${r} ${r} 0 ${a} 1 ${s.toFixed(1)} ${l.toFixed(1)}`}function $e(e,t,n,r){if(e.length<2)return null;let o=e.map(c=>c.temp),i=Math.min(...o,t-n),s=Math.max(...o,t+n);if(s-i<.5){let c=(s+i)/2;i=c-.25,s=c+.25}let l=e[0].t,a=e[e.length-1].t,p=c=>r.x+(c-l)/(a-l)*r.w,m=c=>r.y+(s-c)/(s-i)*r.h;return{line:e.map((c,d)=>`${d?"L":"M"}${p(c.t).toFixed(1)} ${m(c.temp).toFixed(1)}`).join(" "),bandTop:m(t+n),bandBottom:m(t-n),target:m(t),lo:i,hi:s}}function we(e,t,n,r,o,i){let s=Math.atan2(n-e.cy,t-e.cx)*180/Math.PI;s<90&&(s+=360);let l=Math.min(Math.max((s-135)/270,0),1),a=e.lo+l*(e.hi-e.lo);return _t(a,r,o,i)}function _t(e,t,n,r){let o=Math.round(e/t)*t;return Number(Math.min(Math.max(o,n),r).toFixed(2))}var bn=1e3,ke=.1,Me=1,Dt=.05,Ae={x:116,y:212,w:128,h:38},B=class extends M{constructor(){super(...arguments);this._target=null;this._band=null;this._timers={};this._dragging=!1;this.onDown=n=>{this._dragging=!0,n.currentTarget.setPointerCapture?.(n.pointerId),this.setTarget(this.pointerTemp(n))};this.onMove=n=>{this._dragging&&this.setTarget(this.pointerTemp(n))};this.onUp=()=>{this._dragging=!1}}get target(){return this._target??this.model.target}get band(){return this._band??this.model.band}emit(n,r){clearTimeout(this._timers[n]),this._timers[n]=setTimeout(()=>{this.dispatchEvent(new CustomEvent(n,{detail:{value:r},bubbles:!0,composed:!0})),n==="set-target"?this._target=null:this._band=null},bn)}setTarget(n){let r=this.model;this._target=_t(n,r.step,r.min,r.max),this.emit("set-target",this._target)}setBand(n){this._band=_t(n,Dt,ke,Me),this.emit("set-band",this._band)}pointerTemp(n){let o=n.currentTarget.closest("svg").getBoundingClientRect(),i=(n.clientX-o.left)/o.width*360,s=(n.clientY-o.top)/o.height*360;return we(jt(this.model.target),i,s,this.model.step,this.model.min,this.model.max)}onKey(n,r){let o=n.key==="ArrowUp"||n.key==="ArrowRight"?1:n.key==="ArrowDown"||n.key==="ArrowLeft"?-1:0;o&&(n.preventDefault(),r==="target"?this.setTarget(this.target+o*this.model.step):this.setBand(this.band+o*Dt))}onSlider(n){this.setBand(Number(n.target.value))}disconnectedCallback(){super.disconnectedCallback(),Object.values(this._timers).forEach(n=>clearTimeout(n))}render(){let n=this.model,r=this.t,o=this.target,i=this.band,s=jt(n.target),l=[];for(let _=Math.ceil(s.lo);_<=Math.floor(s.hi);_++){let E=K(s,_),[b,R]=O(s,E,s.r+11),[z,T]=O(s,E,s.r+17),[u,H]=O(s,E,s.r+30);l.push(x`<line x1=${b} y1=${R} x2=${z} y2=${T} class="tick"/>
        <text x=${u} y=${H+4} class="tick-label" text-anchor="middle">${_}</text>`)}let[a,p]=O(s,K(s,o)),m=x``;if(n.pond!==null){let _=K(s,n.pond),E=O(s,_,s.r-12),b=O(s,_-4,s.r-26),R=O(s,_+4,s.r-26);m=x`<polygon class="pond-marker" points="${E.join(",")} ${b.join(",")} ${R.join(",")}"/>`}let g=[n.heating===null?null:r(n.heating?"heating":"idle"),n.mode?r(n.mode):null,n.position?r(n.position):null].filter(Boolean),c=$e(n.history,o,i,Ae),d=Ae,w=c?x`<g class="spark" role="img" aria-label=${r("history_24h")}>
          <rect x=${d.x} y=${Math.max(c.bandTop,d.y)} width=${d.w}
            height=${Math.max(Math.min(c.bandBottom,d.y+d.h)-Math.max(c.bandTop,d.y),0)} class="spark-band"/>
          <line x1=${d.x} x2=${d.x+d.w} y1=${c.target} y2=${c.target} class="spark-target"/>
          <path d=${c.line} class="spark-line"/>
          <text x=${d.x} y=${d.y+d.h+11} class="spark-label">−24 h</text>
          <text x=${d.x+d.w} y=${d.y+d.h+11} class="spark-label" text-anchor="end">${r("now")}</text>
          <text x=${d.x-4} y=${d.y+4} class="spark-label" text-anchor="end">${c.hi.toFixed(1)}</text>
          <text x=${d.x-4} y=${d.y+d.h} class="spark-label" text-anchor="end">${c.lo.toFixed(1)}</text>
        </g>`:x``;return f`
      <div class="wrap">
        <svg viewBox="0 0 360 330" class="gauge">
          <path d=${yt(s,135,405)} class="ring"/>
          <path d=${yt(s,K(s,o-i),K(s,o+i))} class="band"/>
          ${l}
          ${m}
          <circle cx=${a} cy=${p} r="12" class="handle" tabindex="0" role="slider"
            aria-label=${r("target")} aria-valuemin=${n.min} aria-valuemax=${n.max} aria-valuenow=${o}
            @pointerdown=${this.onDown} @pointermove=${this.onMove} @pointerup=${this.onUp}
            @keydown=${_=>this.onKey(_,"target")}/>
          <path d=${yt(s,135,405)} class="hit"
            @pointerdown=${this.onDown} @pointermove=${this.onMove} @pointerup=${this.onUp}/>
          <text x="180" y="140" class="caption" text-anchor="middle">${r("pond")}</text>
          <text x="180" y="178" class="pond" text-anchor="middle">${n.pond===null?"\u2013":`${n.pond.toFixed(1)} \xB0C`}</text>
          <text x="180" y="200" class="status ${n.position??""}" text-anchor="middle">${g.join(" \xB7 ")}</text>
          ${w}
        </svg>
        <div class="stepper" style="--window:${3}">
          <span class="caption">${r("target")}</span>
          <button @click=${()=>this.setTarget(o-n.step)} aria-label="−">−</button>
          <span class="number">${o.toFixed(1)} °C</span>
          <button @click=${()=>this.setTarget(o+n.step)} aria-label="+">+</button>
        </div>
        ${n.bandEntity===null?h:f`
          <div class="band-slider">
            <span class="caption">${r("band")}</span>
            <span class="number">± ${i.toFixed(2)} °C</span>
            <input type="range" min=${ke} max=${Me} step=${Dt} .value=${String(i)}
              aria-label=${r("band")} @input=${this.onSlider} @keydown=${_=>this.onKey(_,"band")}/>
          </div>`}
      </div>`}};B.properties={model:{attribute:!1},t:{attribute:!1},_target:{state:!0},_band:{state:!0}},B.styles=P`
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
  `;var yn=`M-98 394 q20 -7 40 0 ${"t40 0 ".repeat(19)}V458 H-98 Z`,_n=`M-98 400 q20 5 40 0 ${"t40 0 ".repeat(19)}V458 H-98 Z`;function v(e,t,n,r="label",o="start",i=""){return n===null?h:x`<text x=${e} y=${t} class=${r} text-anchor=${o} style=${i}>${n}</text>`}function Ee(e,t){let n=r=>r?"on":"";return x`
  <svg viewBox="0 0 640 480" role="img" aria-label=${t("heat_pump")} class="illustration">
    <g class="air ${n(e.fan)}">
      <path d="M40 122 H160"/><path d="M40 142 H160"/><path d="M472 122 H600"/><path d="M472 142 H600"/>
    </g>
    <polygon points="160,116 172,132 160,148" class="arrow"/>
    <polygon points="600,116 612,132 600,148" class="arrow"/>
    ${v(40,104,e.airIn===null?null:t("air_in"))}
    ${v(40,170,e.airIn,"value")}
    ${v(520,104,e.airOut===null?null:t("air_out"))}
    ${v(520,170,e.airOut,"value")}

    <g class="legend" transform="translate(40 210)">
      <line x1="0" y1="0" x2="18" y2="0" class="hotgas-line"/><text x="24" y="4">${t("hot_gas")}</text>
      <line x1="0" y1="16" x2="18" y2="16" class="liquid-line"/><text x="24" y="20">${t("liquid")}</text>
      <line x1="0" y1="32" x2="18" y2="32" class="suction-line"/><text x="24" y="36">${t("suction_gas")}</text>
    </g>

    <rect class="housing" x="176" y="40" width="288" height="240" rx="14"/>
    <text x="192" y="58" class="label">${t("heat_pump")}</text>
    ${e.mode===null?h:x`
      <rect class="badge ${e.mode}" x="398" y="48" width="54" height="22" rx="11"/>
      <text x="425" y="64" class="badge-text" text-anchor="middle">${t(e.mode).toUpperCase()}</text>`}

    <rect class="hx" x="252" y="196" width="136" height="48" rx="8"/>
    <polyline class="coil" points="366,206 350,230 334,206 318,230 302,206 286,230 274,206"/>
    <text x="320" y="190" class="label" text-anchor="middle">${t("heat_exchanger")}</text>
    ${v(320,258,e.thermal===null?null:t("thermal"),"label","middle")}
    ${v(320,274,e.thermal,"small","middle")}

    <g class="refrigerant ${n(e.compressor)}">
      <path class="rpipe" d="M196 86 V74 H378 V86"/><path class="rflow suction" d="M196 86 V74 H378 V86"/>
      <path class="rpipe" d="M404 122 H420 V206 H366"/><path class="rflow hotgas" d="M404 122 H420 V206 H366"/>
      <path class="rpipe" d="M274 206 H262 V188 H196 V178"/><path class="rflow liquid" d="M274 206 H262 V188 H196 V178"/>
    </g>
    <g transform="translate(228 188)" class="valve">
      <polygon points="-9,-7 -9,7 0,0"/><polygon points="9,-7 9,7 0,0"/>
    </g>
    ${v(424,150,e.gas===null?null:t("gas"),"label hot")}
    ${v(424,166,e.gas,"tiny hot")}
    ${v(246,208,e.liquid===null?null:t("liquid"),"label warmtext","end")}
    ${v(246,223,e.liquid,"small warmtext","end")}

    <rect class="evaporator" x="188" y="86" width="16" height="92" rx="3"/>
    <path class="fins" d="M188 98 H204 M188 110 H204 M188 122 H204 M188 134 H204 M188 146 H204 M188 158 H204 M188 170 H204"/>
    <text transform="translate(214 132) rotate(-90)" class="tiny-label" text-anchor="middle">${t("evaporator")}</text>

    <circle class="fan-ring" cx="274" cy="132" r="48"/>
    <g class="fan ${n(e.fan)}">
      <path d="M274 132 C274 104 291 89 304 95 C298 112 285 123 274 132 Z"/>
      <path d="M274 132 C302 132 317 149 311 162 C294 156 283 143 274 132 Z"/>
      <path d="M274 132 C274 160 257 175 244 169 C250 152 263 141 274 132 Z"/>
      <path d="M274 132 C246 132 231 115 237 102 C254 108 265 121 274 132 Z"/>
      <circle cx="274" cy="132" r="7" class="hub"/>
    </g>

    <rect class="comp-body" x="352" y="86" width="52" height="72" rx="10"/>
    <rect class="cylinder" x="363" y="98" width="30" height="48" rx="3"/>
    <g class="piston ${n(e.compressor)}">
      <rect x="365" y="126" width="26" height="10" rx="2" class="piston-head"/>
      <rect x="375" y="136" width="6" height="12" class="piston-rod"/>
    </g>
    <text x="378" y="172" class="label" text-anchor="middle">${t("compressor")}</text>

    ${e.electrical===null?h:x`
      <path class="cord" d="M464 250 C496 250 512 272 548 270"/>
      <rect x="546" y="262" width="16" height="16" rx="3" class="plug"/>
      <rect x="562" y="266" width="6" height="2.5" class="pin"/><rect x="562" y="271.5" width="6" height="2.5" class="pin"/>
      <rect x="570" y="248" width="44" height="44" rx="8" class="socket"/>
      <circle cx="592" cy="270" r="13" class="socket-face"/>
      <circle cx="586" cy="270" r="2.5" class="hole"/><circle cx="598" cy="270" r="2.5" class="hole"/>
      <text x="592" y="308" class="label" text-anchor="middle">${t("electrical")}</text>
      <text x="592" y="324" class="value" text-anchor="middle">${e.electrical}</text>`}

    <g class="water ${n(e.flow)}">
      <path class="pipe" d="M100 380 V312 H230 V236 H252"/><path class="flow cold" d="M100 380 V312 H230 V236 H252"/>
      <path class="pipe" d="M388 236 H410 V312 H540 V380"/><path class="flow warm" d="M388 236 H410 V312 H540 V380"/>
    </g>
    <polygon points="533,366 547,366 540,380" class="warm-arrow"/>
    ${v(242,300,e.waterIn===null?null:t("water_in"))}
    ${v(242,318,e.waterIn,"value")}
    ${v(398,300,e.waterOut===null?null:t("water_out"),"label","end")}
    ${v(398,318,e.waterOut,"value","end")}

    <g class="pump ${e.pump}" transform="translate(160 312)">
      <circle class="pump-body" r="20"/><polygon class="pump-tri" points="-11,-15 -11,15 17,0"/>
    </g>
    <text x="160" y="348" class="label" text-anchor="middle">${t("pump")} · ${t(e.pump)}</text>
    ${v(160,364,e.pumpText,"small","middle")}

    <path d="M60 380 H580 V450 Q580 460 570 460 H70 Q60 460 60 450 Z" class="tub"/>
    <clipPath id="phpc-tub"><path d="M61 381 H579 V450 Q579 459 570 459 H70 Q61 459 61 450 Z"/></clipPath>
    <g clip-path="url(#phpc-tub)">
      <path class="wave" d=${yn}/><path class="wave2" d=${_n}/>
    </g>
    <text x="320" y="438" class="label" text-anchor="middle">${t("pond")}</text>
    ${v(320,422,e.pond,"pond-temp","middle")}
  </svg>`}var Se=P`
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
`;function Ce(e){return e>=900?"wide":e>=560?"medium":"narrow"}function Te(e){return e==="wide"?3:e==="medium"?2:1}var $n={narrow:{heat_pump:1,thermostat:1,plan:1,side:1,model:1},medium:{heat_pump:1,thermostat:1,plan:2,side:1,model:1},wide:{heat_pump:1,thermostat:1,plan:3,side:1,model:3}};function Pe(e,t){return $n[e][t]}function Re(e){return e==="wide"?1200:e==="medium"?900:600}var He={columns:"full",min_columns:6,rows:"auto"};var Oe={pond:"pond",heat_pump:"HEAT PUMP",air_in:"air in",air_out:"air out",water_in:"water in",water_out:"water out",evaporator:"evaporator",compressor:"compressor",heat_exchanger:"heat exchanger",thermal:"thermal",electrical:"electrical",gas:"gas",liquid:"liquid",hot_gas:"hot gas",suction_gas:"suction gas",pump:"pump",running:"running",fault:"fault",off:"off",low:"low",high:"high",target:"target",band:"band",heating:"heating",idle:"idle",in_band:"in band",above_band:"above band",below_band:"below band",next_start:"next start",next_stop:"next stop",controlling:"controlling",dry_run:"dry run",planned_cost:"planned cost 24 h",planned_energy:"planned electricity 24 h",expensive_share:"in expensive quarters",cop:"COP",heat_loss:"heat loss",thermal_power:"thermal power",insulation_cover:"insulation cover",control:"control the heat pump",model:"Model",cooling:"cooling",heating_low:"heating rate low",heating_high:"heating rate high",prediction_error:"prediction error",learned:"learned",cop_by_outdoor:"COP by outdoor temperature",plan:"Plan",price:"price",now:"now",known_prices:"known prices",legend_pond:"pond temperature (predicted)",legend_measured:"pond temperature (measured)",tip_measured:"measured",tip_predicted:"predicted",tip_mode:"mode",tip_forecast:"forecast",tip_expensive:"expensive quarter",tip_solar:"solar surplus",legend_expensive:"expensive quarters",legend_solar:"solar surplus",legend_forecast:"forecast prices from",no_plan_yet:"No plan yet",plan_title:"Plan:",history_24h:"pond temperature, last 24 hours",reason_no_pond_temperature:"waiting for the pond temperature",reason_no_plan:"the planner could not make a plan",reason_unavailable:"the planner is not available",reason_other:"waiting for the next planning cycle",no_device:"Choose a planner device in the card editor.",plan_summary:"Plan: {parts}.",device:"Planner device",hours:"Width of the plan chart (hours, ending at the last known price)",sections:"Sections"},wn={pond:"vijver",heat_pump:"WARMTEPOMP",air_in:"lucht in",air_out:"lucht uit",water_in:"water in",water_out:"water uit",evaporator:"verdamper",compressor:"compressor",heat_exchanger:"warmtewisselaar",thermal:"thermisch",electrical:"elektrisch",gas:"gas",liquid:"vloeistof",hot_gas:"heet gas",suction_gas:"zuiggas",pump:"pomp",running:"in bedrijf",fault:"storing",off:"uit",low:"laag",high:"hoog",target:"streefwaarde",band:"band",heating:"verwarmt",idle:"rust",in_band:"binnen band",above_band:"boven band",below_band:"onder band",next_start:"volgende start",next_stop:"volgende stop",controlling:"stuurt aan",dry_run:"alleen plannen",planned_cost:"geplande kosten 24 u",planned_energy:"gepland stroomverbruik 24 u",expensive_share:"in dure kwartieren",cop:"COP",heat_loss:"warmteverlies",thermal_power:"thermisch vermogen",insulation_cover:"isolatiekap",control:"warmtepomp aansturen",model:"Model",cooling:"afkoeling",heating_low:"opwarmsnelheid laag",heating_high:"opwarmsnelheid hoog",prediction_error:"voorspelfout",learned:"geleerd",cop_by_outdoor:"COP per buitentemperatuur",plan:"Plan",price:"prijs",now:"nu",known_prices:"bekende prijzen",legend_pond:"vijvertemperatuur (voorspeld)",legend_measured:"vijvertemperatuur (gemeten)",tip_measured:"gemeten",tip_predicted:"voorspeld",tip_mode:"stand",tip_forecast:"verwacht",tip_expensive:"duur kwartier",tip_solar:"zonne-overschot",legend_expensive:"dure kwartieren",legend_solar:"zonne-overschot",legend_forecast:"verwachte prijzen vanaf",no_plan_yet:"Nog geen plan",plan_title:"Plan:",history_24h:"vijvertemperatuur, afgelopen 24 uur",reason_no_pond_temperature:"wacht op de vijvertemperatuur",reason_no_plan:"de planner kon geen plan maken",reason_unavailable:"de planner is niet beschikbaar",reason_other:"wacht op de volgende planningsronde",no_device:"Kies een planner-apparaat in de kaarteditor.",plan_summary:"Plan: {parts}.",device:"Planner-apparaat",hours:"Breedte van de plangrafiek (uren, tot de laatste bekende prijs)",sections:"Blokken"};function wt(e){let t=(e??"en").toLowerCase().startsWith("nl")?wn:Oe;return(n,r)=>{let o=t[n]??Oe[n]??n;for(let[i,s]of Object.entries(r??{}))o=o.replace(`{${i}}`,String(s));return o}}function vn(e,t,n){let r=n*36e5,o=Math.ceil(t/9e5)*9e5,i=Math.floor(e/9e5)*9e5;return o-r>i?{start:i,end:i+r}:{start:o-r,end:o}}function kn(e,t){let n=e.history.filter(r=>r.t>=t&&r.t<=e.now);return e.pond!==null&&n.push({t:e.now,temp:e.pond}),n}function Mn(e,t){if(!e.length)return 0;let n=(e.length-1)*t,r=Math.floor(n),o=Math.ceil(n);return e[r]+(e[o]-e[r])*(n-r)}function Le(e,t,n=6){let r=new Date(e);r.setMinutes(0,0,0),r.getTime()<e&&r.setHours(r.getHours()+1);let o=[];for(;r.getTime()<t;r.setHours(r.getHours()+1))r.getHours()%n===0&&o.push({t:r.getTime(),midnight:r.getHours()===0});return o}function vt(e,t,n,r=28){let o=e.quarters,{start:i,end:s}=vn(e.now,o[o.length-1].t+9e5,e.hours),l=kn(e,i),a=o.map(b=>b.temp).concat(l.map(b=>b.temp),[e.target-e.band,e.target+e.band]),p=Math.floor((Math.min(...a)-.1)*10)/10,m=Math.ceil((Math.max(...a)+.1)*10)/10,g=o.map(b=>b.price),c=Math.min(...g),d=Math.max(...g)===c?c+.01:Math.max(...g),w=o.map((b,R)=>{let z=o.slice(Math.floor(R/96)*96,Math.floor(R/96)*96+96).map(T=>T.price);return o[R].price>Mn([...z].sort((T,u)=>T-u),.75)}),_=o.find(b=>!b.known),E=n-r*2;return{x:b=>r+(b-i)/(s-i)*(t-r*2),t:b=>i+(b-r)/(t-r*2)*(s-i),yTemp:b=>r+(1-(b-p)/(m-p))*E,yPrice:b=>r+(1-(b-c)/(d-c))*E,tempMin:p,tempMax:m,priceMin:c,priceMax:d,start:i,end:s,measured:l,expensive:w,knownUntil:_?_.t:null}}function Ue(e){let t=null;return e.measured.map(n=>{let r=t===null||n.t-t>18e5?"M":"L";return t=n.t,`${r}${e.x(n.t).toFixed(1)} ${e.yTemp(n.temp).toFixed(1)}`}).join(" ")}function ze(e,t){let n=e.quarters.filter(r=>r.t+9e5>e.now&&r.t>=t.start).map(r=>[t.x(r.t+9e5),t.yTemp(r.temp)]);return e.pond!==null&&e.now>=t.start&&n.unshift([t.x(e.now),t.yTemp(e.pond)]),n.map(([r,o],i)=>`${i?"L":"M"}${r.toFixed(1)} ${o.toFixed(1)}`).join(" ")}function Ne(e,t){let n=Math.floor(e.t(t)/9e5)*9e5;return Math.min(Math.max(n,e.start),e.end-9e5)}function Ie(e,t,n){let r={t:n,temp:null,measured:!1,mode:null,price:null,known:!0,expensive:!1,surplus:null},o=e.quarters.findIndex(i=>i.t===n);if(o>=0){let i=e.quarters[o];return{...r,temp:i.temp,mode:i.mode,price:i.price,known:i.known,expensive:t.expensive[o],surplus:i.surplus}}if(n<e.now){let i=n+9e5,s=t.measured.filter(l=>Math.abs(l.t-i)<=9e5/2);if(s.length){let l=s.reduce((a,p)=>Math.abs(p.t-i)<Math.abs(a.t-i)?p:a);return{...r,temp:l.temp,measured:!0}}}return r}function An(e){let t=[];for(let n of e){let r=t[t.length-1];r&&r.mode===n.mode?r.to=n.t+9e5:t.push({mode:n.mode,from:n.t,to:n.t+9e5})}return t}function Fe(e,t,n="en"){let r=i=>new Date(i).toLocaleTimeString(n,{hour:"2-digit",minute:"2-digit"}),o=An(e.quarters).map(i=>`${t(i.mode)} ${r(i.from)}\u2013${r(i.to)}`);return t("plan_summary",{parts:o.join(", ")})}var Vt=600,A=220,En=70,Bt=(e,t)=>new Date(e).toLocaleTimeString(t,{hour:"2-digit",minute:"2-digit"}),je=(e,t)=>new Date(e).toLocaleDateString(t,{weekday:"short",day:"numeric",month:"short"});function Sn(e,t,n){let r=[`${je(e.t,n)} ${Bt(e.t,n)}\u2013${Bt(e.t+9e5,n)}`];return e.temp!==null&&r.push(`${e.temp.toFixed(2)} \xB0C ${t(e.measured?"tip_measured":"tip_predicted")}`),e.mode!==null&&r.push(`${t("tip_mode")}: ${t(e.mode)}`),e.price!==null&&r.push(`\u20AC ${e.price.toFixed(3)}/kWh${e.known?"":` (${t("tip_forecast")})`}`),e.expensive&&r.push(t("tip_expensive")),e.surplus&&r.push(`${t("tip_solar")} ${e.surplus.toFixed(1)} kW`),r}function Cn(e,t,n,r=Vt,o=null,i=vt(e,r,A)){let s=e.quarters,l=i.x(s[0].t+9e5)-i.x(s[0].t),a={off:0,low:.5,high:1},p=s.map((u,H)=>{if(u.t<i.start||u.t>=i.end)return x``;let J=18*a[u.mode],At=i.expensive[H]?x`<rect x=${i.x(u.t)} y="28" width=${l} height=${A-56} class="expensive"/>`:x``,Et=u.surplus?x`<rect x=${i.x(u.t)} y=${A-26} width=${l} height="4" class="sun"/>`:x``;return x`${At}${Et}<rect x=${i.x(u.t)} y=${A-28-J} width=${l} height=${J} class="bar ${u.mode}"/>`}),m=s.filter(u=>u.t>=i.start&&u.t<i.end).map((u,H)=>`${H?"L":"M"}${i.x(u.t).toFixed(1)} ${i.yPrice(u.price).toFixed(1)} H${i.x(u.t+9e5).toFixed(1)}`).join(" "),g=i.yTemp(e.target+e.band),c=i.yTemp(e.target-e.band),d=Math.min(Math.max(i.x(e.now),28),r-28),w=Le(i.start,i.end),_=w.map(u=>x`<line x1=${i.x(u.t)} x2=${i.x(u.t)} y1="28" y2=${A-28} class=${u.midnight?"day":"grid"}/>`),E=w.map(u=>x`<text x=${i.x(u.t)} y=${A-8} class="axis" text-anchor="middle">${Bt(u.t,n)}</text>`),b=w.find(u=>u.midnight),z=[...b&&i.x(b.t)-28<En?[]:[{t:i.start,x:28}],...w.filter(u=>u.midnight).map(u=>({t:u.t,x:i.x(u.t)}))].map(u=>x`<text x=${u.x+4} y="40" class="day-label">${je(u.t,n)}</text>`),T=x``;if(o){let u=i.x(o.t+9e5/2),H=o.temp===null?x``:x`<circle cx=${i.x(o.t+9e5)} cy=${i.yTemp(o.temp)} r="4" class="hover-dot"/>`;T=x`<line x1=${u} x2=${u} y1="28" y2=${A-28} class="hair"/>${H}`}return x`
    <svg viewBox="0 0 ${r} ${A}" class="chart" role="img" aria-label=${Fe(e,t,n)}>
      ${_}
      <rect x="28" y=${g} width=${r-56} height=${c-g} class="band"/>
      ${p}
      <line x1="28" x2=${r-28} y1=${i.yTemp(e.target)} y2=${i.yTemp(e.target)} class="target"/>
      <path d=${m} class="price"/>
      <path d=${Ue(i)} class="measured"/>
      <path d=${ze(e,i)} class="temp"/>
      ${i.knownUntil===null?x``:x`<line x1=${i.x(i.knownUntil)} x2=${i.x(i.knownUntil)} y1="28" y2=${A-28} class="known"/>`}
      <line x1=${d} x2=${d} y1="20" y2=${A-28} class="now"/>
      <text x="4" y="20" class="axis">${i.tempMax.toFixed(1)} °C</text>
      <text x="4" y=${A-30} class="axis">${i.tempMin.toFixed(1)}</text>
      <text x=${r-4} y="20" class="axis" text-anchor="end">€ ${i.priceMax.toFixed(2)}</text>
      <text x=${r-4} y=${A-30} class="axis" text-anchor="end">${i.priceMin.toFixed(2)}</text>
      ${E}
      ${z}
      ${T}
    </svg>`}var pt=class extends M{constructor(){super(...arguments);this.language="en";this.width=Vt;this._hover=null;this.onPointer=n=>{let r=n.currentTarget.getBoundingClientRect();r.width&&(this._hover=Ne(this.scales,(n.clientX-r.left)/r.width*this.width))};this.onLeave=n=>{n.pointerType==="mouse"&&(this._hover=null)};this.onOutside=n=>{this._hover!==null&&!n.composedPath().includes(this)&&(this._hover=null)};this.onKey=n=>{let r=this.scales,o=this._hover??Math.floor(this.model.now/9e5)*9e5,i={ArrowLeft:o-9e5,ArrowRight:o+9e5,Home:r.start,End:r.end-9e5,Escape:null};if(!(n.key in i))return;n.preventDefault();let s=i[n.key];this._hover=s===null?null:Math.min(Math.max(s,r.start),r.end-9e5)}}createRenderRoot(){return this}get scales(){return vt(this.model,this.width,A)}connectedCallback(){super.connectedCallback(),window.addEventListener("pointerdown",this.onOutside)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("pointerdown",this.onOutside)}render(){if(!this.model)return h;let n=this.scales,r=this._hover===null?null:Ie(this.model,n,this._hover),o=r?Sn(r,this.t,this.language):[],i=h;if(r){let s=n.x(r.t+9e5/2)/this.width*100,l=s>50?`right:${(100-s).toFixed(1)}%`:`left:${s.toFixed(1)}%`;i=f`<div class="tooltip ${s>50?"to-left":"to-right"}" style=${l}>
        ${o.map((a,p)=>f`<div class=${p?"":"tip-time"}>${a}</div>`)}
      </div>`}return f`<div class="plot" tabindex="0" @pointermove=${this.onPointer} @pointerdown=${this.onPointer}
        @pointerleave=${this.onLeave} @keydown=${this.onKey}>
        ${Cn(this.model,this.t,this.language,this.width,r,n)}${i}
        <span class="sr-only" aria-live="polite">${o.join(", ")}</span>
      </div>`}};pt.properties={model:{attribute:!1},t:{attribute:!1},language:{},width:{type:Number},_hover:{state:!0}};function Tn(e){let t=vt(e,Vt,A),n=[...t.measured.length>1?[{key:"legend_measured",swatch:"line"}]:[],{key:"legend_pond",swatch:"predicted"},{key:"target",swatch:"dashed"},{key:"band",swatch:"area"},{key:"low",swatch:"low"},{key:"high",swatch:"high"},{key:"price",swatch:"step"}];return t.expensive.some(Boolean)&&n.push({key:"legend_expensive",swatch:"expensive"}),e.quarters.some(r=>r.surplus)&&n.push({key:"legend_solar",swatch:"solar"}),n.push({key:"now",swatch:"now"}),t.knownUntil!==null&&n.push({key:"legend_forecast",swatch:"dotted"}),n}function De(e,t){return f`<ul class="chart-legend">
    ${Tn(e).map(n=>f`<li><span class="sw ${n.swatch}"></span>${t(n.key)}</li>`)}
  </ul>`}var Be=P`
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
`;function L(e){let t=typeof e=="number"?e:Number.parseFloat(String(e));return Number.isFinite(t)?t:null}function G(e,t){return e===null?null:e.toFixed(t)}function dt(e){return e===null?null:Math.abs(e)>=1e3?`${(e/1e3).toFixed(2)} kW`:`${Math.round(e)} W`}function Q(e){return e===null?null:`${e.toFixed(1)} \xB0C`}function V(e,t,n=0){return e===null?null:t?`${e.toFixed(n)} ${t}`:e.toFixed(n)}function ut(e,t="en"){if(!e)return null;let n=new Date(e);return Number.isNaN(n.getTime())?null:n.toLocaleTimeString(t,{hour:"2-digit",minute:"2-digit"})}function Z(e,t){return t===null?h:f`<div class="fig"><span class="v">${t}</span><span class="l">${e}</span></div>`}function Ve(e,t,n){let r=[e.nextStop?`${t("next_stop")} ${ut(e.nextStop,n)}`:null,e.nextStart?`${t("next_start")} ${ut(e.nextStart,n)}`:null,e.control===null?null:t(e.control?"controlling":"dry_run")].filter(Boolean);return f`<div class="next">${r.join(" \xB7 ")}</div>`}function qe(e,t){return f`<div class="figures">
    ${Z(t("planned_cost"),e.cost)} ${Z(t("planned_energy"),e.energy)}
    ${Z(t("expensive_share"),e.expensive)}
    ${Z(e.copMethod?`${t("cop")} (${e.copMethod})`:t("cop"),e.cop)}
    ${Z(t("heat_loss"),e.heatLoss)} ${Z(t("thermal_power"),e.thermal)}
  </div>`}function We(e,t,n){let r=(o,i)=>o===null?h:f`<label class="switch"><input type="checkbox" .checked=${o.on} @change=${s=>n(o.entity,s.target.checked)}/>${t(i)}</label>`;return f`<div class="switches">${r(e.cover,"insulation_cover")} ${r(e.control,"control")}</div>`}function Ke(e,t){let n=[[t("cooling"),e.cooling],[t("heating_low"),e.heatingLow],[t("heating_high"),e.heatingHigh],[t("prediction_error"),e.predictionError],[t("learned"),e.learned]];return f`<details class="model"><summary>${t("model")}</summary>
    <table>${n.filter(([,r])=>r!==null).map(([r,o])=>f`<tr><td>${r}</td><td>${o}</td></tr>`)}</table>
    ${e.copByOutdoor.length?f`<div class="l">${t("cop_by_outdoor")}</div>
          <table>${e.copByOutdoor.map(([r,o])=>f`<tr><td>${r} °C</td><td>${o??"\u2013"}</td></tr>`)}</table>`:h}
  </details>`}var Ge=P`
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
`;var Qe=["off","low","high"];function Pn(e){return Array.isArray(e)?e.map(t=>({t:Date.parse(t?.time),temp:Number(t?.temp)})).filter(t=>Number.isFinite(t.t)&&Number.isFinite(t.temp)).sort((t,n)=>t.t-n.t):[]}function k(e,t){return t?e.states[t]:void 0}function C(e){return!!e&&e.state!=="unavailable"&&e.state!=="unknown"}function $(e,t){let n=k(e,t);return C(n)?L(n.state):null}function Y(e,t){return k(e,t)?.state==="on"}function Rn(e,t,n){let r=k(e,n.model_status)?.attributes.links??{},o={water_in:r.inlet_temperature,water_out:r.outlet_temperature,air_in:r.air_inlet_temperature,power:r.power},i={};for(let[s,l]of Object.entries({...o,...t.heat_pump??{}}))l&&(i[s]=l);return i}function Ze(e,t,n=Date.now()){let r=_e(e,t.device_id),o=(t.sections?.length?t.sections:[...ct]).filter(y=>ct.includes(y)),i=Rn(e,t,r),l=[...Object.values(r),...Object.values(i)].map(y=>`${y}:${k(e,y)?.last_updated??"-"}`).join("|"),a={sections:o,illustration:null,gauge:null,plan:null,planMissing:null,figures:null,switches:null,model:null,missingDevice:!t.device_id||Object.keys(r).length===0,signature:l};if(a.missingDevice)return a;let p=k(e,r.thermostat),m=k(e,r.mode),g=C(m)&&Qe.includes(m.state)?m.state:null,c=C(p)?L(p.attributes.current_temperature):null,d=C(p)?L(p.attributes.temperature)??15:15,w=$(e,r.band)??.25,_=$(e,r.thermal_power),E=k(e,i.pump_speed),b=$(e,i.pump_power),R=Y(e,i.pump_fault),z=Y(e,i.flow),T=[V($(e,i.pump_speed),E?.attributes.unit_of_measurement),dt(b)].filter(Boolean),u={pond:Q(c),waterIn:Q($(e,i.water_in)),waterOut:Q($(e,i.water_out)),airIn:Q($(e,i.air_in)),airOut:Q($(e,i.air_out)),electrical:dt($(e,i.power)),thermal:dt(_),liquid:G($(e,i.liquid),0)&&`${G($(e,i.liquid),0)} \xB0C`,gas:G($(e,i.gas),0)&&`${G($(e,i.gas),0)} \xB0C`,mode:g,fan:Y(e,i.fan),flow:z,compressor:Y(e,i.compressor),pump:R?"fault":z?"running":"off",pumpText:T.length?T.join(" \xB7 "):null},H=C(p)?p.attributes.hvac_action:null,J=Pn(m?.attributes.pond_history),At=r.thermostat?{pond:c,target:d,band:w,min:L(p?.attributes.min_temp)??5,max:L(p?.attributes.max_temp)??28,step:L(p?.attributes.target_temp_step)??.1,heating:H==="heating"?!0:H==="idle"?!1:null,mode:g,position:c===null?null:c>d+w?"above_band":c<d-w?"below_band":"in_band",thermostat:r.thermostat,bandEntity:r.band??null,nextStart:C(k(e,r.next_start))?k(e,r.next_start).state:null,nextStop:C(k(e,r.next_stop))?k(e,r.next_stop).state:null,control:r.control?Y(e,r.control):null,history:J.filter(y=>y.t>=n-24*36e5)}:null,Et=m?.attributes.plan??[],Wt=t.hours??36,Kt=Et.map(y=>({t:Date.parse(y.start),mode:Qe.includes(y.mode)?y.mode:"off",temp:Number(y.temp),price:Number(y.price),known:y.known!==!1,surplus:y.surplus===void 0?null:Number(y.surplus)})).filter(y=>Number.isFinite(y.t)&&Number.isFinite(y.temp)).slice(0,Wt*4),Gt=Kt.length?{quarters:Kt,target:d,band:w,now:n,hours:Wt,history:J,pond:c}:null,tt=k(e,r.planned_cost),Qt=k(e,r.cop),Zt=C(tt)?L(tt.attributes.expensive_share):null,Yt=$(e,r.heat_loss),Je={cost:C(tt)&&L(tt.state)!==null?`\u20AC ${L(tt.state).toFixed(2)}`:null,energy:V($(e,r.planned_energy),"kWh",1),expensive:Zt===null?null:`${Math.round(Zt*100)} %`,cop:G($(e,r.cop),1),copMethod:C(Qt)?Qt.attributes.method??null:null,heatLoss:Yt===null?null:`${Math.round(Yt)} W/K`,thermal:dt(_)},Xt=y=>r[y]?{entity:r[y],on:Y(e,r[y])}:null,tn=k(e,r.cop)?.attributes.by_outdoor??{},en={cooling:V($(e,r.cooling_coefficient),"1/h",4),heatingLow:V($(e,r.heating_rate_low),"K/h",3),heatingHigh:V($(e,r.heating_rate_high),"K/h",3),predictionError:V($(e,r.prediction_error),"K",2),learned:C(k(e,r.model_status))?ut(k(e,r.model_status).state,e.locale?.language):null,copByOutdoor:Object.entries(tn).map(([y,Jt])=>[y,Jt===null?null:Number(Jt).toFixed(1)])},nn=Gt?null:C(m)?String(m.attributes.reason??"no_plan"):"unavailable";return{...a,illustration:u,gauge:At,plan:Gt,planMissing:nn,figures:Je,switches:{cover:Xt("insulation_cover"),control:Xt("control")},model:en}}var ht="pond-heatpump-planner-card",qt="pond-heatpump-planner-card-editor",Ye="phpc-gauge",Xe="phpc-plan-chart",X=class extends M{constructor(){super(...arguments);this._layout="narrow"}static getConfigElement(){return document.createElement(qt)}static getStubConfig(n){return{type:`custom:${ht}`,device_id:ye(n)[0]}}setConfig(n){if(!n)throw new Error("Invalid configuration");this._config={hours:36,...n},this.rebuild(!0)}set hass(n){this._hass=n,this.rebuild(!1)}get hass(){return this._hass}rebuild(n){if(!this._hass||!this._config)return;let r=Ze(this._hass,this._config);(n||!this._vm||r.signature!==this._vm.signature)&&(this._vm=r)}getCardSize(){return 12}getGridOptions(){return{...He}}connectedCallback(){super.connectedCallback(),typeof ResizeObserver<"u"&&(this._observer=new ResizeObserver(n=>this.resized(n[0]?.contentRect.width??0)),this._observer.observe(this))}disconnectedCallback(){super.disconnectedCallback(),this._observer?.disconnect()}resized(n){let r=Ce(n);r!==this._layout&&(this._layout=r)}get t(){return wt(this._hass?.locale?.language??this._hass?.language)}call(n,r,o){this._hass?.callService(n,r,o)}content(n,r){let o=this.t,i=this._hass?.locale?.language??"en";switch(n){case"heat_pump":return r.illustration?Ee(r.illustration,o):h;case"thermostat":return r.gauge?f`<phpc-gauge .model=${r.gauge} .t=${o}
                @set-target=${s=>this.call("climate","set_temperature",{entity_id:r.gauge.thermostat,temperature:s.detail.value})}
                @set-band=${s=>r.gauge.bandEntity&&this.call("number","set_value",{entity_id:r.gauge.bandEntity,value:s.detail.value})}
              ></phpc-gauge>
              ${Ve(r.gauge,o,i)}`:h;case"plan":return r.plan?f`<div class="title">${o("plan_title")}</div>
            <phpc-plan-chart .model=${r.plan} .t=${o} .language=${i} .width=${Re(this._layout)}></phpc-plan-chart>
            ${De(r.plan,o)}`:r.planMissing===null?h:f`<div class="no-plan"><strong>${o("no_plan_yet")}</strong> · ${this.reasonText(r.planMissing)}</div>`;case"figures":return r.figures?qe(r.figures,o):h;case"switches":return r.switches&&(r.switches.cover||r.switches.control)?We(r.switches,o,(s,l)=>this.call("switch",l?"turn_on":"turn_off",{entity_id:s})):h;case"model":return r.model?Ke(r.model,o):h}}reasonText(n){let r=`reason_${n}`,o=this.t(r);return o===r?this.t("reason_other"):o}blocks(n){let r=[];for(let o of n.sections){let i=this.content(o,n);if(i===h)continue;let s=o==="figures"||o==="switches"?"side":o,l=s==="side"?r.find(a=>a.block==="side"):void 0;l?l.parts.push(i):r.push({block:s,parts:[i]})}return r}render(){let n=this._vm;if(!n)return h;if(n.missingDevice)return f`<ha-card><div class="section warning">${this.t("no_device")}</div></ha-card>`;let r=this._layout;return f`<ha-card class=${r} style="--phpc-columns:${Te(r)}">
      ${this.blocks(n).map(o=>f`<div class="section ${o.block}" style="grid-column: span ${Pe(r,o.block)}">
          ${o.parts.map(i=>f`<div class="part">${i}</div>`)}
        </div>`)}
    </ha-card>`}};X.properties={_vm:{state:!0},_layout:{state:!0}},X.styles=[Se,Be,Ge,P`
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
    `];var Hn=["water_in","water_out","air_in","air_out","power","liquid","gas","pump_speed","pump_power"];function On(){return[{name:"device_id",selector:{device:{integration:lt}}},{name:"hours",selector:{select:{options:["24","36","48"],mode:"dropdown"}}},{name:"sections",selector:{select:{options:[...ct],multiple:!0,reorder:!0}}},{name:"heat_pump",type:"expandable",title:"Heat pump",schema:be.map(e=>({name:e,selector:{entity:{domain:Hn.includes(e)?"sensor":"binary_sensor"}}}))}]}var mt=class extends M{setConfig(t){this._config=t}changed(t){let n={...t.detail.value};n.hours&&(n.hours=Number(n.hours)),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:n},bubbles:!0,composed:!0}))}render(){if(!this.hass||!this._config)return f``;let t=wt(this.hass.locale?.language),n={...this._config,hours:String(this._config.hours??36)};return f`<ha-form
      .hass=${this.hass}
      .data=${n}
      .schema=${On()}
      .computeLabel=${r=>t(r.name)}
      @value-changed=${this.changed}
    ></ha-form>`}};mt.properties={hass:{attribute:!1},_config:{state:!0}};function Mt(e,t){customElements.get(e)||customElements.define(e,t)}Mt(Ye,B);Mt(Xe,pt);Mt(qt,mt);Mt(ht,X);var kt=window;kt.customCards=kt.customCards??[];kt.customCards.some(e=>e.type===ht)||kt.customCards.push({type:ht,name:"Pond Heat Pump Planner",description:"Heat pump illustration, thermostat with band, plan and key figures of the pond heat pump planner.",preview:!0,documentationURL:"https://github.com/abroeders/pond-heatpump-price-planner/blob/main/docs/card.md"});
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
