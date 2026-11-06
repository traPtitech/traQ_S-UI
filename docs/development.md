## 開発環境構築

実行には Node.js が必要です

```shell
$ npm i
$ npm run gen-fonts
```

Vetur ではなく Vue (offical) を導入することを推奨しています。

## 依存パッケージの型定義修正

`vue-slider-component` の型定義には、Vue の要素型を `any` に上書きする参照と、配布されていない `.vue` ファイルへの参照があるため、`scripts/patch-dependencies.js` で修正しています。

この修正は `npm run type-check` の実行時に適用されます。対象パッケージの更新で型定義が変わった場合は、スクリプトの修正も必要です。

## コミット時の自動フォーマット・lint

このリポジトリでは [husky](https://typicode.github.io/husky/) と [lint-staged](https://github.com/okonet/lint-staged) を利用して、コミット時にステージされたファイルへ自動でフォーマット（prettier）とlint（eslint --fix）が実行されます。

初回セットアップ時は、以下のコマンドを実行してください。

```shell
$ npm run husky:prepare
```

その後は特別な操作は不要で、通常通りコミットするだけで自動的に修正・整形が行われます。

設定ファイル:

- lint-staged: `lint-staged.config.js`
- husky: `.husky/pre-commit`

## コマンド

### ホットリロード環境

```shell
$ npm run dev
```

**実行前に一度`$ npm run gen-fonts`を実行する必要があります**

### コンポーネントの表示確認

```shell
$ npm run storybook
```

`http://localhost:6006` で Storybook を開けます。バックエンドへの接続やログインは不要です。
ツールバーからライト・ダークテーマを切り替え、Controls で props を変更できます。
フォントはアプリと同じものを使用するため、初回は `npm run gen-fonts` を実行してください。

Story はコンポーネントの隣に `ComponentName.stories.ts` として追加します。
ストアや API に依存するコンポーネントは、各 Story で必要なデータを用意してください。

```shell
$ npm run storybook:build
```

静的ファイルは `storybook/` に出力されます。

### ビルド

#### フォント以外のビルド

```shell
$ npm run build
```

#### フォントを含めたビルド

```shell
$ npm run build:with-font
```

#### 絵文字用データの生成

```shell
$ npm run gen-unicode_emojis
```

- リポジトリに生成物が含まれています
- このコマンドは更新用です

#### フォントの生成

```shell
$ npm run gen-fonts
```

リポジトリに生成物が含まれていません

## ビルド成果物の確認

```shell
$ npm run preview
```

**実行前に`$ npm run build`を実行する必要があります**

### テスト/lint

#### ユニットテスト実行

```shell
$ npm run test:unit
```

#### e2e テスト実行

Playwright と専用の traQ・MariaDB を使用します。Docker Engine と Docker Compose v2 を起動し、初回は Chromium をインストールしてください。

```shell
$ npx playwright install chromium
$ npm run test:e2e
```

ビルド後に専用バックエンドとプレビューサーバーを起動し、Playwright の UI mode を開きます。
開発用サーバーのアカウントや既存チャンネルの準備は不要です。
認証が必要な各テストで、API 経由でユーザー・チャンネル・初期メッセージを作成します。

`npm run test:e2e-headless` ではヘッドレスで実行できます。
終了時に専用コンテナと volume を削除します。テスト用データは次回に引き継ぎません。

プレビューは `http://127.0.0.1:4173`、バックエンドは動的なローカルポートを使用します。
4173 番ポートは空けておいてください。
`E2E_BACKEND_URL` はランナーが設定する内部変数です。テストはローカルの HTTP 接続先のみ受け付けます。

失敗時のスクリーンショットと Trace は `tests/e2e/results`、HTML レポートは `tests/e2e/report`、バックエンドのログは `tests/e2e/logs` に出力されます。
CI ではこれらを成果物として保存します。

#### 再ビルドなしでの e2e テスト実行

```shell
$ npm run test:e2e:only-run
$ npm run test:e2e:only-run-headless
```

特定の spec だけを実行する場合は `--spec` を指定できます。
この場合も専用のバックエンドは起動・破棄されます。

```shell
$ npm run test:e2e:only-run-headless -- --spec tests/e2e/specs/login.spec.ts
```

#### lint の実行と auto-fix による修正

```shell
$ npm run lint
```

#### lint の実行(auto-fix なし)

```shell
$ npm run lint:no-fix
```

#### 型チェックの実行

```shell
$ npm run type-check
```
