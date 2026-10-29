# GitHub-hosted Homebrew repository for rooted LG webOS

You can add this existing GitHub repository directly to the standard **LG Homebrew Channel**. No new Homebrew Channel application or personal web server is required.

## Repository URL

```text
https://raw.githubusercontent.com/belykot90-maker/LG-WebOS-stuff/main/repo.json
```

On the TV: Homebrew Channel → **Settings → Add repository** → paste the URL → refresh applications.

## Available public app

**AmneziaWG Universal v1.0.2 (beta)** — for rooted LG webOS **4.x / ARMv7**, no webOS 5.0 requirement. Download and accompanying source code are stored at [GitHub Releases](https://github.com/belykot90-maker/LG-WebOS-stuff/releases/tag/awgu-v1.0.2).

The JSON catalog in this repository provides only GitHub-hosted manifest URLs. The manifests point to GitHub-hosted IPK packages. The user provides their own VPS and VPN profile.

## Notes

- This is an **experimental** release, not a verified production VPN client.
- Requires own compatible AmneziaWG server and native `.conf` file.
- Private keys are never uploaded to GitHub or to the maintainer's server.
- Importing through the optional local HTTP portal is **unencrypted**; use it only on your own trusted LAN, or use an encrypted transfer option.
- Existing personal/private deployment URLs are not included here.

Further universal LG webOS apps can be added to this same catalog.
