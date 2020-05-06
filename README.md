# traQ_S-UI
[![CircleCI](https://circleci.com/gh/traPtitech/traQ_S-UI.svg?style=svg)](https://circleci.com/gh/traPtitech/traQ_S-UI)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=traPtitech/traQ_S-UI)](https://dependabot.com)

traQ-S Frontend 

## コマンド
### ホットリロード環境
```shell
$ npm run serve
```

**実行前に一度`$ npm run gen-fonts`を実行する必要があります**

### ビルド
```shell
$ npm run build
```
フォント以外のビルド

```shell
$ npm run build:with-font
```
フォントを含めたビルド

```shell
$ npm run gen-unicode_emojis
```
絵文字用データの生成
リポジトリに生成物が含まれています
このコマンドは更新用です

```shell
$ npm run gen-fonts
```
フォントの生成
リポジトリに生成物が含まれていません

### テスト/lint

```shell
$ npm run test:unit
```
テスト実行

```shell
$ npm run lint
```
lintの実行とauto-fixによる修正

```shell
$ npm run lint:no-fix
```
lintの実行(auto-fixなし)
