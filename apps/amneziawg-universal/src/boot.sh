#!/bin/sh
# Nonblocking Homebrew startup hook; runs only with user-approved autostart.
D=/media/developer/.awgu
[ -r "$D/settings.sh" ] || exit 0
. "$D/settings.sh"
[ "${AWGU_AUTO:-0}" = 1 ] || exit 0
[ -r "$D/wire.conf" ] || exit 0
if [ -f /tmp/awgu-boot.pid ] && kill -0 "$(cat /tmp/awgu-boot.pid)" 2>/dev/null;then exit 0;fi
nohup /bin/sh "$D/boot-worker.sh" </dev/null >>"$D/boot.log" 2>&1 &
echo $! >/tmp/awgu-boot.pid
exit 0
