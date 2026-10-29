#!/usr/bin/env python3
import os,pathlib,tempfile,subprocess
root=pathlib.Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory() as temp:
 p=pathlib.Path(temp)
 vk=p/'vkvideo'
 app=p/'app'
 state=p/'state'
 (vk/'webOSUserScripts').mkdir(parents=True)
 (vk/'styles').mkdir()
 (app/'files').mkdir(parents=True)
 (vk/'appinfo.json').write_text('{"id":"vkvideo"}')
 for file in ('adskip.js','font-prefix.js','font-suffix.js'):
  (app/'files'/file).write_bytes((root/'src'/file).read_bytes())
 script=vk/'webOSUserScripts'/'userScript.js'
 script.write_text('console.log("Previous external user script");\n')
 env=dict(os.environ,VKADSKIP_TEST='1',VKADSKIP_TEST_ROOT=str(vk),
   VKADSKIP_TEST_APP=str(app),VKADSKIP_TEST_STATE=str(state))
 def run(action,code=0):
  x=subprocess.run(['sh',str(root/'src'/'install.sh'),action],env=env,text=True,capture_output=True)
  assert x.returncode==code,(action,x.returncode,x.stdout,x.stderr)
  return x.stdout
 assert 'NOT INSTALLED' in run('status')
 assert 'INSTALLED' in run('install')
 assert 'VK AdSkip Universal' in script.read_text()
 assert 'INSTALLED' in run('install') # idempotent; must not overwrite original backup
 assert 'PREVIOUS SCRIPT RESTORED' in run('uninstall')
 assert script.read_text()=='console.log("Previous external user script");\n'
 assert 'INSTALLED' in run('install')
 script.write_text('unrelated replacement\n')
 run('install',2)
 run('uninstall',2)
 assert script.read_text()=='unrelated replacement\n'
 print('PASS: installation, idempotence, rollback and refusal to overwrite foreign scripts')
