# Changelog
## [0.11.0](https://github.com/klave-network/platform/compare/sdk@0.10.2...sdk@0.11.0) (2024-05-08)

### Dependency Updates

* `compiler` updated to version `0.10.2`

### Features

* **compiler,sdk,api:** Bring ASC and compiler versions forward ([520ae67](https://github.com/klave-network/platform/commit/520ae67a6ae630e9c2d9c75d05ea13a175bf7273))

## [0.10.2](https://github.com/klave-network/platform/compare/sdk@0.10.1...sdk@0.10.2) (2024-05-08)

### Dependency Updates

* `compiler` updated to version `0.10.1`

### Bug Fixes

* **compiler:** Update `@klave/as-json` to solve private member issue ([4483859](https://github.com/klave-network/platform/commit/4483859f96de8174041e23856f0078282589d11d))

## [0.10.1](https://github.com/klave-network/platform/compare/sdk@0.10.0...sdk@0.10.1) (2024-05-02)


### Bug Fixes

* **sdk:** Missing usage parameter length for `generate_key` calls ([016b67e](https://github.com/klave-network/platform/commit/016b67e6083631055d5aa1abd7c2e52e60d83c86))

## [0.10.0](https://github.com/klave-network/platform/compare/sdk@0.9.3...sdk@0.10.0) (2024-05-02)

### Dependency Updates

* `compiler` updated to version `0.9.3`
* `constants` updated to version `0.9.3`

### Features

* **sdk:** Add `import_key` function to the crypto SDK ([0a7190c](https://github.com/klave-network/platform/commit/0a7190cb7240864bcb08fc49c004765615582f43))

## [0.9.3](https://github.com/klave-network/platform/compare/sdk@0.9.2...sdk@0.9.3) (2024-04-08)


### Reverts

* Revert "fix(sdk): Embed SWC helpers" ([75196d2](https://github.com/klave-network/platform/commit/75196d24dc09d384359d61ab371a15ae6664a466))

## [0.9.2](https://github.com/klave-network/platform/compare/sdk@0.9.1...sdk@0.9.2) (2024-04-08)

### Dependency Updates

* `compiler` updated to version `0.9.1`

### Bug Fixes

* **sdk:** Embed SWC helpers ([88cb152](https://github.com/klave-network/platform/commit/88cb152e696b3ee97bc5ec7b57adafdc463618ee))

## [0.9.1](https://github.com/klave-network/platform/compare/sdk@0.9.0...sdk@0.9.1) (2024-04-08)


### Bug Fixes

* **sdk:** Treating constants package as internal ([82c26a1](https://github.com/klave-network/platform/commit/82c26a1c5e2ecbc538bcc4191fd43829eaf2e642))

## [0.9.0](https://github.com/klave-network/platform/compare/sdk@0.8.3...sdk@0.9.0) (2024-04-05)

### Dependency Updates

* `compiler` updated to version `0.8.3`
* `constants` updated to version `0.8.3`

### Features

* **sdk:** Add abort_transaction() method in SDK ([ea26482](https://github.com/klave-network/platform/commit/ea264823c8f4f7e91d5f9648bc59650df6efa6e7))

## [0.8.3](https://github.com/klave-network/platform/compare/sdk@0.8.2...sdk@0.8.3) (2023-12-12)

### Dependency Updates

* `compiler` updated to version `0.8.2`
## [0.8.2](https://github.com/klave-network/platform/compare/sdk@0.8.1...sdk@0.8.2) (2023-12-08)

### Dependency Updates

* `compiler` updated to version `0.8.1`

### Bug Fixes

* Revert dependencies to prevent an assemblyscript failure ([6c251f1](https://github.com/klave-network/platform/commit/6c251f15d1235e11c0bf8f9cd75ac9ebbc6ea46d))

## [0.8.1](///compare/klave-sdk@0.8.0...klave-sdk@0.8.1) (2023-09-07)

### Dependency Updates

* `klave-compiler` updated to version `0.8.0`

### Bug Fixes

* Revert change to package.json generation until Nx 17 0d72132

## [0.8.0](///compare/klave-sdk@0.7.0...klave-sdk@0.8.0) (2023-09-04)

### Dependency Updates

* `klave-compiler` updated to version `0.7.0`

### Features

* **sdk:** Add Ledger key unset method abd8959
* **sdk:** Add subscription marker 8ada39b
* **sdk:** Switching JSON package + Add new HTTP request prototypes 12d45dc


### Bug Fixes

* **sdk,create:** Linking, compilation and target issues d0da049

## [0.7.0](///compare/klave-sdk@0.6.4...klave-sdk@0.7.0) (2023-08-02)

### Dependency Updates

* `klave-compiler` updated to version `0.2.3`

### Features

* **sdk:** Add Light GBM APIs a9217f0
* **sdk:** Finalising Crypto SDK exposition 1de0c79

## [0.6.4](///compare/klave-sdk@0.6.3...klave-sdk@0.6.4) (2023-06-12)

## [0.6.3](///compare/klave-sdk@0.6.2...klave-sdk@0.6.3) (2023-06-02)

### Dependency Updates

* `klave-compiler` updated to version `0.2.1`

### Bug Fixes

* **sdk:** Use synchronous file writing to prevent incomplete writes 5f58df3

## [0.6.2](///compare/klave-sdk@0.6.1...klave-sdk@0.6.2) (2023-05-31)

### Dependency Updates

* `klave-compiler` updated to version `0.2.0`
## [0.6.1](///compare/klave-sdk@0.6.0...klave-sdk@0.6.1) (2023-05-30)


### Bug Fixes

* **sdk:** Correcting Table getArrayBuffer export 10d21fb

## [0.6.0](///compare/klave-sdk@0.5.0...klave-sdk@0.6.0) (2023-05-30)

### Dependency Updates

* `klave-compiler` updated to version `0.1.1`

### Features

* **sdk:** Add Utils API, Context API and extend Notifier API 370c746

## [0.5.0](///compare/klave-sdk@0.4.6...klave-sdk@0.5.0) (2023-05-30)

### Dependency Updates

* `klave-compiler` updated to version `0.1.0`

### Features

* **api,compiler,deployer:** Include JSON transformer for AS compilation ed72c2b

## [0.4.6](///compare/klave-sdk@0.4.5...klave-sdk@0.4.6) (2023-05-16)

### Dependency Updates

* `klave-compiler` updated to version `0.0.4`
## [0.4.5](///compare/trustless-app-sdk@0.4.4...trustless-app-sdk@0.4.5) (2023-05-11)

## [0.4.4](///compare/trustless-app-sdk@0.4.3...trustless-app-sdk@0.4.4) (2023-05-11)

### Dependency Updates

* `klave-compiler` updated to version `0.0.3`

### Bug Fixes

* **klave-compiler,klave-sdk:** Problem leading to compiler freeze + Add bailing e124be5
* **klave-compiler:** Ensure proper export of ESM bindings 147aa09

## [0.4.3](///compare/trustless-app-sdk@0.4.2...trustless-app-sdk@0.4.3) (2023-05-11)

### Dependency Updates

* `klave-compiler` updated to version `0.0.2`

## [0.4.2](///compare/trustless-app-sdk@0.4.1...trustless-app-sdk@0.4.2) (2023-05-10)

### Bug Fixes

* **klave-sdk:** Fixing crash on file absence b3c3535

## [0.4.1](///compare/trustless-app-sdk@0.4.0...trustless-app-sdk@0.4.1) (2023-05-10)

### Dependency Updates

* `klave-compiler` updated to version `0.0.1`

## [0.4.0](///compare/trustless-app-sdk@0.3.2...trustless-app-sdk@0.4.0) (2023-05-10)

### Dependency Updates

* `klave-compiler` updated to version `0.1.0`

### Features

* **klave-compiler:** Split off the wasm compiler into separate library package 36e1f02

## [0.3.2](///compare/trustless-app-sdk@0.3.1...trustless-app-sdk@0.3.2) (2023-02-24)

### Bug Fixes

* **klave-sdk:** Comply with asbuild stricter type checking edd5a20

## [0.3.1](///compare/trustless-app-sdk@0.3.0...trustless-app-sdk@0.3.1) (2023-02-24)

## [0.3.0](///compare/trustless-app-sdk@0.2.1...trustless-app-sdk@0.3.0) (2023-02-24)

### ⚠ BREAKING CHANGES

* Replace SDK structure

### Bug Fixes

* **klave-sdk:** Prevent display of peer dependency warning 59c13da

### Miscellaneous Chores

* Replace SDK structure be5add9

## [0.2.1](///compare/trustless-app-sdk@0.2.0...trustless-app-sdk@0.2.1) (2023-02-08)

### Bug Fixes

* Creator template would incorrectly validate and skeleton the config file 9778524

## 0.2.0 (2023-02-08)

### ⚠ BREAKING CHANGES

* Rename templator and TS sdk

### Miscellaneous Chores

* Rename templator and TS sdk 44903f1

## 0.1.0 (2023-01-29)

### Features

* Switching over to using asb in place of asc for sdk compilation 5157354
* **trustless-app:** Add trustless app typescript helps for developers fd78d16

## 0.0.3 (2023-01-23)

## 0.0.2 (2023-01-23)

## 0.0.1 (2023-01-23)
