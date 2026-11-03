(async function(){
var T=null,TM=0;
var GENERIC=['serif','sans-serif','monospace','cursive','fantasy','system-ui','ui-serif','ui-sans-serif','ui-monospace','ui-rounded','emoji','math','fangsong'];
var INH=new Set(['color','cursor','direction','font-family','font-size','font-style','font-variant','font-weight','font-stretch','font-kerning','font-feature-settings','font-variation-settings','letter-spacing','line-height','list-style-type','list-style-position','list-style-image','text-align','text-indent','text-transform','text-shadow','text-rendering','visibility','white-space','word-break','word-spacing','overflow-wrap','word-wrap','tab-size','quotes']);
var SKIP={SCRIPT:1,NOSCRIPT:1,LINK:1,STYLE:1,TEMPLATE:1};
var fd,fw,frame,defs={},counts={},pseudo=[],pn=0,SPAN=document.createElement('span');
var stat={images:0,embedded:0,referenced:0,keptLinks:[],imgEmbedded:0,imgKept:0,imgFailed:[],hosts:{}};
var faces=[],jobs=[];
var EMBED_IMAGES=false,EMBED_FONTS=false,KEEP_UNREADABLE_LINKS=false,BODYD=null;
var UAATTR=['href','type','dir','hidden','multiple','size','rows','cols','border','align','valign','bgcolor','cellpadding','cellspacing','nowrap','color','face','contenteditable','open','disabled','readonly','checked','popover'];
var FORM={input:1,select:1,textarea:1,button:1,meter:1,progress:1};
var PH=['color','opacity','font-family','font-size','font-style','font-weight','letter-spacing','text-transform','text-indent','text-align'];
var MAXIMG=6000000,MAXTOTAL=45000000;
var urlRe=/url\(\s*(["']?)((?:https?:|blob:)[^"')]+)\1\s*\)/g;

function toast(m,bad,ms){
if(!T){T=document.createElement('div');T.style.cssText='position:fixed;left:8px;right:8px;top:8px;z-index:2147483647;color:#fff;font:14px/1.4 sans-serif;padding:10px;border-radius:8px;white-space:pre-wrap;word-break:break-word';document.body.appendChild(T)}
T.style.background=bad?'#b00':'#111';T.textContent=m;clearTimeout(TM);
if(ms)TM=setTimeout(function(){if(T){T.remove();T=null}},ms)}

function abs(v){try{if(!v||v.charAt(0)==='#'||/^(javascript|data|blob|mailto|tel|about):/i.test(v))return v;return new URL(v,document.baseURI).href}catch(e){return v}}

function fontCheck(name){var c=document.createElement('canvas').getContext('2d'),t='mmmmmmmmmmlliWW@#%&0123456789',w=function(f){c.font='72px '+f;return c.measureText(t).width};return ['monospace','serif','sans-serif'].some(function(g){return w('"'+name+'",'+g)!==w(g)})}

async function localCheck(name){try{var f=new FontFace('dc-probe','local("'+name.replace(/["\\]/g,'')+'")');await f.load();return true}catch(e){return false}}

async function viewer(fontCheck){
var R=JSON.parse(document.getElementById('font-report').textContent);
try{Array.prototype.forEach.call(document.querySelectorAll('[data-dc-st],[data-dc-sl]'),function(e){e.scrollTop=+e.getAttribute('data-dc-st')||0;e.scrollLeft=+e.getAttribute('data-dc-sl')||0});if(R.scroll)window.scrollTo(R.scroll[0],R.scroll[1])}catch(e){}
function el(t,css,txt){var e=document.createElement(t);e.style.cssText=css;if(txt!=null)e.textContent=txt;return e}
function kind(f){
if(f.kind==='generic')return 'generic family';
if(f.kind==='web')return 'web font ('+(f.webStatus||'declared')+(f.embedded?', embedded in file':f.source==='origin'?', served by the site itself':f.source==='cdn'?', from a CDN':', referenced')+(f.localFirst?'; installed copy is tried first':'')+(f.installed?'; installed here':'; not detected as installed')+')';
if(f.kind==='system')return 'installed font';
return 'not installed'}
async function nowOk(f){
if(f.kind==='generic')return 'generic family';
try{var r=await document.fonts.load('16px "'+f.name+'"');if(r&&r.length)return f.embedded?'embedded in this file':f.localFirst?'installed copy, or the original URL':'web font loaded from its original URL'}catch(e){}
return fontCheck(f.name)?'installed on this device':null}
var btn=el('button','position:fixed;right:8px;bottom:8px;z-index:2147483647;font:14px/1 sans-serif;padding:8px 10px;border-radius:20px;border:1px solid #888;background:#fff;color:#000;opacity:.85','Aa fonts');
var panel=el('div','display:none;position:fixed;left:8px;right:8px;bottom:48px;max-height:60vh;overflow:auto;z-index:2147483647;background:#fff;color:#000;border:1px solid #888;border-radius:8px;padding:10px;font:13px/1.4 sans-serif;box-shadow:0 2px 12px rgba(0,0,0,.3)');
panel.appendChild(el('div','font-weight:bold;margin-bottom:6px','Fonts - captured '+R.captured.slice(0,10)+' from '+R.url));
if(R.images&&R.images.hosts){var hk=Object.keys(R.images.hosts);panel.appendChild(el('div','margin-bottom:6px;color:#444','Images load from: '+(hk.length?hk.map(function(k){return k+' ('+R.images.hosts[k]+')'}).join(', '):'none found')))}
for(var s=0;s<R.stacks.length;s++){
var st=R.stacks[s],first=st.families[0],used=st.families[st.usedIndex],box=el('div','border-top:1px solid #ccc;padding:6px 0');
var nu=null,how=null;
for(var i=0;i<st.families.length;i++){how=await nowOk(st.families[i]);if(how){nu=st.families[i];break}}
box.appendChild(el('div','font-family:monospace;word-break:break-all',st.stack+'  ('+st.count+' text runs)'));
box.appendChild(el('div','color:'+(st.fellBack?'#b00':'#080'),'At capture: '+(st.fellBack?'FALLBACK - wanted "'+first.name+'" ('+kind(first)+'), rendered with "'+(used?used.name:'?')+'" ('+(used?kind(used):'')+')':'original "'+first.name+'" ('+kind(first)+')')));
box.appendChild(el('div','color:'+(nu===first?'#080':'#b00'),'Now: '+(nu===first?'original "'+first.name+'" works ('+how+')':'original "'+first.name+'" NOT available here, using "'+(nu?nu.name:'?')+'" ('+(how||'nothing found')+')')));
panel.appendChild(box)}
btn.onclick=function(){panel.style.display=panel.style.display==='none'?'block':'none'};
document.body.appendChild(panel);document.body.appendChild(btn)}

function webMap(){var m={};try{document.fonts.forEach(function(f){var n=f.family.replace(/^["']|["']$/g,''),s=f.status,p=m[n];if(s==='loaded'||p==='loaded')m[n]='loaded';else if(s==='error'||p==='error')m[n]='error';else m[n]=s})}catch(e){}return m}
function parseStack(s){return s.split(',').map(function(x){return x.trim().replace(/^["']|["']$/g,'')}).filter(Boolean)}
function norm(s){return String(s||'').replace(/["']/g,'').replace(/\s+/g,' ').trim().toLowerCase()}
function nw(w){w=norm(w)||'normal';return w==='normal'?'400':w==='bold'?'700':w}
function decl(css,prop){var m=css.match(new RegExp('(?:^|[;{\\s])'+prop+'\\s*:\\s*([^;}]*)','i'));return m?m[1].trim():''}
function absUrls(css,base){return css.replace(/url\(\s*(['"]?)([^'")]*)\1\s*\)/g,function(m,q,u){if(/^(data|blob):/i.test(u))return m;try{return 'url("'+new URL(u,base).href+'")'}catch(e){return m}})}
function toDataUrl(url){return fetch(url).then(function(r){if(!r.ok)throw new Error(r.status);return r.blob()}).then(function(b){return new Promise(function(res,rej){var fr=new FileReader();fr.onload=function(){res(fr.result)};fr.onerror=rej;fr.readAsDataURL(b)})})}

function hostOf(u){try{return new URL(u).hostname}catch(e){return ''}}
function sameSite(a,b){if(!a||!b)return false;if(a===b)return true;function k(h){var p=h.split('.'),n=p.length;if(n<=2)return h;return (p[n-1].length===2&&p[n-2].length<=3)?p.slice(-3).join('.'):p.slice(-2).join('.')}return k(a)===k(b)}
function localNames(fam,w,st){
var base=fam.replace(/["']/g,'').trim(),n=nw(w),ital=/italic|oblique/i.test(st||''),out=(n==='400'&&!ital)||/\s/.test(n)?[base]:[];
if(!/\s/.test(n)){
var map={'100':'Thin','200':'ExtraLight','300':'Light','400':'Regular','500':'Medium','600':'SemiBold','700':'Bold','800':'ExtraBold','900':'Black'},wn=map[n]||'Regular';
out.push((base+' '+(wn==='Regular'&&ital?'':wn)+(ital?' Italic':'')).replace(/\s+/g,' ').trim())}
return out.filter(function(x,i){return out.indexOf(x)===i}).map(function(x){return 'local("'+x.replace(/"/g,'')+'")'})}
function blobToData(b){return new Promise(function(res,rej){var fr=new FileReader();fr.onload=function(){res(fr.result)};fr.onerror=rej;fr.readAsDataURL(b)})}
async function fetchData(url){
var ac=new AbortController(),t=setTimeout(function(){ac.abort()},15000);
try{var r=await fetch(url,{cache:'force-cache',signal:ac.signal});if(!r.ok)throw new Error('http '+r.status);var b=await r.blob();if(b.size>MAXIMG)throw new Error('too big');if(b.type&&!/^image\//i.test(b.type))throw new Error('not an image');return await blobToData(b)}finally{clearTimeout(t)}}
async function pool(items,n,fn){var i=0;async function w(){while(i<items.length){var k=i++;await fn(items[k])}}await Promise.all(Array.from({length:n},function(){return w()}))}

async function embedImages(root){
var seen={},list=[];
function add(u){if(u&&!seen[u]&&/^(https?:|blob:)/i.test(u)){seen[u]=1;list.push(u)}}
jobs.forEach(function(j){add(j.el.getAttribute(j.attr))});
var styled=Array.prototype.slice.call(root.querySelectorAll('[style]'));styled.push(root);
function scan(s){var m;urlRe.lastIndex=0;while((m=urlRe.exec(s)))add(m[2])}
styled.forEach(function(e){scan(e.getAttribute('style')||'')});
pseudo.forEach(scan);
list.forEach(function(u){var h=/^blob:/i.test(u)?'(blob)':hostOf(u);if(h)stat.hosts[h]=(stat.hosts[h]||0)+1});
if(!EMBED_IMAGES)list=list.filter(function(u){return /^blob:/i.test(u)});
var map={},total=0,done=0;
await pool(list,6,async function(u){
if(total>MAXTOTAL){stat.imgKept++;return}
try{var d=await fetchData(u);total+=d.length;map[u]=d;stat.imgEmbedded++}catch(e){stat.imgKept++;stat.imgFailed.push(u)}
done++;if(done%5===0)toast('DOM Capture: embedding images '+done+'/'+list.length+'...')});
jobs.forEach(function(j){var d=map[j.el.getAttribute(j.attr)];if(d)j.el.setAttribute(j.attr,d)});
function sub(s){return s.replace(urlRe,function(m,q,u){return map[u]?'url("'+map[u]+'")':m})}
styled.forEach(function(e){var s=e.getAttribute('style');if(s&&s.indexOf('url(')>-1)e.setAttribute('style',sub(s))});
for(var i=0;i<pseudo.length;i++)pseudo[i]=sub(pseudo[i])}

function pushRules(rules,base,depth){
for(var i=0;i<rules.length;i++){var r=rules[i];
if(r.type===5)faces.push({css:r.cssText,base:base});
else if(r.type===3&&r.styleSheet&&depth<4){try{pushRules(r.styleSheet.cssRules,r.styleSheet.href||base,depth+1)}catch(e){}}
else if(r.cssRules&&depth<4)pushRules(r.cssRules,base,depth+1)}}

async function gatherFaces(){
for(var i=0;i<document.styleSheets.length;i++){
var sh=document.styleSheets[i],base=sh.href||document.baseURI;
try{pushRules(sh.cssRules,base,0)}catch(e){
var ok=false;
if(sh.href){try{var tx=await (await fetch(sh.href)).text();(tx.match(/@font-face\s*\{[^}]*\}/g)||[]).forEach(function(c){faces.push({css:c,base:sh.href})});ok=true}catch(e2){}}
if(!ok&&sh.href)stat.keptLinks.push(sh.href)}}}

async function buildFaces(){
var loaded={};
if(EMBED_FONTS){try{document.fonts.forEach(function(f){if(f.status==='loaded')loaded[norm(f.family)+'|'+nw(f.weight)+'|'+(norm(f.style)||'normal')+'|'+(norm(f.unicodeRange)||'u+0-10ffff').replace(/\s/g,'')]=1})}catch(e){}}
var seen={};
faces=faces.filter(function(f){if(seen[f.css])return false;seen[f.css]=1;return true});
await Promise.all(faces.map(async function(fc){
var css=absUrls(fc.css,fc.base),fam=decl(css,'font-family');
var key=norm(fam)+'|'+nw(decl(css,'font-weight'))+'|'+(norm(decl(css,'font-style'))||'normal')+'|'+(norm(decl(css,'unicode-range'))||'u+0-10ffff').replace(/\s/g,'');
fc.fam=norm(fam);fc.embedded=false;fc.localFirst=false;
var sm=css.match(/src\s*:\s*((?:\([^)]*\)|[^;(])*)/i);
var items=sm?(sm[1].match(/(?:url|local)\([^)]*\)(?:\s*format\([^)]*\))?(?:\s*tech\([^)]*\))?/g)||[]):[];
var urls=items.filter(function(x){return /^url\(/.test(x)});
var um0=urls[0]&&urls[0].match(/url\(\s*['"]?([^'")]*)/),firstUrl=um0?um0[1]:'';
var host=firstUrl&&!/^data:/i.test(firstUrl)?hostOf(firstUrl):'';
fc.host=host;
fc.source=!firstUrl?'none':/^data:/i.test(firstUrl)?'inline':sameSite(host,location.hostname)?'origin':'cdn';
if(EMBED_FONTS&&sm&&loaded[key]&&urls.length){
var pick=urls.filter(function(x){return /woff2/i.test(x)})[0]||urls[0];
var um=pick.match(/url\(\s*['"]?([^'")]*)/),fm=pick.match(/format\(([^)]*)\)/);
try{var du=await toDataUrl(um[1]);css=css.replace(sm[0],function(){return 'src:url("'+du+'")'+(fm?' format('+fm[1]+')':'')});fc.embedded=true}catch(e){}}
if(!fc.embedded&&sm&&(fc.source==='origin'||fc.source==='cdn')){
var locals=localNames(fam,decl(css,'font-weight'),decl(css,'font-style')).filter(function(l){return items.indexOf(l)<0});
if(locals.length){
var ordered=fc.source==='origin'?locals.concat(items):items.concat(locals);
css=css.replace(sm[0],function(){return 'src:'+ordered.join(', ')});
fc.localFirst=fc.source==='origin'}}
if(fc.embedded)stat.embedded++;else stat.referenced++;
fc.out=css}))}

function snap(cs){var o={};for(var i=0;i<cs.length;i++){o[cs[i]]=cs.getPropertyValue(cs[i])}return o}
function defaults(el){
var sig=UAATTR.filter(function(a){return el.hasAttribute(a)}).map(function(a){return a==='href'?'href':a+'='+el.getAttribute(a)}).join('&');
var key=(el.namespaceURI||'')+'|'+el.localName+'|'+sig;
if(!defs[key]){
var e=el.namespaceURI?fd.createElementNS(el.namespaceURI,el.localName):fd.createElement(el.localName);
UAATTR.forEach(function(a){if(el.hasAttribute(a))e.setAttribute(a,a==='href'?'#':el.getAttribute(a))});
fd.body.appendChild(e);defs[key]=snap(fw.getComputedStyle(e));fd.body.removeChild(e)}
return defs[key]}
function diff(cs,base,pcs,tag){
if(!BODYD)BODYD=snap(fw.getComputedStyle(fd.body));
var all=!!FORM[tag],out=[];
for(var i=0;i<cs.length;i++){var p=cs[i];
if(p.charAt(0)==='-'&&p.charAt(1)==='-')continue;
var v=cs.getPropertyValue(p),b=base[p],force=all||p==='box-sizing';
if(!force&&/-width$/.test(p)&&/^(border|outline|column-rule|row-rule)/.test(p)){var sv=cs.getPropertyValue(p.replace(/-width$/,'-style'));if(sv&&sv!=='none'&&sv!=='hidden')force=true}
if(!force){
if(pcs&&INH.has(p)&&base[p]===BODYD[p])b=pcs.getPropertyValue(p);
if(v===b)continue}
out.push(p+':'+v)}
return out.join(';')}

function walk(src,dst,pcs){
var cs=getComputedStyle(src),tag=src.localName;
dst.setAttribute('style',diff(cs,defaults(src),pcs,tag));
if(cs.display==='none'){while(dst.firstChild)dst.removeChild(dst.firstChild);return}
if(tag!=='body'&&tag!=='html'&&/auto|scroll/.test(cs.overflowX+' '+cs.overflowY)){
var sbw=src.offsetWidth-src.clientWidth-(parseFloat(cs.borderLeftWidth)||0)-(parseFloat(cs.borderRightWidth)||0);
var sbh=src.offsetHeight-src.clientHeight-(parseFloat(cs.borderTopWidth)||0)-(parseFloat(cs.borderBottomWidth)||0);
var sw=(sbw>0.5||sbh>0.5)?(Math.max(sbw,sbh)<=10?'thin':null):'none';
if(sw)dst.setAttribute('style',dst.getAttribute('style')+';scrollbar-width:'+sw);
if(src.scrollTop)dst.setAttribute('data-dc-st',src.scrollTop);
if(src.scrollLeft)dst.setAttribute('data-dc-sl',src.scrollLeft)}
if((tag==='input'||tag==='textarea')&&src.hasAttribute('placeholder')){
var pp=getComputedStyle(src,'::placeholder'),pid='p'+(pn++);
dst.setAttribute('data-'+pid,'');
pseudo.push('[data-'+pid+']::placeholder{'+PH.map(function(k){return k+':'+pp.getPropertyValue(k)}).join(';')+'}')}
['::before','::after'].forEach(function(p){var pc=getComputedStyle(src,p),c=pc.content;if(c&&c!=='none'&&c!=='normal'){var id='p'+(pn++);dst.setAttribute('data-'+id,'');pseudo.push('[data-'+id+']'+p+'{'+diff(pc,defaults(SPAN),cs)+'}')}});
for(var n=src.firstChild;n;n=n.nextSibling){if(n.nodeType===3&&n.nodeValue.trim()){counts[cs.fontFamily]=(counts[cs.fontFamily]||0)+1}}
['src','href','poster','action'].forEach(function(a){if(src.hasAttribute(a))dst.setAttribute(a,abs(src.getAttribute(a)))});
if(tag==='object'&&src.hasAttribute('data'))dst.setAttribute('data',abs(src.getAttribute('data')));
if(tag==='img'){stat.images++;
var os=src.getAttribute('src'),oss=src.getAttribute('srcset');
if(os)dst.setAttribute('data-dc-src',abs(os));
if(oss)dst.setAttribute('data-dc-srcset',oss.split(',').map(function(c){c=c.trim();var i=c.search(/\s/);return i<0?abs(c):abs(c.slice(0,i))+c.slice(i)}).join(', '));
if(src.currentSrc)dst.setAttribute('src',src.currentSrc);dst.removeAttribute('srcset');dst.removeAttribute('sizes');dst.removeAttribute('loading');jobs.push({el:dst,attr:'src'})}
if(tag==='video'&&dst.hasAttribute('poster'))jobs.push({el:dst,attr:'poster'});
if(tag==='input'){dst.setAttribute('value',src.value);if(src.checked)dst.setAttribute('checked','')}
else if(tag==='textarea'){dst.textContent=src.value}
else if(tag==='canvas'){try{var im=document.createElement('img');im.src=src.toDataURL();im.setAttribute('style',dst.getAttribute('style'));dst.parentNode.replaceChild(im,dst);return}catch(e){}}
var sk=src.children,dk=Array.prototype.slice.call(dst.children);
for(var i=0;i<dk.length;i++){
if(SKIP[dk[i].tagName]||(tag==='picture'&&dk[i].localName==='source')){dk[i].parentNode.removeChild(dk[i]);continue}
walk(sk[i],dk[i],cs)}
}

try{
var rootClone=document.documentElement.cloneNode(true);
toast('DOM Capture running...');
frame=document.createElement('iframe');
frame.style.cssText='position:fixed;left:-9999px;top:0;width:1200px;height:800px;border:0;visibility:hidden';
document.body.appendChild(frame);
fd=frame.contentDocument;fw=frame.contentWindow;

toast('DOM Capture: reading page styles...');
var head=rootClone.querySelector('head'),body=rootClone.querySelector('body');
Array.prototype.slice.call(head.querySelectorAll('script,style,noscript,base,meta[http-equiv],meta[charset],link')).forEach(function(e){if(e.localName==='link'&&/icon/i.test(e.rel)){e.setAttribute('href',abs(e.getAttribute('href')));jobs.push({el:e,attr:'href'})}else e.parentNode.removeChild(e)});
var rcs=getComputedStyle(document.documentElement);
rootClone.setAttribute('style',diff(rcs,defaults(document.documentElement),null));
walk(document.body,body,rcs);

toast('DOM Capture: embedding images...');
await embedImages(rootClone);

toast('DOM Capture: collecting fonts...');
await gatherFaces();
await buildFaces();
var web=webMap(),declFam={},embFam={},famSrc={},famLF={};
faces.forEach(function(f){declFam[f.fam]=1;if(f.embedded)embFam[f.fam]=1;if(f.source==='origin'||!famSrc[f.fam]||famSrc[f.fam]==='none')famSrc[f.fam]=f.source;if(f.localFirst)famLF[f.fam]=1});

var stacks=[],keys=Object.keys(counts);
for(var k=0;k<keys.length;k++){
var fs=keys[k],names=parseStack(fs),fams=[];
for(var j=0;j<names.length;j++){
var name=names[j],generic=GENERIC.indexOf(name.toLowerCase())>-1,isWeb=!generic&&(!!web[name]||!!declFam[norm(name)]);
var loc=generic?null:await localCheck(name);
var avail=generic||web[name]==='loaded'||loc||fontCheck(name);
var inst=generic?null:isWeb?loc:(loc||fontCheck(name));
fams.push({name:name,kind:generic?'generic':isWeb?'web':avail?'system':'missing',webStatus:web[name]||null,embedded:!!embFam[norm(name)],source:famSrc[norm(name)]||null,localFirst:!!famLF[norm(name)],installed:inst,available:!!avail})}
var idx=fams.findIndex(function(f){return f.available});
stacks.push({stack:fs,count:counts[fs],families:fams,usedIndex:idx,fellBack:idx!==0})}
stacks.sort(function(a,b){return b.count-a.count});

var report={url:location.href,title:document.title,captured:new Date().toISOString(),viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,ua:navigator.userAgent,generic:GENERIC,stacks:stacks,faces:{embedded:stat.embedded,referenced:stat.referenced},images:{embedded:stat.imgEmbedded,keptAsUrl:stat.imgKept,failedSample:stat.imgFailed.slice(0,10),hosts:stat.hosts},unreadableSheets:stat.keptLinks,scroll:[scrollX,scrollY]};

var meta=document.createElement('meta');meta.setAttribute('charset','utf-8');head.insertBefore(meta,head.firstChild);
var st=document.createElement('style');st.textContent=faces.map(function(f){return f.out}).join('\n')+'\n'+pseudo.join('\n');head.appendChild(st);
if(KEEP_UNREADABLE_LINKS)stat.keptLinks.forEach(function(h){var l=document.createElement('link');l.rel='stylesheet';l.href=h;head.appendChild(l)});
var js=document.createElement('script');js.type='application/json';js.id='font-report';js.textContent=JSON.stringify(report).replace(/</g,'\\u003c');body.appendChild(js);
var vs=document.createElement('script');vs.textContent='('+viewer.toString()+')('+fontCheck.toString()+')';body.appendChild(vs);
var html='<!doctype html>\n'+rootClone.outerHTML;

var a=document.createElement('a');
a.href=URL.createObjectURL(new Blob([html],{type:'text/html'}));
a.download=((document.title||'page').replace(/[^\w\- ]+/g,'').trim().slice(0,60)||'page')+'.html';
document.body.appendChild(a);a.click();a.remove();

var fb=stacks.filter(function(s){return s.fellBack}).length;
toast('Captured '+Math.round(html.length/1024)+' KB. Images: '+(EMBED_IMAGES?stat.imgEmbedded+' embedded, '+stat.imgKept+' kept as URL':Object.keys(stat.hosts).reduce(function(n,k){return n+stat.hosts[k]},0)+' unique, original sources kept, from '+Object.keys(stat.hosts).length+' host(s)')+'. Fonts: '+stacks.length+' stacks, '+fb+' fell back; font rules '+(EMBED_FONTS?stat.embedded+' embedded, ':'')+stat.referenced+' by URL'+(stat.keptLinks.length?'; '+stat.keptLinks.length+' cross-site stylesheet(s) could not be read'+(KEEP_UNREADABLE_LINKS?' (kept as links)':' (their fonts are not included)'):'')+'.',false,10000);
}catch(e){
toast('DOM Capture failed: '+(e&&e.message||e)+'\n'+String(e&&e.stack||'').split('\n').slice(0,3).join('\n'),true);
}finally{if(frame&&frame.parentNode)frame.parentNode.removeChild(frame)}
})();
