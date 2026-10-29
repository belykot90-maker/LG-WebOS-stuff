# AmneziaWG Universal for LG webOS 4.x

Independent, configurable AmneziaWG VPN client for **rooted LG webOS 4.x ARMv7**. The client uses a native `.conf` profile from the user's **own VPS**. webOS 5.0 or newer is **not required**.

**Status:** experimental beta v1.0.1. Profile parsing, on-TV storage and one-time local upload were tested on LG webOS 4.10.x / ARMv7 / Node.js 0.12.2. Connections to independent users' VPN servers and other TV models remain unverified.

## Install

When GitHub-hosted installable assets are available, add this [GitHub Homebrew repository](../../repo.json) to the Homebrew Channel using the URL in [HOME_BREW.md](../../HOME_BREW.md). There is currently **no GitHub-hosted installable release**; the repository catalog is intentionally empty. Do not use someone's private VPN infrastructure for distribution.

For a source build, see `scripts/build_ipk.py` and the third-party notices.

## Configure your VPS profile

1. Set up a compatible AmneziaWG server on **your own** VPS.
2. Export a native AmneziaWG `.conf` file with `[Interface]` and `[Peer]`: `PrivateKey`, `Address`, `PublicKey`, `Endpoint`, `AllowedIPs = 0.0.0.0/0`, and the server's obfuscation parameters.
3. Install the app and its bundled ARMv7 dependencies on a supported rooted LG TV.
4. In the app, click **Upload .conf from phone**. On a phone/PC connected to the *same trusted LAN*, open the local address shown on the TV, choose the file and enter the temporary 8-digit code. The portal expires after five minutes.
5. Alternatively, paste the entire `.conf` text into the TV UI.
6. Select full IPv4 VPN routing or optional Russian IPv4 routes outside VPN; press VPN ON. Enable autostart only after testing.

Private profiles are stored on the TV with restrictive file permissions, **not on GitHub**. The optional phone upload uses **unencrypted HTTP over LAN**, so anyone able to monitor the LAN could capture the private key. Use it only on a trusted private network, or transfer over SSH/SFTP instead.

## Features

- User-configurable VPS host/port and credentials: no author-specific IP addresses or profiles are embedded.
- Independent VPN interface `awgu0` and config directory `/media/developer/.awgu`.
- Optional Homebrew cold-boot startup hook.
- Fail-open behavior: in case of handshake failure, ordinary Internet remains available.
- Single peer; IPv4 only. No IPv6 protection and no system DNS configuration changes; DNS leaks may occur.
- Tested on LG webOS 4.10.x (ARMv7); other versions and architectures are **not verified**.

## Source tree

- `src/index.html` — TV user interface.
- `src/manager.js` — AmneziaWG profile validation and local storage.
- `src/portal.js`, `portal.html`, `portal.sh` — temporary LAN upload.
- `src/vpn.sh` — tunnel management; `boot.sh`, `boot-worker.sh` — optional autostart.
- `src/install.sh` — system integration.
- `scripts/build_ipk.py` — offline IPK packager.
- `tests/test_profile.py` — synthetic-profile validation.

## Licensing and third-party code

Original application source: MIT (see LICENSE). AmneziaWG binaries and LG SDK components are **not included in the GitHub source tree**, and must be obtained, built and distributed in accordance with their own terms. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). The source packager requires external vendor inputs.

## Русский

Универсальный AmneziaWG-клиент для **LG webOS 4.x (ARMv7)** с root и Homebrew Channel. Требует собственный VPS и файл `.conf`. Не нужен webOS 5.0+. Конфигурация импортируется с телефона по локальному адресу телевизора и одноразовому коду или вставкой текста в интерфейсе. При использовании локального HTTP-портала ключ передаётся без шифрования, поэтому необходима доверенная домашняя сеть.

Это экспериментальная версия. Исходники размещены на GitHub; установочные файлы будут публиковаться здесь отдельно после проверки сборки и лицензий, без использования чьего-либо личного сервера.
