# Third-party notices / licenses

The application source here is independent of the third-party AmneziaWG implementation. **Do not interpret the MIT license of this repository as changing third-party licenses.**

The published Homebrew IPK contains ARMv7 builds of the following separate dependencies. Redistribution and release processes must satisfy their terms:

- **amneziawg-tools** (`awg`), v3.1.20260812 — GPL-2.0. Upstream source: https://github.com/amnezia-vpn/amneziawg-tools (tag `v3.1.20260812`). Source license: https://github.com/amnezia-vpn/amneziawg-tools/blob/master/COPYING . When distributing the binary, comply with GPL-2.0 source-code obligations and preserve original license and copyright notices.
- **amneziawg-go** (`amneziawg-go`) — MIT. Upstream source and LICENSE: https://github.com/amnezia-vpn/amneziawg-go . Preserve copyright and full MIT permission notice when distributing.
- **LG webOSTV.js** is part of LG's webOS TV platform SDK. This repository intentionally does not redistribute the SDK file; obtain it from the official SDK and follow its terms.
- **Russian IPv4 prefix list** is generated from externally maintained address allocation data. Its accuracy and redistribution terms need to be reviewed for a production release.

The separately published Homebrew IPK is a test build. Before describing a GitHub release as reproducible or redistributing new builds, identify the exact source commits, toolchain, and build inputs used for both binaries, provide the corresponding GPL source, and verify binary provenance. Do not assume the binaries were built from current upstream master.

Sources:
- https://github.com/amnezia-vpn/amneziawg-tools
- https://github.com/amnezia-vpn/amneziawg-go
- https://github.com/webosbrew/webos-homebrew-channel
