var dt=globalThis,ut=dt.ShadowRoot&&(dt.ShadyCSS===void 0||dt.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,_t=Symbol(),qt=new WeakMap,Y=class{constructor(t,n,e){if(this._$cssResult$=!0,e!==_t)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=n}get styleSheet(){let t=this.o,n=this.t;if(ut&&t===void 0){let e=n!==void 0&&n.length===1;e&&(t=qt.get(n)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&qt.set(n,t))}return t}toString(){return this.cssText}},Kt=r=>new Y(typeof r=="string"?r:r+"",void 0,_t),M=(r,...t)=>{let n=r.length===1?r[0]:t.reduce((e,o,i)=>e+(s=>{if(s._$cssResult$===!0)return s.cssText;if(typeof s=="number")return s;throw Error("Value passed to 'css' function must be a 'css' function result: "+s+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+r[i+1],r[0]);return new Y(n,r,_t)},Gt=(r,t)=>{if(ut)r.adoptedStyleSheets=t.map(n=>n instanceof CSSStyleSheet?n:n.styleSheet);else for(let n of t){let e=document.createElement("style"),o=dt.litNonce;o!==void 0&&e.setAttribute("nonce",o),e.textContent=n.cssText,r.appendChild(e)}},$t=ut?r=>r:r=>r instanceof CSSStyleSheet?(t=>{let n="";for(let e of t.cssRules)n+=e.cssText;return Kt(n)})(r):r;var{is:Be,defineProperty:We,getOwnPropertyDescriptor:qe,getOwnPropertyNames:Ke,getOwnPropertySymbols:Ge,getPrototypeOf:Qe}=Object,ht=globalThis,Qt=ht.trustedTypes,Ze=Qt?Qt.emptyScript:"",Ye=ht.reactiveElementPolyfillSupport,X=(r,t)=>r,wt={toAttribute(r,t){switch(t){case Boolean:r=r?Ze:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,t){let n=r;switch(t){case Boolean:n=r!==null;break;case Number:n=r===null?null:Number(r);break;case Object:case Array:try{n=JSON.parse(r)}catch{n=null}}return n}},Yt=(r,t)=>!Be(r,t),Zt={attribute:!0,type:String,converter:wt,reflect:!1,useDefault:!1,hasChanged:Yt};Symbol.metadata??=Symbol("metadata"),ht.litPropertyMetadata??=new WeakMap;var H=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,n=Zt){if(n.state&&(n.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((n=Object.create(n)).wrapped=!0),this.elementProperties.set(t,n),!n.noAccessor){let e=Symbol(),o=this.getPropertyDescriptor(t,e,n);o!==void 0&&We(this.prototype,t,o)}}static getPropertyDescriptor(t,n,e){let{get:o,set:i}=qe(this.prototype,t)??{get(){return this[n]},set(s){this[n]=s}};return{get:o,set(s){let l=o?.call(this);i?.call(this,s),this.requestUpdate(t,l,e)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??Zt}static _$Ei(){if(this.hasOwnProperty(X("elementProperties")))return;let t=Qe(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(X("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(X("properties"))){let n=this.properties,e=[...Ke(n),...Ge(n)];for(let o of e)this.createProperty(o,n[o])}let t=this[Symbol.metadata];if(t!==null){let n=litPropertyMetadata.get(t);if(n!==void 0)for(let[e,o]of n)this.elementProperties.set(e,o)}this._$Eh=new Map;for(let[n,e]of this.elementProperties){let o=this._$Eu(n,e);o!==void 0&&this._$Eh.set(o,n)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let n=[];if(Array.isArray(t)){let e=new Set(t.flat(1/0).reverse());for(let o of e)n.unshift($t(o))}else t!==void 0&&n.push($t(t));return n}static _$Eu(t,n){let e=n.attribute;return e===!1?void 0:typeof e=="string"?e:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,n=this.constructor.elementProperties;for(let e of n.keys())this.hasOwnProperty(e)&&(t.set(e,this[e]),delete this[e]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Gt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,n,e){this._$AK(t,e)}_$ET(t,n){let e=this.constructor.elementProperties.get(t),o=this.constructor._$Eu(t,e);if(o!==void 0&&e.reflect===!0){let i=(e.converter?.toAttribute!==void 0?e.converter:wt).toAttribute(n,e.type);this._$Em=t,i==null?this.removeAttribute(o):this.setAttribute(o,i),this._$Em=null}}_$AK(t,n){let e=this.constructor,o=e._$Eh.get(t);if(o!==void 0&&this._$Em!==o){let i=e.getPropertyOptions(o),s=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:wt;this._$Em=o;let l=s.fromAttribute(n,i.type);this[o]=l??this._$Ej?.get(o)??l,this._$Em=null}}requestUpdate(t,n,e,o=!1,i){if(t!==void 0){let s=this.constructor;if(o===!1&&(i=this[t]),e??=s.getPropertyOptions(t),!((e.hasChanged??Yt)(i,n)||e.useDefault&&e.reflect&&i===this._$Ej?.get(t)&&!this.hasAttribute(s._$Eu(t,e))))return;this.C(t,n,e)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,n,{useDefault:e,reflect:o,wrapped:i},s){e&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,s??n??this[t]),i!==!0||s!==void 0)||(this._$AL.has(t)||(this.hasUpdated||e||(n=void 0),this._$AL.set(t,n)),o===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(n){Promise.reject(n)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[o,i]of this._$Ep)this[o]=i;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[o,i]of e){let{wrapped:s}=i,l=this[o];s!==!0||this._$AL.has(o)||l===void 0||this.C(o,void 0,i,l)}}let t=!1,n=this._$AL;try{t=this.shouldUpdate(n),t?(this.willUpdate(n),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(n)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(n)}willUpdate(t){}_$AE(t){this._$EO?.forEach(n=>n.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(n=>this._$ET(n,this[n])),this._$EM()}updated(t){}firstUpdated(t){}};H.elementStyles=[],H.shadowRootOptions={mode:"open"},H[X("elementProperties")]=new Map,H[X("finalized")]=new Map,Ye?.({ReactiveElement:H}),(ht.reactiveElementVersions??=[]).push("2.1.2");var Ct=globalThis,Xt=r=>r,mt=Ct.trustedTypes,Jt=mt?mt.createPolicy("lit-html",{createHTML:r=>r}):void 0,ie="$lit$",R=`lit$${Math.random().toFixed(9).slice(2)}$`,se="?"+R,Xe=`<${se}>`,z=document,tt=()=>z.createComment(""),et=r=>r===null||typeof r!="object"&&typeof r!="function",Tt=Array.isArray,Je=r=>Tt(r)||typeof r?.[Symbol.iterator]=="function",vt=`[ 	
\f\r]`,J=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,te=/-->/g,ee=/>/g,U=RegExp(`>|${vt}(?:([^\\s"'>=/]+)(${vt}*=${vt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ne=/'/g,re=/"/g,ae=/^(?:script|style|textarea|title)$/i,Pt=r=>(t,...n)=>({_$litType$:r,strings:t,values:n}),g=Pt(1),$=Pt(2),_n=Pt(3),I=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),oe=new WeakMap,N=z.createTreeWalker(z,129);function le(r,t){if(!Tt(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return Jt!==void 0?Jt.createHTML(t):t}var tn=(r,t)=>{let n=r.length-1,e=[],o,i=t===2?"<svg>":t===3?"<math>":"",s=J;for(let l=0;l<n;l++){let a=r[l],d,h,c=-1,u=0;for(;u<a.length&&(s.lastIndex=u,h=s.exec(a),h!==null);)u=s.lastIndex,s===J?h[1]==="!--"?s=te:h[1]!==void 0?s=ee:h[2]!==void 0?(ae.test(h[2])&&(o=RegExp("</"+h[2],"g")),s=U):h[3]!==void 0&&(s=U):s===U?h[0]===">"?(s=o??J,c=-1):h[1]===void 0?c=-2:(c=s.lastIndex-h[2].length,d=h[1],s=h[3]===void 0?U:h[3]==='"'?re:ne):s===re||s===ne?s=U:s===te||s===ee?s=J:(s=U,o=void 0);let f=s===U&&r[l+1].startsWith("/>")?" ":"";i+=s===J?a+Xe:c>=0?(e.push(d),a.slice(0,c)+ie+a.slice(c)+R+f):a+R+(c===-2?l:f)}return[le(r,i+(r[n]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),e]},nt=class r{constructor({strings:t,_$litType$:n},e){let o;this.parts=[];let i=0,s=0,l=t.length-1,a=this.parts,[d,h]=tn(t,n);if(this.el=r.createElement(d,e),N.currentNode=this.el.content,n===2||n===3){let c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(o=N.nextNode())!==null&&a.length<l;){if(o.nodeType===1){if(o.hasAttributes())for(let c of o.getAttributeNames())if(c.endsWith(ie)){let u=h[s++],f=o.getAttribute(c).split(R),_=/([.?@])?(.*)/.exec(u);a.push({type:1,index:i,name:_[2],strings:f,ctor:_[1]==="."?Mt:_[1]==="?"?At:_[1]==="@"?Et:V}),o.removeAttribute(c)}else c.startsWith(R)&&(a.push({type:6,index:i}),o.removeAttribute(c));if(ae.test(o.tagName)){let c=o.textContent.split(R),u=c.length-1;if(u>0){o.textContent=mt?mt.emptyScript:"";for(let f=0;f<u;f++)o.append(c[f],tt()),N.nextNode(),a.push({type:2,index:++i});o.append(c[u],tt())}}}else if(o.nodeType===8)if(o.data===se)a.push({type:2,index:i});else{let c=-1;for(;(c=o.data.indexOf(R,c+1))!==-1;)a.push({type:7,index:i}),c+=R.length-1}i++}}static createElement(t,n){let e=z.createElement("template");return e.innerHTML=t,e}};function F(r,t,n=r,e){if(t===I)return t;let o=e!==void 0?n._$Co?.[e]:n._$Cl,i=et(t)?void 0:t._$litDirective$;return o?.constructor!==i&&(o?._$AO?.(!1),i===void 0?o=void 0:(o=new i(r),o._$AT(r,n,e)),e!==void 0?(n._$Co??=[])[e]=o:n._$Cl=o),o!==void 0&&(t=F(r,o._$AS(r,t.values),o,e)),t}var kt=class{constructor(t,n){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=n}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:n},parts:e}=this._$AD,o=(t?.creationScope??z).importNode(n,!0);N.currentNode=o;let i=N.nextNode(),s=0,l=0,a=e[0];for(;a!==void 0;){if(s===a.index){let d;a.type===2?d=new rt(i,i.nextSibling,this,t):a.type===1?d=new a.ctor(i,a.name,a.strings,this,t):a.type===6&&(d=new St(i,this,t)),this._$AV.push(d),a=e[++l]}s!==a?.index&&(i=N.nextNode(),s++)}return N.currentNode=z,o}p(t){let n=0;for(let e of this._$AV)e!==void 0&&(e.strings!==void 0?(e._$AI(t,e,n),n+=e.strings.length-2):e._$AI(t[n])),n++}},rt=class r{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,n,e,o){this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=t,this._$AB=n,this._$AM=e,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,n=this._$AM;return n!==void 0&&t?.nodeType===11&&(t=n.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,n=this){t=F(this,t,n),et(t)?t===p||t==null||t===""?(this._$AH!==p&&this._$AR(),this._$AH=p):t!==this._$AH&&t!==I&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Je(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==p&&et(this._$AH)?this._$AA.nextSibling.data=t:this.T(z.createTextNode(t)),this._$AH=t}$(t){let{values:n,_$litType$:e}=t,o=typeof e=="number"?this._$AC(t):(e.el===void 0&&(e.el=nt.createElement(le(e.h,e.h[0]),this.options)),e);if(this._$AH?._$AD===o)this._$AH.p(n);else{let i=new kt(o,this),s=i.u(this.options);i.p(n),this.T(s),this._$AH=i}}_$AC(t){let n=oe.get(t.strings);return n===void 0&&oe.set(t.strings,n=new nt(t)),n}k(t){Tt(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,e,o=0;for(let i of t)o===n.length?n.push(e=new r(this.O(tt()),this.O(tt()),this,this.options)):e=n[o],e._$AI(i),o++;o<n.length&&(this._$AR(e&&e._$AB.nextSibling,o),n.length=o)}_$AR(t=this._$AA.nextSibling,n){for(this._$AP?.(!1,!0,n);t!==this._$AB;){let e=Xt(t).nextSibling;Xt(t).remove(),t=e}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},V=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,n,e,o,i){this.type=1,this._$AH=p,this._$AN=void 0,this.element=t,this.name=n,this._$AM=o,this.options=i,e.length>2||e[0]!==""||e[1]!==""?(this._$AH=Array(e.length-1).fill(new String),this.strings=e):this._$AH=p}_$AI(t,n=this,e,o){let i=this.strings,s=!1;if(i===void 0)t=F(this,t,n,0),s=!et(t)||t!==this._$AH&&t!==I,s&&(this._$AH=t);else{let l=t,a,d;for(t=i[0],a=0;a<i.length-1;a++)d=F(this,l[e+a],n,a),d===I&&(d=this._$AH[a]),s||=!et(d)||d!==this._$AH[a],d===p?t=p:t!==p&&(t+=(d??"")+i[a+1]),this._$AH[a]=d}s&&!o&&this.j(t)}j(t){t===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},Mt=class extends V{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===p?void 0:t}},At=class extends V{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==p)}},Et=class extends V{constructor(t,n,e,o,i){super(t,n,e,o,i),this.type=5}_$AI(t,n=this){if((t=F(this,t,n,0)??p)===I)return;let e=this._$AH,o=t===p&&e!==p||t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive,i=t!==p&&(e===p||o);o&&this.element.removeEventListener(this.name,this,e),i&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},St=class{constructor(t,n,e){this.element=t,this.type=6,this._$AN=void 0,this._$AM=n,this.options=e}get _$AU(){return this._$AM._$AU}_$AI(t){F(this,t)}};var en=Ct.litHtmlPolyfillSupport;en?.(nt,rt),(Ct.litHtmlVersions??=[]).push("3.3.3");var ce=(r,t,n)=>{let e=n?.renderBefore??t,o=e._$litPart$;if(o===void 0){let i=n?.renderBefore??null;e._$litPart$=o=new rt(t.insertBefore(tt(),i),i,void 0,n??{})}return o._$AI(r),o};var Ht=globalThis,k=class extends H{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let n=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=ce(n,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return I}};k._$litElement$=!0,k.finalized=!0,Ht.litElementHydrateSupport?.({LitElement:k});var nn=Ht.litElementPolyfillSupport;nn?.({LitElement:k});(Ht.litElementVersions??=[]).push("4.2.2");var ot="pond_heatpump_price_planner",it=["heat_pump","thermostat","plan","figures","switches","model"],pe=["water_in","water_out","air_in","air_out","power","liquid","gas","fan","flow","compressor","pump_speed","pump_power","pump_fault"];function de(r){let t=new Set;for(let n of Object.values(r.entities??{}))n.platform===ot&&n.device_id&&t.add(n.device_id);return[...t].sort()}function ue(r,t){let n={};if(!t)return n;for(let e of Object.values(r.entities??{}))e.platform===ot&&e.device_id===t&&e.translation_key&&(n[e.translation_key]=e.entity_id);return n}function Rt(r,t=180,n=180,e=118){return{cx:t,cy:n,r:e,lo:r-3,hi:r+3}}function B(r,t){return 135+270*Math.min(Math.max((t-r.lo)/(r.hi-r.lo),0),1)}function T(r,t,n=r.r){let e=t*Math.PI/180;return[r.cx+n*Math.cos(e),r.cy+n*Math.sin(e)]}function gt(r,t,n,e=r.r){let[o,i]=T(r,t,e),[s,l]=T(r,n,e),a=n-t>180?1:0;return`M${o.toFixed(1)} ${i.toFixed(1)} A${e} ${e} 0 ${a} 1 ${s.toFixed(1)} ${l.toFixed(1)}`}function he(r,t,n,e,o,i){let s=Math.atan2(n-r.cy,t-r.cx)*180/Math.PI;s<90&&(s+=360);let l=Math.min(Math.max((s-135)/270,0),1),a=r.lo+l*(r.hi-r.lo);return ft(a,e,o,i)}function ft(r,t,n,e){let o=Math.round(r/t)*t;return Number(Math.min(Math.max(o,n),e).toFixed(2))}var on=1e3,ge=.1,fe=1,Ot=.05,j=class extends k{constructor(){super(...arguments);this._target=null;this._band=null;this._timers={};this._dragging=!1;this.onDown=n=>{this._dragging=!0,n.currentTarget.setPointerCapture?.(n.pointerId),this.setTarget(this.pointerTemp(n))};this.onMove=n=>{this._dragging&&this.setTarget(this.pointerTemp(n))};this.onUp=()=>{this._dragging=!1}}get target(){return this._target??this.model.target}get band(){return this._band??this.model.band}emit(n,e){clearTimeout(this._timers[n]),this._timers[n]=setTimeout(()=>{this.dispatchEvent(new CustomEvent(n,{detail:{value:e},bubbles:!0,composed:!0})),n==="set-target"?this._target=null:this._band=null},on)}setTarget(n){let e=this.model;this._target=ft(n,e.step,e.min,e.max),this.emit("set-target",this._target)}setBand(n){this._band=ft(n,Ot,ge,fe),this.emit("set-band",this._band)}pointerTemp(n){let o=n.currentTarget.closest("svg").getBoundingClientRect(),i=(n.clientX-o.left)/o.width*360,s=(n.clientY-o.top)/o.height*360;return he(Rt(this.model.target),i,s,this.model.step,this.model.min,this.model.max)}onKey(n,e){let o=n.key==="ArrowUp"||n.key==="ArrowRight"?1:n.key==="ArrowDown"||n.key==="ArrowLeft"?-1:0;o&&(n.preventDefault(),e==="target"?this.setTarget(this.target+o*this.model.step):this.setBand(this.band+o*Ot))}onSlider(n){this.setBand(Number(n.target.value))}disconnectedCallback(){super.disconnectedCallback(),Object.values(this._timers).forEach(n=>clearTimeout(n))}render(){let n=this.model,e=this.t,o=this.target,i=this.band,s=Rt(n.target),l=[];for(let u=Math.ceil(s.lo);u<=Math.floor(s.hi);u++){let f=B(s,u),[_,m]=T(s,f,s.r+11),[x,S]=T(s,f,s.r+17),[L,C]=T(s,f,s.r+30);l.push($`<line x1=${_} y1=${m} x2=${x} y2=${S} class="tick"/>
        <text x=${L} y=${C+4} class="tick-label" text-anchor="middle">${u}</text>`)}let[a,d]=T(s,B(s,o)),h=$``;if(n.pond!==null){let u=B(s,n.pond),f=T(s,u,s.r-12),_=T(s,u-4,s.r-26),m=T(s,u+4,s.r-26);h=$`<polygon class="pond-marker" points="${f.join(",")} ${_.join(",")} ${m.join(",")}"/>`}let c=[n.heating===null?null:e(n.heating?"heating":"idle"),n.mode?e(n.mode):null,n.position?e(n.position):null].filter(Boolean);return g`
      <div class="wrap">
        <svg viewBox="0 0 360 330" class="gauge">
          <path d=${gt(s,135,405)} class="ring"/>
          <path d=${gt(s,B(s,o-i),B(s,o+i))} class="band"/>
          ${l}
          ${h}
          <circle cx=${a} cy=${d} r="12" class="handle" tabindex="0" role="slider"
            aria-label=${e("target")} aria-valuemin=${n.min} aria-valuemax=${n.max} aria-valuenow=${o}
            @pointerdown=${this.onDown} @pointermove=${this.onMove} @pointerup=${this.onUp}
            @keydown=${u=>this.onKey(u,"target")}/>
          <path d=${gt(s,135,405)} class="hit"
            @pointerdown=${this.onDown} @pointermove=${this.onMove} @pointerup=${this.onUp}/>
          <text x="180" y="140" class="caption" text-anchor="middle">${e("pond")}</text>
          <text x="180" y="178" class="pond" text-anchor="middle">${n.pond===null?"\u2013":`${n.pond.toFixed(1)} \xB0C`}</text>
          <text x="180" y="200" class="status ${n.position??""}" text-anchor="middle">${c.join(" \xB7 ")}</text>
        </svg>
        <div class="stepper" style="--window:${3}">
          <span class="caption">${e("target")}</span>
          <button @click=${()=>this.setTarget(o-n.step)} aria-label="−">−</button>
          <span class="number">${o.toFixed(1)} °C</span>
          <button @click=${()=>this.setTarget(o+n.step)} aria-label="+">+</button>
        </div>
        ${n.bandEntity===null?p:g`
          <div class="band-slider">
            <span class="caption">${e("band")}</span>
            <span class="number">± ${i.toFixed(2)} °C</span>
            <input type="range" min=${ge} max=${fe} step=${Ot} .value=${String(i)}
              aria-label=${e("band")} @input=${this.onSlider} @keydown=${u=>this.onKey(u,"band")}/>
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
  `;var sn=`M-98 394 q20 -7 40 0 ${"t40 0 ".repeat(19)}V458 H-98 Z`,an=`M-98 400 q20 5 40 0 ${"t40 0 ".repeat(19)}V458 H-98 Z`;function w(r,t,n,e="label",o="start",i=""){return n===null?p:$`<text x=${r} y=${t} class=${e} text-anchor=${o} style=${i}>${n}</text>`}function xe(r,t){let n=e=>e?"on":"";return $`
  <svg viewBox="0 0 640 480" role="img" aria-label=${t("heat_pump")} class="illustration">
    <g class="air ${n(r.fan)}">
      <path d="M40 122 H160"/><path d="M40 142 H160"/><path d="M472 122 H600"/><path d="M472 142 H600"/>
    </g>
    <polygon points="160,116 172,132 160,148" class="arrow"/>
    <polygon points="600,116 612,132 600,148" class="arrow"/>
    ${w(40,104,r.airIn===null?null:t("air_in"))}
    ${w(40,170,r.airIn,"value")}
    ${w(520,104,r.airOut===null?null:t("air_out"))}
    ${w(520,170,r.airOut,"value")}

    <g class="legend" transform="translate(40 210)">
      <line x1="0" y1="0" x2="18" y2="0" class="hotgas-line"/><text x="24" y="4">${t("hot_gas")}</text>
      <line x1="0" y1="16" x2="18" y2="16" class="liquid-line"/><text x="24" y="20">${t("liquid")}</text>
      <line x1="0" y1="32" x2="18" y2="32" class="suction-line"/><text x="24" y="36">${t("suction_gas")}</text>
    </g>

    <rect class="housing" x="176" y="40" width="288" height="240" rx="14"/>
    <text x="192" y="58" class="label">${t("heat_pump")}</text>
    ${r.mode===null?p:$`
      <rect class="badge ${r.mode}" x="398" y="48" width="54" height="22" rx="11"/>
      <text x="425" y="64" class="badge-text" text-anchor="middle">${t(r.mode).toUpperCase()}</text>`}

    <rect class="hx" x="252" y="196" width="136" height="48" rx="8"/>
    <polyline class="coil" points="366,206 350,230 334,206 318,230 302,206 286,230 274,206"/>
    <text x="320" y="190" class="label" text-anchor="middle">${t("heat_exchanger")}</text>
    ${w(320,258,r.thermal===null?null:t("thermal"),"label","middle")}
    ${w(320,274,r.thermal,"small","middle")}

    <g class="refrigerant ${n(r.compressor)}">
      <path class="rpipe" d="M196 86 V74 H378 V86"/><path class="rflow suction" d="M196 86 V74 H378 V86"/>
      <path class="rpipe" d="M404 122 H420 V206 H366"/><path class="rflow hotgas" d="M404 122 H420 V206 H366"/>
      <path class="rpipe" d="M274 206 H262 V188 H196 V178"/><path class="rflow liquid" d="M274 206 H262 V188 H196 V178"/>
    </g>
    <g transform="translate(228 188)" class="valve">
      <polygon points="-9,-7 -9,7 0,0"/><polygon points="9,-7 9,7 0,0"/>
    </g>
    ${w(424,150,r.gas===null?null:t("gas"),"label hot")}
    ${w(424,166,r.gas,"tiny hot")}
    ${w(246,208,r.liquid===null?null:t("liquid"),"label warmtext","end")}
    ${w(246,223,r.liquid,"small warmtext","end")}

    <rect class="evaporator" x="188" y="86" width="16" height="92" rx="3"/>
    <path class="fins" d="M188 98 H204 M188 110 H204 M188 122 H204 M188 134 H204 M188 146 H204 M188 158 H204 M188 170 H204"/>
    <text transform="translate(214 132) rotate(-90)" class="tiny-label" text-anchor="middle">${t("evaporator")}</text>

    <circle class="fan-ring" cx="274" cy="132" r="48"/>
    <g class="fan ${n(r.fan)}">
      <path d="M274 132 C274 104 291 89 304 95 C298 112 285 123 274 132 Z"/>
      <path d="M274 132 C302 132 317 149 311 162 C294 156 283 143 274 132 Z"/>
      <path d="M274 132 C274 160 257 175 244 169 C250 152 263 141 274 132 Z"/>
      <path d="M274 132 C246 132 231 115 237 102 C254 108 265 121 274 132 Z"/>
      <circle cx="274" cy="132" r="7" class="hub"/>
    </g>

    <rect class="comp-body" x="352" y="86" width="52" height="72" rx="10"/>
    <rect class="cylinder" x="363" y="98" width="30" height="48" rx="3"/>
    <g class="piston ${n(r.compressor)}">
      <rect x="365" y="126" width="26" height="10" rx="2" class="piston-head"/>
      <rect x="375" y="136" width="6" height="12" class="piston-rod"/>
    </g>
    <text x="378" y="172" class="label" text-anchor="middle">${t("compressor")}</text>

    ${r.electrical===null?p:$`
      <path class="cord" d="M464 250 C496 250 512 272 548 270"/>
      <rect x="546" y="262" width="16" height="16" rx="3" class="plug"/>
      <rect x="562" y="266" width="6" height="2.5" class="pin"/><rect x="562" y="271.5" width="6" height="2.5" class="pin"/>
      <rect x="570" y="248" width="44" height="44" rx="8" class="socket"/>
      <circle cx="592" cy="270" r="13" class="socket-face"/>
      <circle cx="586" cy="270" r="2.5" class="hole"/><circle cx="598" cy="270" r="2.5" class="hole"/>
      <text x="592" y="308" class="label" text-anchor="middle">${t("electrical")}</text>
      <text x="592" y="324" class="value" text-anchor="middle">${r.electrical}</text>`}

    <g class="water ${n(r.flow)}">
      <path class="pipe" d="M100 380 V312 H230 V236 H252"/><path class="flow cold" d="M100 380 V312 H230 V236 H252"/>
      <path class="pipe" d="M388 236 H410 V312 H540 V380"/><path class="flow warm" d="M388 236 H410 V312 H540 V380"/>
    </g>
    <polygon points="533,366 547,366 540,380" class="warm-arrow"/>
    ${w(242,300,r.waterIn===null?null:t("water_in"))}
    ${w(242,318,r.waterIn,"value")}
    ${w(398,300,r.waterOut===null?null:t("water_out"),"label","end")}
    ${w(398,318,r.waterOut,"value","end")}

    <g class="pump ${r.pump}" transform="translate(160 312)">
      <circle class="pump-body" r="20"/><polygon class="pump-tri" points="-11,-15 -11,15 17,0"/>
    </g>
    <text x="160" y="348" class="label" text-anchor="middle">${t("pump")} · ${t(r.pump)}</text>
    ${w(160,364,r.pumpText,"small","middle")}

    <path d="M60 380 H580 V450 Q580 460 570 460 H70 Q60 460 60 450 Z" class="tub"/>
    <clipPath id="phpc-tub"><path d="M61 381 H579 V450 Q579 459 570 459 H70 Q61 459 61 450 Z"/></clipPath>
    <g clip-path="url(#phpc-tub)">
      <path class="wave" d=${sn}/><path class="wave2" d=${an}/>
    </g>
    <text x="320" y="438" class="label" text-anchor="middle">${t("pond")}</text>
    ${w(320,422,r.pond,"pond-temp","middle")}
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
`;function ye(r){return r>=900?"wide":r>=560?"medium":"narrow"}function _e(r){return r==="wide"?3:r==="medium"?2:1}var ln={narrow:{heat_pump:1,thermostat:1,plan:1,side:1,model:1},medium:{heat_pump:1,thermostat:1,plan:2,side:1,model:1},wide:{heat_pump:1,thermostat:1,plan:3,side:1,model:3}};function $e(r,t){return ln[r][t]}var we={columns:"full",min_columns:6,rows:"auto"};var ve={pond:"pond",heat_pump:"HEAT PUMP",air_in:"air in",air_out:"air out",water_in:"water in",water_out:"water out",evaporator:"evaporator",compressor:"compressor",heat_exchanger:"heat exchanger",thermal:"thermal",electrical:"electrical",gas:"gas",liquid:"liquid",hot_gas:"hot gas",suction_gas:"suction gas",pump:"pump",running:"running",fault:"fault",off:"off",low:"low",high:"high",target:"target",band:"band",heating:"heating",idle:"idle",in_band:"in band",above_band:"above band",below_band:"below band",next_start:"next start",next_stop:"next stop",controlling:"controlling",dry_run:"dry run",planned_cost:"planned cost 24 h",planned_energy:"planned energy 24 h",expensive_share:"in expensive quarters",cop:"COP",heat_loss:"heat loss",thermal_power:"thermal power",insulation_cover:"insulation cover",control:"control the heat pump",model:"Model",cooling:"cooling",heating_low:"heating rate low",heating_high:"heating rate high",prediction_error:"prediction error",learned:"learned",cop_by_outdoor:"COP by outdoor temperature",plan:"Plan",price:"price",now:"now",known_prices:"known prices",legend_pond:"pond temperature (predicted)",legend_expensive:"expensive quarters",legend_solar:"solar surplus",legend_forecast:"forecast prices from",no_device:"Choose a planner device in the card editor.",plan_summary:"Plan: {parts}.",device:"Planner device",hours:"Hours in the plan chart",sections:"Sections"},cn={pond:"vijver",heat_pump:"WARMTEPOMP",air_in:"lucht in",air_out:"lucht uit",water_in:"water in",water_out:"water uit",evaporator:"verdamper",compressor:"compressor",heat_exchanger:"warmtewisselaar",thermal:"thermisch",electrical:"elektrisch",gas:"gas",liquid:"vloeistof",hot_gas:"heet gas",suction_gas:"zuiggas",pump:"pomp",running:"in bedrijf",fault:"storing",off:"uit",low:"laag",high:"hoog",target:"streefwaarde",band:"band",heating:"verwarmt",idle:"rust",in_band:"binnen band",above_band:"boven band",below_band:"onder band",next_start:"volgende start",next_stop:"volgende stop",controlling:"stuurt aan",dry_run:"alleen plannen",planned_cost:"geplande kosten 24 u",planned_energy:"gepland verbruik 24 u",expensive_share:"in dure kwartieren",cop:"COP",heat_loss:"warmteverlies",thermal_power:"thermisch vermogen",insulation_cover:"isolatiekap",control:"warmtepomp aansturen",model:"Model",cooling:"afkoeling",heating_low:"opwarmsnelheid laag",heating_high:"opwarmsnelheid hoog",prediction_error:"voorspelfout",learned:"geleerd",cop_by_outdoor:"COP per buitentemperatuur",plan:"Plan",price:"prijs",now:"nu",known_prices:"bekende prijzen",legend_pond:"vijvertemperatuur (voorspeld)",legend_expensive:"dure kwartieren",legend_solar:"zonne-overschot",legend_forecast:"verwachte prijzen vanaf",no_device:"Kies een planner-apparaat in de kaarteditor.",plan_summary:"Plan: {parts}.",device:"Planner-apparaat",hours:"Uren in de plangrafiek",sections:"Blokken"};function bt(r){let t=(r??"en").toLowerCase().startsWith("nl")?cn:ve;return(n,e)=>{let o=t[n]??ve[n]??n;for(let[i,s]of Object.entries(e??{}))o=o.replace(`{${i}}`,String(s));return o}}function pn(r,t){if(!r.length)return 0;let n=(r.length-1)*t,e=Math.floor(n),o=Math.ceil(n);return r[e]+(r[o]-r[e])*(n-e)}function Lt(r,t,n,e=28){let o=r.quarters,i=o[0].t,s=o[o.length-1].t+9e5,l=o.map(x=>x.temp).concat([r.target-r.band,r.target+r.band]),a=Math.floor((Math.min(...l)-.1)*10)/10,d=Math.ceil((Math.max(...l)+.1)*10)/10,h=o.map(x=>x.price),c=Math.min(...h),u=Math.max(...h)===c?c+.01:Math.max(...h),f=o.map((x,S)=>{let L=o.slice(Math.floor(S/96)*96,Math.floor(S/96)*96+96).map(C=>C.price);return o[S].price>pn([...L].sort((C,pt)=>C-pt),.75)}),_=o.find(x=>!x.known),m=n-e*2;return{x:x=>e+(x-i)/(s-i)*(t-e*2),yTemp:x=>e+(1-(x-a)/(d-a))*m,yPrice:x=>e+(1-(x-c)/(u-c))*m,tempMin:a,tempMax:d,priceMin:c,priceMax:u,start:i,end:s,expensive:f,knownUntil:_?_.t:null}}function dn(r){let t=[];for(let n of r){let e=t[t.length-1];e&&e.mode===n.mode?e.to=n.t+9e5:t.push({mode:n.mode,from:n.t,to:n.t+9e5})}return t}function ke(r,t,n="en"){let e=i=>new Date(i).toLocaleTimeString(n,{hour:"2-digit",minute:"2-digit"}),o=dn(r.quarters).map(i=>`${t(i.mode)} ${e(i.from)}\u2013${e(i.to)}`);return t("plan_summary",{parts:o.join(", ")})}var O=600,A=220,Ut=15*60*1e3;function Me(r,t,n){let e=Lt(r,O,A),o=r.quarters,i=e.x(o[0].t+Ut)-e.x(o[0].t),s={off:0,low:.5,high:1},l=o.map((m,x)=>{let S=18*s[m.mode],L=e.expensive[x]?$`<rect x=${e.x(m.t)} y="28" width=${i} height=${A-56} class="expensive"/>`:$``,C=m.surplus?$`<rect x=${e.x(m.t)} y=${A-26} width=${i} height="4" class="sun"/>`:$``;return $`${L}${C}<rect x=${e.x(m.t)} y=${A-28-S} width=${i} height=${S} class="bar ${m.mode}"/>`}),a=o.map((m,x)=>`${x?"L":"M"}${e.x(m.t+Ut).toFixed(1)} ${e.yTemp(m.temp).toFixed(1)}`).join(" "),d=o.map((m,x)=>`${x?"L":"M"}${e.x(m.t).toFixed(1)} ${e.yPrice(m.price).toFixed(1)} H${e.x(m.t+Ut).toFixed(1)}`).join(" "),h=e.yTemp(r.target+r.band),c=e.yTemp(r.target-r.band),u=Math.min(Math.max(e.x(r.now),28),O-28),f=m=>new Date(m).toLocaleTimeString(n,{hour:"2-digit",minute:"2-digit"}),_=[];for(let m=Math.ceil(e.start/(6*36e5))*6*36e5;m<e.end;m+=6*36e5)_.push($`<text x=${e.x(m)} y=${A-8} class="axis" text-anchor="middle">${f(m)}</text>`);return $`
    <svg viewBox="0 0 ${O} ${A}" class="chart" role="img" aria-label=${ke(r,t,n)}>
      <rect x="28" y=${h} width=${O-56} height=${c-h} class="band"/>
      ${l}
      <line x1="28" x2=${O-28} y1=${e.yTemp(r.target)} y2=${e.yTemp(r.target)} class="target"/>
      <path d=${d} class="price"/>
      <path d=${a} class="temp"/>
      ${e.knownUntil===null?$``:$`<line x1=${e.x(e.knownUntil)} x2=${e.x(e.knownUntil)} y1="28" y2=${A-28} class="known"/>`}
      <line x1=${u} x2=${u} y1="20" y2=${A-28} class="now"/>
      <text x="4" y="20" class="axis">${e.tempMax.toFixed(1)} °C</text>
      <text x="4" y=${A-30} class="axis">${e.tempMin.toFixed(1)}</text>
      <text x=${O-4} y="20" class="axis" text-anchor="end">€ ${e.priceMax.toFixed(2)}</text>
      <text x=${O-4} y=${A-30} class="axis" text-anchor="end">${e.priceMin.toFixed(2)}</text>
      ${_}
    </svg>`}function un(r){let t=Lt(r,O,A),n=[{key:"legend_pond",swatch:"line"},{key:"target",swatch:"dashed"},{key:"band",swatch:"area"},{key:"low",swatch:"low"},{key:"high",swatch:"high"},{key:"price",swatch:"step"}];return t.expensive.some(Boolean)&&n.push({key:"legend_expensive",swatch:"expensive"}),r.quarters.some(e=>e.surplus)&&n.push({key:"legend_solar",swatch:"solar"}),n.push({key:"now",swatch:"now"}),t.knownUntil!==null&&n.push({key:"legend_forecast",swatch:"dotted"}),n}function Ae(r,t){return g`<ul class="chart-legend">
    ${un(r).map(n=>g`<li><span class="sw ${n.swatch}"></span>${t(n.key)}</li>`)}
  </ul>`}var Ee=M`
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
`;function P(r){let t=typeof r=="number"?r:Number.parseFloat(String(r));return Number.isFinite(t)?t:null}function W(r,t){return r===null?null:r.toFixed(t)}function st(r){return r===null?null:Math.abs(r)>=1e3?`${(r/1e3).toFixed(2)} kW`:`${Math.round(r)} W`}function q(r){return r===null?null:`${r.toFixed(1)} \xB0C`}function D(r,t,n=0){return r===null?null:t?`${r.toFixed(n)} ${t}`:r.toFixed(n)}function at(r,t="en"){if(!r)return null;let n=new Date(r);return Number.isNaN(n.getTime())?null:n.toLocaleTimeString(t,{hour:"2-digit",minute:"2-digit"})}function K(r,t){return t===null?p:g`<div class="fig"><span class="v">${t}</span><span class="l">${r}</span></div>`}function Se(r,t,n){let e=[r.nextStop?`${t("next_stop")} ${at(r.nextStop,n)}`:null,r.nextStart?`${t("next_start")} ${at(r.nextStart,n)}`:null,r.control===null?null:t(r.control?"controlling":"dry_run")].filter(Boolean);return g`<div class="next">${e.join(" \xB7 ")}</div>`}function Ce(r,t){return g`<div class="figures">
    ${K(t("planned_cost"),r.cost)} ${K(t("planned_energy"),r.energy)}
    ${K(t("expensive_share"),r.expensive)}
    ${K(r.copMethod?`${t("cop")} (${r.copMethod})`:t("cop"),r.cop)}
    ${K(t("heat_loss"),r.heatLoss)} ${K(t("thermal_power"),r.thermal)}
  </div>`}function Te(r,t,n){let e=(o,i)=>o===null?p:g`<label class="switch"><input type="checkbox" .checked=${o.on} @change=${s=>n(o.entity,s.target.checked)}/>${t(i)}</label>`;return g`<div class="switches">${e(r.cover,"insulation_cover")} ${e(r.control,"control")}</div>`}function Pe(r,t){let n=[[t("cooling"),r.cooling],[t("heating_low"),r.heatingLow],[t("heating_high"),r.heatingHigh],[t("prediction_error"),r.predictionError],[t("learned"),r.learned]];return g`<details class="model"><summary>${t("model")}</summary>
    <table>${n.filter(([,e])=>e!==null).map(([e,o])=>g`<tr><td>${e}</td><td>${o}</td></tr>`)}</table>
    ${r.copByOutdoor.length?g`<div class="l">${t("cop_by_outdoor")}</div>
          <table>${r.copByOutdoor.map(([e,o])=>g`<tr><td>${e} °C</td><td>${o??"\u2013"}</td></tr>`)}</table>`:p}
  </details>`}var He=M`
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
`;var Re=["off","low","high"];function v(r,t){return t?r.states[t]:void 0}function E(r){return!!r&&r.state!=="unavailable"&&r.state!=="unknown"}function y(r,t){let n=v(r,t);return E(n)?P(n.state):null}function G(r,t){return v(r,t)?.state==="on"}function hn(r,t,n){let e=v(r,n.model_status)?.attributes.links??{},o={water_in:e.inlet_temperature,water_out:e.outlet_temperature,air_in:e.air_inlet_temperature,power:e.power},i={};for(let[s,l]of Object.entries({...o,...t.heat_pump??{}}))l&&(i[s]=l);return i}function Oe(r,t,n=Date.now()){let e=ue(r,t.device_id),o=(t.sections?.length?t.sections:[...it]).filter(b=>it.includes(b)),i=hn(r,t,e),l=[...Object.values(e),...Object.values(i)].map(b=>`${b}:${v(r,b)?.last_updated??"-"}`).join("|"),a={sections:o,illustration:null,gauge:null,plan:null,figures:null,switches:null,model:null,missingDevice:!t.device_id||Object.keys(e).length===0,signature:l};if(a.missingDevice)return a;let d=v(r,e.thermostat),h=v(r,e.mode),c=E(h)&&Re.includes(h.state)?h.state:null,u=E(d)?P(d.attributes.current_temperature):null,f=E(d)?P(d.attributes.temperature)??15:15,_=y(r,e.band)??.25,m=y(r,e.thermal_power),x=v(r,i.pump_speed),S=y(r,i.pump_power),L=G(r,i.pump_fault),C=G(r,i.flow),pt=[D(y(r,i.pump_speed),x?.attributes.unit_of_measurement),st(S)].filter(Boolean),Ue={pond:q(u),waterIn:q(y(r,i.water_in)),waterOut:q(y(r,i.water_out)),airIn:q(y(r,i.air_in)),airOut:q(y(r,i.air_out)),electrical:st(y(r,i.power)),thermal:st(m),liquid:W(y(r,i.liquid),0)&&`${W(y(r,i.liquid),0)} \xB0C`,gas:W(y(r,i.gas),0)&&`${W(y(r,i.gas),0)} \xB0C`,mode:c,fan:G(r,i.fan),flow:C,compressor:G(r,i.compressor),pump:L?"fault":C?"running":"off",pumpText:pt.length?pt.join(" \xB7 "):null},It=E(d)?d.attributes.hvac_action:null,Ne=e.thermostat?{pond:u,target:f,band:_,min:P(d?.attributes.min_temp)??5,max:P(d?.attributes.max_temp)??28,step:P(d?.attributes.target_temp_step)??.1,heating:It==="heating"?!0:It==="idle"?!1:null,mode:c,position:u===null?null:u>f+_?"above_band":u<f-_?"below_band":"in_band",thermostat:e.thermostat,bandEntity:e.band??null,nextStart:E(v(r,e.next_start))?v(r,e.next_start).state:null,nextStop:E(v(r,e.next_stop))?v(r,e.next_stop).state:null,control:e.control?G(r,e.control):null}:null,ze=h?.attributes.plan??[],Ie=t.hours??36,jt=ze.map(b=>({t:Date.parse(b.start),mode:Re.includes(b.mode)?b.mode:"off",temp:Number(b.temp),price:Number(b.price),known:b.known!==!1,surplus:b.surplus===void 0?null:Number(b.surplus)})).filter(b=>Number.isFinite(b.t)&&Number.isFinite(b.temp)).slice(0,Ie*4),je=jt.length?{quarters:jt,target:f,band:_,now:n}:null,Z=v(r,e.planned_cost),Dt=v(r,e.cop),Ft=E(Z)?P(Z.attributes.expensive_share):null,Vt=y(r,e.heat_loss),De={cost:E(Z)&&P(Z.state)!==null?`\u20AC ${P(Z.state).toFixed(2)}`:null,energy:D(y(r,e.planned_energy),"kWh",1),expensive:Ft===null?null:`${Math.round(Ft*100)} %`,cop:W(y(r,e.cop),1),copMethod:E(Dt)?Dt.attributes.method??null:null,heatLoss:Vt===null?null:`${Math.round(Vt)} W/K`,thermal:st(m)},Bt=b=>e[b]?{entity:e[b],on:G(r,e[b])}:null,Fe=v(r,e.cop)?.attributes.by_outdoor??{},Ve={cooling:D(y(r,e.cooling_coefficient),"1/h",4),heatingLow:D(y(r,e.heating_rate_low),"K/h",3),heatingHigh:D(y(r,e.heating_rate_high),"K/h",3),predictionError:D(y(r,e.prediction_error),"K",2),learned:E(v(r,e.model_status))?at(v(r,e.model_status).state,r.locale?.language):null,copByOutdoor:Object.entries(Fe).map(([b,Wt])=>[b,Wt===null?null:Number(Wt).toFixed(1)])};return{...a,illustration:Ue,gauge:Ne,plan:je,figures:De,switches:{cover:Bt("insulation_cover"),control:Bt("control")},model:Ve}}var lt="pond-heatpump-planner-card",Nt="pond-heatpump-planner-card-editor",Le="phpc-gauge",Q=class extends k{constructor(){super(...arguments);this._layout="narrow"}static getConfigElement(){return document.createElement(Nt)}static getStubConfig(n){return{type:`custom:${lt}`,device_id:de(n)[0]}}setConfig(n){if(!n)throw new Error("Invalid configuration");this._config={hours:36,...n},this.rebuild(!0)}set hass(n){this._hass=n,this.rebuild(!1)}get hass(){return this._hass}rebuild(n){if(!this._hass||!this._config)return;let e=Oe(this._hass,this._config);(n||!this._vm||e.signature!==this._vm.signature)&&(this._vm=e)}getCardSize(){return 12}getGridOptions(){return{...we}}connectedCallback(){super.connectedCallback(),typeof ResizeObserver<"u"&&(this._observer=new ResizeObserver(n=>this.resized(n[0]?.contentRect.width??0)),this._observer.observe(this))}disconnectedCallback(){super.disconnectedCallback(),this._observer?.disconnect()}resized(n){let e=ye(n);e!==this._layout&&(this._layout=e)}get t(){return bt(this._hass?.locale?.language??this._hass?.language)}call(n,e,o){this._hass?.callService(n,e,o)}content(n,e){let o=this.t,i=this._hass?.locale?.language??"en";switch(n){case"heat_pump":return e.illustration?xe(e.illustration,o):p;case"thermostat":return e.gauge?g`<phpc-gauge .model=${e.gauge} .t=${o}
                @set-target=${s=>this.call("climate","set_temperature",{entity_id:e.gauge.thermostat,temperature:s.detail.value})}
                @set-band=${s=>e.gauge.bandEntity&&this.call("number","set_value",{entity_id:e.gauge.bandEntity,value:s.detail.value})}
              ></phpc-gauge>
              ${Se(e.gauge,o,i)}`:p;case"plan":return e.plan?g`${Me(e.plan,o,i)}${Ae(e.plan,o)}`:p;case"figures":return e.figures?Ce(e.figures,o):p;case"switches":return e.switches&&(e.switches.cover||e.switches.control)?Te(e.switches,o,(s,l)=>this.call("switch",l?"turn_on":"turn_off",{entity_id:s})):p;case"model":return e.model?Pe(e.model,o):p}}blocks(n){let e=[];for(let o of n.sections){let i=this.content(o,n);if(i===p)continue;let s=o==="figures"||o==="switches"?"side":o,l=s==="side"?e.find(a=>a.block==="side"):void 0;l?l.parts.push(i):e.push({block:s,parts:[i]})}return e}render(){let n=this._vm;if(!n)return p;if(n.missingDevice)return g`<ha-card><div class="section warning">${this.t("no_device")}</div></ha-card>`;let e=this._layout;return g`<ha-card class=${e} style="--phpc-columns:${_e(e)}">
      ${this.blocks(n).map(o=>g`<div class="section ${o.block}" style="grid-column: span ${$e(e,o.block)}">
          ${o.parts.map(i=>g`<div class="part">${i}</div>`)}
        </div>`)}
    </ha-card>`}};Q.properties={_vm:{state:!0},_layout:{state:!0}},Q.styles=[be,Ee,He,M`
      ha-card { padding: 8px 0; overflow: hidden; display: grid; grid-template-columns: repeat(var(--phpc-columns, 1), minmax(0, 1fr)); grid-auto-flow: row; }
      .section { padding: 8px 16px; min-width: 0; border-top: 1px solid var(--divider-color, #e0e0e0); }
      ha-card.narrow .section:first-child { border-top: none; }
      ha-card.medium .section, ha-card.wide .section { border-top: none; padding: 12px 16px; }
      ha-card.medium .section.plan, ha-card.wide .section.plan, ha-card.wide .section.model { border-top: 1px solid var(--divider-color, #e0e0e0); }
      .section.side .part + .part { margin-top: 12px; }
      ha-card.medium .section.side, ha-card.wide .section.side { display: flex; flex-direction: column; justify-content: center; }
      .warning { color: var(--warning-color, #ef6c00); }
    `];var mn=["water_in","water_out","air_in","air_out","power","liquid","gas","pump_speed","pump_power"];function gn(){return[{name:"device_id",selector:{device:{integration:ot}}},{name:"hours",selector:{select:{options:["24","36","48"],mode:"dropdown"}}},{name:"sections",selector:{select:{options:[...it],multiple:!0,reorder:!0}}},{name:"heat_pump",type:"expandable",title:"Heat pump",schema:pe.map(r=>({name:r,selector:{entity:{domain:mn.includes(r)?"sensor":"binary_sensor"}}}))}]}var ct=class extends k{setConfig(t){this._config=t}changed(t){let n={...t.detail.value};n.hours&&(n.hours=Number(n.hours)),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:n},bubbles:!0,composed:!0}))}render(){if(!this.hass||!this._config)return g``;let t=bt(this.hass.locale?.language),n={...this._config,hours:String(this._config.hours??36)};return g`<ha-form
      .hass=${this.hass}
      .data=${n}
      .schema=${gn()}
      .computeLabel=${e=>t(e.name)}
      @value-changed=${this.changed}
    ></ha-form>`}};ct.properties={hass:{attribute:!1},_config:{state:!0}};function zt(r,t){customElements.get(r)||customElements.define(r,t)}zt(Le,j);zt(Nt,ct);zt(lt,Q);var yt=window;yt.customCards=yt.customCards??[];yt.customCards.some(r=>r.type===lt)||yt.customCards.push({type:lt,name:"Pond Heat Pump Planner",description:"Heat pump illustration, thermostat with band, plan and key figures of the pond heat pump planner.",preview:!0,documentationURL:"https://github.com/abroeders/pond-heatpump-price-planner/blob/main/docs/card.md"});
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
