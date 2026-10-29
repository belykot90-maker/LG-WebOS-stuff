#!/bin/sh
# Configurable, fail-open IPv4 AmneziaWG controller for rooted LG webOS 4.x ARMv7.
# Operates on AWGU0/proto 187 only; never modifies the user's existing LG VPN.
set -u
D=/media/developer/.awgu
B=$D/bin
IF=awgu0
SETTINGS=$D/settings.sh
CONF=$D/wire.conf
LOCK=$D/operation.lock
LOG=$D/vpn.log
DNSPROBE=1.1.1.1
mkdir -p "$D"
log(){ printf '%s %s\n' "$(date '+%F %T')" "$*" >> "$LOG"; }
load(){
 [ -f "$SETTINGS" ] && [ -f "$CONF" ] || { echo 'NO PROFILE'; return 1; }
 . "$SETTINGS"
 [ -n "${AWGU_ADDRESS:-}" ] && [ -n "${AWGU_HOST:-}" ] && [ -n "${AWGU_PORT:-}" ] || { echo 'INCOMPLETE PROFILE'; return 1; }
}
is_on(){ ip -4 route show default | grep -q "dev $IF"; }
status(){
 if [ -d "$LOCK" ];then echo BUSY;return;fi
 if is_on;then echo 'ON';elif ip link show "$IF" >/dev/null 2>&1;then echo 'PARTIAL';else echo 'OFF';fi
}
restore_default(){
 if [ -f "$D/last-lan" ];then
  read LAN_DEV LAN_GW < "$D/last-lan"
  if [ -n "$LAN_DEV" ] && [ -n "$LAN_GW" ] && [ "$LAN_GW" != '-' ];then
   ip -4 route replace default via "$LAN_GW" dev "$LAN_DEV" >/dev/null 2>&1 || true
  fi
 fi
}
clean(){
 if is_on;then restore_default;fi
 ip -4 route flush proto 187 >/dev/null 2>&1 || true
 if [ -f "$D/endpoint-ip" ] && [ -f "$D/last-lan" ];then
  IP="$(cat "$D/endpoint-ip")"
  read LAN_DEV LAN_GW < "$D/last-lan"
  ip -4 route del "$IP/32" via "$LAN_GW" dev "$LAN_DEV" 2>/dev/null || true
 fi
 if [ -f "$D/probe-ip" ];then
  PROBE="$(cat "$D/probe-ip")"
  ip -4 route del "$PROBE/32" dev "$IF" 2>/dev/null || true
 fi
 ip link del "$IF" 2>/dev/null || true
 if [ -f "$D/daemon.pid" ];then
  kill "$(cat "$D/daemon.pid")" 2>/dev/null || true
  rm -f "$D/daemon.pid"
 fi
 rm -f "$D/endpoint-ip" "$D/probe-ip" "$D/last-lan" "$D/active-wire.conf"
}
failure(){ log "FAILED $*";clean;echo "ERROR $*";exit 1; }
connect(){
 mkdir "$LOCK" 2>/dev/null || { echo 'BUSY';return 0; }
 trap 'rmdir "$LOCK" 2>/dev/null' EXIT HUP INT TERM
 if is_on;then echo ON;return 0;fi
 if ip link show "$IF" >/dev/null 2>&1;then clean;fi
 load || return 2
 [ -x "$B/awg" ] && [ -x "$B/amneziawg-go" ] || { echo 'MISSING ARMv7 BINARIES';return 2; }
 # Do not interfere with a different VPN already controlling the default route.
 DEF="$(ip -4 route show default | head -1)"
 LAN_DEV="$(printf '%s\n' "$DEF" | awk '{for(i=1;i<=NF;i++)if($i=="dev")print $(i+1)}' | head -1)"
 LAN_GW="$(printf '%s\n' "$DEF" | awk '{for(i=1;i<=NF;i++)if($i=="via")print $(i+1)}' | head -1)"
 if [ -z "$LAN_DEV" ] || [ -z "$LAN_GW" ];then echo 'ERROR: Direct LAN gateway required. Disconnect other VPNs first.';return 2;fi
 if [ "$LAN_DEV" = "$IF" ];then echo 'BUSY';return 0;fi
 printf '%s %s\n' "$LAN_DEV" "$LAN_GW" > "$D/last-lan"
 chmod 600 "$D/last-lan"
 case "$AWGU_HOST" in
  *[!0-9.]*)
   EP_IP="$(getent ahostsv4 "$AWGU_HOST" 2>/dev/null | awk '$1 ~ /^[0-9]+\./ {print $1; exit}')"
   if [ -z "$EP_IP" ];then
    EP_IP="$(getent hosts "$AWGU_HOST" 2>/dev/null | awk '$1 ~ /^[0-9]+\./ {print $1; exit}')"
   fi
   ;;
  *) EP_IP="$AWGU_HOST" ;;
 esac
 case "$EP_IP" in
   ''|*[!0-9.]*) failure 'Could not resolve IPv4 VPN server';;
 esac
 printf '%s\n' "$EP_IP" > "$D/endpoint-ip"
 # awg setconf resolves a peer address itself; pin its chosen IP to our bypass route.
 sed "s/^[[:space:]]*Endpoint[[:space:]]*=.*/Endpoint = $EP_IP:$AWGU_PORT/" "$CONF" > "$D/active-wire.conf"
 chmod 600 "$D/active-wire.conf"
 ip -4 route replace "$EP_IP/32" via "$LAN_GW" dev "$LAN_DEV" || failure 'Endpoint route'
 nohup "$B/amneziawg-go" -f "$IF" </dev/null >"$D/daemon.log" 2>&1 &
 echo $! > "$D/daemon.pid"
 sleep 2
 ip link show "$IF" >/dev/null 2>&1 || failure 'VPN tunnel device not available'
 "$B/awg" setconf "$IF" "$D/active-wire.conf" >/dev/null 2>&1 || failure 'AmneziaWG rejected profile'
 ip -4 addr add "$AWGU_ADDRESS" dev "$IF" || failure 'Interface address'
 ip link set "$IF" mtu "$AWGU_MTU" up || failure 'Interface activation'
 case "${AWGU_DNS:-}" in
  ''|"$EP_IP") PROBE=1.1.1.1;;
  *) PROBE="$AWGU_DNS";;
 esac
 if [ "$PROBE" = "$EP_IP" ];then PROBE=9.9.9.9;fi
 printf '%s\n' "$PROBE" > "$D/probe-ip"
 ip -4 route replace "$PROBE/32" dev "$IF" || failure 'Handshake probe route'
 HSOK=0
 I=0
 while [ "$I" -lt 10 ];do
  ping -c 1 -W 1 -I "$IF" "$PROBE" >/dev/null 2>&1 || true
  HS="$("$B/awg" show "$IF" latest-handshakes 2>/dev/null | awk '{print $2}' | head -1)"
  if [ -n "$HS" ] && [ "$HS" != 0 ];then HSOK=1;break;fi
  I=$((I+1));sleep 1
 done
 [ "$HSOK" -eq 1 ] || failure 'No VPN handshake. Check profile and VPS'
 # The probe can be removed before enabling the full IPv4 default route.
 ip -4 route del "$PROBE/32" dev "$IF" 2>/dev/null || true
 rm -f "$D/probe-ip"
 if [ "${AWGU_MODE:-full}" = ru ];then
   [ -r "$D/ru-ipv4.txt" ] || failure 'RU prefix list missing'
   awk -v gw="$LAN_GW" -v lan="$LAN_DEV" ' /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+\/[0-9]+$/ {print "route replace "$0" via "gw" dev "lan" proto 187"}' "$D/ru-ipv4.txt" > "$D/ru-routes.tmp"
   [ "$(wc -l < "$D/ru-routes.tmp")" -ge 1000 ] || failure 'Invalid RU prefix list'
   ip -batch "$D/ru-routes.tmp" >> "$LOG" 2>&1 || failure 'Failed RU routes'
   rm -f "$D/ru-routes.tmp"
 fi
 ip -4 route replace default dev "$IF" || failure 'Default VPN route'
 log 'VPN ON'
 echo ON
}
disconnect(){
 mkdir "$LOCK" 2>/dev/null || { echo 'BUSY';return 0; }
 trap 'rmdir "$LOCK" 2>/dev/null' EXIT HUP INT TERM
 clean
 log 'VPN OFF'
 echo OFF
}
case "${1:-status}" in
 status)status;;
 connect)connect;;
 disconnect)disconnect;;
 *)echo 'ERROR: unknown action';exit 2;;
esac
