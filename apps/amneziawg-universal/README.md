# AmneziaWG Universal for LG webOS 4.x

Independent, configurable AmneziaWG VPN client for **rooted LG webOS 4.x ARMv7**. The client uses a native `.conf` profile from the user's **own VPS**. webOS 5.0 or newer is **not required**.

**Status:** experimental beta v1.0.3. Profile parsing, on-TV storage and one-time local upload were tested on LG webOS 4.10.x / ARMv7 / Node.js 0.12.2. Connections to independent users' VPN servers and other TV models remain unverified.

## Install from Homebrew Channel

1. On a **rooted LG webOS 4.x / ARMv7** TV, open **Homebrew Channel → Settings → Add repository**.
2. Enter `https://raw.githubusercontent.com/belykot90-maker/LG-WebOS-stuff/main/repo.json` and refresh apps.
3. Find **AmneziaWG Universal — webOS 4.x** and choose Install.
4. Launch the app and select **Установить компоненты** to enable the client binaries.
5. Export a native AmneziaWG `.conf` from **your own** VPS and import it through the app.

**GitHub beta release:** [AmneziaWG Universal v1.0.3](https://github.com/belykot90-maker/LG-WebOS-stuff/releases/tag/awgu-v1.0.3). It contains the IPK, manifest, corresponding upstream sources and checksums.

For a reproducible source build, see `scripts/build_ipk.py`, `scripts/generate_ru_prefixes.py` and the GitHub release workflow.

## Configure your VPS profile

1. Set up a compatible AmneziaWG server on **your own** VPS.
2. Export a native AmneziaWG `.conf` file with `[Interface]` and `[Peer]`: `PrivateKey`, `Address`, `PublicKey`, `Endpoint`, `AllowedIPs = 0.0.0.0/0`, and the server's obfuscation parameters.
3. Install the app and its bundled ARMv7 dependencies on a supported rooted LG TV.
4. In the app, click **Upload .conf from phone**. On a phone/PC connected to the *same trusted LAN*, open the local address shown on the TV, choose the file and enter the temporary 8-digit code. The portal expires after five minutes.
5. Alternatively, paste the entire `.conf` text into the TV UI.
6. Select full IPv4 VPN routing or optional Russian IPv4 routes outside VPN; press VPN ON. Enable autostart only after testing. The optional long-press yellow remote shortcut is disabled until enabled explicitly; do not run it alongside another shortcut listener.

Private profiles are stored on the TV with restrictive file permissions, **not on GitHub**. The optional phone upload uses **unencrypted HTTP over LAN**, so anyone able to monitor the LAN could capture the private key. Use it only on a trusted private network, or transfer over SSH/SFTP instead.

## Features

- User-configurable VPS host/port and credentials: no author-specific IP addresses or profiles are embedded.
- Independent VPN interface `awgu0` and config directory `/media/developer/.awgu`.
- Optional Homebrew cold-boot startup hook.
- Optional long-press yellow remote key toggle (Linux event code 400, 1250ms), disabled by default. Actual remote keycodes may vary across devices.
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

Original application source: MIT (see LICENSE). Public IPKs include upstream `amneziawg-tools` (GPL-2.0) and `amneziawg-go` (MIT) compiled from pinned upstream tags in GitHub Actions. The release includes both source archives and license notices. The minimal webOS service bridge is original MIT-licensed code, not a redistributed LG SDK library. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Русский

Универсальный AmneziaWG-клиент для **LG webOS 4.x (ARMv7)** с root и Homebrew Channel. Требует собственный VPS и файл `.conf`. Не нужен webOS 5.0+. Конфигурация импортируется с телефона по локальному адресу телевизора и одноразовому коду или вставкой текста в интерфейсе. При использовании локального HTTP-портала ключ передаётся без шифрования, поэтому необходима доверенная домашняя сеть.

Это экспериментальная версия 1.0.2. Исходники и готовый установочный IPK уже доступны в GitHub Releases, а пакет добавлен в отдельный GitHub-репозиторий для Homebrew Channel. Личный VPS автора в распространении не участвует.
