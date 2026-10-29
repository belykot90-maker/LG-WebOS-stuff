#!/usr/bin/env node
/* AmneziaWG Universal for LG webOS 4.x / ARMv7
 * Private profiles never leave the TV. ES5 for system Node.js 0.12.
 * CLI interface is intentionally restricted: no shell interpolation.
 */
'use strict';
var fs=require('fs'),path=require('path'),cp=require('child_process');
var BASE=process.env.AWGU_TEST_DIR||'/media/developer/.awgu';
var CFG=BASE+'/wire.conf',OPTIONS=BASE+'/settings.sh';
var IF_KEYS=['PrivateKey','ListenPort','FwMark','Jc','Jmin','Jmax','S1','S2','S3','S4','H1','H2','H3','H4','I1','I2','I3','I4','I5','HeaderProtectionKey','ContentPaddingAddition','RekeyAfterTime','RekeyTimeout','RejectAfterTime','KeepaliveTimeout','MaxHandshakeAttempts','RandomTrailers','DisableCookies'];
var PEER_KEYS=['PublicKey','PresharedKey','AllowedIPs','Endpoint','PersistentKeepalive'];
function fail(msg){process.stderr.write('ERROR: '+msg+'\n');process.exit(2);}
function mkdir(d){if(!fs.existsSync(d))fs.mkdirSync(d,parseInt('700',8));}
function readSettings(){
 var r={mode:'full',auto:'0'};
 if(!fs.existsSync(OPTIONS))return r;
 fs.readFileSync(OPTIONS,'utf8').split(/\r?\n/).forEach(function(line){
  var m=/^AWGU_(MODE|AUTO|ADDRESS|HOST|PORT|MTU|DNS)='([^']*)'$/.exec(line);
  if(m){r[m[1].toLowerCase()]=m[2];}
 });
 return r;
}
function writeAtomic(name,body){
 mkdir(BASE);var temp=name+'.tmp-'+process.pid;
 var fd=fs.openSync(temp,'w',parseInt('600',8));
 try{fs.writeSync(fd,body);fs.fsyncSync(fd);}
 finally{fs.closeSync(fd);}
 fs.chmodSync(temp,parseInt('600',8));fs.renameSync(temp,name);
}
function saveSettings(v){
 var order=['mode','auto','address','host','port','mtu','dns'];
 var b='';
 order.forEach(function(k){
  var val=String(v[k]||'');
  if(val.indexOf("'")!==-1||val.indexOf('\n')!==-1)fail('Invalid setting '+k);
  b+='AWGU_'+k.toUpperCase()+"='"+val+"'\n";
 });
 writeAtomic(OPTIONS,b);
}
function ipv4(ip){
 var a=String(ip).split('.');
 if(a.length!==4)return false;
 for(var i=0;i<4;i++){
  if(!/^\d{1,3}$/.test(a[i])||Number(a[i])>255)return false;
 }
 return true;
}
function isConnected(){return fs.existsSync('/sys/class/net/awgu0');}
function parse(raw){
 if(raw.length<90||raw.length>16000)fail('Profile size must be 90..16000 characters');
 var section='',iface={},peer={},seen={};
 raw.split(/\r?\n/).forEach(function(line,idx){
  var s=line.trim();
  if(!s||/^[#;]/.test(s))return;
  if(/^\[(Interface|Peer)\]$/i.test(s)){
   section=/Interface/i.test(s)?'Interface':'Peer';return;
  }
  var m=/^([a-zA-Z][a-zA-Z0-9]*)\s*=\s*(.*?)\s*$/.exec(s);
  if(!m||!section)fail('Invalid line '+(idx+1));
  var key=m[1],v=m[2];
  var known=section==='Interface'?IF_KEYS.concat(['Address','DNS','MTU']):PEER_KEYS;
  var resolved=null;
  for(var i=0;i<known.length;i++)if(known[i].toLowerCase()===key.toLowerCase())resolved=known[i];
  if(!resolved)fail('Unsupported AmneziaWG option: '+key);
  var unique=section+':'+resolved;
  if(seen[unique])fail('Duplicate parameter: '+resolved);
  seen[unique]=true;
  if(!v||v.length>240||/[\x00-\x1F\x7F]/.test(v))fail('Invalid value of '+resolved);
  if(section==='Interface')iface[resolved]=v;else peer[resolved]=v;
 });
 if(!iface.PrivateKey||!peer.PublicKey||!peer.Endpoint||!iface.Address)fail('Missing PrivateKey, Address, PublicKey or Endpoint');
 function key64(v){return /^[A-Za-z0-9+/]{43}=$/.test(v);}
 if(!key64(iface.PrivateKey)||!key64(peer.PublicKey)||(peer.PresharedKey&&!key64(peer.PresharedKey)))fail('Invalid key format');
 var addr=iface.Address.split(',')[0].trim();
 var a=/^([^\/]+)\/(\d{1,2})$/.exec(addr);
 if(!a||!ipv4(a[1])||Number(a[2])>32||Number(a[2])<1)fail('Only one IPv4 Address/CIDR is supported');
 if(iface.Address.indexOf(',')!==-1)fail('Only one IPv4 Address is supported');
 var ep=/^([A-Za-z0-9.-]+):(\d{1,5})$/.exec(peer.Endpoint);
 if(!ep||Number(ep[2])<1||Number(ep[2])>65535||ep[1].length>253||ep[1].indexOf('..')!==-1)fail('Endpoint must be hostname-or-IPv4:port');
 var allowed=String(peer.AllowedIPs||'').split(',').map(function(s){return s.trim();});
 if(allowed.indexOf('0.0.0.0/0')<0)fail('AllowedIPs must include 0.0.0.0/0 (full tunnel)');
 var mtu=String(iface.MTU||'1280');
 if(!/^\d+$/.test(mtu)||Number(mtu)<576||Number(mtu)>1500)fail('MTU must be 576..1500');
 var dns=String(iface.DNS||'').split(',')[0].trim();
 if(dns&&!ipv4(dns))fail('First DNS must be IPv4');
 function safeValue(k,v){
  if(k==='PrivateKey'||k==='PublicKey'||k==='PresharedKey'||k==='HeaderProtectionKey')return key64(v);
  if(k==='Endpoint')return true;
  if(k==='AllowedIPs')return /^[0-9A-Fa-f.:/,\s]+$/.test(v);
  if(/^I[1-5]$/.test(k))return /^[<>a-zA-Z0-9, ._+-]{1,180}$/.test(v);
  if(k==='RandomTrailers'||k==='DisableCookies')return /^(on|off|true|false|0|1)$/i.test(v);
  if(/^(H[1-4]|ContentPaddingAddition|RekeyAfterTime|RekeyTimeout|RejectAfterTime|KeepaliveTimeout|MaxHandshakeAttempts)$/.test(k))
   return /^\d{1,10}(-\d{1,10})?$/.test(v);
  return /^\d{1,10}$/.test(v);
 }
 Object.keys(iface).forEach(function(k){if(IF_KEYS.indexOf(k)>=0&&!safeValue(k,iface[k]))fail('Invalid AWG parameter '+k);});
 Object.keys(peer).forEach(function(k){if(!safeValue(k,peer[k]))fail('Invalid peer parameter '+k);});
 var wire='[Interface]\n';
 IF_KEYS.forEach(function(k){if(iface[k])wire+=k+' = '+iface[k]+'\n';});
 wire+='\n[Peer]\n';
 PEER_KEYS.forEach(function(k){if(peer[k])wire+=k+' = '+peer[k]+'\n';});
 return {wire:wire,address:addr,host:ep[1],port:ep[2],mtu:mtu,dns:dns};
}
function doImport(b64){
 if(isConnected())fail('Disconnect Universal VPN before replacing the profile');
 if(!/^[A-Za-z0-9+/=]{100,22000}$/.test(b64))fail('Invalid base64 encoding');
 var raw=(new Buffer(b64,'base64')).toString('utf8');
 var p=parse(raw),settings=readSettings();
 settings.address=p.address;settings.host=p.host;settings.port=p.port;
 settings.mtu=p.mtu;settings.dns=p.dns;
 if(settings.mode!=='ru')settings.mode='full';
 if(settings.auto!=='1')settings.auto='0';
 writeAtomic(CFG,p.wire);
 saveSettings(settings);
 process.stdout.write('PROFILE SAVED on TV. Endpoint: '+p.host+':'+p.port+'; IPv4 '+p.address+'; mode: '+settings.mode+'\n');
}
var action=process.argv[2]||'status';
if(action==='import'){
 doImport(process.argv[3]||'');
}else if(action==='import-file'){
 var f=process.argv[3]||'';
 // Only explicit local fixed temporary path; no remote fetch.
 if(f!==BASE+'/import.conf')fail('Unsupported import path');
 doImport((new Buffer(fs.readFileSync(f,'utf8'),'utf8')).toString('base64'));
}else if(action==='mode'){
 if(isConnected())fail('Disconnect VPN before changing routing mode');
 var mode=process.argv[3];
 if(mode!=='full'&&mode!=='ru')fail('Routing mode must be full or ru');
 var v=readSettings();v.mode=mode;saveSettings(v);
 process.stdout.write('ROUTING '+mode+'\n');
}else if(action==='autostart'){
 var auto=process.argv[3];
 if(auto!=='0'&&auto!=='1')fail('Autostart must be 0 or 1');
 if(auto==='1'&&!fs.existsSync(CFG))fail('Import profile first');
 var v=readSettings();v.auto=auto;saveSettings(v);
 process.stdout.write('AUTOSTART '+auto+'\n');
}else if(action==='status'){
 var opt=readSettings();
 process.stdout.write('PROFILE '+(fs.existsSync(CFG)?'READY':'MISSING')+'\n');
 process.stdout.write('ENDPOINT '+(opt.host||'-')+':'+(opt.port||'-')+'\n');
 process.stdout.write('MODE '+opt.mode+'\n');
 process.stdout.write('AUTOSTART '+opt.auto+'\n');
}else fail('Unknown command');
