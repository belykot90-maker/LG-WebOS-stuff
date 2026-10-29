# LG webOS Stuff

Open-source applications and utilities for rooted LG webOS TVs.

This GitHub repository contains **universal source projects only**, with documentation, tests and build scripts. Personal VPN servers, private network addresses, passwords, API credentials, and user VPN profiles do **not** belong here.

## Applications

| Project | Description | Compatibility | Status |
| --- | --- | --- | --- |
| [AmneziaWG Universal](apps/amneziawg-universal/README.md) | Configurable AmneziaWG VPN client for your own VPS | Rooted LG webOS 4.x / ARMv7; webOS 5.0+ not required | Public beta 1.0.1 |

Other universal applications can be added under `apps/` after review.

## Download and installation

Installable releases will be published under this repository's **GitHub Releases** when packaging and licensing checks are complete. Public Homebrew installation instructions will use GitHub-hosted assets, not a maintainer's private VPS.

## Privacy and security

Never commit user VPN configurations, endpoint details, server IP addresses, private keys or other secrets. AmneziaWG Universal's optional local import uses HTTP on a **trusted home network only**, because the profile includes a private key. DNS leak protection and IPv6 routing are not provided in this beta.

This is an independent community project, unaffiliated with LG, Amnezia VPN, or the webOS Homebrew team.
