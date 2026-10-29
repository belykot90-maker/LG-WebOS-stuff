#!/usr/bin/env python3
"""Deterministic IPK builder for the standalone VK AdSkip Universal app.

Only original open-source code from this repository is included.
No VK Video app files or font binaries are bundled.
"""
from pathlib import Path
import argparse,hashlib,io,json,gzip,tarfile
ROOT=Path(__file__).resolve().parents[1]
APPID='com.konstantin.vkadskipuniversal'
VERSION='0.5.0'
ASSETS=('adskip.js','install.sh','font-prefix.js','font-suffix.js')
BASE='https://github.com/belykot90-maker/LG-WebOS-stuff/releases/download/vkadskip-v0.5.0'
def tgz(items):
 b=io.BytesIO()
 with tarfile.open(fileobj=b,mode='w:') as f:
  for name,data in sorted(items.items()):
   info=tarfile.TarInfo(name)
   info.size=len(data);info.mode=0o644;info.mtime=1600000000
   f.addfile(info,io.BytesIO(data))
 out=io.BytesIO()
 with gzip.GzipFile(filename='',mode='wb',fileobj=out,mtime=0) as f:f.write(b.getvalue())
 return out.getvalue()
def member(name,b):
 header=(name.ljust(16)+str(1600000000).ljust(12)+'0'.ljust(6)+'0'.ljust(6)+'100644'.ljust(8)+str(len(b)).ljust(10)+'\x60\n').encode()
 return header+b+(b'\n' if len(b)%2 else b'')
def main():
 p=argparse.ArgumentParser()
 p.add_argument('--base-url',default=BASE)
 a=p.parse_args()
 def read(n):return (ROOT/'src'/n).read_bytes()
 appinfo={'id':APPID,'version':VERSION,'vendor':'Community','type':'web',
  'main':'index.html','title':'VK AdSkip Universal','icon':'icon.png','visible':True,
  'requiredPermissions':['lunabus.query'],
  'appDescription':'Reversible experimental VK Video ad skip for rooted LG webOS.'}
 files={'./usr/palm/applications/'+APPID+'/appinfo.json':json.dumps(appinfo,ensure_ascii=False,indent=2).encode(),
  './usr/palm/applications/'+APPID+'/index.html':read('index.html'),
  './usr/palm/applications/'+APPID+'/webOSTV.js':(ROOT.parent/'amneziawg-universal'/'src'/'webOSTV.js').read_bytes(),
  './usr/palm/applications/'+APPID+'/install.sh':read('install.sh'),
  './usr/palm/applications/'+APPID+'/icon.png':(ROOT/'assets'/'icon.png').read_bytes()}
 for name in ASSETS:files['./usr/palm/applications/'+APPID+'/files/'+('adskip.js' if name=='adskip.js' else name)]=read(name)
 control=('Package: '+APPID+'\nVersion: '+VERSION+'\nSection: misc\nPriority: optional\n'
   'Architecture: all\nMaintainer: Community\nDescription: VK AdSkip Universal rooted LG webOS\n').encode()
 pkg=b'!<arch>\n'+member('debian-binary',b'2.0\n')+member('control.tar.gz',tgz({'./control':control}))+member('data.tar.gz',tgz(files))
 out=ROOT/'dist';out.mkdir(exist_ok=True)
 name=APPID+'_'+VERSION+'_all.ipk'
 (out/name).write_bytes(pkg)
 url=a.base_url.rstrip('/')+'/'+name
 manifest={'id':APPID,'version':VERSION,'type':'web','title':'VK AdSkip Universal',
 'iconUri':'https://raw.githubusercontent.com/belykot90-maker/LG-WebOS-stuff/main/apps/vk-adskip/assets/icon.png',
 'appDescription':'Experimental VK Video ad skip with safe rollback; rooted LG webOS.',
 'sourceUrl':'https://github.com/belykot90-maker/LG-WebOS-stuff/tree/main/apps/vk-adskip',
 'rootRequired':True,'ipkUrl':url,'ipkHash':{'sha256':hashlib.sha256(pkg).hexdigest()},'ipkSize':len(pkg)}
 (out/(APPID+'.manifest.json')).write_text(json.dumps(manifest,indent=2)+'\n')
 print('BUILT',name,'SIZE',len(pkg),'SHA256',manifest['ipkHash']['sha256'])
if __name__=='__main__':main()
