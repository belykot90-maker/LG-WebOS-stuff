/* VK AdSkip Universal v0.5.0 (MIT). Client-side ad detection for VK Video webOS. */
(function(){
'use strict';
if (window.__vkAdSkipV03) return;
window.__vkAdSkipV03 = true;
var AD_HOST='proxy.vkvideo.ru';
var MAX_GUARD_MS=3200, MAX_AD_HIDE_MS=40000;
var seenSource='', attempts=0, lastAttempt=0, pending=null;
var hidden=null, blockedSrc='', since=0, silentOriginal=false, CSSOriginal='', cover=null, confirmedAt=0;
var recoveredUntil=0, toast=null, toastUntil=0, reported={};

function host(url){
 try {var a=document.createElement('a');a.href=String(url||'');return String(a.hostname||'').toLowerCase();}catch(e){return '';}
}
function getVideo(){
 var a=document.getElementsByTagName('video'),i;
 for(i=0;i<a.length;i++)if(!a[i].paused&&a[i].readyState>0)return a[i];
 return a.length?a[0]:null;
}
function mark(){
 try{
  var t=String(document.body&&document.body.innerText||'');
  return /отключить\s+рекламу/i.test(t)||/(^|\n)\s*Реклама(?:\s|$|[•·])/im.test(t);
 }catch(e){return false;}
}
function event(name,v,hn){ /* no network telemetry or analytics */ }
function toastSuccess(){
 try{
  if(!document.body)return;
  if(!toast){
   toast=document.createElement('div');
   toast.id='__vk_adskip_success';
   toast.style.cssText='position:fixed;left:18px;bottom:18px;z-index:2147483647;'+
    'background:rgba(24,40,43,.93);color:white;padding:9px 14px;border-radius:6px;'+
    'font:17px Arial,sans-serif;pointer-events:none';
   document.body.appendChild(toast);
  }
  toast.textContent='Реклама пропущена';
  toastUntil=Date.now()+3000;
 }catch(e){}
}
function ensureCover(){
 if(cover||!document.body)return;
 cover=document.createElement('div');
 cover.id='__vk_adguard_cover';
 cover.style.cssText='position:fixed;top:0;left:0;width:100vw;height:100vh;'+
  'background:#000;z-index:2147483646;pointer-events:none';
 document.body.appendChild(cover);
}
function guard(v,src){
 if(hidden===v&&blockedSrc===src)return;
 restore();
 hidden=v;blockedSrc=src;since=Date.now();
 silentOriginal=v.muted;
 CSSOriginal=v.style.visibility;
 try{v.style.visibility='hidden';v.muted=true;}catch(e){}
 ensureCover();
 event('ad-hidden',v,AD_HOST);
}
function keepHidden(){
 if(hidden){
  ensureCover();
  try{
   if(hidden.style.visibility!=='hidden')hidden.style.visibility='hidden';
   if(!hidden.muted)hidden.muted=true;
  }catch(e){}
 }
}
function restore(){
 if(cover){if(cover.parentNode)cover.parentNode.removeChild(cover);cover=null;}
 if(!hidden)return;
 try{hidden.style.visibility=CSSOriginal;hidden.muted=silentOriginal;}catch(e){}
 hidden=null;blockedSrc='';since=0;
}
function checkSeek(now){
 if(!pending)return;
 var p=pending,e=now-p.at;
 if(e<280)return;
 var v=p.video,src=v.currentSrc||v.src||'',t=v.currentTime;
 var reached=src===p.src&&isFinite(t)&&t>p.before+1.8&&t>=p.target-1.0;
 var main=src!==p.src&&src&&host(src)!==AD_HOST&&e<3500;
 if(reached||main){
  pending=null;
  event('seek-confirmed',v,host(src));
  confirmedAt=main?0:now;
  toastSuccess();
  if(main){restore();recoveredUntil=now+1500;}
 } else if(e>2900){
  pending=null;
  event('seek-unconfirmed',v,host(src));
 }
}
function loop(){
 try{
  var now=Date.now();
  if(toast&&now>=toastUntil){if(toast.parentNode)toast.parentNode.removeChild(toast);toast=null;}
  checkSeek(now);
  var v=getVideo();
  if(!v){
    if(hidden&&now-since>MAX_GUARD_MS)restore();
    return;
  }
  var src=v.currentSrc||v.src||'',hn=host(src);
  var adHost=hn===AD_HOST, adMarked=mark();
  var d=isFinite(v.duration)?v.duration:0;
  if(src!==seenSource){seenSource=src;attempts=0;}
  if(hidden){
   if(v!==hidden||src!==blockedSrc||!adHost){
    restore();
  }else{
    var held=now-since;
    if((!adMarked&&held>MAX_GUARD_MS)||(adMarked&&held>MAX_AD_HIDE_MS)||
       (confirmedAt&&now-confirmedAt>5000)){
     restore();
     event('guard-timeout',v,hn);
     recoveredUntil=now+5000;confirmedAt=0;
    }else keepHidden();
   }
  }
  // Conceal suspicious host immediately on source/playing events. Reveal after a
  // short guard if the player never marks the content as advertisement.
  if(adHost&&!hidden&&src&&now>=recoveredUntil&&(!d||d<=90)){
    guard(v,src);
  }
  if(!adHost||!src||!adMarked||!d||d<3||d>90||v.paused||v.ended||pending||attempts>=3)return;
  if(now-lastAttempt<650)return;
  var target=Math.max(0,d-0.12),before=v.currentTime;
  if(!isFinite(before)||target-before<1.5)return;
  attempts++;lastAttempt=now;
  pending={video:v,src:src,before:before,target:target,at:now};
  event('seek-requested',v,hn);
  try{v.currentTime=target;}catch(e){pending=null;event('seek-error',v,hn);}
 }catch(e){}
}
function quickCheck(e){
 try{
  var target=e&&e.target;
  if(target&&target.tagName&&target.tagName.toLowerCase()==='video'){
   var src=target.currentSrc||target.src||'';
   if(host(src)===AD_HOST)guard(target,src);
  }
 }catch(err){}
 setTimeout(loop,0);
}
['loadstart','loadedmetadata','playing','play','durationchange','emptied','seeked','timeupdate'].forEach(function(x){
 document.addEventListener(x,quickCheck,true);
});
if(document.documentElement&&typeof MutationObserver!=='undefined'){
 var observer=new MutationObserver(function(){loop();});
 observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
}
setInterval(loop,120);
loop();
})();
