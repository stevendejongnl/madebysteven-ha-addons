# Dude, Where's My Package? — Changelog

## [dwmp-v2.6.0](https://github.com/stevendejongnl/madebysteven-ha-addons/compare/dwmp-v2.5.0...dwmp-v2.6.0) (2026-04-14)

### Features

* **dwmp:** bump upstream image to v1.24.0 ([#13](https://github.com/stevendejongnl/madebysteven-ha-addons/issues/13)) ([6ba7c70](https://github.com/stevendejongnl/madebysteven-ha-addons/commit/6ba7c70fb6615e1bb817fa9a6dcedeefbc0c3648))

## [dwmp-v2.5.0](https://github.com/stevendejongnl/madebysteven-ha-addons/compare/dwmp-v2.4.0...dwmp-v2.5.0) (2026-04-14)

### Features

* **dwmp:** bump upstream image to v1.23.0 ([#12](https://github.com/stevendejongnl/madebysteven-ha-addons/issues/12)) ([68b6de0](https://github.com/stevendejongnl/madebysteven-ha-addons/commit/68b6de0136a5c07d6a1b98dcb7d26bc8f2e32dff))

## [dwmp-v2.4.0](https://github.com/stevendejongnl/madebysteven-ha-addons/compare/dwmp-v2.3.3...dwmp-v2.4.0) (2026-04-14)

### Features

* **dwmp:** bump upstream image to v1.22.0 ([#11](https://github.com/stevendejongnl/madebysteven-ha-addons/issues/11)) ([2e31ce6](https://github.com/stevendejongnl/madebysteven-ha-addons/commit/2e31ce62af7a5b03023761c99eb3764fdd126355))

## [dwmp-v2.3.3](https://github.com/stevendejongnl/madebysteven-ha-addons/compare/dwmp-v2.3.2...dwmp-v2.3.3) (2026-04-14)

### Bug Fixes

* **dwmp:** bump upstream image to v1.21.3 ([#10](https://github.com/stevendejongnl/madebysteven-ha-addons/issues/10)) ([49f2e28](https://github.com/stevendejongnl/madebysteven-ha-addons/commit/49f2e28f749a35e961ff46b1528acbddb75d893d))

## [dwmp-v2.3.2](https://github.com/stevendejongnl/madebysteven-ha-addons/compare/dwmp-v2.3.1...dwmp-v2.3.2) (2026-04-14)

### Bug Fixes

* **dwmp:** bump upstream image to v1.21.2 ([#9](https://github.com/stevendejongnl/madebysteven-ha-addons/issues/9)) ([6a4bb62](https://github.com/stevendejongnl/madebysteven-ha-addons/commit/6a4bb62d1d8215b38c811d1050dd9047dafa6516))

## [dwmp-v2.3.1](https://github.com/stevendejongnl/madebysteven-ha-addons/compare/dwmp-v2.3.0...dwmp-v2.3.1) (2026-04-13)

### Bug Fixes

* **dwmp:** bump upstream image to v1.21.1 ([#8](https://github.com/stevendejongnl/madebysteven-ha-addons/issues/8)) ([daa8913](https://github.com/stevendejongnl/madebysteven-ha-addons/commit/daa89133dd53300019e6677d43bf6d79bf309e54))

## [dwmp-v2.3.0](https://github.com/stevendejongnl/madebysteven-ha-addons/compare/dwmp-v2.2.1...dwmp-v2.3.0) (2026-04-13)

### Features

* **dwmp:** bump upstream image to v1.21.0 ([#7](https://github.com/stevendejongnl/madebysteven-ha-addons/issues/7)) ([165a98d](https://github.com/stevendejongnl/madebysteven-ha-addons/commit/165a98db0299dc9705de464a25c5ff51aaa58c22))

## [dwmp-v2.2.1](https://github.com/stevendejongnl/madebysteven-ha-addons/compare/dwmp-v2.2.0...dwmp-v2.2.1) (2026-04-13)

### Bug Fixes

* **dwmp:** bump upstream image to v1.20.1 ([#6](https://github.com/stevendejongnl/madebysteven-ha-addons/issues/6)) ([774213b](https://github.com/stevendejongnl/madebysteven-ha-addons/commit/774213bd91bbfc8db005ec5c96cd1a803f0897f8))

## [dwmp-v2.2.0](https://github.com/stevendejongnl/madebysteven-ha-addons/compare/dwmp-v2.1.0...dwmp-v2.2.0) (2026-04-13)

### Features

* **dwmp:** bump upstream image to v1.20.0 ([#5](https://github.com/stevendejongnl/madebysteven-ha-addons/issues/5)) ([94f3702](https://github.com/stevendejongnl/madebysteven-ha-addons/commit/94f3702d741226862ab74c33d7d3865e6759bcc1))

## [dwmp-v2.1.0](https://github.com/stevendejongnl/madebysteven-ha-addons/compare/dwmp-v2.0.0...dwmp-v2.1.0) (2026-04-13)

### Features

* **dwmp:** bump upstream image to v1.19.0 ([#4](https://github.com/stevendejongnl/madebysteven-ha-addons/issues/4)) ([5db9a6d](https://github.com/stevendejongnl/madebysteven-ha-addons/commit/5db9a6d394259940df76178ee5b8c4648038138d))

## [dwmp-v2.0.0](https://github.com/stevendejongnl/madebysteven-ha-addons/compare/dwmp-v1.1.0...dwmp-v2.0.0) (2026-04-13)

### ⚠ BREAKING CHANGES

* **dwmp:** the `password` addon option has been removed. The addon now
delegates authentication to Home Assistant's ingress — anyone reaching the
sidebar is already an authenticated HA user. Any value previously set for
`password` in options.json is ignored; the stale argon2 hash cache at
/data/pw.hash is cleaned up on first run.

### Features

* **dwmp:** remove password option, rely on HA ingress for auth ([dd96460](https://github.com/stevendejongnl/madebysteven-ha-addons/commit/dd96460e89a24ba431b21c39e17b55ef66365e38))

## [dwmp-v1.1.0](https://github.com/stevendejongnl/madebysteven-ha-addons/compare/dwmp-v1.0.4...dwmp-v1.1.0) (2026-04-13)

### Features

* **dwmp:** bump upstream image to v1.18.0 ([#3](https://github.com/stevendejongnl/madebysteven-ha-addons/issues/3)) ([940ea95](https://github.com/stevendejongnl/madebysteven-ha-addons/commit/940ea95ed8b62f8ab5428d8ece5fc38ec9e67daa))

## [dwmp-v1.0.4](https://github.com/stevendejongnl/madebysteven-ha-addons/compare/dwmp-v1.0.3...dwmp-v1.0.4) (2026-04-13)

### Bug Fixes

* **dwmp:** bump upstream image to v1.17.3 ([#2](https://github.com/stevendejongnl/madebysteven-ha-addons/issues/2)) ([6c18537](https://github.com/stevendejongnl/madebysteven-ha-addons/commit/6c1853775c9d0c83ea87fd1ff1ce8cc287bec004))

## [dwmp-v1.0.3](https://github.com/stevendejongnl/madebysteven-ha-addons/compare/dwmp-v1.0.2...dwmp-v1.0.3) (2026-04-13)

### Bug Fixes

* **dwmp:** bump upstream image to v1.17.2 ([#1](https://github.com/stevendejongnl/madebysteven-ha-addons/issues/1)) ([24ff3b6](https://github.com/stevendejongnl/madebysteven-ha-addons/commit/24ff3b6da6a161ca87b624908646e46982d2af62))

## [dwmp-v1.0.2](https://github.com/stevendejongnl/madebysteven-ha-addons/compare/dwmp-v1.0.1...dwmp-v1.0.2) (2026-04-13)

### Bug Fixes

* **dwmp:** bump upstream pin to 1.17.1 for StaticFiles mount fix ([73cf150](https://github.com/stevendejongnl/madebysteven-ha-addons/commit/73cf150b183c598e1596f30b50c76d3b9071a4e6))

## [dwmp-v1.0.1](https://github.com/stevendejongnl/madebysteven-ha-addons/compare/dwmp-v1.0.0...dwmp-v1.0.1) (2026-04-13)

### Bug Fixes

* **dwmp:** bump upstream pin to 1.16.0 for HA-ingress prefix support ([9af1199](https://github.com/stevendejongnl/madebysteven-ha-addons/commit/9af1199bca7918f7161d576dac56d986229ebbb2))

## dwmp-v1.0.0 (2026-04-13)

### Features

* **dwmp:** wrap dude-wheres-my-package as Home Assistant addon ([675f377](https://github.com/stevendejongnl/madebysteven-ha-addons/commit/675f37799955bb0da0b2cc7f402a47ac674167ab))
