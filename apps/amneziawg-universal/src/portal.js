/* Temporary LAN-only .conf upload portal.
 * LG webOS 4.x Node.js 0.12 compatible, single-use, 5-minute expiry.
 * NOTE: HTTP over local LAN, not encrypted; use on trusted home network.
 */
'use strict';
var http=require('http'),fs=require('fs'),os=require('os'),crypto=require('crypto'),cp=require('child_process');
var D=process.env.AWGU_TEST_DIR||'/media/developer/.awgu';
var INFO=D+'/portal.info',CONF=D+'/import.conf',MANAGER=D+'/manager.js';
var PORT=38648,TTL=300000,MAX_BYTES=16000,failed=0,used=false,started=Date.now();
var pin=('00000000'+(crypto.randomBytes(5).readUInt32BE(0)%100000000)).slice(-8);
function localIP(){
 var all=os.networkInterfaces(),priority=['wlan0','eth0','en0','enp0s1'];
 var keys=Object.keys(all).sort(function(a,b){var ai=priority.indexOf(a),bi=priority.indexOf(b);return (ai<0?999:ai)-(bi<0?999:bi);});
 for(var k=0;k<keys.length;k++){
  var arr=all[keys[k]];
  for(var j=0;j<arr.length;j++){
   var n=arr[j],ip=n.address;
   if(n.family==='IPv4'&&!n.internal&&
     (/^192\.168\./.test(ip)||/^10\./.test(ip)||/^172\.(1[6-9]|2[0-9]|3[01])\./.test(ip)))return ip;
  }
 }
 return null;
}
function writeAtomic(p,b){
 var t=p+'.tmp';
 fs.writeFileSync(t,b,{mode:384});
 fs.chmodSync(t,384);
 fs.renameSync(t,p);
}
function respond(res,status,type,data){
 res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',
 'Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; form-action 'self'; connect-src 'self'",
 'X-Frame-Options':'DENY','Referrer-Policy':'no-referrer'});
 res.end(data);
}
function equal(a,b){
 if(a.length!==b.length)return false;
 var diff=0;for(var i=0;i<a.length;i++)diff|=(a.charCodeAt(i)^b.charCodeAt(i));
 return diff===0;
}
var page=fs.readFileSync(D+'/portal.html','utf8');
function shutdown(server){
 try{fs.unlinkSync(INFO);}catch(e){}
 try{fs.unlinkSync(CONF);}catch(e){}
 server.close();
}
function create(){
 var ip=localIP();
 if(!ip){process.stderr.write('No private LAN IPv4 address\n');process.exit(2);}
 var srv=http.createServer(function(req,res){
  if(Date.now()-started>TTL||used){respond(res,410,'text/plain;charset=utf-8','Сеанс завершён. Откройте новый на ТВ.');return;}
  if(req.method==='GET'&&(req.url==='/'||req.url==='/index.html')){
   return respond(res,200,'text/html;charset=utf-8',page);
  }
  if(req.method==='POST'&&/^\/upload\?code=/.test(req.url||'')){
   var match=/^\/upload\?code=(\d{8})$/.exec(req.url);
   if(!match||!equal(match[1],pin)){
    failed++;respond(res,403,'text/plain;charset=utf-8','Неверный код.');
    if(failed>=15)setTimeout(function(){shutdown(srv);},100);
    return;
   }
   var chunks=[],total=0,excess=false;
   req.on('data',function(buf){
    total+=buf.length;
    if(total>MAX_BYTES){excess=true;chunks=[];}
    else chunks.push(buf);
   });
   req.on('end',function(){
    if(excess||total<90){respond(res,413,'text/plain;charset=utf-8','Неверный размер файла');return;}
    used=true;
    var raw=Buffer.concat(chunks).toString('utf8');
    if(raw.indexOf('[Interface]')<0||raw.indexOf('[Peer]')<0){
     used=false;respond(res,422,'text/plain;charset=utf-8','Ожидается .conf с [Interface] и [Peer]');return;
    }
    try{writeAtomic(CONF,raw);}
    catch(e){used=false;respond(res,500,'text/plain;charset=utf-8','Ошибка записи файла');return;}
    cp.execFile('/usr/bin/node',[MANAGER,'import-file',CONF],{timeout:12000,maxBuffer:8192},
      function(err,out,stderr){
       try{fs.unlinkSync(CONF);}catch(e){}
       if(err){used=false;respond(res,422,'text/plain;charset=utf-8',
         'Профиль не принят: '+String(stderr||'ошибка').replace(/[\r\n]+/g,' ').slice(0,200));return;}
       respond(res,200,'text/plain;charset=utf-8','Профиль сохранён на телевизоре. Теперь включите VPN в приложении.');
       setTimeout(function(){shutdown(srv);},250);
    });
   });
   return;
  }
  respond(res,404,'text/plain;charset=utf-8','Not found');
 });
 srv.on('error',function(e){process.stderr.write('Portal error '+e.code+'\n');process.exit(2);});
 srv.listen(PORT,ip,function(){
  writeAtomic(INFO,JSON.stringify({url:'http://'+ip+':'+PORT+'/',pin:pin,expires:started+TTL})+'\n');
 });
 setTimeout(function(){shutdown(srv);},TTL);
 process.on('SIGTERM',function(){shutdown(srv);});
}
create();
