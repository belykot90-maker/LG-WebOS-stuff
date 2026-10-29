#!/bin/sh
# Toggle only this application's interface, never the user's private VPN.
D=/media/developer/.awgu
CTL="$D/vpn.sh"
notify(){
 /usr/bin/luna-send -n 1 -f -a webosbrew luna://com.webos.notification/createToast "{\"sourceId\":\"webosbrew\",\"message\":\"$1\"}" >/dev/null 2>&1 || true
}
state="$(/bin/sh "$CTL" status 2>/dev/null)"
case "$state" in
  BUSY*)notify 'AmneziaWG busy';exit 0;;
  ON*)/bin/sh "$CTL" disconnect >/dev/null 2>&1;;
  PARTIAL*)/bin/sh "$CTL" disconnect >/dev/null 2>&1;;
  *)/bin/sh "$CTL" connect >/dev/null 2>&1;;
esac
now="$(/bin/sh "$CTL" status 2>/dev/null)"
case "$now" in
 ON*)notify 'AmneziaWG ON';;
 OFF*)notify 'AmneziaWG OFF';;
 *)notify 'AmneziaWG check network';;
esac
exit 0
