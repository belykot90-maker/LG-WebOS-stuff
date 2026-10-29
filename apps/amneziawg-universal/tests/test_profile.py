#!/usr/bin/env python3
"""Offline smoke tests; never uses a real VPN/private key."""
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess,sys,os,base64
ROOT=Path(__file__).resolve().parents[1]
node=os.environ.get('NODE','node')
manager=ROOT/'src'/'manager.js'
def b64(b):return base64.b64encode(b).decode()
def main():
    with TemporaryDirectory() as tmp:
        env=dict(os.environ,AWGU_TEST_DIR=tmp)
        def run(args,expected=0):
            p=subprocess.run([node,str(manager)]+args,env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
            assert p.returncode==expected,(p.returncode,p.stderr)
            return p.stdout
        assert 'PROFILE MISSING' in run(['status'])
        key=b64(bytes(range(32)))
        pub=b64(bytes(reversed(range(32))))
        profile=('[Interface]\nPrivateKey = '+key+'\nAddress = 10.19.0.2/32\n'
                 'MTU = 1280\nJc = 3\nJmin = 40\nJmax = 70\n'
                 '[Peer]\nPublicKey = '+pub+'\nEndpoint = example.org:51820\n'
                 'AllowedIPs = 0.0.0.0/0, ::/0\n')
        out=run(['import',b64(profile.encode())])
        assert 'PROFILE SAVED' in out
        assert key not in out
        assert 'example.org:51820' in run(['status'])
        wire=(Path(tmp)/'wire.conf').read_text()
        assert 'PrivateKey' in wire and 'Address =' not in wire
        assert 'ROUTING ru' in run(['mode','ru'])
        assert 'AUTOSTART 1' in run(['autostart','1'])
        bad=profile.replace('Endpoint = example.org:51820','Endpoint = bad;reboot:51820')
        run(['import',b64(bad.encode())],2)
        run(['import',b64(profile.replace('AllowedIPs = 0.0.0.0/0, ::/0','AllowedIPs = 10.0.0.0/8').encode())],2)
    print('PASS: profile validation, storage, options, rejected invalid configs')
if __name__=='__main__':main()
