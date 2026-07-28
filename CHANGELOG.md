# Changelog

All notable changes to this project will be documented in this file.

## [0.8.0](https://github.com/inference-gateway/skills/compare/v0.7.0...v0.8.0) (2026-07-28)

### ✨ Features

* add go skills from inference-gateway to catalog ([#90](https://github.com/inference-gateway/skills/issues/90)) ([63df3b2](https://github.com/inference-gateway/skills/commit/63df3b2da9115e71e32b338d773b2a853b160fd2))

### 👷 CI

* purge jsDelivr [@latest](https://github.com/latest) alias instead of [@main](https://github.com/main) ([#89](https://github.com/inference-gateway/skills/issues/89)) ([b383352](https://github.com/inference-gateway/skills/commit/b38335226431d255610837b299f4d97ea659d660)), references [pre-#86](https://github.com/pre-/issues/86)
* purge jsDelivr cache when catalog.json changes ([#88](https://github.com/inference-gateway/skills/issues/88)) ([811a433](https://github.com/inference-gateway/skills/commit/811a43398be54563141c939f7b2939ed16aecbe1)), references [#86](https://github.com/inference-gateway/skills/issues/86)

### 📦 Miscellaneous

* migrate toolchain from Node.js to Bun ([#87](https://github.com/inference-gateway/skills/issues/87)) ([da7ee67](https://github.com/inference-gateway/skills/commit/da7ee67c1c55f0a5c2b2fae1b43f303ff3fe6247))

## [0.7.0](https://github.com/inference-gateway/skills/compare/v0.6.0...v0.7.0) (2026-07-28)

### ✨ Features

* add language logo to catalog entries ([#86](https://github.com/inference-gateway/skills/issues/86)) ([3175b1b](https://github.com/inference-gateway/skills/commit/3175b1b3150fecfb5d6bfe9a03e768fb584a8978))

## [0.6.0](https://github.com/inference-gateway/skills/compare/v0.5.0...v0.6.0) (2026-07-28)

### ✨ Features

* add opentask skill to catalog ([#81](https://github.com/inference-gateway/skills/issues/81)) ([c1a215d](https://github.com/inference-gateway/skills/commit/c1a215dcf13d113eb52cbfcd0dac217cfed28825))
* **skills:** add C++ best practices, review, and concurrency skills ([#85](https://github.com/inference-gateway/skills/issues/85)) ([4a82ce1](https://github.com/inference-gateway/skills/commit/4a82ce13387873fa6ef39c54bf333f6e750de06e))

### 🐛 Bug Fixes

* **ci:** update maintainer app ID to client ID in workflows and documentation ([232a1f2](https://github.com/inference-gateway/skills/commit/232a1f24394831a794ecc2712996ccc262080fab))
* **deps:** update js-yaml transitive dependency to 3.15.0 to fix Dependabot alert [#3](https://github.com/inference-gateway/skills/issues/3) ([#83](https://github.com/inference-gateway/skills/issues/83)) ([4f00a13](https://github.com/inference-gateway/skills/commit/4f00a13a971c543281d736ee97ad75ee21e25b61))

### 👷 CI

* **claude:** centralize claude.yml via reusable workflow ([#76](https://github.com/inference-gateway/skills/issues/76)) ([45feed6](https://github.com/inference-gateway/skills/commit/45feed60c307b5cd03782f3c2c14fa5b67efba1d))
* **claude:** centralize claude.yml via reusable workflow ([#77](https://github.com/inference-gateway/skills/issues/77)) ([2815ca2](https://github.com/inference-gateway/skills/commit/2815ca29c4bc6d7bdae41712373e788145077f09))
* **claude:** centralize claude.yml via reusable workflow ([#80](https://github.com/inference-gateway/skills/issues/80)) ([b252a51](https://github.com/inference-gateway/skills/commit/b252a519b8c7d6958c2da2b93ff0ec37181b3229))
* **claude:** centralize claude.yml via reusable workflow ([#84](https://github.com/inference-gateway/skills/issues/84)) ([13eab96](https://github.com/inference-gateway/skills/commit/13eab96f4e564dd323f0de4cec1cecf9b6bc6938))
* **infer:** centralize infer.yml via reusable workflow ([#82](https://github.com/inference-gateway/skills/issues/82)) ([7390460](https://github.com/inference-gateway/skills/commit/7390460e967773e43f5b1164532a2f4ccedcc8b2))

### 📚 Documentation

* **adl:** sync skill with adl v0.23 and adl-cli v0.54 ([#75](https://github.com/inference-gateway/skills/issues/75)) ([9f11597](https://github.com/inference-gateway/skills/commit/9f1159779f8656030e6256cfb4d174e797b01e1b))
* **readme:** add security scan badge ([#74](https://github.com/inference-gateway/skills/issues/74)) ([0274400](https://github.com/inference-gateway/skills/commit/02744009b48e513f7776cdd1a1ce149d853b74e7))

### 🔧 Miscellaneous

* **deps:** bump infer CLI v0.147.1 -> v0.153.1 ([#79](https://github.com/inference-gateway/skills/issues/79)) ([44584a4](https://github.com/inference-gateway/skills/commit/44584a48e6afc809256a9325350d7a322ac3992a))
* **deps:** bump js-yaml from 4.2.0 to 4.3.0 ([#73](https://github.com/inference-gateway/skills/issues/73)) ([ac2f63f](https://github.com/inference-gateway/skills/commit/ac2f63f021dbded34190a4d6c9d1043855c5f649))

## [0.5.0](https://github.com/inference-gateway/skills/compare/v0.4.0...v0.5.0) (2026-07-23)

### ✨ Features

* security-scan catalog skills with NVIDIA SkillSpector ([#72](https://github.com/inference-gateway/skills/issues/72)) ([60fb893](https://github.com/inference-gateway/skills/commit/60fb8933cbf7833337de8a685a248f154c2292c1))

### 📚 Documentation

* **adl:** sync skill with adl-cli examples seeding, CONFIGURATIONS.md, and A2A_OTEL_* env vars ([#70](https://github.com/inference-gateway/skills/issues/70)) ([36a6d79](https://github.com/inference-gateway/skills/commit/36a6d7983fcaa7e48346b2978d3c79d5a43f4029))

### 🔧 Miscellaneous

* **deps:** bump actions/checkout in the github-actions group ([#71](https://github.com/inference-gateway/skills/issues/71)) ([5dc46ac](https://github.com/inference-gateway/skills/commit/5dc46aca8cc78c4e436c5e88127c93a1db43f9a3))
* **deps:** bump actions/setup-node in the github-actions group ([#68](https://github.com/inference-gateway/skills/issues/68)) ([878f20e](https://github.com/inference-gateway/skills/commit/878f20ea424850ff8864a284472117ded445a1c3))
* **deps:** bump infer CLI v0.141.0 -> v0.147.1 ([#69](https://github.com/inference-gateway/skills/issues/69)) ([39b99fb](https://github.com/inference-gateway/skills/commit/39b99fb17cc5a3f4fbc1db6108be583ea39c3d0e))
* **release:** update GitHub App credentials to use RELEASER_APP_ID and RELEASER_APP_PRIVATE_KEY ([32c557f](https://github.com/inference-gateway/skills/commit/32c557f2c7cacc45b370837071eef028ece23d35))

## [0.4.0](https://github.com/inference-gateway/skills/compare/v0.3.3...v0.4.0) (2026-07-15)

### ✨ Features

* **adl:** document spec.documentation.pages and spec.examples from adl-cli v0.49.0 ([#67](https://github.com/inference-gateway/skills/issues/67)) ([0e4ddca](https://github.com/inference-gateway/skills/commit/0e4ddcaf2610def7ee7997d3346b3f3ecb8f2a8a))

## [0.3.3](https://github.com/inference-gateway/skills/compare/v0.3.2...v0.3.3) (2026-07-15)

### 📚 Documentation

* **adl:** document manifest-authoritative vendor deps and Go devdeps semantics ([#65](https://github.com/inference-gateway/skills/issues/65)) ([761302d](https://github.com/inference-gateway/skills/commit/761302d1cc324a2777db86df2cf4a3c8af519a79))
* **adl:** prefer repo tasks over global adl binary in generated projects ([#66](https://github.com/inference-gateway/skills/issues/66)) ([9576814](https://github.com/inference-gateway/skills/commit/957681462e17df8d40a4e5b0021064c5b521d5b2)), references [inference-gateway/mock-agent#59](https://github.com/inference-gateway/mock-agent/issues/59)

## [0.3.2](https://github.com/inference-gateway/skills/compare/v0.3.1...v0.3.2) (2026-07-14)

### 📚 Documentation

* **adl:** adopt per-signal telemetry exporter schema ([#64](https://github.com/inference-gateway/skills/issues/64)) ([9457b3f](https://github.com/inference-gateway/skills/commit/9457b3f00d7dabcf130f07b5bf1e3419ba7321e9))
* **adl:** correct telemetry coverage - Go/TypeScript only, traces + metrics ([#63](https://github.com/inference-gateway/skills/issues/63)) ([8329e86](https://github.com/inference-gateway/skills/commit/8329e86d3699f4707c3a58acd424ff9c6aeffa54)), references [inference-gateway/adl#102](https://github.com/inference-gateway/adl/issues/102)

## [0.3.1](https://github.com/inference-gateway/skills/compare/v0.3.0...v0.3.1) (2026-07-14)

### 👷 CI

* **claude:** centralize claude.yml via reusable workflow ([#59](https://github.com/inference-gateway/skills/issues/59)) ([276f66f](https://github.com/inference-gateway/skills/commit/276f66f6b2a0c40582ac176c7d1814a895f49618))
* **infer:** centralize infer.yml via reusable workflow ([#55](https://github.com/inference-gateway/skills/issues/55)) ([389bc87](https://github.com/inference-gateway/skills/commit/389bc87540ce09f1a6c1a53a5f48d0e5fd9dfc4f))
* **infer:** centralize infer.yml via reusable workflow ([#56](https://github.com/inference-gateway/skills/issues/56)) ([efa709d](https://github.com/inference-gateway/skills/commit/efa709dc57a59563e7823a73055cb71433601fc8))
* **release:** update semantic release and plugins to latest versions with local installation ([01ddc27](https://github.com/inference-gateway/skills/commit/01ddc27c08674386399faf44509abe7fbe02f012))
* restrict default workflow token permissions to contents: read ([#54](https://github.com/inference-gateway/skills/issues/54)) ([a6ee9fa](https://github.com/inference-gateway/skills/commit/a6ee9fa53b62459dab0813a14ab141c4fea0906b))

### 📚 Documentation

* **adl:** sync skill with schema v0.18.1 / adl-cli v0.47.1 ([#62](https://github.com/inference-gateway/skills/issues/62)) ([c9eb2e8](https://github.com/inference-gateway/skills/commit/c9eb2e8f48071aa3607befe1799c4770487fd91e))

### 🔧 Miscellaneous

* **deps:** bump claude-code 2.1.177 -> 2.1.197, claude-code-action v1.0.161 -> v1.0.165 ([#48](https://github.com/inference-gateway/skills/issues/48)) ([8f8895d](https://github.com/inference-gateway/skills/commit/8f8895da3511f6cf846b2adaf5214e80f78ec896))
* **deps:** bump claude-code 2.1.197 -> 2.1.201 ([#49](https://github.com/inference-gateway/skills/issues/49)) ([479cdeb](https://github.com/inference-gateway/skills/commit/479cdeb2a4171587d4ed74b8c6d15454a7e2dcf9))
* **deps:** bump claude-code-action v1.0.168 -> v1.0.169 ([#58](https://github.com/inference-gateway/skills/issues/58)) ([c8a2fa1](https://github.com/inference-gateway/skills/commit/c8a2fa185f549240a008b234d497a5d73019dc94))
* **deps:** bump infer CLI v0.125.0 -> v0.130.1, infer-action v0.19.1 -> v0.23.1 ([#47](https://github.com/inference-gateway/skills/issues/47)) ([cbd3ae0](https://github.com/inference-gateway/skills/commit/cbd3ae095b9c3e9a9cd814e9c8f6ea26e1ce99ed))
* **deps:** bump infer CLI v0.130.1 -> v0.133.0, infer-action v0.23.1 -> v0.26.0 ([#50](https://github.com/inference-gateway/skills/issues/50)) ([31a5344](https://github.com/inference-gateway/skills/commit/31a53449a8d1e81e932afa2e3671f353b8d00590))
* **deps:** bump infer CLI v0.133.0 -> v0.133.1, infer-action v0.26.0 -> v0.27.1 ([#51](https://github.com/inference-gateway/skills/issues/51)) ([fabd2a1](https://github.com/inference-gateway/skills/commit/fabd2a1e03f50ee2ce82151f16c7e7a63f1592b5))
* **deps:** bump infer CLI v0.133.1 -> v0.137.0, infer-action v0.27.1 -> v0.29.0 ([#52](https://github.com/inference-gateway/skills/issues/52)) ([aaa9252](https://github.com/inference-gateway/skills/commit/aaa9252d4bb04661348eddc8b06577fc4118fe04))
* **deps:** bump infer CLI v0.137.0 -> v0.138.0, infer-action v0.29.0 -> v0.30.1 ([#53](https://github.com/inference-gateway/skills/issues/53)) ([358368b](https://github.com/inference-gateway/skills/commit/358368b349a68bfc7400e48c4e9858ef57ac1a6f))
* **deps:** bump infer CLI v0.138.0 -> v0.141.0 ([#60](https://github.com/inference-gateway/skills/issues/60)) ([0fc0b69](https://github.com/inference-gateway/skills/commit/0fc0b6990dffe3d3fa1abc5616f9bd03054f20a7))
* **deps:** bump inference-gateway/.github/.github/workflows/claude.yml ([#57](https://github.com/inference-gateway/skills/issues/57)) ([630f09f](https://github.com/inference-gateway/skills/commit/630f09f21b942bd1b660732959a7a6f8199dd8fa))

## [0.3.0](https://github.com/inference-gateway/skills/compare/v0.2.2...v0.3.0) (2026-07-02)

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
