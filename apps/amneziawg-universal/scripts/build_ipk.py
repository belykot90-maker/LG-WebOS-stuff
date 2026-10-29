#!/usr/bin/env python3
"""Standalone Python3 Homebrew IPK packager; requires separately licensed vendor inputs.
   Does not contact a server or include personal VPN configurations.
"""
from pathlib import Path
from hashlib import sha256
import argparse,io,tarfile,struct,json,gzip
ROOT=Path(__file__).resolve().parents[1]
APPID='com.konstantin.awguniversal'
VERSION='1.0.3'
SOURCES=('manager.js','vpn.sh','boot.sh','boot-worker.sh','portal.js','portal.sh','portal.html','keywatch.js','keywatch.sh','toggle.sh')
VENDOR=('awg','amneziawg-go','ru-ipv4.txt')
def tarball(files):
    stream=io.BytesIO()
    with tarfile.open(fileobj=stream,mode='w:') as ar:
        for name,blob in sorted(files.items()):
            t=tarfile.TarInfo(name)
            t.size=len(blob);t.mode=0o644;t.uid=0;t.gid=0;t.mtime=1600000000
            ar.addfile(t,io.BytesIO(blob))
    compressed=io.BytesIO()
    with gzip.GzipFile(fileobj=compressed,mode='wb',filename='',mtime=0) as g:
        g.write(stream.getvalue())
    return compressed.getvalue()
def member(name,data):
    header=(name.ljust(16) +str(1600000000).ljust(12)+'0'.ljust(6)+'0'.ljust(6)+
            '100644'.ljust(8)+str(len(data)).ljust(10)+'\x60\n').encode('ascii')
    return header+data+(b'\n' if len(data)%2 else b'')
def main():
    p=argparse.ArgumentParser()
    p.add_argument('--base-url',required=True,help='IPK download base URL for manifest')
    args=p.parse_args()
    required=[ROOT/'src'/n for n in SOURCES]+[ROOT/'vendor'/n for n in VENDOR]+[
         ROOT/'src'/'index.html',ROOT/'src'/'install.sh',ROOT/'src'/'webOSTV.js',ROOT/'assets'/'icon.png']
    missing=[str(f.relative_to(ROOT)) for f in required if not f.is_file()]
    if missing:
        raise SystemExit('Required build inputs missing (not committed for licensing reasons): '+', '.join(missing))
    info={'id':APPID,'version':VERSION,'vendor':'Konstantin','type':'web','main':'index.html',
          'title':'AmneziaWG Universal','icon':'icon.png',
          'appDescription':'Configurable AmneziaWG for rooted LG webOS 4.x / ARMv7; own VPS profile.',
          'requiredPermissions':['lunabus.query'],'visible':True}
    files={'appinfo.json':json.dumps(info,ensure_ascii=False,indent=2).encode('utf8'),
           'index.html':(ROOT/'src'/'index.html').read_bytes(),
           'install.sh':(ROOT/'src'/'install.sh').read_bytes(),
           'icon.png':(ROOT/'assets'/'icon.png').read_bytes(),
           'webOSTV.js':(ROOT/'src'/'webOSTV.js').read_bytes()}
    for n in SOURCES:files['files/'+n]=(ROOT/'src'/n).read_bytes()
    for n in ('awg','amneziawg-go'):files['files/'+n]=(ROOT/'vendor'/n).read_bytes()
    files['files/ru-ipv4.txt']=(ROOT/'vendor'/'ru-ipv4.txt').read_bytes()
    for name,source in [('amneziawg-tools-GPL-2.0.txt','awg-tools-COPYING'),('amneziawg-go-MIT.txt','awg-go-LICENSE')]:
        f=ROOT/'vendor'/source
        if f.is_file(): files['licenses/'+name]=f.read_bytes()
    files={('./usr/palm/applications/'+APPID+'/'+n):b for n,b in files.items()}
    control=('Package: '+APPID+'\nVersion: '+VERSION+'\nSection: misc\nPriority: optional\n'
             'Architecture: all\nMaintainer: Konstantin\nDescription: Configurable AmneziaWG for webOS 4.x ARMv7\n').encode()
    ipk=b'!<arch>\n'+member('debian-binary',b'2.0\n')+member('control.tar.gz',tarball({'./control':control}))+member('data.tar.gz',tarball(files))
    dst=ROOT/'dist';dst.mkdir(exist_ok=True)
    fn=APPID+'_'+VERSION+'_all.ipk'
    (dst/fn).write_bytes(ipk)
    url=args.base_url.rstrip('/')+'/'+fn
    manifest={'id':APPID,'version':VERSION,'type':'web','title':'AmneziaWG Universal',
              'iconUri':'https://raw.githubusercontent.com/belykot90-maker/LG-WebOS-stuff/main/apps/amneziawg-universal/assets/icon.png',
              'sourceUrl':'https://github.com/belykot90-maker/LG-WebOS-stuff','appDescription':'Self-configured AmneziaWG VPN for rooted LG webOS 4.x ARMv7',
              'ipkUrl':url,'ipkSize':len(ipk),'ipkHash':{'sha256':sha256(ipk).hexdigest()},
              'rootRequired':True}
    (dst/(APPID+'.manifest.json')).write_text(json.dumps(manifest,indent=2)+'\n')
    print('Built',fn,len(ipk),'SHA256',sha256(ipk).hexdigest())
if __name__=='__main__':main()
