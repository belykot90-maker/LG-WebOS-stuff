#!/bin/sh
D=/media/developer/.awgu
echo "Startup worker: $(date)"
i=0
while [ "$i" -lt 35 ];do
 if ip -4 route show default | grep -q ' via ';then
   /bin/sh "$D/vpn.sh" connect
   exit $?
 fi
 i=$((i+1));sleep 2
done
echo 'No direct LAN gateway; no changes to network'
exit 0
