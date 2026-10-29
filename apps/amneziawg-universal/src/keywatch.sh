#!/bin/sh
# Optional independent remote button listener for AWGU Universal only.
D=/media/developer/.awgu
PID=$D/keywatch.pid
case "${1:-status}" in
 start)
  [ -r "$D/settings.sh" ] || exit 0
  . "$D/settings.sh"
  [ "${AWGU_KEY:-0}" = 1 ] || exit 0
  [ -f "$D/keywatch.js" ] || exit 1
  if [ -r "$PID" ] && kill -0 "$(cat "$PID")" 2>/dev/null;then
    echo RUNNING;exit 0
  fi
  nohup /usr/bin/node "$D/keywatch.js" </dev/null >>"$D/keywatch.log" 2>&1 &
  echo $! > "$PID"
  echo STARTED
  ;;
 stop)
  if [ -r "$PID" ];then kill "$(cat "$PID")" 2>/dev/null || true;fi
  rm -f "$PID"
  echo STOPPED
  ;;
 status)
  if [ -r "$PID" ] && kill -0 "$(cat "$PID")" 2>/dev/null;then echo RUNNING;else echo OFF;fi
  ;;
 *)echo 'Usage: start|stop|status';exit 2;;
esac
