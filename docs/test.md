# テスト

## ユニットテスト

### 通常の関数 (`lib`以下)

- `tests/unit/lib`以下にファイル/関数ごとに分けて記述する
- `describe`で関数名を指定する

### composable (`composables`以下など)

`tests/unit/composables`や`tests/unit/components/**/composables`などにファイルごとに分けて記述する

- 注意点
  - `watch`はデフォルトで`flush: post`なので`await nextTick()`をしないと実行されない
  - `onMounted`などのライフサイクルフックは`tests/unit/composables/testUtils.ts`の`withSetup`を利用しないと実行されない
  - ストアを利用しているものは`beforeEach`で`createTestingPinia`を呼び出してモックすること

### component (`components`以下など)

TBD

## E2E テスト

根幹を成す部分とそれでのみ保証できるものは E2E テストを書いている

- 注意点
  - サービスワーカーのキャッシュで動かないことがあるので`cy.disableSW`を利用すること
