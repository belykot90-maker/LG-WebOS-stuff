#!/bin/sh
# VK AdSkip Universal 0.5.0 — reversible, does not distribute VK assets.
set -eu
ID=com.konstantin.vkadskipuniversal
STATE=/media/developer/.vkadskip-universal
TEST=${VKADSKIP_TEST:-0}
if [ "$TEST" = 1 ]; then
  APP=${VKADSKIP_TEST_APP:?}
  VK=${VKADSKIP_TEST_ROOT:?}
  STATE=${VKADSKIP_TEST_STATE:?}
else
  [ "$(id -u)" = 0 ] || { echo "ERROR: root required"; exit 2; }
  APP=/media/developer/apps/usr/palm/applications/$ID
  [ -f "$APP/files/adskip.js" ] || APP=/media/cryptofs/apps/usr/palm/applications/$ID
  VK=/media/cryptofs/apps/usr/palm/applications/vkvideo
  [ -f "$VK/appinfo.json" ] || VK=/media/developer/apps/usr/palm/applications/vkvideo
fi
SCRIPT="$VK/webOSUserScripts/userScript.js"
BKP="$STATE/userScript.previous.js"
MARKER="VK AdSkip Universal v0.5.0"
status(){
  if [ ! -f "$VK/appinfo.json" ];then echo "VK VIDEO NOT FOUND";return;fi
  if [ -f "$SCRIPT" ] && grep -q 'VK AdSkip Universal' "$SCRIPT";then echo "INSTALLED VK AdSkip Universal";
  else echo "NOT INSTALLED";fi
  if [ -f "$BKP" ];then echo "Previous script preserved";fi
  if [ -f "$STATE/had-none" ];then echo "Previous script was absent";fi
}
case "${1:-status}" in
 status) status;;
 install)
  [ -f "$VK/appinfo.json" ] || { echo "ERROR: VK Video app not found";exit 2; }
  [ -f "$APP/files/adskip.js" ] || { echo "ERROR: adskip.js package missing";exit 2; }
  mkdir -p "$STATE" "$VK/webOSUserScripts"
  chmod 700 "$STATE"
  if [ -f "$SCRIPT" ] && ! grep -q 'VK AdSkip Universal' "$SCRIPT";then
     if [ -f "$BKP" ] || [ -f "$STATE/had-none" ];then
        echo "ERROR: Unrelated script changed after backup; refusing overwrite";exit 2
     fi
     cp -p "$SCRIPT" "$BKP";chmod 600 "$BKP"
  elif [ ! -f "$SCRIPT" ] && [ ! -f "$BKP" ] && [ ! -f "$STATE/had-none" ];then
     : > "$STATE/had-none"
  fi
  TMP="$SCRIPT.vkadskip.tmp.$$"
  trap 'rm -f "$TMP"' EXIT HUP INT TERM
  # Optional: restore this app version's icon font using TV's own existing TTF.
  FONT="$VK/styles/a569de1.ttf"
  if [ -s "$FONT" ] && command -v base64 >/dev/null 2>&1 &&
     [ -f "$APP/files/font-prefix.js" ] && [ -f "$APP/files/font-suffix.js" ];then
     cat "$APP/files/font-prefix.js" > "$TMP"
     base64 "$FONT" | tr -d '\r\n' >> "$TMP"
     cat "$APP/files/font-suffix.js" >> "$TMP"
  else
     : > "$TMP"
  fi
  cat "$APP/files/adskip.js" >> "$TMP"
  chmod 644 "$TMP"
  mv "$TMP" "$SCRIPT"
  trap - EXIT HUP INT TERM
  echo "INSTALLED. Restart VK Video to activate. Original font remains on TV."
  ;;
 uninstall)
  [ -f "$SCRIPT" ] || { echo "NOT INSTALLED";exit 0; }
  if ! grep -q 'VK AdSkip Universal' "$SCRIPT";then
     echo "ERROR: Current script is not ours; refusing to modify";exit 2
  fi
  if [ -f "$BKP" ];then
     cp -p "$BKP" "$SCRIPT"; rm -f "$BKP"
  elif [ -f "$STATE/had-none" ];then
     rm -f "$SCRIPT" "$STATE/had-none"
  else
     echo "ERROR: Cannot safely restore original script";exit 2
  fi
  echo "PREVIOUS SCRIPT RESTORED. Restart VK Video."
  ;;
 *)echo "Usage: install|status|uninstall";exit 2;;
esac
