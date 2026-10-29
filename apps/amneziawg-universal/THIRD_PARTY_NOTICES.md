# Third-party licenses and build provenance

The original TV frontend and management source of **AmneziaWG Universal** is MIT-licensed. Two independently maintained VPN components bundled in release IPKs have separate licenses and copyright notices:

- `amneziawg-tools` — **GPL-2.0**, upstream [amnezia-vpn/amneziawg-tools](https://github.com/amnezia-vpn/amneziawg-tools), tag `v3.1.20260812` (commit `ee0f0a9aa34ff0a0da4b3433b9512781cfe02843`).
- `amneziawg-go` — **MIT**, upstream [amnezia-vpn/amneziawg-go](https://github.com/amnezia-vpn/amneziawg-go), tag `v3.1.20260828` (commit `b5928efb6ca19f0153958460c3d141f04abc5c2e`).

GitHub Actions fetches those precise tags, verifies commit hashes, cross-compiles ARMv7 binaries, includes their license notices in the IPK, and attaches corresponding complete upstream source archives to the release. The original sources remain available under their upstream project licenses. Use the release sources and the workflow to reproduce the build.

The minimal `src/webOSTV.js` bridge is separately written MIT-licensed code; no original LG SDK JavaScript bundle is distributed in GitHub IPKs.

The Russian IPv4 prefix list is generated automatically from [RIPE NCC delegated statistics](https://ftp.ripe.net/pub/stats/ripencc/delegated-ripencc-latest), which can change over time. The list is not tied to the author's home network.

No personal AmneziaWG profile, private key, IP address or VPN server settings are part of the source distribution.

See also [upstream Go source](https://github.com/amnezia-vpn/amneziawg-go) and [upstream tools source](https://github.com/amnezia-vpn/amneziawg-tools).
