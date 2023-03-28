# ストアについて

## モジュールの種類分けについて

### `entities`

- サーバーの情報を扱う (key-value のもののみ)
- WebSocket で状態が同期される
- ほかのストアには依存しないようにする

### `domain`

- entities でないサーバーの情報を扱う store
- listeners で websocket を受け取ったり、entities の変更を受け取ったりする

### `app`

- サーバーからの状態の変更を受け取らない store
- (送ることはあるがここから直接送信することはない)

### `ui`

- 通信することも IndexedDB を利用することもないストア
- 特定のコンポーネントのみが利用することが多い
- ここが他のストアを変更することはあっても、ここをほかのストアが変更することはない

## 各モジュールについて

- ID は衝突を避けるため、ディレクトリと同じ名称にする
  - 例: `/@/store/ui/modal`にあるならば、`ui/modal`にする
- ストアは storeSetup を利用した形式(関数で定義する形式)で定義する
- `export`するものは`/@/store/utils/convertToRefsStore`を利用したものにする
  - これは分割代入を行っても壊れないようにするため
  - また、コードベースで全体的に Reactive よりも Ref を多用する書き方を採用しているため
- HMR 対応用のコードを書く
  - [pinia のドキュメント](https://pinia.vuejs.org/cookbook/hot-module-replacement.html)を参照
  - `acceptHMRUpdate`には`convertToRefsStore`を行う前のものを渡すこと
- IndexedDB を使う際は`useIndexedDbValue`を利用してストア名を`store/${id}`にすること
  - 例: `ui/modal`ならば、`store/ui/modal`にする

## テンプレート

```ts
import { defineStore, acceptHMRUpdate } from 'pinia'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'

const useModalStorePinia = defineStore('ui/modal', () => {
  // TODO
  return {}
})

export const useModalStore = convertToRefsStore(useModalStorePinia)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useModalStorePinia, import.meta.hot))
}
```
