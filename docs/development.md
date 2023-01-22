## 開発環境構築

実行には Node.js が必要です

```shell
$ npm i
$ npm run gen-fonts
```

Vetur ではなく Volar を導入することを推奨しています。

## コマンド

### ホットリロード環境

```shell
$ npm run dev
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

## ビルド成果物の確認

```shell
$ npm run preview
```

**実行前に`$ npm run build`を実行する必要があります**

### テスト/lint

```shell
$ npm run test:unit
```

ユニットテスト実行

```shell
$ npm run test:e2e
```

e2e テスト実行  
`cypress.env.json`を以下の通りに作成する必要があります

```json
{
  "username": "ユーザー名",
  "password": "パスワード"
}
```

`npm run test:e2e-headless`ではヘッドレスで実行できます

```shell
$ npm run test:e2e:without-build
```

再ビルドなしでの e2e テスト実行

```shell
$ npm run lint
```

lint の実行と auto-fix による修正

```shell
$ npm run lint:no-fix
```

lint の実行(auto-fix なし)

```shell
$ npm run type-check
```

型チェックの実行
