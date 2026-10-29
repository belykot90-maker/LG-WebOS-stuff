# LG webOS Stuff — public Homebrew apps

Open-source applications and tools for rooted **LG webOS** TVs. Every publicly listed installer is hosted on **GitHub Releases**, not on the maintainer's personal VPS.

## Available applications

| Application | Version | Platform | Details |
| --- | --- | --- | --- |
| [AmneziaWG Universal](apps/amneziawg-universal/README.md) | [v1.0.3 beta](https://github.com/belykot90-maker/LG-WebOS-stuff/releases/tag/awgu-v1.0.3) | Rooted **webOS 4.x / ARMv7**, no webOS 5.0+ required | Configurable VPN for **your own** AmneziaWG VPS, optional cold-boot autostart and yellow-button hold toggle |
| [VK AdSkip Universal](apps/vk-adskip/README.md) | [v0.5.0 beta](https://github.com/belykot90-maker/LG-WebOS-stuff/releases/tag/vkadskip-v0.5.0) | Rooted LG webOS; verified original VK Video 2.4.76 on webOS 4.x | Attempts to skip VK Video ads; can also restore missing player button icons using the font already installed with VK Video (not downloaded or shared). Backup and rollback included |

These two packages replace the separate *personal* VPN Controller / VPN Tools and VK AdSkip test installer. Those personal scripts are not published.

## Add our repository to LG Homebrew Channel

On your TV open **Homebrew Channel → Settings → Add repository** and paste:

```text
https://raw.githubusercontent.com/belykot90-maker/LG-WebOS-stuff/main/repo.json
```

Refresh applications. Both installable IPKs, manifests and icons are served via GitHub infrastructure.

## Important restrictions

- All apps are **experimental beta**. A working installation on one LG TV does not guarantee compatibility with every firmware or app version.
- AmneziaWG Universal requires **your own VPN server** and a native `.conf` profile; the publisher supplies no VPN service or account.
- The optional phone-to-TV upload for `.conf` uses local **unencrypted HTTP** with a short-lived code. Use only on a trusted LAN; anyone able to monitor that network could intercept the private key.
- There is no IPv6 tunnel, VPN kill switch or system DNS-leak protection in the VPN beta.
- The optional yellow remote hold listener is disabled by default, and may conflict with another remote key listener if enabled at the same time.
- VK AdSkip depends on third-party VK Video internals; ad detection is not guaranteed across future versions. No VK fonts or proprietary content are distributed.

## Source, tests and licensing

Source code, GitHub Actions builds and tests live in `apps/`. The AmneziaWG release includes pinned official upstream source archives for the separately licensed VPN binaries. Read each app's MIT license and third-party notices.

This is an independent community project, unaffiliated with LG, Amnezia VPN, VK or the webOS Homebrew team.
