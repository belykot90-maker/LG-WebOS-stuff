#!/usr/bin/env node
/* Universal optional yellow-button hold watcher; 32-bit ARM Linux input_event.
 * Does not grab or block normal short presses; no keylogging or telemetry.
 */
'use strict';
var fs=require('fs'),cp=require('child_process'),D='/media/developer/.awgu';
var devices=['/dev/input/event0','/dev/input/event1','/dev/input/event2','/dev/input/event3','/dev/input/event4','/dev/input/event5'];
var state={},fds=[],open={},lastToggle=0,active=false;
function pending(){
 devices.forEach(function(p){
  if(open[p])return;
  try{var fd=fs.openSync(p,2048);fds.push({path:p,fd:fd,b:new Buffer(16)});open[p]=true;}
  catch(e){}
 });
}
function toggle(){
 if(active||Date.now()-lastToggle<3500)return;
 lastToggle=Date.now();active=true;
 cp.execFile('/bin/sh',[D+'/toggle.sh'],{timeout:45000},function(){
   active=false;
 });
}
function keyEvent(device,code,value){
 if(code!==400)return;
 var id=device+':'+code,now=Date.now();
 if(value===1)state[id]={when:now,done:false};
 else if(value===2&&state[id]&&!state[id].done&&now-state[id].when>=1250){
   state[id].done=true;toggle();
 }else if(value===0){
   if(state[id]&&!state[id].done&&now-state[id].when>=1250)toggle();
   delete state[id];
 }
}
function poll(){
 fds.forEach(function(f){
  try{
   for(var n=0;n<24;n++){
    var got=fs.readSync(f.fd,f.b,0,16,null);
    if(got!==16)break;
    if(f.b.readUInt16LE(8)===1)keyEvent(f.path,f.b.readUInt16LE(10),f.b.readInt32LE(12));
   }
  }catch(e){
   if(e.code!=='EAGAIN'&&e.code!=='EWOULDBLOCK'){
     open[f.path]=false;try{fs.closeSync(f.fd);}catch(x){}
     fds=fds.filter(function(x){return x!==f;});
   }
  }
 });
}
pending();
setInterval(pending,5000);
setInterval(poll,75);
