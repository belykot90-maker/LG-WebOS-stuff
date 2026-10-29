# VK AdSkip Universal for LG webOS

Experimental independent community add-on for the **VK Video** application on rooted LG webOS TVs. This is not an official VK product.

## Install from Homebrew Channel

Add the public catalog:

```
https://raw.githubusercontent.com/belykot90-maker/LG-WebOS-stuff/main/repo.json
```

Install **VK AdSkip Universal**, open the installer, and choose **Установить / обновить**. The installed VK Video app is required. Restart VK Video after installing.

The add-on stores a previous `webOSUserScripts/userScript.js` backup on the TV, writes a new reversible script, and uses the VK app's **own** original icon font where available. No VK font, media content or proprietary app source is distributed.

## Supported versions

Tested only with VK Video 2.4.76 / LG webOS 4.10 on one TV. Behavior on other VK Video versions and webOS generations is **unverified**. Root and the Homebrew Channel are required. Changes to VK Video might break script injection, ad identification or icon rendering.

## Behavior and limitations

- Checks the player for currently recognized advertisement source and on-screen ad labels.
- Attempts HTML5 video seeking. It cannot guarantee all ads will be skipped and may not work against server-enforced ads.
- Temporarily hides and mutes a recognized ad; attempts to restore original visibility and volume if the guard times out.
- No telemetry, analytics or requests to external servers.
- **Откатить** restores the previous user script (or removes our script if there was none). It refuses to overwrite an unrelated script if changes were detected.
- Original VK Video files remain the property of their respective owners.

**Beta v0.5.0.** Designed as a standalone, non-VPN utility; no personal IP addresses, private keys or servers are required.

## Files

`src/adskip.js` — standalone browser-side ad handler. `src/install.sh` — safe root-level install/rollback. `src/font-prefix.js`, `font-suffix.js` — reconstruct original icon CSS only from a font already installed on the TV. `src/index.html` — remote control interface.
