var dt=globalThis,ut=dt.ShadowRoot&&(dt.ShadyCSS===void 0||dt.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,yt=Symbol(),Wt=new WeakMap,Y=class{constructor(t,e,r){if(this._$cssResult$=!0,r!==yt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(ut&&t===void 0){let r=e!==void 0&&e.length===1;r&&(t=Wt.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),r&&Wt.set(e,t))}return t}toString(){return this.cssText}},Kt=n=>new Y(typeof n=="string"?n:n+"",void 0,yt),M=(n,...t)=>{let e=n.length===1?n[0]:t.reduce((r,o,i)=>r+(s=>{if(s._$cssResult$===!0)return s.cssText;if(typeof s=="number")return s;throw Error("Value passed to 'css' function must be a 'css' function result: "+s+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+n[i+1],n[0]);return new Y(e,n,yt)},Gt=(n,t)=>{if(ut)n.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let r=document.createElement("style"),o=dt.litNonce;o!==void 0&&r.setAttribute("nonce",o),r.textContent=e.cssText,n.appendChild(r)}},$t=ut?n=>n:n=>n instanceof CSSStyleSheet?(t=>{let e="";for(let r of t.cssRules)e+=r.cssText;return Kt(e)})(n):n;var{is:je,defineProperty:Ve,getOwnPropertyDescriptor:De,getOwnPropertyNames:Be,getOwnPropertySymbols:Fe,getPrototypeOf:qe}=Object,ht=globalThis,Qt=ht.trustedTypes,We=Qt?Qt.emptyScript:"",Ke=ht.reactiveElementPolyfillSupport,X=(n,t)=>n,wt={toAttribute(n,t){switch(t){case Boolean:n=n?We:null;break;case Object:case Array:n=n==null?n:JSON.stringify(n)}return n},fromAttribute(n,t){let e=n;switch(t){case Boolean:e=n!==null;break;case Number:e=n===null?null:Number(n);break;case Object:case Array:try{e=JSON.parse(n)}catch{e=null}}return e}},Yt=(n,t)=>!je(n,t),Zt={attribute:!0,type:String,converter:wt,reflect:!1,useDefault:!1,hasChanged:Yt};Symbol.metadata??=Symbol("metadata"),ht.litPropertyMetadata??=new WeakMap;var H=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=Zt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let r=Symbol(),o=this.getPropertyDescriptor(t,r,e);o!==void 0&&Ve(this.prototype,t,o)}}static getPropertyDescriptor(t,e,r){let{get:o,set:i}=De(this.prototype,t)??{get(){return this[e]},set(s){this[e]=s}};return{get:o,set(s){let c=o?.call(this);i?.call(this,s),this.requestUpdate(t,c,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??Zt}static _$Ei(){if(this.hasOwnProperty(X("elementProperties")))return;let t=qe(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(X("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(X("properties"))){let e=this.properties,r=[...Be(e),...Fe(e)];for(let o of r)this.createProperty(o,e[o])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[r,o]of e)this.elementProperties.set(r,o)}this._$Eh=new Map;for(let[e,r]of this.elementProperties){let o=this._$Eu(e,r);o!==void 0&&this._$Eh.set(o,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let r=new Set(t.flat(1/0).reverse());for(let o of r)e.unshift($t(o))}else t!==void 0&&e.push($t(t));return e}static _$Eu(t,e){let r=e.attribute;return r===!1?void 0:typeof r=="string"?r:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let r of e.keys())this.hasOwnProperty(r)&&(t.set(r,this[r]),delete this[r]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Gt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,r){this._$AK(t,r)}_$ET(t,e){let r=this.constructor.elementProperties.get(t),o=this.constructor._$Eu(t,r);if(o!==void 0&&r.reflect===!0){let i=(r.converter?.toAttribute!==void 0?r.converter:wt).toAttribute(e,r.type);this._$Em=t,i==null?this.removeAttribute(o):this.setAttribute(o,i),this._$Em=null}}_$AK(t,e){let r=this.constructor,o=r._$Eh.get(t);if(o!==void 0&&this._$Em!==o){let i=r.getPropertyOptions(o),s=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:wt;this._$Em=o;let c=s.fromAttribute(e,i.type);this[o]=c??this._$Ej?.get(o)??c,this._$Em=null}}requestUpdate(t,e,r,o=!1,i){if(t!==void 0){let s=this.constructor;if(o===!1&&(i=this[t]),r??=s.getPropertyOptions(t),!((r.hasChanged??Yt)(i,e)||r.useDefault&&r.reflect&&i===this._$Ej?.get(t)&&!this.hasAttribute(s._$Eu(t,r))))return;this.C(t,e,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:r,reflect:o,wrapped:i},s){r&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,s??e??this[t]),i!==!0||s!==void 0)||(this._$AL.has(t)||(this.hasUpdated||r||(e=void 0),this._$AL.set(t,e)),o===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[o,i]of this._$Ep)this[o]=i;this._$Ep=void 0}let r=this.constructor.elementProperties;if(r.size>0)for(let[o,i]of r){let{wrapped:s}=i,c=this[o];s!==!0||this._$AL.has(o)||c===void 0||this.C(o,void 0,i,c)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(r=>r.hostUpdate?.()),this.update(e)):this._$EM()}catch(r){throw t=!1,this._$EM(),r}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};H.elementStyles=[],H.shadowRootOptions={mode:"open"},H[X("elementProperties")]=new Map,H[X("finalized")]=new Map,Ke?.({ReactiveElement:H}),(ht.reactiveElementVersions??=[]).push("2.1.2");var Ct=globalThis,Xt=n=>n,mt=Ct.trustedTypes,Jt=mt?mt.createPolicy("lit-html",{createHTML:n=>n}):void 0,ie="$lit$",R=`lit$${Math.random().toFixed(9).slice(2)}$`,se="?"+R,Ge=`<${se}>`,z=document,tt=()=>z.createComment(""),et=n=>n===null||typeof n!="object"&&typeof n!="function",Pt=Array.isArray,Qe=n=>Pt(n)||typeof n?.[Symbol.iterator]=="function",vt=`[ 	
\f\r]`,J=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,te=/-->/g,ee=/>/g,L=RegExp(`>|${vt}(?:([^\\s"'>=/]+)(${vt}*=${vt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ne=/'/g,re=/"/g,ae=/^(?:script|style|textarea|title)$/i,Tt=n=>(t,...e)=>({_$litType$:n,strings:t,values:e}),g=Tt(1),$=Tt(2),gn=Tt(3),I=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),oe=new WeakMap,N=z.createTreeWalker(z,129);function le(n,t){if(!Pt(n)||!n.hasOwnProperty("raw"))throw Error("invalid template strings array");return Jt!==void 0?Jt.createHTML(t):t}var Ze=(n,t)=>{let e=n.length-1,r=[],o,i=t===2?"<svg>":t===3?"<math>":"",s=J;for(let c=0;c<e;c++){let a=n[c],d,h,l=-1,u=0;for(;u<a.length&&(s.lastIndex=u,h=s.exec(a),h!==null);)u=s.lastIndex,s===J?h[1]==="!--"?s=te:h[1]!==void 0?s=ee:h[2]!==void 0?(ae.test(h[2])&&(o=RegExp("</"+h[2],"g")),s=L):h[3]!==void 0&&(s=L):s===L?h[0]===">"?(s=o??J,l=-1):h[1]===void 0?l=-2:(l=s.lastIndex-h[2].length,d=h[1],s=h[3]===void 0?L:h[3]==='"'?re:ne):s===re||s===ne?s=L:s===te||s===ee?s=J:(s=L,o=void 0);let f=s===L&&n[c+1].startsWith("/>")?" ":"";i+=s===J?a+Ge:l>=0?(r.push(d),a.slice(0,l)+ie+a.slice(l)+R+f):a+R+(l===-2?c:f)}return[le(n,i+(n[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),r]},nt=class n{constructor({strings:t,_$litType$:e},r){let o;this.parts=[];let i=0,s=0,c=t.length-1,a=this.parts,[d,h]=Ze(t,e);if(this.el=n.createElement(d,r),N.currentNode=this.el.content,e===2||e===3){let l=this.el.content.firstChild;l.replaceWith(...l.childNodes)}for(;(o=N.nextNode())!==null&&a.length<c;){if(o.nodeType===1){if(o.hasAttributes())for(let l of o.getAttributeNames())if(l.endsWith(ie)){let u=h[s++],f=o.getAttribute(l).split(R),y=/([.?@])?(.*)/.exec(u);a.push({type:1,index:i,name:y[2],strings:f,ctor:y[1]==="."?Mt:y[1]==="?"?kt:y[1]==="@"?Et:B}),o.removeAttribute(l)}else l.startsWith(R)&&(a.push({type:6,index:i}),o.removeAttribute(l));if(ae.test(o.tagName)){let l=o.textContent.split(R),u=l.length-1;if(u>0){o.textContent=mt?mt.emptyScript:"";for(let f=0;f<u;f++)o.append(l[f],tt()),N.nextNode(),a.push({type:2,index:++i});o.append(l[u],tt())}}}else if(o.nodeType===8)if(o.data===se)a.push({type:2,index:i});else{let l=-1;for(;(l=o.data.indexOf(R,l+1))!==-1;)a.push({type:7,index:i}),l+=R.length-1}i++}}static createElement(t,e){let r=z.createElement("template");return r.innerHTML=t,r}};function D(n,t,e=n,r){if(t===I)return t;let o=r!==void 0?e._$Co?.[r]:e._$Cl,i=et(t)?void 0:t._$litDirective$;return o?.constructor!==i&&(o?._$AO?.(!1),i===void 0?o=void 0:(o=new i(n),o._$AT(n,e,r)),r!==void 0?(e._$Co??=[])[r]=o:e._$Cl=o),o!==void 0&&(t=D(n,o._$AS(n,t.values),o,r)),t}var At=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:r}=this._$AD,o=(t?.creationScope??z).importNode(e,!0);N.currentNode=o;let i=N.nextNode(),s=0,c=0,a=r[0];for(;a!==void 0;){if(s===a.index){let d;a.type===2?d=new rt(i,i.nextSibling,this,t):a.type===1?d=new a.ctor(i,a.name,a.strings,this,t):a.type===6&&(d=new St(i,this,t)),this._$AV.push(d),a=r[++c]}s!==a?.index&&(i=N.nextNode(),s++)}return N.currentNode=z,o}p(t){let e=0;for(let r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(t,r,e),e+=r.strings.length-2):r._$AI(t[e])),e++}},rt=class n{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,r,o){this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=r,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=D(this,t,e),et(t)?t===p||t==null||t===""?(this._$AH!==p&&this._$AR(),this._$AH=p):t!==this._$AH&&t!==I&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Qe(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==p&&et(this._$AH)?this._$AA.nextSibling.data=t:this.T(z.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:r}=t,o=typeof r=="number"?this._$AC(t):(r.el===void 0&&(r.el=nt.createElement(le(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===o)this._$AH.p(e);else{let i=new At(o,this),s=i.u(this.options);i.p(e),this.T(s),this._$AH=i}}_$AC(t){let e=oe.get(t.strings);return e===void 0&&oe.set(t.strings,e=new nt(t)),e}k(t){Pt(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,r,o=0;for(let i of t)o===e.length?e.push(r=new n(this.O(tt()),this.O(tt()),this,this.options)):r=e[o],r._$AI(i),o++;o<e.length&&(this._$AR(r&&r._$AB.nextSibling,o),e.length=o)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let r=Xt(t).nextSibling;Xt(t).remove(),t=r}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},B=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,r,o,i){this.type=1,this._$AH=p,this._$AN=void 0,this.element=t,this.name=e,this._$AM=o,this.options=i,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=p}_$AI(t,e=this,r,o){let i=this.strings,s=!1;if(i===void 0)t=D(this,t,e,0),s=!et(t)||t!==this._$AH&&t!==I,s&&(this._$AH=t);else{let c=t,a,d;for(t=i[0],a=0;a<i.length-1;a++)d=D(this,c[r+a],e,a),d===I&&(d=this._$AH[a]),s||=!et(d)||d!==this._$AH[a],d===p?t=p:t!==p&&(t+=(d??"")+i[a+1]),this._$AH[a]=d}s&&!o&&this.j(t)}j(t){t===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},Mt=class extends B{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===p?void 0:t}},kt=class extends B{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==p)}},Et=class extends B{constructor(t,e,r,o,i){super(t,e,r,o,i),this.type=5}_$AI(t,e=this){if((t=D(this,t,e,0)??p)===I)return;let r=this._$AH,o=t===p&&r!==p||t.capture!==r.capture||t.once!==r.once||t.passive!==r.passive,i=t!==p&&(r===p||o);o&&this.element.removeEventListener(this.name,this,r),i&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},St=class{constructor(t,e,r){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(t){D(this,t)}};var Ye=Ct.litHtmlPolyfillSupport;Ye?.(nt,rt),(Ct.litHtmlVersions??=[]).push("3.3.3");var ce=(n,t,e)=>{let r=e?.renderBefore??t,o=r._$litPart$;if(o===void 0){let i=e?.renderBefore??null;r._$litPart$=o=new rt(t.insertBefore(tt(),i),i,void 0,e??{})}return o._$AI(n),o};var Ht=globalThis,A=class extends H{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=ce(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return I}};A._$litElement$=!0,A.finalized=!0,Ht.litElementHydrateSupport?.({LitElement:A});var Xe=Ht.litElementPolyfillSupport;Xe?.({LitElement:A});(Ht.litElementVersions??=[]).push("4.2.2");var ot="pond_heatpump_price_planner",it=["heat_pump","thermostat","plan","figures","switches","model"],pe=["water_in","water_out","air_in","air_out","power","liquid","gas","fan","flow","compressor","pump_speed","pump_power","pump_fault"];function de(n){let t=new Set;for(let e of Object.values(n.entities??{}))e.platform===ot&&e.device_id&&t.add(e.device_id);return[...t].sort()}function ue(n,t){let e={};if(!t)return e;for(let r of Object.values(n.entities??{}))r.platform===ot&&r.device_id===t&&r.translation_key&&(e[r.translation_key]=r.entity_id);return e}function Rt(n,t=180,e=180,r=118){return{cx:t,cy:e,r,lo:n-3,hi:n+3}}function F(n,t){return 135+270*Math.min(Math.max((t-n.lo)/(n.hi-n.lo),0),1)}function P(n,t,e=n.r){let r=t*Math.PI/180;return[n.cx+e*Math.cos(r),n.cy+e*Math.sin(r)]}function gt(n,t,e,r=n.r){let[o,i]=P(n,t,r),[s,c]=P(n,e,r),a=e-t>180?1:0;return`M${o.toFixed(1)} ${i.toFixed(1)} A${r} ${r} 0 ${a} 1 ${s.toFixed(1)} ${c.toFixed(1)}`}function he(n,t,e,r,o,i){let s=Math.atan2(e-n.cy,t-n.cx)*180/Math.PI;s<90&&(s+=360);let c=Math.min(Math.max((s-135)/270,0),1),a=n.lo+c*(n.hi-n.lo);return ft(a,r,o,i)}function ft(n,t,e,r){let o=Math.round(n/t)*t;return Number(Math.min(Math.max(o,e),r).toFixed(2))}var tn=1e3,ge=.1,fe=1,Ot=.05,j=class extends A{constructor(){super(...arguments);this._target=null;this._band=null;this._timers={};this._dragging=!1;this.onDown=e=>{this._dragging=!0,e.currentTarget.setPointerCapture?.(e.pointerId),this.setTarget(this.pointerTemp(e))};this.onMove=e=>{this._dragging&&this.setTarget(this.pointerTemp(e))};this.onUp=()=>{this._dragging=!1}}get target(){return this._target??this.model.target}get band(){return this._band??this.model.band}emit(e,r){clearTimeout(this._timers[e]),this._timers[e]=setTimeout(()=>{this.dispatchEvent(new CustomEvent(e,{detail:{value:r},bubbles:!0,composed:!0})),e==="set-target"?this._target=null:this._band=null},tn)}setTarget(e){let r=this.model;this._target=ft(e,r.step,r.min,r.max),this.emit("set-target",this._target)}setBand(e){this._band=ft(e,Ot,ge,fe),this.emit("set-band",this._band)}pointerTemp(e){let o=e.currentTarget.closest("svg").getBoundingClientRect(),i=(e.clientX-o.left)/o.width*360,s=(e.clientY-o.top)/o.height*360;return he(Rt(this.model.target),i,s,this.model.step,this.model.min,this.model.max)}onKey(e,r){let o=e.key==="ArrowUp"||e.key==="ArrowRight"?1:e.key==="ArrowDown"||e.key==="ArrowLeft"?-1:0;o&&(e.preventDefault(),r==="target"?this.setTarget(this.target+o*this.model.step):this.setBand(this.band+o*Ot))}onSlider(e){this.setBand(Number(e.target.value))}disconnectedCallback(){super.disconnectedCallback(),Object.values(this._timers).forEach(e=>clearTimeout(e))}render(){let e=this.model,r=this.t,o=this.target,i=this.band,s=Rt(e.target),c=[];for(let u=Math.ceil(s.lo);u<=Math.floor(s.hi);u++){let f=F(s,u),[y,m]=P(s,f,s.r+11),[x,S]=P(s,f,s.r+17),[U,C]=P(s,f,s.r+30);c.push($`<line x1=${y} y1=${m} x2=${x} y2=${S} class="tick"/>
        <text x=${U} y=${C+4} class="tick-label" text-anchor="middle">${u}</text>`)}let[a,d]=P(s,F(s,o)),h=$``;if(e.pond!==null){let u=F(s,e.pond),f=P(s,u,s.r-12),y=P(s,u-4,s.r-26),m=P(s,u+4,s.r-26);h=$`<polygon class="pond-marker" points="${f.join(",")} ${y.join(",")} ${m.join(",")}"/>`}let l=[e.heating===null?null:r(e.heating?"heating":"idle"),e.mode?r(e.mode):null,e.position?r(e.position):null].filter(Boolean);return g`
      <div class="wrap">
        <svg viewBox="0 0 360 330" class="gauge">
          <path d=${gt(s,135,405)} class="ring"/>
          <path d=${gt(s,F(s,o-i),F(s,o+i))} class="band"/>
          ${c}
          ${h}
          <circle cx=${a} cy=${d} r="12" class="handle" tabindex="0" role="slider"
            aria-label=${r("target")} aria-valuemin=${e.min} aria-valuemax=${e.max} aria-valuenow=${o}
            @pointerdown=${this.onDown} @pointermove=${this.onMove} @pointerup=${this.onUp}
            @keydown=${u=>this.onKey(u,"target")}/>
          <path d=${gt(s,135,405)} class="hit"
            @pointerdown=${this.onDown} @pointermove=${this.onMove} @pointerup=${this.onUp}/>
          <text x="180" y="140" class="caption" text-anchor="middle">${r("pond")}</text>
          <text x="180" y="178" class="pond" text-anchor="middle">${e.pond===null?"\u2013":`${e.pond.toFixed(1)} \xB0C`}</text>
          <text x="180" y="200" class="status ${e.position??""}" text-anchor="middle">${l.join(" \xB7 ")}</text>
        </svg>
        <div class="stepper" style="--window:${3}">
          <span class="caption">${r("target")}</span>
          <button @click=${()=>this.setTarget(o-e.step)} aria-label="−">−</button>
          <span class="number">${o.toFixed(1)} °C</span>
          <button @click=${()=>this.setTarget(o+e.step)} aria-label="+">+</button>
        </div>
        ${e.bandEntity===null?p:g`
          <div class="band-slider">
            <span class="caption">${r("band")}</span>
            <span class="number">± ${i.toFixed(2)} °C</span>
            <input type="range" min=${ge} max=${fe} step=${Ot} .value=${String(i)}
              aria-label=${r("band")} @input=${this.onSlider} @keydown=${u=>this.onKey(u,"band")}/>
          </div>`}
      </div>`}};j.properties={model:{attribute:!1},t:{attribute:!1},_target:{state:!0},_band:{state:!0}},j.styles=M`
    .wrap { display: grid; grid-template-columns: 1fr auto; grid-template-areas: "gauge band" "step band"; align-items: center; gap: 0 12px; }
    .gauge { grid-area: gauge; width: 100%; height: auto; touch-action: none; }
    .ring { fill: none; stroke: var(--divider-color, #e0e0e0); stroke-width: 18; stroke-linecap: round; }
    .band { fill: none; stroke: var(--success-color, #66bb6a); stroke-width: 18; }
    .hit { fill: none; stroke: transparent; stroke-width: 40; cursor: pointer; }
    .tick { stroke: var(--secondary-text-color); stroke-width: 1.5; }
    .tick-label { font-size: 11px; fill: var(--secondary-text-color); }
    .handle { fill: var(--card-background-color, #fff); stroke: var(--primary-color, #1e88e5); stroke-width: 4; cursor: grab; }
    .handle:focus-visible { outline: none; stroke-width: 6; }
    .pond-marker { fill: #0d47a1; }
    .caption { font-size: 12px; fill: var(--secondary-text-color); color: var(--secondary-text-color); }
    .pond { font-size: 34px; font-weight: 700; fill: #0d47a1; }
    .status { font-size: 12px; fill: var(--success-color, #43a047); }
    .status.above_band { fill: var(--warning-color, #ef6c00); }
    .status.below_band { fill: var(--info-color, #1e88e5); }
    .stepper { grid-area: step; display: flex; align-items: center; justify-content: center; gap: 10px; }
    .stepper .caption { margin-right: 4px; }
    .number { font-size: 16px; font-weight: 600; color: var(--primary-text-color); min-width: 72px; text-align: center; }
    button { width: 32px; height: 32px; border-radius: 50%; border: none; background: var(--secondary-background-color, #eceff1); color: var(--primary-text-color); font-size: 18px; cursor: pointer; }
    .band-slider { grid-area: band; display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .band-slider input { writing-mode: vertical-lr; direction: rtl; height: 200px; accent-color: var(--success-color, #43a047); }
  `;var en=`M-98 394 q20 -7 40 0 ${"t40 0 ".repeat(19)}V458 H-98 Z`,nn=`M-98 400 q20 5 40 0 ${"t40 0 ".repeat(19)}V458 H-98 Z`;function w(n,t,e,r="label",o="start",i=""){return e===null?p:$`<text x=${n} y=${t} class=${r} text-anchor=${o} style=${i}>${e}</text>`}function xe(n,t){let e=r=>r?"on":"";return $`
  <svg viewBox="0 0 640 480" role="img" aria-label=${t("heat_pump")} class="illustration">
    <g class="air ${e(n.fan)}">
      <path d="M40 122 H160"/><path d="M40 142 H160"/><path d="M472 122 H600"/><path d="M472 142 H600"/>
    </g>
    <polygon points="160,116 172,132 160,148" class="arrow"/>
    <polygon points="600,116 612,132 600,148" class="arrow"/>
    ${w(40,104,n.airIn===null?null:t("air_in"))}
    ${w(40,170,n.airIn,"value")}
    ${w(520,104,n.airOut===null?null:t("air_out"))}
    ${w(520,170,n.airOut,"value")}

    <g class="legend" transform="translate(40 210)">
      <line x1="0" y1="0" x2="18" y2="0" class="hotgas-line"/><text x="24" y="4">${t("hot_gas")}</text>
      <line x1="0" y1="16" x2="18" y2="16" class="liquid-line"/><text x="24" y="20">${t("liquid")}</text>
      <line x1="0" y1="32" x2="18" y2="32" class="suction-line"/><text x="24" y="36">${t("suction_gas")}</text>
    </g>

    <rect class="housing" x="176" y="40" width="288" height="240" rx="14"/>
    <text x="192" y="58" class="label">${t("heat_pump")}</text>
    ${n.mode===null?p:$`
      <rect class="badge ${n.mode}" x="398" y="48" width="54" height="22" rx="11"/>
      <text x="425" y="64" class="badge-text" text-anchor="middle">${t(n.mode).toUpperCase()}</text>`}

    <rect class="hx" x="252" y="196" width="136" height="48" rx="8"/>
    <polyline class="coil" points="366,206 350,230 334,206 318,230 302,206 286,230 274,206"/>
    <text x="320" y="190" class="label" text-anchor="middle">${t("heat_exchanger")}</text>
    ${w(320,258,n.thermal===null?null:t("thermal"),"label","middle")}
    ${w(320,274,n.thermal,"small","middle")}

    <g class="refrigerant ${e(n.compressor)}">
      <path class="rpipe" d="M196 86 V74 H378 V86"/><path class="rflow suction" d="M196 86 V74 H378 V86"/>
      <path class="rpipe" d="M404 122 H420 V206 H366"/><path class="rflow hotgas" d="M404 122 H420 V206 H366"/>
      <path class="rpipe" d="M274 206 H262 V188 H196 V178"/><path class="rflow liquid" d="M274 206 H262 V188 H196 V178"/>
    </g>
    <g transform="translate(228 188)" class="valve">
      <polygon points="-9,-7 -9,7 0,0"/><polygon points="9,-7 9,7 0,0"/>
    </g>
    ${w(424,150,n.gas===null?null:t("gas"),"label hot")}
    ${w(424,166,n.gas,"tiny hot")}
    ${w(246,208,n.liquid===null?null:t("liquid"),"label warmtext","end")}
    ${w(246,223,n.liquid,"small warmtext","end")}

    <rect class="evaporator" x="188" y="86" width="16" height="92" rx="3"/>
    <path class="fins" d="M188 98 H204 M188 110 H204 M188 122 H204 M188 134 H204 M188 146 H204 M188 158 H204 M188 170 H204"/>
    <text transform="translate(214 132) rotate(-90)" class="tiny-label" text-anchor="middle">${t("evaporator")}</text>

    <circle class="fan-ring" cx="274" cy="132" r="48"/>
    <g class="fan ${e(n.fan)}">
      <path d="M274 132 C274 104 291 89 304 95 C298 112 285 123 274 132 Z"/>
      <path d="M274 132 C302 132 317 149 311 162 C294 156 283 143 274 132 Z"/>
      <path d="M274 132 C274 160 257 175 244 169 C250 152 263 141 274 132 Z"/>
      <path d="M274 132 C246 132 231 115 237 102 C254 108 265 121 274 132 Z"/>
      <circle cx="274" cy="132" r="7" class="hub"/>
    </g>

    <rect class="comp-body" x="352" y="86" width="52" height="72" rx="10"/>
    <rect class="cylinder" x="363" y="98" width="30" height="48" rx="3"/>
    <g class="piston ${e(n.compressor)}">
      <rect x="365" y="126" width="26" height="10" rx="2" class="piston-head"/>
      <rect x="375" y="136" width="6" height="12" class="piston-rod"/>
    </g>
    <text x="378" y="172" class="label" text-anchor="middle">${t("compressor")}</text>

    ${n.electrical===null?p:$`
      <path class="cord" d="M464 250 C496 250 512 272 548 270"/>
      <rect x="546" y="262" width="16" height="16" rx="3" class="plug"/>
      <rect x="562" y="266" width="6" height="2.5" class="pin"/><rect x="562" y="271.5" width="6" height="2.5" class="pin"/>
      <rect x="570" y="248" width="44" height="44" rx="8" class="socket"/>
      <circle cx="592" cy="270" r="13" class="socket-face"/>
      <circle cx="586" cy="270" r="2.5" class="hole"/><circle cx="598" cy="270" r="2.5" class="hole"/>
      <text x="592" y="308" class="label" text-anchor="middle">${t("electrical")}</text>
      <text x="592" y="324" class="value" text-anchor="middle">${n.electrical}</text>`}

    <g class="water ${e(n.flow)}">
      <path class="pipe" d="M100 380 V312 H230 V236 H252"/><path class="flow cold" d="M100 380 V312 H230 V236 H252"/>
      <path class="pipe" d="M388 236 H410 V312 H540 V380"/><path class="flow warm" d="M388 236 H410 V312 H540 V380"/>
    </g>
    <polygon points="533,366 547,366 540,380" class="warm-arrow"/>
    ${w(242,300,n.waterIn===null?null:t("water_in"))}
    ${w(242,318,n.waterIn,"value")}
    ${w(398,300,n.waterOut===null?null:t("water_out"),"label","end")}
    ${w(398,318,n.waterOut,"value","end")}

    <g class="pump ${n.pump}" transform="translate(160 312)">
      <circle class="pump-body" r="20"/><polygon class="pump-tri" points="-11,-15 -11,15 17,0"/>
    </g>
    <text x="160" y="348" class="label" text-anchor="middle">${t("pump")} · ${t(n.pump)}</text>
    ${w(160,364,n.pumpText,"small","middle")}

    <path d="M60 380 H580 V450 Q580 460 570 460 H70 Q60 460 60 450 Z" class="tub"/>
    <clipPath id="phpc-tub"><path d="M61 381 H579 V450 Q579 459 570 459 H70 Q61 459 61 450 Z"/></clipPath>
    <g clip-path="url(#phpc-tub)">
      <path class="wave" d=${en}/><path class="wave2" d=${nn}/>
    </g>
    <text x="320" y="438" class="label" text-anchor="middle">${t("pond")}</text>
    ${w(320,422,n.pond,"pond-temp","middle")}
  </svg>`}var be=M`
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
`;var _e={pond:"pond",heat_pump:"HEAT PUMP",air_in:"air in",air_out:"air out",water_in:"water in",water_out:"water out",evaporator:"evaporator",compressor:"compressor",heat_exchanger:"heat exchanger",thermal:"thermal",electrical:"electrical",gas:"gas",liquid:"liquid",hot_gas:"hot gas",suction_gas:"suction gas",pump:"pump",running:"running",fault:"fault",off:"off",low:"low",high:"high",target:"target",band:"band",heating:"heating",idle:"idle",in_band:"in band",above_band:"above band",below_band:"below band",next_start:"next start",next_stop:"next stop",controlling:"controlling",dry_run:"dry run",planned_cost:"planned cost 24 h",planned_energy:"planned energy 24 h",expensive_share:"in expensive quarters",cop:"COP",heat_loss:"heat loss",thermal_power:"thermal power",insulation_cover:"insulation cover",control:"control the heat pump",model:"Model",cooling:"cooling",heating_low:"heating rate low",heating_high:"heating rate high",prediction_error:"prediction error",learned:"learned",cop_by_outdoor:"COP by outdoor temperature",plan:"Plan",price:"price",now:"now",known_prices:"known prices",legend_pond:"pond temperature (predicted)",legend_expensive:"expensive quarters",legend_solar:"solar surplus",legend_forecast:"forecast prices from",no_device:"Choose a planner device in the card editor.",plan_summary:"Plan: {parts}.",device:"Planner device",hours:"Hours in the plan chart",sections:"Sections"},rn={pond:"vijver",heat_pump:"WARMTEPOMP",air_in:"lucht in",air_out:"lucht uit",water_in:"water in",water_out:"water uit",evaporator:"verdamper",compressor:"compressor",heat_exchanger:"warmtewisselaar",thermal:"thermisch",electrical:"elektrisch",gas:"gas",liquid:"vloeistof",hot_gas:"heet gas",suction_gas:"zuiggas",pump:"pomp",running:"in bedrijf",fault:"storing",off:"uit",low:"laag",high:"hoog",target:"streefwaarde",band:"band",heating:"verwarmt",idle:"rust",in_band:"binnen band",above_band:"boven band",below_band:"onder band",next_start:"volgende start",next_stop:"volgende stop",controlling:"stuurt aan",dry_run:"alleen plannen",planned_cost:"geplande kosten 24 u",planned_energy:"gepland verbruik 24 u",expensive_share:"in dure kwartieren",cop:"COP",heat_loss:"warmteverlies",thermal_power:"thermisch vermogen",insulation_cover:"isolatiekap",control:"warmtepomp aansturen",model:"Model",cooling:"afkoeling",heating_low:"opwarmsnelheid laag",heating_high:"opwarmsnelheid hoog",prediction_error:"voorspelfout",learned:"geleerd",cop_by_outdoor:"COP per buitentemperatuur",plan:"Plan",price:"prijs",now:"nu",known_prices:"bekende prijzen",legend_pond:"vijvertemperatuur (voorspeld)",legend_expensive:"dure kwartieren",legend_solar:"zonne-overschot",legend_forecast:"verwachte prijzen vanaf",no_device:"Kies een planner-apparaat in de kaarteditor.",plan_summary:"Plan: {parts}.",device:"Planner-apparaat",hours:"Uren in de plangrafiek",sections:"Blokken"};function bt(n){let t=(n??"en").toLowerCase().startsWith("nl")?rn:_e;return(e,r)=>{let o=t[e]??_e[e]??e;for(let[i,s]of Object.entries(r??{}))o=o.replace(`{${i}}`,String(s));return o}}function on(n,t){if(!n.length)return 0;let e=(n.length-1)*t,r=Math.floor(e),o=Math.ceil(e);return n[r]+(n[o]-n[r])*(e-r)}function Ut(n,t,e,r=28){let o=n.quarters,i=o[0].t,s=o[o.length-1].t+9e5,c=o.map(x=>x.temp).concat([n.target-n.band,n.target+n.band]),a=Math.floor((Math.min(...c)-.1)*10)/10,d=Math.ceil((Math.max(...c)+.1)*10)/10,h=o.map(x=>x.price),l=Math.min(...h),u=Math.max(...h)===l?l+.01:Math.max(...h),f=o.map((x,S)=>{let U=o.slice(Math.floor(S/96)*96,Math.floor(S/96)*96+96).map(C=>C.price);return o[S].price>on([...U].sort((C,pt)=>C-pt),.75)}),y=o.find(x=>!x.known),m=e-r*2;return{x:x=>r+(x-i)/(s-i)*(t-r*2),yTemp:x=>r+(1-(x-a)/(d-a))*m,yPrice:x=>r+(1-(x-l)/(u-l))*m,tempMin:a,tempMax:d,priceMin:l,priceMax:u,start:i,end:s,expensive:f,knownUntil:y?y.t:null}}function sn(n){let t=[];for(let e of n){let r=t[t.length-1];r&&r.mode===e.mode?r.to=e.t+9e5:t.push({mode:e.mode,from:e.t,to:e.t+9e5})}return t}function ye(n,t,e="en"){let r=i=>new Date(i).toLocaleTimeString(e,{hour:"2-digit",minute:"2-digit"}),o=sn(n.quarters).map(i=>`${t(i.mode)} ${r(i.from)}\u2013${r(i.to)}`);return t("plan_summary",{parts:o.join(", ")})}var O=600,k=220,Lt=15*60*1e3;function $e(n,t,e){let r=Ut(n,O,k),o=n.quarters,i=r.x(o[0].t+Lt)-r.x(o[0].t),s={off:0,low:.5,high:1},c=o.map((m,x)=>{let S=18*s[m.mode],U=r.expensive[x]?$`<rect x=${r.x(m.t)} y="28" width=${i} height=${k-56} class="expensive"/>`:$``,C=m.surplus?$`<rect x=${r.x(m.t)} y=${k-26} width=${i} height="4" class="sun"/>`:$``;return $`${U}${C}<rect x=${r.x(m.t)} y=${k-28-S} width=${i} height=${S} class="bar ${m.mode}"/>`}),a=o.map((m,x)=>`${x?"L":"M"}${r.x(m.t+Lt).toFixed(1)} ${r.yTemp(m.temp).toFixed(1)}`).join(" "),d=o.map((m,x)=>`${x?"L":"M"}${r.x(m.t).toFixed(1)} ${r.yPrice(m.price).toFixed(1)} H${r.x(m.t+Lt).toFixed(1)}`).join(" "),h=r.yTemp(n.target+n.band),l=r.yTemp(n.target-n.band),u=Math.min(Math.max(r.x(n.now),28),O-28),f=m=>new Date(m).toLocaleTimeString(e,{hour:"2-digit",minute:"2-digit"}),y=[];for(let m=Math.ceil(r.start/(6*36e5))*6*36e5;m<r.end;m+=6*36e5)y.push($`<text x=${r.x(m)} y=${k-8} class="axis" text-anchor="middle">${f(m)}</text>`);return $`
    <svg viewBox="0 0 ${O} ${k}" class="chart" role="img" aria-label=${ye(n,t,e)}>
      <rect x="28" y=${h} width=${O-56} height=${l-h} class="band"/>
      ${c}
      <line x1="28" x2=${O-28} y1=${r.yTemp(n.target)} y2=${r.yTemp(n.target)} class="target"/>
      <path d=${d} class="price"/>
      <path d=${a} class="temp"/>
      ${r.knownUntil===null?$``:$`<line x1=${r.x(r.knownUntil)} x2=${r.x(r.knownUntil)} y1="28" y2=${k-28} class="known"/>`}
      <line x1=${u} x2=${u} y1="20" y2=${k-28} class="now"/>
      <text x="4" y="20" class="axis">${r.tempMax.toFixed(1)} °C</text>
      <text x="4" y=${k-30} class="axis">${r.tempMin.toFixed(1)}</text>
      <text x=${O-4} y="20" class="axis" text-anchor="end">€ ${r.priceMax.toFixed(2)}</text>
      <text x=${O-4} y=${k-30} class="axis" text-anchor="end">${r.priceMin.toFixed(2)}</text>
      ${y}
    </svg>`}function an(n){let t=Ut(n,O,k),e=[{key:"legend_pond",swatch:"line"},{key:"target",swatch:"dashed"},{key:"band",swatch:"area"},{key:"low",swatch:"low"},{key:"high",swatch:"high"},{key:"price",swatch:"step"}];return t.expensive.some(Boolean)&&e.push({key:"legend_expensive",swatch:"expensive"}),n.quarters.some(r=>r.surplus)&&e.push({key:"legend_solar",swatch:"solar"}),e.push({key:"now",swatch:"now"}),t.knownUntil!==null&&e.push({key:"legend_forecast",swatch:"dotted"}),e}function we(n,t){return g`<ul class="chart-legend">
    ${an(n).map(e=>g`<li><span class="sw ${e.swatch}"></span>${t(e.key)}</li>`)}
  </ul>`}var ve=M`
  .chart-legend { list-style: none; display: flex; flex-wrap: wrap; gap: 4px 14px; margin: 6px 0 0; padding: 0; font-size: 11px; color: var(--secondary-text-color); }
  .chart-legend li { display: flex; align-items: center; gap: 5px; }
  .sw { display: inline-block; width: 18px; height: 10px; box-sizing: border-box; }
  .sw.line { border-top: 2.5px solid #0d47a1; height: 0; }
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
  .temp { fill: none; stroke: #0d47a1; stroke-width: 2.5; }
  .price { fill: none; stroke: var(--secondary-text-color); stroke-width: 1.2; }
  .known { stroke: var(--secondary-text-color); stroke-dasharray: 2 3; }
  .now { stroke: var(--error-color, #e53935); stroke-width: 1.5; }
  .axis { font-size: 10px; fill: var(--secondary-text-color); }
`;function T(n){let t=typeof n=="number"?n:Number.parseFloat(String(n));return Number.isFinite(t)?t:null}function q(n,t){return n===null?null:n.toFixed(t)}function st(n){return n===null?null:Math.abs(n)>=1e3?`${(n/1e3).toFixed(2)} kW`:`${Math.round(n)} W`}function W(n){return n===null?null:`${n.toFixed(1)} \xB0C`}function V(n,t,e=0){return n===null?null:t?`${n.toFixed(e)} ${t}`:n.toFixed(e)}function at(n,t="en"){if(!n)return null;let e=new Date(n);return Number.isNaN(e.getTime())?null:e.toLocaleTimeString(t,{hour:"2-digit",minute:"2-digit"})}function K(n,t){return t===null?p:g`<div class="fig"><span class="v">${t}</span><span class="l">${n}</span></div>`}function Ae(n,t,e){let r=[n.nextStop?`${t("next_stop")} ${at(n.nextStop,e)}`:null,n.nextStart?`${t("next_start")} ${at(n.nextStart,e)}`:null,n.control===null?null:t(n.control?"controlling":"dry_run")].filter(Boolean);return g`<div class="next">${r.join(" \xB7 ")}</div>`}function Me(n,t){return g`<div class="figures">
    ${K(t("planned_cost"),n.cost)} ${K(t("planned_energy"),n.energy)}
    ${K(t("expensive_share"),n.expensive)}
    ${K(n.copMethod?`${t("cop")} (${n.copMethod})`:t("cop"),n.cop)}
    ${K(t("heat_loss"),n.heatLoss)} ${K(t("thermal_power"),n.thermal)}
  </div>`}function ke(n,t,e){let r=(o,i)=>o===null?p:g`<label class="switch"><input type="checkbox" .checked=${o.on} @change=${s=>e(o.entity,s.target.checked)}/>${t(i)}</label>`;return g`<div class="switches">${r(n.cover,"insulation_cover")} ${r(n.control,"control")}</div>`}function Ee(n,t){let e=[[t("cooling"),n.cooling],[t("heating_low"),n.heatingLow],[t("heating_high"),n.heatingHigh],[t("prediction_error"),n.predictionError],[t("learned"),n.learned]];return g`<details class="model"><summary>${t("model")}</summary>
    <table>${e.filter(([,r])=>r!==null).map(([r,o])=>g`<tr><td>${r}</td><td>${o}</td></tr>`)}</table>
    ${n.copByOutdoor.length?g`<div class="l">${t("cop_by_outdoor")}</div>
          <table>${n.copByOutdoor.map(([r,o])=>g`<tr><td>${r} °C</td><td>${o??"\u2013"}</td></tr>`)}</table>`:p}
  </details>`}var Se=M`
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
`;var Ce=["off","low","high"];function v(n,t){return t?n.states[t]:void 0}function E(n){return!!n&&n.state!=="unavailable"&&n.state!=="unknown"}function _(n,t){let e=v(n,t);return E(e)?T(e.state):null}function G(n,t){return v(n,t)?.state==="on"}function ln(n,t,e){let r=v(n,e.model_status)?.attributes.links??{},o={water_in:r.inlet_temperature,water_out:r.outlet_temperature,air_in:r.air_inlet_temperature,power:r.power},i={};for(let[s,c]of Object.entries({...o,...t.heat_pump??{}}))c&&(i[s]=c);return i}function Pe(n,t,e=Date.now()){let r=ue(n,t.device_id),o=(t.sections?.length?t.sections:[...it]).filter(b=>it.includes(b)),i=ln(n,t,r),c=[...Object.values(r),...Object.values(i)].map(b=>`${b}:${v(n,b)?.last_updated??"-"}`).join("|"),a={sections:o,illustration:null,gauge:null,plan:null,figures:null,switches:null,model:null,missingDevice:!t.device_id||Object.keys(r).length===0,signature:c};if(a.missingDevice)return a;let d=v(n,r.thermostat),h=v(n,r.mode),l=E(h)&&Ce.includes(h.state)?h.state:null,u=E(d)?T(d.attributes.current_temperature):null,f=E(d)?T(d.attributes.temperature)??15:15,y=_(n,r.band)??.25,m=_(n,r.thermal_power),x=v(n,i.pump_speed),S=_(n,i.pump_power),U=G(n,i.pump_fault),C=G(n,i.flow),pt=[V(_(n,i.pump_speed),x?.attributes.unit_of_measurement),st(S)].filter(Boolean),He={pond:W(u),waterIn:W(_(n,i.water_in)),waterOut:W(_(n,i.water_out)),airIn:W(_(n,i.air_in)),airOut:W(_(n,i.air_out)),electrical:st(_(n,i.power)),thermal:st(m),liquid:q(_(n,i.liquid),0)&&`${q(_(n,i.liquid),0)} \xB0C`,gas:q(_(n,i.gas),0)&&`${q(_(n,i.gas),0)} \xB0C`,mode:l,fan:G(n,i.fan),flow:C,compressor:G(n,i.compressor),pump:U?"fault":C?"running":"off",pumpText:pt.length?pt.join(" \xB7 "):null},It=E(d)?d.attributes.hvac_action:null,Re=r.thermostat?{pond:u,target:f,band:y,min:T(d?.attributes.min_temp)??5,max:T(d?.attributes.max_temp)??28,step:T(d?.attributes.target_temp_step)??.1,heating:It==="heating"?!0:It==="idle"?!1:null,mode:l,position:u===null?null:u>f+y?"above_band":u<f-y?"below_band":"in_band",thermostat:r.thermostat,bandEntity:r.band??null,nextStart:E(v(n,r.next_start))?v(n,r.next_start).state:null,nextStop:E(v(n,r.next_stop))?v(n,r.next_stop).state:null,control:r.control?G(n,r.control):null}:null,Oe=h?.attributes.plan??[],Ue=t.hours??36,jt=Oe.map(b=>({t:Date.parse(b.start),mode:Ce.includes(b.mode)?b.mode:"off",temp:Number(b.temp),price:Number(b.price),known:b.known!==!1,surplus:b.surplus===void 0?null:Number(b.surplus)})).filter(b=>Number.isFinite(b.t)&&Number.isFinite(b.temp)).slice(0,Ue*4),Le=jt.length?{quarters:jt,target:f,band:y,now:e}:null,Z=v(n,r.planned_cost),Vt=v(n,r.cop),Dt=E(Z)?T(Z.attributes.expensive_share):null,Bt=_(n,r.heat_loss),Ne={cost:E(Z)&&T(Z.state)!==null?`\u20AC ${T(Z.state).toFixed(2)}`:null,energy:V(_(n,r.planned_energy),"kWh",1),expensive:Dt===null?null:`${Math.round(Dt*100)} %`,cop:q(_(n,r.cop),1),copMethod:E(Vt)?Vt.attributes.method??null:null,heatLoss:Bt===null?null:`${Math.round(Bt)} W/K`,thermal:st(m)},Ft=b=>r[b]?{entity:r[b],on:G(n,r[b])}:null,ze=v(n,r.cop)?.attributes.by_outdoor??{},Ie={cooling:V(_(n,r.cooling_coefficient),"1/h",4),heatingLow:V(_(n,r.heating_rate_low),"K/h",3),heatingHigh:V(_(n,r.heating_rate_high),"K/h",3),predictionError:V(_(n,r.prediction_error),"K",2),learned:E(v(n,r.model_status))?at(v(n,r.model_status).state,n.locale?.language):null,copByOutdoor:Object.entries(ze).map(([b,qt])=>[b,qt===null?null:Number(qt).toFixed(1)])};return{...a,illustration:He,gauge:Re,plan:Le,figures:Ne,switches:{cover:Ft("insulation_cover"),control:Ft("control")},model:Ie}}var lt="pond-heatpump-planner-card",Nt="pond-heatpump-planner-card-editor",Te="phpc-gauge",Q=class extends A{static getConfigElement(){return document.createElement(Nt)}static getStubConfig(t){return{type:`custom:${lt}`,device_id:de(t)[0]}}setConfig(t){if(!t)throw new Error("Invalid configuration");this._config={hours:36,...t},this.rebuild(!0)}set hass(t){this._hass=t,this.rebuild(!1)}get hass(){return this._hass}rebuild(t){if(!this._hass||!this._config)return;let e=Pe(this._hass,this._config);(t||!this._vm||e.signature!==this._vm.signature)&&(this._vm=e)}getCardSize(){return 12}get t(){return bt(this._hass?.locale?.language??this._hass?.language)}call(t,e,r){this._hass?.callService(t,e,r)}section(t,e){let r=this.t,o=this._hass?.locale?.language??"en";switch(t){case"heat_pump":return e.illustration?g`<div class="section">${xe(e.illustration,r)}</div>`:p;case"thermostat":return e.gauge?g`<div class="section">
              <phpc-gauge .model=${e.gauge} .t=${r}
                @set-target=${i=>this.call("climate","set_temperature",{entity_id:e.gauge.thermostat,temperature:i.detail.value})}
                @set-band=${i=>e.gauge.bandEntity&&this.call("number","set_value",{entity_id:e.gauge.bandEntity,value:i.detail.value})}
              ></phpc-gauge>
              ${Ae(e.gauge,r,o)}
            </div>`:p;case"plan":return e.plan?g`<div class="section">${$e(e.plan,r,o)}${we(e.plan,r)}</div>`:p;case"figures":return e.figures?g`<div class="section">${Me(e.figures,r)}</div>`:p;case"switches":return e.switches&&(e.switches.cover||e.switches.control)?g`<div class="section">${ke(e.switches,r,(i,s)=>this.call("switch",s?"turn_on":"turn_off",{entity_id:i}))}</div>`:p;case"model":return e.model?g`<div class="section">${Ee(e.model,r)}</div>`:p}}render(){let t=this._vm;return t?t.missingDevice?g`<ha-card><div class="section warning">${this.t("no_device")}</div></ha-card>`:g`<ha-card>${t.sections.map(e=>this.section(e,t))}</ha-card>`:p}};Q.properties={_vm:{state:!0}},Q.styles=[be,ve,Se,M`
      ha-card { padding: 8px 0; overflow: hidden; }
      .section { padding: 8px 16px; }
      .section + .section { border-top: 1px solid var(--divider-color, #e0e0e0); }
      .warning { color: var(--warning-color, #ef6c00); }
    `];var cn=["water_in","water_out","air_in","air_out","power","liquid","gas","pump_speed","pump_power"];function pn(){return[{name:"device_id",selector:{device:{integration:ot}}},{name:"hours",selector:{select:{options:["24","36","48"],mode:"dropdown"}}},{name:"sections",selector:{select:{options:[...it],multiple:!0,reorder:!0}}},{name:"heat_pump",type:"expandable",title:"Heat pump",schema:pe.map(n=>({name:n,selector:{entity:{domain:cn.includes(n)?"sensor":"binary_sensor"}}}))}]}var ct=class extends A{setConfig(t){this._config=t}changed(t){let e={...t.detail.value};e.hours&&(e.hours=Number(e.hours)),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}render(){if(!this.hass||!this._config)return g``;let t=bt(this.hass.locale?.language),e={...this._config,hours:String(this._config.hours??36)};return g`<ha-form
      .hass=${this.hass}
      .data=${e}
      .schema=${pn()}
      .computeLabel=${r=>t(r.name)}
      @value-changed=${this.changed}
    ></ha-form>`}};ct.properties={hass:{attribute:!1},_config:{state:!0}};function zt(n,t){customElements.get(n)||customElements.define(n,t)}zt(Te,j);zt(Nt,ct);zt(lt,Q);var _t=window;_t.customCards=_t.customCards??[];_t.customCards.some(n=>n.type===lt)||_t.customCards.push({type:lt,name:"Pond Heat Pump Planner",description:"Heat pump illustration, thermostat with band, plan and key figures of the pond heat pump planner.",preview:!0,documentationURL:"https://github.com/abroeders/pond-heatpump-price-planner/blob/main/docs/card.md"});
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
