# Changelog

All notable changes to this project will be documented in this file.

## [0.2.2](https://github.com/inference-gateway/skills/compare/v0.2.1...v0.2.2) (2026-06-08)

### 🐛 Bug Fixes

* **maintainer:** emit issue-Type mutation as a single CI-safe line ([#30](https://github.com/inference-gateway/skills/issues/30)) ([57e9c8b](https://github.com/inference-gateway/skills/commit/57e9c8bde16bc4ec27c1c7a60e3ea239046c3a8e))

### 🔧 Miscellaneous

* **deps:** bump claude-code 2.1.158 -> 2.1.161 ([#28](https://github.com/inference-gateway/skills/issues/28)) ([fcacaed](https://github.com/inference-gateway/skills/commit/fcacaed26d86a054d4bbad2b6c3b886ec8ef51cf))
* **deps:** bump codex 0.133.0 -> 0.135.0 ([#24](https://github.com/inference-gateway/skills/issues/24)) ([8102eef](https://github.com/inference-gateway/skills/commit/8102eef5d330b39b304a1846c156608ed6db76f5))
* **deps:** bump infer CLI v0.117.1 -> v0.119.0, infer-action v0.11.2 -> v0.11.4 ([#25](https://github.com/inference-gateway/skills/issues/25)) ([041d067](https://github.com/inference-gateway/skills/commit/041d0674febceaa877876e38d258e7ee399900ff))
* **deps:** bump infer CLI v0.119.0 -> v0.120.0, infer-action v0.11.4 -> v0.11.6 ([#26](https://github.com/inference-gateway/skills/issues/26)) ([b17c46a](https://github.com/inference-gateway/skills/commit/b17c46a28a524732ecb5cdf095fa3a7fd4fba424))
* **deps:** bump infer CLI v0.120.0 -> v0.120.1, infer-action v0.11.6 -> v0.11.7 ([#27](https://github.com/inference-gateway/skills/issues/27)) ([ef10d24](https://github.com/inference-gateway/skills/commit/ef10d240097d58ad89a48e91914e81b6e0b0fba8))
* **deps:** bump infer CLI v0.120.1 -> v0.121.0 ([#29](https://github.com/inference-gateway/skills/issues/29)) ([4fd43c7](https://github.com/inference-gateway/skills/commit/4fd43c7f97b42ab08fba23f6b3e2b79e1970da36))

## [0.2.1](https://github.com/inference-gateway/skills/compare/v0.2.0...v0.2.1) (2026-06-05)

### ♻️ Improvements

* remove local skill config ([3c630cb](https://github.com/inference-gateway/skills/commit/3c630cb289a65480f7d08e6539976e7c0c4946dc))

### 🐛 Bug Fixes

* **ci:** add generated files to markdownlint ignore file ([6ef1432](https://github.com/inference-gateway/skills/commit/6ef143215081659f5aeb1f217e87598fa574eaf1))

### 👷 CI

* centralize claude.yml via reusable workflow ([#11](https://github.com/inference-gateway/skills/issues/11)) ([1590bfe](https://github.com/inference-gateway/skills/commit/1590bfe681cab51e9b0e2274080b7ebda34e8888))
* centralize claude.yml via reusable workflow ([#12](https://github.com/inference-gateway/skills/issues/12)) ([925f2eb](https://github.com/inference-gateway/skills/commit/925f2eb0c88a7724f1455c8d541e94563cf168aa))
* centralize claude.yml via reusable workflow ([#13](https://github.com/inference-gateway/skills/issues/13)) ([b5d98ce](https://github.com/inference-gateway/skills/commit/b5d98ce4c3c1fcc673de5457b7e02b1aa7a30432))
* centralize claude.yml via reusable workflow ([#20](https://github.com/inference-gateway/skills/issues/20)) ([79343b0](https://github.com/inference-gateway/skills/commit/79343b083c497bafb813739bf504e2e1e93f9926))
* centralize infer.yml + bump infer CLI and sync .infer config ([#16](https://github.com/inference-gateway/skills/issues/16)) ([ca70958](https://github.com/inference-gateway/skills/commit/ca70958b43a643dd2cafcde2aecabf8c2976cc97))
* centralize infer.yml + sync .infer config ([#15](https://github.com/inference-gateway/skills/issues/15)) ([ff7ff65](https://github.com/inference-gateway/skills/commit/ff7ff653c7322d40f69a77182c1761412e8f2e0a))
* centralize infer.yml via reusable workflow ([#14](https://github.com/inference-gateway/skills/issues/14)) ([5fe9fb4](https://github.com/inference-gateway/skills/commit/5fe9fb41e94907b4bf651b2991486450415d647a))
* **claude:** add docs and refactor branch prefixes ([213ab5e](https://github.com/inference-gateway/skills/commit/213ab5eee602581578152a2b03d34db313e53e0a))
* **claude:** download all maintainer skill assets ([e09114e](https://github.com/inference-gateway/skills/commit/e09114e3a6cca287191b779ce0a1a5e23761f829))
* **claude:** standardize workflow + task-based branch prefix ([#8](https://github.com/inference-gateway/skills/issues/8)) ([841528b](https://github.com/inference-gateway/skills/commit/841528baf632e866f2a99d7b02b2f62e1a91d843))
* **infer:** centralize infer.yml + bump infer CLI and sync .infer config ([#17](https://github.com/inference-gateway/skills/issues/17)) ([684b6d8](https://github.com/inference-gateway/skills/commit/684b6d87293a29c681e0f64b8e4a331a0bec85a2))
* use org reusable Claude Code workflow ([#9](https://github.com/inference-gateway/skills/issues/9)) ([3162e0c](https://github.com/inference-gateway/skills/commit/3162e0c54f2322d33edd0c798c3b3887ee953f06))

### 📚 Documentation

* add roadmap and issue tracking details ([7894adf](https://github.com/inference-gateway/skills/commit/7894adffc480b0be6c5989cd9a99a74e63917396))
* fix build-catalog and lint command descriptions ([#10](https://github.com/inference-gateway/skills/issues/10)) ([291fcdd](https://github.com/inference-gateway/skills/commit/291fcdd6d2fc0ac16db056fc87f15a68fcc26112))

### 🔧 Miscellaneous

* **deps:** bump actions/create-github-app-token ([#7](https://github.com/inference-gateway/skills/issues/7)) ([80f1605](https://github.com/inference-gateway/skills/commit/80f16055c1117ac503cb4030d66e250e228f58a0))
* **deps:** bump claude-code 2.1.148 -> 2.1.158 ([#19](https://github.com/inference-gateway/skills/issues/19)) ([f47976a](https://github.com/inference-gateway/skills/commit/f47976ad3f55ab15a6c8172b0455e37492df8595))
* **deps:** bump infer CLI v0.117.0 -> v0.117.1, infer-action v0.9.1 -> v0.11.1 ([#18](https://github.com/inference-gateway/skills/issues/18)) ([58ff485](https://github.com/inference-gateway/skills/commit/58ff485d8a8055767dbadfe2dd60b49d8adb1a43))
* **deps:** bump infer-action v0.11.1 -> v0.11.2 ([#22](https://github.com/inference-gateway/skills/issues/22)) ([04d978e](https://github.com/inference-gateway/skills/commit/04d978e32d7db33dd1b440dc22f0b78104eb5160))
* **deps:** bump the github-actions group across 1 directory with 2 updates ([#23](https://github.com/inference-gateway/skills/issues/23)) ([5148b5d](https://github.com/inference-gateway/skills/commit/5148b5da1903c8866d28ad1c3bf6d6db9d567429))

## [0.2.0](https://github.com/inference-gateway/skills/compare/v0.1.1...v0.2.0) (2026-05-28)

### ✨ Features

* **catalog:** Aggregate local skills + external skills.yaml into catalog.json ([#5](https://github.com/inference-gateway/skills/issues/5)) ([9237dcc](https://github.com/inference-gateway/skills/commit/9237dcc754d5bcc377591b77e058a35cbfd59964)), closes [#4](https://github.com/inference-gateway/skills/issues/4)

### ♻️ Improvements

* **maintainer:** compress maintainer skill and split it into multiple references ([ddf3f74](https://github.com/inference-gateway/skills/commit/ddf3f741e3918eb8f15380f1a411cf0b29c7ae6e))
* Remove low-code repository ([1406811](https://github.com/inference-gateway/skills/commit/1406811916927fa91b6dd7c605c8ce695bf08f33))

### 🐛 Bug Fixes

* **ci:** only trigger infer when actually needed ([665aa85](https://github.com/inference-gateway/skills/commit/665aa85c798d2b0ba7138ec26dc286bf3017df26))

### 👷 CI

* Add a pull request for new skills ([69bb9a2](https://github.com/inference-gateway/skills/commit/69bb9a2b1e31b6e37ce20a0c5f1f08d9e8b237df))
* **claude:** change effort to max ([f470e96](https://github.com/inference-gateway/skills/commit/f470e96e057e6aad886cbb8c6caca768446ab912))
* **claude:** remove system prompt - use default community maintained prompt ([8c7d3c3](https://github.com/inference-gateway/skills/commit/8c7d3c3bfd1d8aa15a807c8278ed9538459065d7))
* **deps:** Bump anthropics/claude-code-action  v1.0.131 -> v1.0.133 ([0ce0477](https://github.com/inference-gateway/skills/commit/0ce04771d9844ab3346ee9e053b4751058b07620))

### 🔧 Miscellaneous

* Delete AGENTS.md ([294bf53](https://github.com/inference-gateway/skills/commit/294bf53fb6fc0093adb5bab315e483e4b5cb6c86))
* **deps:** Bump dev dependecies ([e9e626f](https://github.com/inference-gateway/skills/commit/e9e626fc6b9787372bd7cbb52094eec93dd40da4))
* **deps:** Bump dev dependencies ([1084072](https://github.com/inference-gateway/skills/commit/10840726462e42e2a3cb4b1757a037f79ef6fd82))
* **docs:** Generate AGENTS.md file ([5a96f30](https://github.com/inference-gateway/skills/commit/5a96f3082d22861485974362182d9b1bd40c8ade))
* **docs:** Generate CLAUDE.md file ([f0f0cdb](https://github.com/inference-gateway/skills/commit/f0f0cdbac5cb26e9e38888aa2612a9891abdcb2b))
* Ensure no timestamp update if the content didn't change ([19132c6](https://github.com/inference-gateway/skills/commit/19132c6a41ebe6f24678901957d2e58f9d2a8e06))
* **flox:** Bump schema version ([db0b0d6](https://github.com/inference-gateway/skills/commit/db0b0d6a0e2ef1e842a53bc1f332f0ea032d7cb9))
* Remove CLAUDE.md file ([a0c6b0f](https://github.com/inference-gateway/skills/commit/a0c6b0fa7772182cc5f68b5b55eff8ac1af24e30))
* Replace em dashes with regular dashes ([d897091](https://github.com/inference-gateway/skills/commit/d89709165cde5867f596fdd7cfff5bb78d9f0b0a))
* run formatting ([ab07d35](https://github.com/inference-gateway/skills/commit/ab07d35e3ed0c98c1fbbd4f09cf3f837e55737ea))
* Use pinned version for ubuntu runner ([06dcf57](https://github.com/inference-gateway/skills/commit/06dcf5707030b60194fcbef51887bc63c7b028f1))

## [0.1.1](https://github.com/inference-gateway/skills/compare/v0.1.0...v0.1.1) (2026-05-24)

### 📚 Documentation

* **skills/adl:** Cover the v1 schema features the skill was missing ([17cd066](https://github.com/inference-gateway/skills/commit/17cd06669cceba64996e928474c7559c36f7d636))

### 🔧 Miscellaneous

* **deps:** Bump claude-code version 2.1.141 -> 2.1.145 ([6c23fc1](https://github.com/inference-gateway/skills/commit/6c23fc1621c9a82039b108ec27b35547fdeaa38e))
* **license:** Update license to Apache 2.0 ([16bccee](https://github.com/inference-gateway/skills/commit/16bcceeb479e0740577cd976b92e6903492df7df))
