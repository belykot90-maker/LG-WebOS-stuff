#!/bin/sh
# Idempotent installation. Does not touch older /media/developer/.lgvpn installation.
set -eu
APP=com.konstantin.awguniversal
SRC=/media/developer/apps/usr/palm/applications/$APP
[ -r "$SRC/files/manager.js" ] || SRC=/media/cryptofs/apps/usr/palm/applications/$APP
D=/media/developer/.awgu
ROOT=/var/lib/webosbrew/init.d
[ "$(id -u)" = 0 ] || { echo 'ERROR: Root access is required';exit 2; }
case "${1:-status}" in
 install)
  [ "$(uname -m)" = armv7l ] || { echo 'ERROR: This build supports ARMv7 only';exit 2; }
  [ -r "$SRC/files/manager.js" ] || { echo 'ERROR: Missing application package files';exit 2; }
  mkdir -p "$D/bin" "$ROOT"
  chmod 700 "$D"
  # Existing user profile/settings never overwritten by upgrades.
  for f in manager.js vpn.sh boot.sh boot-worker.sh portal.js portal.html portal.sh;do
   cp "$SRC/files/$f" "$D/$f"
   case "$f" in *.js|*.html)chmod 644 "$D/$f";; *)chmod 755 "$D/$f";; esac
  done
  for f in awg amneziawg-go;do
   cp "$SRC/files/$f" "$D/bin/$f"
   chmod 755 "$D/bin/$f"
  done
  if [ ! -r "$D/ru-ipv4.txt" ];then
   cp "$SRC/files/ru-ipv4.txt" "$D/ru-ipv4.txt"
  fi
  chmod 644 "$D/ru-ipv4.txt"
  ln -sf "$D/boot.sh" "$ROOT/90-awgu"
  echo 'INSTALLED: ARMv7 AmneziaWG tools. Next: import your .conf profile.'
  ;;
 status)
  if [ -r "$D/manager.js" ];then /usr/bin/node "$D/manager.js" status;else echo 'NOT INSTALLED';fi
  if [ -r "$D/vpn.sh" ];then /bin/sh "$D/vpn.sh" status;fi
  ;;
 uninstall)
  /bin/sh "$D/vpn.sh" disconnect 2>/dev/null || true
  rm -f "$ROOT/90-awgu"
  echo 'Autostart disabled. Private VPN profile preserved on TV.'
  ;;
 *)
  echo 'Usage: install / status / uninstall';exit 2;;
esac
