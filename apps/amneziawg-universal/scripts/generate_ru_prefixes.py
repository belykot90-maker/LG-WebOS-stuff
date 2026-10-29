#!/usr/bin/env python3
"""Generate public Russian IPv4-prefix bypass list from RIPE NCC's delegated stats.

Source: https://ftp.ripe.net/pub/stats/ripencc/delegated-ripencc-latest
Contains no user addresses, credentials, or private network information.
"""
import ipaddress, pathlib, urllib.request, sys

URL="https://ftp.ripe.net/pub/stats/ripencc/delegated-ripencc-latest"

def generate(raw):
    nets=[]
    for line in raw.splitlines():
        parts=line.strip().split("|")
        if len(parts)<7 or parts[1].upper()!="RU" or parts[2]!="ipv4":
            continue
        if parts[6] not in ("allocated","assigned"):
            continue
        try:
            first=ipaddress.IPv4Address(parts[3])
            count=int(parts[4])
            if count < 1 or count > 2**32:
                continue
            last=ipaddress.IPv4Address(int(first)+count-1)
            nets.extend(ipaddress.summarize_address_range(first,last))
        except (ValueError,OverflowError):
            continue
    return [str(n) for n in ipaddress.collapse_addresses(nets)]

def main():
    dest=pathlib.Path(__file__).resolve().parents[1]/"vendor"/"ru-ipv4.txt"
    with urllib.request.urlopen(URL,timeout=40) as response:
        raw=response.read().decode("utf-8")
    prefixes=generate(raw)
    if len(prefixes)<1000:
        raise SystemExit("RIPE RU data validation failed: too few prefixes")
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_text("# Country RU, IPv4. Generated from RIPE NCC delegated stats.\n"+
                    "# Origin: "+URL+"\n"+
                    "\n".join(prefixes)+"\n",encoding="utf-8")
    print("Generated",len(prefixes),"RU IPv4 prefixes")
if __name__=="__main__":
    main()
