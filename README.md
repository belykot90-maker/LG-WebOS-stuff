# LG webOS Stuff

Open-source universal applications and utilities for rooted LG webOS TVs. All public downloads are hosted on **GitHub**. No personal VPN server or private profile is used for distribution.

## Applications

| Application | Compatibility | Version | Download |
| --- | --- | --- | --- |
| [AmneziaWG Universal](apps/amneziawg-universal/README.md) | LG webOS **4.x**, ARMv7, root, Homebrew Channel; **does not require webOS 5.0+** | **1.0.2 beta** | [GitHub Release](https://github.com/belykot90-maker/LG-WebOS-stuff/releases/tag/awgu-v1.0.2) |

Additional independent, universal apps may be added under `apps/` after testing.

## Add repository to LG Homebrew Channel

In **Homebrew Channel → Settings → Add repository**, enter:

```text
https://raw.githubusercontent.com/belykot90-maker/LG-WebOS-stuff/main/repo.json
```

Then refresh the app list. The catalog points exclusively to **GitHub Releases**. No separate Homebrew Channel app or server is necessary.

## AmneziaWG Universal limitations

This experimental beta requires your **own** AmneziaWG VPS and configuration file (`.conf`). The private file is stored locally on your TV. The optional upload from a phone uses unencrypted HTTP on the local network; use only on a trusted LAN or choose an SSH/SFTP import. IPv6 tunneling and system DNS-leak protection are not provided. Compatibility is confirmed for the tested LG webOS 4.10 ARMv7 environment, but a full VPN connection to an independent user's server remains unverified.

## Source and license

The application source is published here under MIT; bundled official upstream AmneziaWG components keep their own GPL-2.0 and MIT terms. Every GitHub release includes a corresponding-source archive for the pinned upstream dependencies. [Licenses and notices](apps/amneziawg-universal/THIRD_PARTY_NOTICES.md).

This is an independent community project unaffiliated with LG, Amnezia VPN or the webOS Homebrew project.
