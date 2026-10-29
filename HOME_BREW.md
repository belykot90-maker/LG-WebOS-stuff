# Our GitHub-only Homebrew repository

A separate Homebrew Channel app or web server is **not required**.

## Add repository

1. On a rooted LG TV with Homebrew Channel, open **Settings → Add repository**.
2. Enter:

```text
https://raw.githubusercontent.com/belykot90-maker/LG-WebOS-stuff/main/repo.json
```

3. Refresh the list. Choose one of the apps below, check compatibility and install.

## Available

- **AmneziaWG Universal v1.0.3** ([IPK release](https://github.com/belykot90-maker/LG-WebOS-stuff/releases/tag/awgu-v1.0.3)): own VPS `.conf`, rooted LG webOS 4.x / ARMv7; optional remote yellow-button hold toggle disabled by default.
- **VK AdSkip Universal v0.5.0** ([IPK release](https://github.com/belykot90-maker/LG-WebOS-stuff/releases/tag/vkadskip-v0.5.0)): rooted LG webOS, VK Video app required; test version on 2.4.76.

The JSON catalog's manifests and release files resolve to **GitHub-hosted** resources. Neither applications nor catalog requires visitors to connect to anyone's private VPS.

## Warning

Both apps are experimental. For VPN, a user-supplied compatible VPS/profile is necessary. The phone upload option uses unencrypted HTTP over the local network. For VK Video, changes to the app can break the ad skipping logic. Refer to app-specific READMEs and licenses.
