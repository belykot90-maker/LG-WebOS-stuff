#!/bin/sh
# Five-minute, single-use LAN config import service. Does not start VPN.
D=/media/developer/.awgu
PID=$D/portal.pid
INFO=$D/portal.info
case "${1:-start}" in
 start)
  [ -r "$D/manager.js" ] && [ -r "$D/portal.js" ] && [ -r "$D/portal.html" ] || { echo 'ERROR: Install components first'; exit 2; }
  if [ -r "$PID" ] && kill -0 "$(cat "$PID")" 2>/dev/null && [ -r "$INFO" ];then
   cat "$INFO";exit 0
  fi
  rm -f "$PID" "$INFO"
  nohup /usr/bin/node "$D/portal.js" </dev/null >>"$D/portal.log" 2>&1 &
  echo $! > "$PID"
  i=0
  while [ "$i" -lt 8 ];do
   [ -r "$INFO" ] && { cat "$INFO";exit 0; }
   kill -0 "$(cat "$PID")" 2>/dev/null || break
   i=$((i+1));sleep 1
  done
  echo 'ERROR: Could not start local upload portal. Check trusted LAN and port 38648.'
  exit 1
 ;;
 status)
  if [ -r "$INFO" ] && [ -r "$PID" ] && kill -0 "$(cat "$PID")" 2>/dev/null;then cat "$INFO"
  else echo 'OFF';fi
 ;;
 stop)
  if [ -r "$PID" ];then kill "$(cat "$PID")" 2>/dev/null || true;fi
  rm -f "$INFO" "$PID" "$D/import.conf"
  echo 'OFF'
 ;;
 *)echo 'Usage: start|status|stop';exit 2;;
esac
